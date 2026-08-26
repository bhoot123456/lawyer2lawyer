/**
 * LOCAL CMS SMOKE TEST (run against http://127.0.0.1:5000).
 * Creates a clearly-labelled tribunal, exercises the full CMS CRUD +
 * publish flow, verifies the public API reflects it, then hard-cleans
 * every artifact it created (record + its audit entries).
 *
 * Usage: node scripts/smoke-cms-local.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const BASE = "http://127.0.0.1:5000/api";
const MARKER = "[SMOKE-CMS-TEST] Tribunal Verification Record";

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  ok - ${name}`); }
  else { failed++; console.error(`  FAIL - ${name}${extra ? ` :: ${extra}` : ""}`); }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("../models/User");
  const Tribunal = require("../models/Tribunal");
  const AuditLog = require("../models/AuditLog");

  const admin = await User.findOne({ role: "admin", adminType: "super_admin" }).lean();
  if (!admin) { console.error("No super admin account found — cannot authenticate."); process.exit(1); }
  const token = jwt.sign({ userId: String(admin._id) }, process.env.JWT_SECRET, { expiresIn: "30m" });
  const api = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true });

  // ── Phase A: identity & module discovery ──
  const me = await api.get("/admin/system/me");
  check("GET /admin/system/me -> 200", me.status === 200, `status=${me.status}`);
  check("me returns super admin identity", me.data?.data?.isSuperAdmin === true);
  check("me leaks no password/token fields", !("password" in (me.data?.data || {})) && !("token" in (me.data?.data || {})));

  const mods = await api.get("/admin/cms/_modules");
  check("GET /admin/cms/_modules -> 200", mods.status === 200, `status=${mods.status}`);
  const modList = mods.data?.data?.modules || [];
  check("_modules includes tribunals with permission map", !!modList.find((m) => m.key === "tribunals" && m.permissions?.view === true));
  check("_modules includes police modules", !!modList.find((m) => m.key === "police-stations") && !!modList.find((m) => m.key === "police-hierarchy"));
  console.log(`       (${modList.length} authorized modules)`);

  // Unauthenticated must be rejected.
  const anon = await axios.get(`${BASE}/admin/system/me`, { validateStatus: () => true }).catch(() => ({ status: 0 }));
  check("unauthenticated /admin/system/me -> 401", anon.status === 401, `status=${anon.status}`);

  // ── Phase B: tribunal CMS CRUD + publish ──
  // Clean any residue from a previously interrupted run.
  await Tribunal.deleteMany({ name: MARKER });
  await AuditLog.deleteMany({ recordLabel: MARKER });

  const list0 = await api.get("/admin/cms/tribunals?limit=5");
  check("GET /admin/cms/tribunals -> 200", list0.status === 200, `status=${list0.status}`);

  const created = await api.post("/admin/cms/tribunals", {
    name: MARKER,
    category: "Tax",
    jurisdiction: "National",
    description: "Temporary record for local CMS smoke verification.",
    isActive: true,
  });
  check("POST /admin/cms/tribunals -> 201", created.status === 201, `status=${created.status} body=${JSON.stringify(created.data).slice(0, 200)}`);
  const id = created.data?.data?._id;

  const got = await api.get(`/admin/cms/tribunals/${id}`);
  check("GET /admin/cms/tribunals/:id -> 200", got.status === 200 && got.data?.data?.name === MARKER);

  const upd = await api.put(`/admin/cms/tribunals/${id}`, {
    description: "Updated by smoke test.",
    expectedUpdatedAt: got.data?.data?.updatedAt,
  });
  check("PUT /admin/cms/tribunals/:id (valid concurrency token) -> 200", upd.status === 200, `status=${upd.status}`);

  const conflict = await api.put(`/admin/cms/tribunals/${id}`, {
    description: "Should be rejected.",
    expectedUpdatedAt: "2000-01-01T00:00:00.000Z",
  });
  check("PUT with stale token -> 409 CONFLICT", conflict.status === 409, `status=${conflict.status}`);

  const pub = await api.patch(`/admin/cms/tribunals/${id}/status`, { action: "publish" });
  check(
    "PATCH publish -> 200 with isActive=true",
    pub.status === 200 && pub.data?.data?.isActive === true,
    `status=${pub.status} body=${JSON.stringify(pub.data).slice(0, 160)}`,
  );

  // Public API must reflect admin change.
  const publicApi = await axios.get(`${BASE}/tribunals`, { validateStatus: () => true });
  const arr = publicApi.data?.tribunals || [];
  check("public GET /api/tribunals shows published change", publicApi.status === 200 && arr.some((t) => t.name === MARKER), `status=${publicApi.status} count=${arr.length}`);

  // Audit trail written.
  const audits = await AuditLog.find({ recordLabel: MARKER }).lean();
  check("audit entries recorded for CREATE/UPDATE/PUBLISH", audits.length >= 3, `found=${audits.length}`);

  // Unknown module is never served.
  const unknownMod = await api.get("/admin/cms/not-a-real-module");
  check("unknown CMS module -> 404 (allowlist holds)", unknownMod.status === 404, `status=${unknownMod.status}`);

  // ── Cleanup: remove ALL smoke artifacts ──
  await Tribunal.deleteMany({ name: MARKER });
  const delAudits = await AuditLog.deleteMany({ recordLabel: MARKER });
  console.log(`\nCleanup: removed test record + ${delAudits.deletedCount} audit entries`);

  console.log(`\n${passed} passed, ${failed} failed`);
  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => { console.error("SMOKE ERROR:", e.message); process.exit(1); });