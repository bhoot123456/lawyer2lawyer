/**
 * ANONYMOUS CASES SMOKE TEST (run against http://127.0.0.1:5000/api).
 * Verifies the device-scoped anonymous Cases contract end-to-end:
 *   create (server-generated ANON-* caseNumber) → device list →
 *   cross-device isolation → update + persistence → nextHearing filter →
 *   duplicate caseNumber conflict → delete → cleanup.
 *
 * Cleanup is `finally`-guarded and idempotent: only documents created by
 * this test (matched by unique device IDs + title marker) are removed.
 *
 * Usage: node scripts/smoke-cases-anonymous.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const BASE = "http://127.0.0.1:5000/api/cases";
const MARKER = "[SMOKE-CASES-TEST] Anonymous Verification Case";

// deviceAuth middleware enforces UUID v4 format, so the test devices use
// deterministic UUID v4 identifiers (unique to this test, reusable across runs).
const DEVICE_A = "a1a1a1a1-a1a1-4a1a-9a1a-a1a1a1a1a1a1";
const DEVICE_B = "b2b2b2b2-b2b2-4b2b-9b2b-b2b2b2b2b2b2";

// Deterministic test date for the next-hearing filter test.
const HEARING_DATE = "2030-06-15";
const HEARING_DATE_ISO = new Date(`${HEARING_DATE}T10:30:00.000Z`).toISOString();

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  ok - ${name}`); }
  else { failed++; console.error(`  FAIL - ${name}${extra ? ` :: ${extra}` : ""}`); }
}

function client(deviceId) {
  return axios.create({
    baseURL: BASE,
    headers: { "X-Device-Id": deviceId },
    validateStatus: () => true,
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Case = require("../models/Case");

  const deviceA = client(DEVICE_A);
  const deviceB = client(DEVICE_B);

  let caseId = null;

  try {
    // Idempotency: remove any residue from a previously interrupted run.
    await Case.deleteMany({ deviceId: { $in: [DEVICE_A, DEVICE_B] }, caseTitle: MARKER });

    // ── TEST 1: Anonymous CREATE (no caseNumber supplied by client) ──
    const created = await deviceA.post("/", {
      caseTitle: MARKER,
      client: "Smoke Test Client",
      advocate: "Smoke Test Advocate",
      court: "Test District Court",
      description: "Temporary record for anonymous Cases smoke verification.",
    });
    check("POST /api/cases (no caseNumber) -> 201", created.status === 201, `status=${created.status} body=${JSON.stringify(created.data).slice(0, 200)}`);
    caseId = created.data?.case?._id;
    check("create returns case _id", !!caseId);

    const anonNumber = created.data?.case?.caseNumber;
    check("caseNumber is present and server-generated", typeof anonNumber === "string" && anonNumber.length > 0);
    check("caseNumber follows ANON-* convention", /^ANON-/.test(anonNumber || ""), `caseNumber=${anonNumber}`);
    check("ownership bound to server-side device identity (deviceId=DEVICE_A)", created.data?.case?.deviceId === DEVICE_A);
    check("anonymous case has no createdBy/assignedTo", !created.data?.case?.createdBy && !created.data?.case?.assignedTo);

    // ── TEST 2: DEVICE A list access ──
    const listA = await deviceA.get("/", { params: { limit: 100 } });
    check("GET /api/cases (Device A) -> 200", listA.status === 200, `status=${listA.status}`);
    const listAFound = (listA.data?.cases || []).some((c) => c._id === caseId && c.caseNumber === anonNumber);
    check("Device A list contains the created test case", listAFound);

    // ── TEST 3: DEVICE B isolation ──
    const listB = await deviceB.get("/", { params: { limit: 100 } });
    check("GET /api/cases (Device B) -> 200", listB.status === 200, `status=${listB.status}`);
    const listBLeak = (listB.data?.cases || []).some((c) => c._id === caseId);
    check("Device B list does NOT contain Device A's case", !listBLeak);

    const singleB = await deviceB.get(`/${caseId}`);
    // Existing contract: cross-device single-record access returns 403 Forbidden.
    check("GET /api/cases/:id (Device B) -> 403 Forbidden (documented contract)", singleB.status === 403, `status=${singleB.status}`);
    check("Device B receives no case data", !singleB.data?.case);

    // ── TEST 4: UPDATE own case + persistence re-check ──
    const updated = await deviceA.put(`/${caseId}`, { nextHearingDate: HEARING_DATE_ISO });
    check("PUT /api/cases/:id (Device A) -> 200", updated.status === 200, `status=${updated.status}`);

    const persisted = await deviceA.get(`/${caseId}`);
    check("fresh GET after update -> 200", persisted.status === 200, `status=${persisted.status}`);
    const storedDate = persisted.data?.case?.nextHearingDate ? new Date(persisted.data.case.nextHearingDate).toISOString() : null;
    check("nextHearingDate persisted with the deterministic test value", storedDate === HEARING_DATE_ISO, `stored=${storedDate}`);

    // ── TEST 5: nextHearing filter ──
    const filtered = await deviceA.get("/", { params: { nextHearing: HEARING_DATE, limit: 100 } });
    check("GET /api/cases?nextHearing=YYYY-MM-DD -> 200", filtered.status === 200, `status=${filtered.status}`);
    const filterFound = (filtered.data?.cases || []).some((c) => c._id === caseId);
    check("nextHearing filter returns the test case", filterFound,
      `total=${filtered.data?.total} cases=${(filtered.data?.cases || []).length}`);

    // ── TEST 6: duplicate caseNumber → 409 + DB integrity ──
    const duplicate = await deviceB.post("/", {
      caseTitle: MARKER,
      caseNumber: anonNumber, // globally unique case number owned by Device A's case
      client: "Duplicate Attempt",
    });
    check("POST duplicate caseNumber -> 409", duplicate.status === 409, `status=${duplicate.status}`);
    const dupCount = await Case.countDocuments({ caseNumber: anonNumber });
    check("duplicate case NOT created in database (count still 1)", dupCount === 1, `count=${dupCount}`);

    // ── TEST 7: DELETE + not-found re-check ──
    const deleted = await deviceA.delete(`/${caseId}`);
    check("DELETE /api/cases/:id (Device A) -> 200", deleted.status === 200, `status=${deleted.status}`);
    const afterDelete = await deviceA.get(`/${caseId}`);
    check("GET after delete -> 404", afterDelete.status === 404, `status=${afterDelete.status}`);
    const dbCount = await Case.countDocuments({ _id: caseId });
    check("case removed from database", dbCount === 0, `count=${dbCount}`);
    caseId = null; // already cleaned
  } finally {
    // ── TEST 8: CLEANUP (always runs, even on assertion failure) ──
    const result = await Case.deleteMany({
      deviceId: { $in: [DEVICE_A, DEVICE_B] },
      caseTitle: MARKER,
    });
    console.log(`\nCleanup: removed ${result.deletedCount} test case record(s)`);
    await mongoose.disconnect();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Smoke test crashed:", err.message);
  process.exit(1);
});
