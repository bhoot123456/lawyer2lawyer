/**
 * ANONYMOUS CASES SMOKE TEST (run against http://127.0.0.1:5000/api).
 * Verifies the device-scoped anonymous Cases contract end-to-end:
 *   create (server-generated ANON-* caseNumber) → device list →
 *   cross-device isolation (list + read + update + delete) →
 *   no-identity denial → ownership-spoofing rejection → update + persistence →
 *   nextHearing filter → duplicate caseNumber conflict → delete → cleanup.
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
  const Notification = require("../models/Notification");
  const AIConversation = require("../models/AIConversation");
  const AuditLog = require("../models/AuditLog");

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

    // ── TEST 3b: DEVICE B cannot modify or delete DEVICE A's case ──
    const updByB = await deviceB.put(`/${caseId}`, { description: "cross-device write attempt" });
    check("PUT /api/cases/:id (Device B on A's case) -> 403", updByB.status === 403, `status=${updByB.status}`);
    const delByB = await deviceB.delete(`/${caseId}`);
    check("DELETE /api/cases/:id (Device B on A's case) -> 403", delByB.status === 403, `status=${delByB.status}`);
    const intact = await deviceA.get(`/${caseId}`);
    check("Device A's case intact after denied cross-device write attempts",
      intact.status === 200 && intact.data?.case?._id === caseId && intact.data?.case?.deviceId === DEVICE_A,
      `status=${intact.status}`);

    // ── TEST 3c: request WITHOUT device identity is denied (no leak of null-deviceId cases) ──
    const noIdentity = axios.create({ baseURL: BASE, validateStatus: () => true });
    const noIdGet = await noIdentity.get(`/${caseId}`);
    check("GET /api/cases/:id without X-Device-Id -> 403 (identity mandatory)", noIdGet.status === 403, `status=${noIdGet.status}`);
    check("no-identity GET receives no case data", !noIdGet.data?.case);
    const noIdList = await noIdentity.get("/");
    check("GET /api/cases without X-Device-Id -> 200 empty list",
      noIdList.status === 200 && (noIdList.data?.cases || []).length === 0,
      `status=${noIdList.status} total=${noIdList.data?.total}`);

    // ── TEST 3d: ownership spoofing via request body is ignored ──
    const spoofed = await deviceA.post("/", {
      caseTitle: MARKER,
      deviceId: DEVICE_B, // must be ignored — ownership is server-derived from X-Device-Id
    });
    check("POST with body deviceId=DEVICE_B (from Device A) -> 201", spoofed.status === 201, `status=${spoofed.status}`);
    const spoofedId = spoofed.data?.case?._id;
    check("stored ownership is server-derived (deviceId=DEVICE_A), spoof ignored",
      spoofed.data?.case?.deviceId === DEVICE_A, `deviceId=${spoofed.data?.case?.deviceId}`);
    const spoofListB = await deviceB.get("/", { params: { limit: 100 } });
    check("spoof-attempt case is NOT visible to the spoofed device (Device B)",
      !(spoofListB.data?.cases || []).some((c) => c._id === spoofedId));
    const spoofUpdB = await deviceB.put(`/${spoofedId}`, { description: "spoof write attempt" });
    check("PUT on spoof case by Device B -> 403", spoofUpdB.status === 403, `status=${spoofUpdB.status}`);
    const spoofReadB = await deviceB.get(`/${spoofedId}`);
    check("GET spoof case by Device B -> 403", spoofReadB.status === 403, `status=${spoofReadB.status}`);

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

    // ── TEST 6.5: DELETE edge cases (invalid id, cross-device, cascade) ──
    const invalidDel = await deviceA.delete("/not-an-object-id");
    check("DELETE with invalid ObjectId -> 400", invalidDel.status === 400, `status=${invalidDel.status}`);

    const crossDevDel = await deviceB.delete(`/${caseId}`);
    check("DELETE Device A's case by Device B -> 403", crossDevDel.status === 403, `status=${crossDevDel.status}`);
    const stillThere = await Case.countDocuments({ _id: caseId });
    check("case intact after cross-device delete attempt (count=1)", stillThere === 1, `count=${stillThere}`);

    // Create orphan-prone dependents that MUST be cascade-removed on delete.
    const dummyUser = new mongoose.Types.ObjectId();
    await Notification.create({
      user: dummyUser,
      category: "system",
      title: "Cascade cleanup check",
      body: "Temporary notification for anonymous smoke cleanup verification.",
      meta: { caseId },
    });
    await AIConversation.create({
      title: "Cascade cleanup check",
      metadata: { caseId },
    });
    // Control row referencing a DIFFERENT case id — must survive the delete.
    await Notification.create({
      user: dummyUser,
      category: "system",
      title: "Control notification",
      body: "Must survive cascade cleanup.",
      meta: { caseId: new mongoose.Types.ObjectId() },
    });

    // ── TEST 7: DELETE + cascade + audit + not-found re-check ──
    const deleted = await deviceA.delete(`/${caseId}`);
    check("DELETE /api/cases/:id (Device A) -> 200 with id echo",
      deleted.status === 200 && String(deleted.data?.id) === String(caseId),
      `status=${deleted.status} body=${JSON.stringify(deleted.data).slice(0, 120)}`);
    const orphanNotif = await Notification.countDocuments({ title: "Cascade cleanup check", "meta.caseId": String(caseId) });
    check("cascade: notification referencing the case was removed", orphanNotif === 0, `count=${orphanNotif}`);
    const orphanAi = await AIConversation.countDocuments({ "metadata.caseId": String(caseId) });
    check("cascade: AI conversation referencing the case was removed", orphanAi === 0, `count=${orphanAi}`);
    const controlCount = await Notification.countDocuments({ title: "Control notification" });
    check("cascade: control notification (other caseId) survives", controlCount === 1, `count=${controlCount}`);
    const auditCount = await AuditLog.countDocuments({ action: "case.delete", module: "cases", recordId: String(caseId) });
    check("audit: case.delete entry written for deleted case", auditCount >= 1, `count=${auditCount}`);
    const afterDelete = await deviceA.get(`/${caseId}`);
    check("GET after delete -> 404", afterDelete.status === 404, `status=${afterDelete.status}`);
    const secondDelete = await deviceA.delete(`/${caseId}`);
    check("second DELETE (already deleted) -> 404", secondDelete.status === 404, `status=${secondDelete.status}`);
    const dbCount = await Case.countDocuments({ _id: caseId });
    check("case removed from database", dbCount === 0, `count=${dbCount}`);
    caseId = null; // already cleaned
  } finally {
    // ── TEST 8: CLEANUP (always runs, even on assertion failure) ──
    // Idempotent: only documents created by this test are removed.
    const result = await Case.deleteMany({
      deviceId: { $in: [DEVICE_A, DEVICE_B] },
      caseTitle: MARKER,
    });
    await Notification.deleteMany({
      title: { $in: ["Cascade cleanup check", "Control notification"] },
    });
    await AIConversation.deleteMany({ title: "Cascade cleanup check" });
    if (anonNumber) {
      await AuditLog.deleteMany({ action: "case.delete", recordLabel: anonNumber });
    }
    console.log(`\nCleanup: removed ${result.deletedCount} test case record(s)`);
    await mongoose.disconnect();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error("Smoke test crashed:", err.message);
  process.exit(1);
});
