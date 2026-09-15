// Regression test for the exact reported bug:
// POST /api/cases -> 400 when CaseForm sent caseNumber: "" (blank optional field).
// Requires the backend server running on 127.0.0.1:5000.
const axios = require("axios");
const crypto = require("crypto");

const BASE = "http://127.0.0.1:5000/api/cases";
let pass = 0;
let fail = 0;

function check(name, cond, extra) {
  if (cond) {
    pass++;
    console.log("  ok -", name);
  } else {
    fail++;
    console.log("  FAIL -", name, extra ? `(${extra})` : "");
  }
}

const uuidA = crypto.randomUUID();
const uuidB = crypto.randomUUID();

async function main() {
  // ── TEST 1: EXACT ORIGINAL 400 REPRODUCTION — blank caseNumber ──
  // This is the payload CaseForm used to send when the Case Number field
  // was left blank: `caseNumber: ""` present in the body.
  const res = await axios.post(
    BASE,
    {
      caseTitle: "[SMOKE-CASES-TEST] Blank CaseNumber Regression",
      caseNumber: "",
      assignedTo: "",
      client: "",
      court: "Regression High Court",
      filingDate: "2026-01-15T00:00:00.000Z",
      nextHearingDate: "2026-12-01T00:00:00.000Z",
      currentStage: "Pending",
      status: "Pending",
      priority: "Medium",
      description: "",
      importantNotes: "",
      caseTags: [],
      expenses: {},
      documents: [],
      notes: [],
    },
    { headers: { "X-Device-Id": uuidA } },
  );
  check("POST /api/cases with caseNumber:\"\" -> 201 (was 400)", res.status === 201, `status=${res.status}`);
  check("server auto-generated a case number", !!res.data?.case?.caseNumber);
  check("ownership bound to device identity", res.data?.case?.deviceId === uuidA);
  const caseId = res.data?.case?._id;

  // ── TEST 2: whitespace-only caseNumber also allowed ──
  const ws = await axios.post(
    BASE,
    { caseTitle: "[SMOKE-CASES-TEST] Whitespace CaseNumber", caseNumber: "   " },
    { headers: { "X-Device-Id": uuidA } },
  );
  check("POST with whitespace-only caseNumber -> 201", ws.status === 201, `status=${ws.status}`);
  const wsId = ws.data?.case?._id;

  // ── TEST 3: still rejects genuinely invalid payloads ──
  const invalidStatus = await axios.post(
    BASE,
    { caseTitle: "x", status: "NotARealStatus" },
    { headers: { "X-Device-Id": uuidA }, validateStatus: () => true },
  ).catch((e) => e.response);
  check("invalid status -> 400", invalidStatus.status === 400, `status=${invalidStatus.status}`);

  const invalidDate = await axios.post(
    BASE,
    { caseTitle: "x", filingDate: "2024-02-30" },
    { headers: { "X-Device-Id": uuidA }, validateStatus: () => true },
  ).catch((e) => e.response);
  check("impossible calendar date (2024-02-30) -> 400", invalidDate.status === 400, `status=${invalidDate.status}`);

  const nonStringCaseNumber = await axios.post(
    BASE,
    { caseTitle: "x", caseNumber: 12345 },
    { headers: { "X-Device-Id": uuidA }, validateStatus: () => true },
  ).catch((e) => e.response);
  check("non-string caseNumber -> 400", nonStringCaseNumber.status === 400, `status=${nonStringCaseNumber.status}`);

  const noIdentity = await axios.post(
    BASE,
    { caseTitle: "x" },
    { validateStatus: () => true },
  ).catch((e) => e.response);
  check("no deviceId + no JWT -> 400 (identity required)", noIdentity.status === 400, `status=${noIdentity.status}`);

  // ── TEST 4: invalid deviceId format still rejected by middleware ──
  const badDevice = await axios.post(
    BASE,
    { caseTitle: "x" },
    { headers: { "X-Device-Id": "not-a-uuid; drop cases" }, validateStatus: () => true },
  ).catch((e) => e.response);
  check("malformed X-Device-Id -> 400", badDevice.status === 400, `status=${badDevice.status}`);

  // ── TEST 5: IDOR matrix — Device B cannot read/modify/delete A's case ──
  const getB = await axios.get(`${BASE}/${caseId}`, {
    headers: { "X-Device-Id": uuidB }, validateStatus: () => true,
  }).catch((e) => e.response);
  check("Device B GET Device A case -> 403", getB.status === 403, `status=${getB.status}`);

  const putB = await axios.put(`${BASE}/${caseId}`, { description: "hack" }, {
    headers: { "X-Device-Id": uuidB }, validateStatus: () => true,
  }).catch((e) => e.response);
  check("Device B PUT Device A case -> 403", putB.status === 403, `status=${putB.status}`);

  const delB = await axios.delete(`${BASE}/${caseId}`, {
    headers: { "X-Device-Id": uuidB }, validateStatus: () => true,
  }).catch((e) => e.response);
  check("Device B DELETE Device A case -> 403", delB.status === 403, `status=${delB.status}`);

  const listB = await axios.get(BASE, {
    headers: { "X-Device-Id": uuidB }, params: { limit: 100 }, validateStatus: () => true,
  }).catch((e) => e.response);
  check("Device B list does not contain Device A case",
    !(listB.data?.cases || []).some((c) => c._id === caseId));

  // ── TEST 6: owner update with hearing date + cleanup ──
  const upd = await axios.put(`${BASE}/${caseId}`, { nextHearingDate: "2027-03-15" }, {
    headers: { "X-Device-Id": uuidA }, validateStatus: () => true,
  }).catch((e) => e.response);
  check("Device A PUT own case hearing date -> 200", upd.status === 200, `status=${upd.status}`);
  const stored = upd.data?.case?.nextHearingDate
    ? new Date(upd.data.case.nextHearingDate).toISOString()
    : null;
  check("hearing date persisted (calendar date preserved, no TZ shift)", stored === "2027-03-15T00:00:00.000Z", `stored=${stored}`);

  const delA = await axios.delete(`${BASE}/${caseId}`, {
    headers: { "X-Device-Id": uuidA }, validateStatus: () => true,
  }).catch((e) => e.response);
  check("Device A DELETE own case -> 200", delA.status === 200, `status=${delA.status}`);

  await axios.delete(`${BASE}/${wsId}`, {
    headers: { "X-Device-Id": uuidA }, validateStatus: () => true,
  }).catch(() => {});

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("SMOKE CRASH:", e?.message || e);
  process.exit(1);
});
