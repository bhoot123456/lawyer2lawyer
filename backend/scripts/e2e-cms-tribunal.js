/**
 * E2E VERIFICATION of the FIXED generic CMS editor contract.
 * Simulates exactly what [module]/[id].tsx now does:
 *   _modules -> allowedFields -> payload built ONLY from allowlist.
 * Safe logging only (module names, ids, field names, non-sensitive values).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const BASE = "http://127.0.0.1:5000/api";
let failures = 0;
function check(label, ok, detail) {
  console.log((ok ? "  ok - " : "  FAIL - ") + label + (detail ? ` (${detail})` : ""));
  if (!ok) failures++;
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("../models/User");
  const admin = await User.findOne({ role: "admin", adminType: "super_admin" }).lean();
  if (!admin) throw new Error("No super admin found");
  const token = jwt.sign({ userId: String(admin._id) }, process.env.JWT_SECRET, { expiresIn: "30m" });
  const api = axios.create({ baseURL: BASE, headers: { Authorization: "Bearer " + token }, validateStatus: () => true });

  // 1. Registry allowlist - same call the fixed editor makes on screen load.
  const modsRes = await api.get("/admin/cms/_modules");
  check("GET /admin/cms/_modules -> 200", modsRes.status === 200, `status=${modsRes.status}`);
  const tribModule = (modsRes.data?.data?.modules || []).find((m) => m.key === "tribunals");
    const allowedFields = tribModule?.allowedFields || [];
  check("_modules exposes tribunals.allowedFields", allowedFields.length > 0, `${allowedFields.length} fields`);
  check("statusField is null for tribunals", tribModule?.statusField === null);

  // TEST 1: valid create - exact starter payload of the FIXED editor (no `status`).
  const MARKER = "[E2E-FIX] Tribunal " + Date.now();
  const fixedCreateRes = await api.post("/admin/cms/tribunals", {
    name: MARKER, category: "Tax", jurisdiction: "National", isActive: true,
  });
  check("POST valid tribunal -> 201", fixedCreateRes.status === 201, `status=${fixedCreateRes.status}`);
  const rid = fixedCreateRes.data?.data?._id;
  check("create returns document id", !!rid);


  // Load the record into "form" like the editor does.
  const gotRes = await api.get("/admin/cms/tribunals/" + rid);
  check("GET created tribunal -> 200", gotRes.status === 200);
  const form = gotRes.data?.data;

  // THE FIX: build payload from allowedFields only (+ concurrency token).
  const HIDDEN_FIELDS = new Set([
    "_id", "__v", "createdAt", "updatedAt", "isDeleted", "deletedAt",
    "deletedBy", "publishedAt", "views", "likes", "slug",
  ]);
  const fields = allowedFields.filter((k) => !HIDDEN_FIELDS.has(k));
  const payload = {};
  for (const f of fields) if (form[f] !== undefined) payload[f] = form[f];
  payload.expectedUpdatedAt = form.updatedAt;

  // TEST 2: valid update via the registry-filtered payload path.
  const EDIT_MARKER = "Description edited by E2E fix verification.";
  payload.description = EDIT_MARKER;
  const putRes = await api.put("/admin/cms/tribunals/" + rid, payload);
  check("PUT with registry-filtered payload -> 200", putRes.status === 200,
    `status=${putRes.status} body=${JSON.stringify(putRes.data?.message || "")}`);

  // Verify persistence through the CMS read API.
  const gotAgain = await api.get("/admin/cms/tribunals/" + rid);
  check("CMS GET after PUT shows the edit",
    gotAgain.data?.data?.description === EDIT_MARKER,
    `description="${(gotAgain.data?.data?.description || "").slice(0, 50)}"`);

  // TEST 5: stale update/version -> 409.
  const staleRes = await api.put("/admin/cms/tribunals/" + rid, {
    ...payload, description: "Should conflict", expectedUpdatedAt: "2000-01-01T00:00:00.000Z",
  });
  check("PUT with stale expectedUpdatedAt -> 409", staleRes.status === 409, `status=${staleRes.status}`);

  // TEST 3: invalid required field -> 400.
  const noName = await api.post("/admin/cms/tribunals", { category: "Tax" });
  check("POST missing required name -> 400", noName.status === 400, `status=${noName.status}`);

  // TEST 4: invalid field type (object on scalar) -> 400.
  const badType = await api.post("/admin/cms/tribunals", {
    name: "[E2E] badtype", displayOrder: { nested: true },
  });
  check("POST object on scalar field -> 400", badType.status === 400, `status=${badType.status}`);

  // Unauthorized field -> 400 (allowlist security intact).
  const rogueField = await api.put("/admin/cms/tribunals/" + rid, {
    description: "x", dataSource: "not-in-registry",
  });
  check("PUT unauthorized field (dataSource) -> 400", rogueField.status === 400, `status=${rogueField.status}`);

  // TEST 6/7/8: unauthenticated -> 401; public APIs still work.
  const anon = axios.create({ baseURL: BASE, validateStatus: () => true });
  const anonGet = await anon.get("/admin/cms/tribunals");
  check("Unauthenticated CMS list -> 401", anonGet.status === 401, `status=${anonGet.status}`);
  const pubList = await anon.get("/tribunals");
  check("PUBLIC GET /api/tribunals -> 200", pubList.status === 200, `status=${pubList.status}`);
  const pubOne = await anon.get("/tribunals/" + rid);
  check("PUBLIC GET /api/tribunals/:id finds the new record", pubOne.status === 200, `status=${pubOne.status}`);
  check("Public detail carries the persisted edit",
    pubOne.status === 200 && JSON.stringify(pubOne.data).includes(EDIT_MARKER));
  const pubSearch = await anon.get("/tribunals?search=" + encodeURIComponent("[E2E-FIX]"));
  check("PUBLIC search/filter works", pubSearch.status === 200, `status=${pubSearch.status}`);

  // Cleanup.
  const Tribunal = require("../models/Tribunal");
  const del = await Tribunal.deleteMany({ name: { $regex: "^\\[E2E" } });
  console.log(`\nCleanup: removed ${del.deletedCount} E2E records.`);

  await mongoose.connection.close();
  console.log(failures === 0 ? "\nALL E2E CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
  console.error("E2E ERROR:", e.message);
  process.exit(1);
});

