/**
 * STALE-TOKEN ISOLATION SMOKE TEST (run against http://127.0.0.1:5000/api).
 *
 * Regression test for the two reported P0 bugs:
 *
 *  BUG 1 — cross-user data leak:
 *    A stale JWT left in AsyncStorage (authToken is shared with Admin Login)
 *    is attached by the axios interceptor to every request. optionalAuth
 *    populated req.user from it, and the admin role bypassed device scoping
 *    entirely — so a NEW anonymous identity (fresh X-Device-Id) could see the
 *    PREVIOUS user's cases and next-hearing dates. Contract after fix:
 *    device identity wins whenever X-Device-Id is present.
 *
 *  BUG 2 — POST /api/cases -> 500:
 *    With a stale token the create fell down the authenticated path where the
 *    free-text "Assigned To" field produced User.findById(CastError) -> 500
 *    (or a 400 "assignedTo is required" without it). Contract after fix:
 *    with X-Device-Id present, ownership is server-derived from the device;
 *    a garbage assignedTo on the JWT-only path is a 400, never a 500.
 *
 * Tokens are minted locally with JWT_SECRET — exactly equivalent to a stale
 * token sitting in a browser's storage. Cleanup is finally-guarded and only
 * removes documents created by this test.
 *
 * Usage: node scripts/smoke-cases-stale-token-isolation.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const BASE = "http://127.0.0.1:5000/api/cases";
const MARKER = "[SMOKE-CASES-TEST] Stale-Token Isolation";

const DEVICE_A = "c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3";
const DEVICE_B = "d4d4d4d4-d4d4-4d4d-8d4d-d4d4d4d4d4d4";

const HEARING_A = "2031-10-15";
const HEARING_B = "2031-10-20";

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  ok - ${name}`); }
  else { failed++; console.error(`  FAIL - ${name}${extra ? ` :: ${extra}` : ""}`); }
}

function deviceClient(deviceId, token) {
  return axios.create({
    baseURL: BASE,
    headers: {
      "X-Device-Id": deviceId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    validateStatus: () => true,
  });
}

function tokenClient(token) {
  return axios.create({
    baseURL: BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    validateStatus: () => true,
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Case = require("../models/Case");
  const User = require("../models/User");

  // Locate users to mint "stale" tokens for (equivalent to tokens in storage).
  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  const clientUser = await User.findOne({ role: "client" }).select("_id").lean();
  const lawyer = await User.findOne({ role: "lawyer" }).select("_id").lean();
  const adminToken = jwt.sign({ userId: String(admin._id) }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const clientToken = jwt.sign({ userId: String(clientUser._id) }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const lawyerToken = jwt.sign({ userId: String(lawyer._id) }, process.env.JWT_SECRET, { expiresIn: "15m" });

  // Simulated public-app clients: NEW identity B still sends the stale token.
  const A = deviceClient(DEVICE_A);                           // previous user, no token
  const B_stale = deviceClient(DEVICE_B, adminToken);         // new user, stale ADMIN token
  const B_staleClient = deviceClient(DEVICE_B, clientToken);  // new user, stale CLIENT token
  const B_clean = deviceClient(DEVICE_B);                     // new user, no token

  let caseA = null;
  let caseB = null;

  try {
    // Idempotency cleanup of any previous interrupted run
    await Case.deleteMany({ deviceId: { $in: [DEVICE_A, DEVICE_B] }, caseTitle: MARKER });
    await Case.deleteMany({ caseTitle: MARKER }); // also removes JWT-path residue

    // ── 1. User A (anonymous, canonical identity) creates Case A with hearing ──
    const createdA = await A.post("/", {
      caseTitle: MARKER,
      nextHearingDate: HEARING_A,
      caseTags: [], expenses: {}, documents: [], notes: [],
    });
    check("A: POST /api/cases -> 201", createdA.status === 201, `status=${createdA.status}`);
    caseA = createdA.data?.case?._id;
    check("A: ownership server-derived (deviceId=DEVICE_A)", createdA.data?.case?.deviceId === DEVICE_A);
    check("A: hearing stored in MongoDB", !!createdA.data?.case?.nextHearingDate);

    // ── 2. NEW USER B (fresh identity) with STALE ADMIN token must see ZERO ──
    const leakList = await B_stale.get("/", { params: { limit: 100 } });
    check("B(stale admin token): list -> 200", leakList.status === 200);
    check("B(stale admin token): does NOT see A's case (leak fixed)",
      !(leakList.data?.cases || []).some((c) => c._id === caseA),
      `total=${leakList.data?.total}`);

    const leakClientList = await B_staleClient.get("/", { params: { limit: 100 } });
    check("B(stale client token): does NOT see A's case",
      !(leakClientList.data?.cases || []).some((c) => c._id === caseA),
      `total=${leakClientList.data?.total}`);

    // ── 3. Cross-user IDOR attacks (B + stale admin token vs A's case id) ──
    const idorGet = await B_stale.get(`/${caseA}`);
    check("B(stale admin token): GET A's case by id -> 403", idorGet.status === 403, `status=${idorGet.status}`);
    const idorPut = await B_stale.put(`/${caseA}`, { description: "attack" });
    check("B(stale admin token): PUT A's case -> 403", idorPut.status === 403, `status=${idorPut.status}`);
    const idorDel = await B_stale.delete(`/${caseA}`);
    check("B(stale admin token): DELETE A's case -> 403", idorDel.status === 403, `status=${idorDel.status}`);
    const stillThere = await Case.countDocuments({ _id: caseA });
    check("A's case intact after attack attempts", stillThere === 1);

    // ── 4. B can CREATE with the stale token present (was 400/500) ──
    const createdB = await B_stale.post("/", {
      caseTitle: MARKER,
      nextHearingDate: HEARING_B,
      caseTags: [], expenses: {}, documents: [], notes: [],
    });
    check("B(stale admin token): POST /api/cases -> 201 (was 400/500)", createdB.status === 201, `status=${createdB.status} body=${JSON.stringify(createdB.data).slice(0, 160)}`);
    caseB = createdB.data?.case?._id;
    check("B: ownership server-derived (deviceId=DEVICE_B), token ignored",
      createdB.data?.case?.deviceId === DEVICE_B && !createdB.data?.case?.createdBy);
    check("B: B's hearing stored", !!createdB.data?.case?.nextHearingDate);

    // ── 5. B sees only B's data; A sees only A's data ──
    const listA = await A.get("/", { params: { limit: 100 } });
    check("A: sees only own case",
      (listA.data?.cases || []).some((c) => c._id === caseA) &&
      !(listA.data?.cases || []).some((c) => c._id === caseB));
    const listB = await B_clean.get("/", { params: { limit: 100 } });
    check("B(no token): sees only own case",
      (listB.data?.cases || []).some((c) => c._id === caseB) &&
      !(listB.data?.cases || []).some((c) => c._id === caseA));

    // ── 6. JWT-only path (no device header): garbage assignedTo -> 400 not 500 ──
    const badAssigned = await tokenClient(adminToken).post("/", {
      caseTitle: MARKER,
      assignedTo: "not-an-objectid",
      caseTags: [], expenses: {}, documents: [], notes: [],
    });
    check("JWT-only path: garbage assignedTo -> 400 (was 500)", badAssigned.status === 400, `status=${badAssigned.status}`);

    // Admin path preserved (no device header -> authorized admin scope)
    const adminList = await tokenClient(adminToken).get("/", { params: { limit: 100 } });
    check("admin (no device header): authorized broad list still works", adminList.status === 200 && adminList.data?.total >= 2,
      `status=${adminList.status} total=${adminList.data?.total}`);

    // Lawyer JWT path unchanged (scope by assignedTo)
    const lawyerList = await tokenClient(lawyerToken).get("/", { params: { limit: 100 } });
    check("lawyer (no device header): list scoped to assignedTo", lawyerList.status === 200,
      `status=${lawyerList.status}`);

    // ── 7. Hearing isolation via nextHearing filter ──
    const hearingA = await A.get("/", { params: { nextHearing: HEARING_A, limit: 100 } });
    check("A: nextHearing filter returns A's hearing only",
      (hearingA.data?.cases || []).some((c) => c._id === caseA) &&
      !(hearingA.data?.cases || []).some((c) => c._id === caseB));
    const hearingB = await B_clean.get("/", { params: { nextHearing: HEARING_B, limit: 100 } });
    check("B: nextHearing filter returns B's hearing only",
      (hearingB.data?.cases || []).some((c) => c._id === caseB) &&
      !(hearingB.data?.cases || []).some((c) => c._id === caseA));
  } finally {
    const res = await Case.deleteMany({ caseTitle: MARKER });
    console.log(`\nCleanup: removed ${res.deletedCount} test case record(s)`);
    await mongoose.disconnect();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Smoke test crashed:", err.message);
  process.exit(1);
});
