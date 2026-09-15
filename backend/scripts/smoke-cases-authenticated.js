/**
 * AUTHENTICATED CASES SMOKE TEST (run against http://127.0.0.1:5000/api).
 * Mirrors smoke-cases-anonymous.js for the JWT-authenticated Cases contract:
 *   register lawyer A -> create own case (assignedTo=self) -> list access ->
 *   second lawyer (B) isolation (403) -> client-role scoping (403 + scoped list)
 *   -> ownership-injection rejected -> update + persistence -> cross-user edit
 *   denied (403) -> delete + not-found re-check (404).
 *
 * Documented contract (caseService.js, no refactors):
 *   - Authenticated create REQUIRES payload.assignedTo (a real user); ownership
 *     comes from req.user (createdBy) -- never from body fields (caseNumber,
 *     deviceId, createdBy, assignedTo are stripped on update).
 *   - Edit/delete (canEditCase): admin, or lawyer where assignedTo === user._id.
 *     A "client"-role user can never edit (403) -- scoping is view-only via
 *     createdBy.
 *   - View (getCaseById): admin sees all; lawyer sees assignedTo===self;
 *     client sees createdBy===self; else 403.
 *
 * Cleanup is `finally`-guarded and idempotent: only documents created by this
 * test (matched by unique test emails + caseTitle marker) are removed.
 *
 * Usage: node scripts/smoke-cases-authenticated.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const API = "http://127.0.0.1:5000/api";
const BASE = `${API}/cases`;
const MARKER = "[SMOKE-CASES-TEST] Authenticated Verification Case";

// Deterministic identities unique to this test (reusable across runs; the
// pre-run residue cleanup below removes any leftovers before assertions).
const LAWYER_A_EMAIL = "smoke-auth-lawyer-a@l2l-test.local";
const LAWYER_B_EMAIL = "smoke-auth-lawyer-b@l2l-test.local";
const CLIENT_EMAIL = "smoke-auth-client@l2l-test.local";
const PASSWORD = "SmokeTest!2026x";
const TEST_EMAILS = [LAWYER_A_EMAIL, LAWYER_B_EMAIL, CLIENT_EMAIL];

// Deterministic test date for the next-hearing filter check.
const HEARING_DATE = "2030-09-20";
const HEARING_DATE_ISO = new Date(`${HEARING_DATE}T09:00:00.000Z`).toISOString();

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  ok - ${name}`); }
  else { failed++; console.error(`  FAIL - ${name}${extra ? ` :: ${extra}` : ""}`); }
}

function client(token) {
  return axios.create({
    baseURL: BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    validateStatus: () => true,
  });
}

// Auth endpoints sit behind a strict per-IP rate limiter (10/min by default).
// Back-to-back gate runs can exhaust the window; retry honoring Retry-After
// so the test is deterministic when the gate runs repeatedly. Test-side only:
// no server security setting is changed.
async function authRequest(method, url, body) {
  for (let attempt = 0; ; attempt++) {
    const resp = await axios.request({ method, url, data: body, validateStatus: () => true });
    if (resp.status !== 429 || attempt >= 12) return resp;
    const retryAfterMs = (Number(resp.headers["retry-after"]) || 5) * 1000;
    console.log(`  .. auth rate-limited (429); retrying in ${retryAfterMs / 1000}s`);
    await new Promise((r) => setTimeout(r, Math.min(retryAfterMs, 15000) + 250));
  }
}


(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("../models/User");
  const Case = require("../models/Case");
  const Notification = require("../models/Notification");
  const AIConversation = require("../models/AIConversation");
  const AuditLog = require("../models/AuditLog");

  let caseId = null;
  let clientCaseId = null;
  // Case ids created by this test (for audit-log cleanup in the finally block).
  const auditCleanupIds = [];

  try {
    // Idempotency: remove residue from a previously interrupted run.
    await Case.deleteMany({ caseTitle: MARKER });
    await User.deleteMany({ email: { $in: TEST_EMAILS } });

    // ── TEST 1: Registration & login (JWT identity) ──
    const regBody = {
      name: "Smoke Auth User",
      password: PASSWORD,
      role: "lawyer",
      state: "Delhi",
      city: "New Delhi",
    };
    const regA = await authRequest("post", `${API}/auth/register`, { ...regBody, email: LAWYER_A_EMAIL });
    check("POST /api/auth/register (lawyer A) -> 200", regA.status === 200, `status=${regA.status} body=${JSON.stringify(regA.data).slice(0, 160)}`);
    check("register returns a JWT token", typeof regA.data?.token === "string" && regA.data.token.length > 0);
    check("register mints lawyer role (self-service allowlist)", regA.data?.user?.role === "lawyer");
    check("register response leaks no password", !("password" in (regA.data?.user || {})));

    const regB = await authRequest("post", `${API}/auth/register`, { ...regBody, email: LAWYER_B_EMAIL });
    check("register lawyer B -> 200", regB.status === 200, `status=${regB.status}`);

    const regC = await authRequest("post", `${API}/auth/register`, { ...regBody, email: CLIENT_EMAIL, role: "client" });
    check("register client C -> 200", regC.status === 200, `status=${regC.status}`);
    check("client role preserved for self-service registration", regC.data?.user?.role === "client");

    // Login proves password verification + token issuance.
    const loginA = await authRequest("post", `${API}/auth/login`, { email: LAWYER_A_EMAIL, password: PASSWORD });
    check("POST /api/auth/login (lawyer A) -> 200", loginA.status === 200, `status=${loginA.status}`);
    check("login returns access + refresh tokens", typeof loginA.data?.token === "string" && typeof loginA.data?.refreshToken === "string");

    const badLogin = await authRequest("post", `${API}/auth/login`, { email: LAWYER_A_EMAIL, password: "wrong-password!" });
    check("login with wrong password -> 401", badLogin.status === 401, `status=${badLogin.status}`);

    const regUserId = (u) => String((u && (u.id || u._id)) || "");
    const lawyerAId = regUserId(regA.data?.user);
    check("lawyer A identity available from server response", !!lawyerAId);
    const tokenA = loginA.data.token;
    const tokenB = regB.data.token;
    const tokenC = regC.data.token;

    // Unauthenticated access is still rejected on an auth-only surface.
    const meAnon = await authRequest("get", `${API}/auth/me`);
    check("GET /api/auth/me without token -> 401", meAnon.status === 401, `status=${meAnon.status}`);

    const apiA = client(tokenA);
    const apiB = client(tokenB);
    const apiC = client(tokenC);

    // ── TEST 2: Authenticated CREATE (assignedTo required, createdBy from req.user) ──
    const created = await apiA.post("/", {
      caseTitle: MARKER,
      client: "Smoke Test Client",
      advocate: "Smoke Test Advocate",
      court: "Test District Court",
      description: "Temporary record for authenticated Cases smoke verification.",
      assignedTo: lawyerAId, // required by the existing createCase contract
    });
    check("POST /api/cases (lawyer A, assignedTo=self) -> 201", created.status === 201, `status=${created.status} body=${JSON.stringify(created.data).slice(0, 200)}`);
    caseId = created.data?.case?._id;
    check("create returns case _id", !!caseId);
    auditCleanupIds.push(String(caseId));
    check("caseNumber server-generated", typeof created.data?.case?.caseNumber === "string" && created.data.case.caseNumber.length > 0);
    check("ownership bound to server-side JWT identity (createdBy=lawyer A)", String(created.data?.case?.createdBy || "") === String(lawyerAId));
    check("assignedTo honored (assignedTo=lawyer A)", String(created.data?.case?.assignedTo || "") === String(lawyerAId));
    check("authenticated case has no deviceId (no cross-contamination)", !created.data?.case?.deviceId);

    const missingAssigned = await apiA.post("/", { caseTitle: MARKER, client: "X" });
    check("authenticated create without assignedTo -> 400 (contract: assignedTo required)", missingAssigned.status === 400, `status=${missingAssigned.status}`);

    // ── TEST 3: Owner list access + cross-user isolation ──
    const listA = await apiA.get("/", { params: { limit: 100 } });
    check("GET /api/cases (lawyer A) -> 200", listA.status === 200, `status=${listA.status}`);
    const listAFound = (listA.data?.cases || []).some((c) => c._id === caseId);
    check("lawyer A list contains the created test case", listAFound);

    const listB = await apiB.get("/", { params: { limit: 100 } });
    check("GET /api/cases (lawyer B) -> 200", listB.status === 200, `status=${listB.status}`);
    const listBLeak = (listB.data?.cases || []).some((c) => c._id === caseId);
    check("lawyer B list does NOT contain lawyer A's case (assignedTo scoping)", !listBLeak);

    const singleB = await apiB.get(`/${caseId}`);
    // Existing contract: cross-user single-record access returns 403 Forbidden.
    check("GET /api/cases/:id (lawyer B) -> 403 Forbidden (documented contract)", singleB.status === 403, `status=${singleB.status}`);
    check("lawyer B receives no case data", !singleB.data?.case);

    // ── TEST 4: Client-role scoping ──
    const clientView = await apiC.get(`/${caseId}`);
    check("GET /api/cases/:id (client) -> 403 (createdBy scoping)", clientView.status === 403, `status=${clientView.status}`);
    const listC = await apiC.get("/", { params: { limit: 100 } });
    check("GET /api/cases (client) -> 200", listC.status === 200, `status=${listC.status}`);
    const listCLeak = (listC.data?.cases || []).some((c) => c._id === caseId);
    check("client list does NOT contain lawyer A's case (createdBy scoping)", !listCLeak);

    // Client CAN create a case (createdBy=self) and see it, but can never edit it
    // (canEditCase: only admin / assigned lawyer). Documented contract.
    const clientCase = await apiC.post("/", {
      caseTitle: MARKER,
      client: "Smoke Client Self Case",
      assignedTo: lawyerAId,
    });
    check("POST /api/cases (client, assignedTo=lawyer) -> 201", clientCase.status === 201, `status=${clientCase.status}`);
    clientCaseId = clientCase.data?.case?._id;
    auditCleanupIds.push(String(clientCaseId));
    check("client case createdBy = client identity", String(clientCase.data?.case?.createdBy || "") === regUserId(regC.data?.user));
    const listC2 = await apiC.get("/", { params: { limit: 100 } });
    check("client list now shows ONLY the client's own case", listC2.status === 200 && (listC2.data?.cases || []).some((c) => c._id === clientCaseId) && !(listC2.data?.cases || []).some((c) => c._id === caseId));
    const clientEdit = await apiC.put(`/${clientCaseId}`, { description: "Client attempting self-edit." });
    check("PUT /api/cases/:id (client editing own case) -> 403 (canEditCase contract)", clientEdit.status === 403, `status=${clientEdit.status}`);

    // ── TEST 5: UPDATE own case + ownership injection rejected ──
    // Ownership fields in the update body are rejected outright by update
    // validation (never applied) -- a stronger guarantee than stripping.
    const injection = await apiA.put(`/${caseId}`, {
      nextHearingDate: HEARING_DATE_ISO,
      caseNumber: "HIJACKED-001",
      deviceId: "99999999-9999-4999-9999-999999999999",
      createdBy: "000000000000000000000000",
      assignedTo: "000000000000000000000000",
    });
    check("PUT with ownership-injection fields -> 400 (rejected, not applied)", injection.status === 400, `status=${injection.status}`);

    const updated = await apiA.put(`/${caseId}`, { nextHearingDate: HEARING_DATE_ISO });
    check("PUT /api/cases/:id (lawyer A, clean payload) -> 200", updated.status === 200, `status=${updated.status}`);
    check("update keeps ownership intact: assignedTo=lawyer A", String(updated.data?.case?.assignedTo || "") === String(lawyerAId));
    check("update keeps ownership intact: createdBy=lawyer A", String(updated.data?.case?.createdBy || "") === String(lawyerAId));
    check("update keeps ownership intact: caseNumber unchanged", updated.data?.case?.caseNumber === created.data?.case?.caseNumber);
    check("update keeps ownership intact: no deviceId on authenticated case", !updated.data?.case?.deviceId);

    const persisted = await apiA.get(`/${caseId}`);
    check("fresh GET after update -> 200", persisted.status === 200, `status=${persisted.status}`);
    const storedDate = persisted.data?.case?.nextHearingDate ? new Date(persisted.data.case.nextHearingDate).toISOString() : null;
    check("nextHearingDate persisted with the deterministic test value", storedDate === HEARING_DATE_ISO, `stored=${storedDate}`);
    const timelineHasHearing = (persisted.data?.case?.timeline || []).some((t) => t.type === "Next Hearing Changed");
    check("authenticated update appends timeline entry", timelineHasHearing);

    // ── TEST 6: Cross-user edit/delete denied ──
    const editB = await apiB.put(`/${caseId}`, { description: "Unauthorized edit attempt." });
    check("PUT /api/cases/:id (lawyer B) -> 403", editB.status === 403, `status=${editB.status}`);
    const delB = await apiB.delete(`/${caseId}`);
    check("DELETE /api/cases/:id (lawyer B) -> 403", delB.status === 403, `status=${delB.status}`);
    const stillThere = await Case.countDocuments({ _id: caseId });
    check("case still intact after unauthorized edit/delete attempts (count=1)", stillThere === 1, `count=${stillThere}`);

    // ── TEST 7: DELETE by owner + cascade + audit + not-found re-check ──
    const invalidDel = await apiA.delete("/not-an-object-id");
    check("DELETE with invalid ObjectId -> 400", invalidDel.status === 400, `status=${invalidDel.status}`);

    // Wire up orphan-prone dependents that MUST be cascade-removed on delete.
    await Notification.create({
      user: lawyerAId,
      category: "system",
      title: "Cascade cleanup check",
      body: "Temporary notification for authenticated smoke cleanup verification.",
      meta: { caseId },
    });
    await AIConversation.create({ title: "Cascade cleanup check", metadata: { caseId } });
    // Control row referencing a DIFFERENT case id — must survive the delete.
    await Notification.create({
      user: lawyerAId,
      category: "system",
      title: "Control notification",
      body: "Must survive cascade cleanup.",
      meta: { caseId: new mongoose.Types.ObjectId() },
    });

    const deleted = await apiA.delete(`/${caseId}`);
    check("DELETE /api/cases/:id (lawyer A) -> 200 with id echo",
      deleted.status === 200 && String(deleted.data?.id) === String(caseId), `status=${deleted.status} body=${JSON.stringify(deleted.data).slice(0, 120)}`);
    const orphanNotif = await Notification.countDocuments({ title: "Cascade cleanup check", "meta.caseId": String(caseId) });
    check("cascade: notification referencing the case was removed", orphanNotif === 0, `count=${orphanNotif}`);
    const orphanAi = await AIConversation.countDocuments({ "metadata.caseId": String(caseId) });
    check("cascade: AI conversation referencing the case was removed", orphanAi === 0, `count=${orphanAi}`);
    const controlCount = await Notification.countDocuments({ title: "Control notification" });
    check("cascade: control notification (other caseId) survives", controlCount === 1, `count=${controlCount}`);
    const auditCount = await AuditLog.countDocuments({ action: "case.delete", module: "cases", recordId: String(caseId) });
    check("audit: case.delete entry written for deleted case", auditCount >= 1, `count=${auditCount}`);
    const afterDelete = await apiA.get(`/${caseId}`);
    check("GET after delete -> 404", afterDelete.status === 404, `status=${afterDelete.status}`);
    const secondDelete = await apiA.delete(`/${caseId}`);
    check("second DELETE (already deleted) -> 404", secondDelete.status === 404, `status=${secondDelete.status}`);
    const dbCount = await Case.countDocuments({ _id: caseId });
    check("case removed from database", dbCount === 0, `count=${dbCount}`);
    caseId = null; // already cleaned

    // Creator (client) may delete the case they created via createdBy match.
    const clientDeleted = await apiC.delete(`/${clientCaseId}`);
    check("DELETE own created case (client, createdBy match) -> 200", clientDeleted.status === 200, `status=${clientDeleted.status}`);
    clientCaseId = null;
  } finally {
    // ── TEST 8: CLEANUP (always runs, even on assertion failure) ──
    // Only documents created by this test: unique caseTitle marker + test emails.
    const cases = await Case.deleteMany({ caseTitle: MARKER });
    const users = await User.deleteMany({ email: { $in: TEST_EMAILS } });
    await Notification.deleteMany({
      title: { $in: ["Cascade cleanup check", "Control notification"] },
    });
    await AIConversation.deleteMany({ title: "Cascade cleanup check" });
    if (auditCleanupIds.length > 0) {
      await AuditLog.deleteMany({ action: "case.delete", recordId: { $in: auditCleanupIds } });
    }
    console.log(`\nCleanup: removed ${cases.deletedCount} test case record(s) and ${users.deletedCount} test user account(s)`);
    await mongoose.disconnect();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Smoke test crashed:", err.message);
  process.exit(1);
});

