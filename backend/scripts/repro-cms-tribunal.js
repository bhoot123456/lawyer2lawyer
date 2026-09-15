/**
 * REPRO: Mimics the frontend generic CMS editor's payload construction
 * (app/mobile/src/app/admin/cms/[module]/[id].tsx) to capture the EXACT
 * 400 errors for POST + PUT on the tribunals module.
 *
 * Safe logging: no JWT/passwords/secrets are printed.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const BASE = "http://127.0.0.1:5000/api";

// Mirrors HIDDEN_FIELDS from the frontend generic editor.
const HIDDEN_FIELDS = new Set([
  "_id", "__v", "createdAt", "updatedAt", "isDeleted", "deletedAt",
  "deletedBy", "publishedAt", "views", "likes", "slug",
]);

function log(label, obj) {
  console.log("\n=== " + label + " ===");
  console.log(JSON.stringify(obj, null, 2));
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("../models/User");

  const admin = await User.findOne({ role: "admin", adminType: "super_admin" }).lean();
  if (!admin) {
    console.error("No super admin found.");
    process.exit(1);
  }
  const token = jwt.sign({ userId: String(admin._id) }, process.env.JWT_SECRET, { expiresIn: "30m" });
  const api = axios.create({
    baseURL: BASE,
    headers: { Authorization: "Bearer " + token },
    validateStatus: () => true, // capture all responses
  });

  // ── Check whether the bug-report record exists (read-only, no secrets) ──
  const bugId = "6a80bab05bdd647c6aff8506";
  const bugGet = await api.get("/admin/cms/tribunals/" + bugId);
  log("GET bug-report record (status + name + keys)", {
    status: bugGet.status,
    name: bugGet.data?.data?.name,
    keys: bugGet.data?.data ? Object.keys(bugGet.data.data) : null,
  });

  // ── Create a clean tribunal to reproduce against ──
  const MARKER = "[REPRO] Tribunal " + Date.now();
  const created = await api.post("/admin/cms/tribunals", {
    name: MARKER,
    category: "Tax",
    jurisdiction: "National",
    isActive: true,
  });
  log("POST minimal valid (baseline)", { status: created.status, id: created.data?.data?._id });
  const rid = created.data?.data?._id;

  // ── GET the record: what fields does the backend return? ──
  const got = await api.get("/admin/cms/tribunals/" + rid);
  const rec = got.data?.data;
  log("GET record -> all returned field keys", Object.keys(rec));

  // ── Simulate the FRONTEND generic editor PUT payload exactly ──
  // fields = Object.keys(form).filter(k => !HIDDEN_FIELDS.has(k) && !k.startsWith("$"))
  //        where form = res.data (the full GET response)
  const form = rec;
  const frontendFields = Object.keys(form).filter(
    (k) => !HIDDEN_FIELDS.has(k) && !k.startsWith("$"),
  );
  const frontendPayload = {};
  for (const f of frontendFields) frontendPayload[f] = form[f];

  log("Frontend PUT payload field names", Object.keys(frontendPayload));

  // Show which of those are NOT in the registry allowedFields
  const { getModule } = require("../admin/registry/contentRegistry");
  const mod = getModule("tribunals");
  const notAllowed = Object.keys(frontendPayload).filter((k) => !mod.allowedFields.includes(k));
  log("Frontend PUT fields NOT in registry allowedFields", notAllowed);

  // ── Attempt the PUT the way the frontend does ──
  const putRes = await api.put("/admin/cms/tribunals/" + rid, frontendPayload);
  log("PUT (frontend-style payload)", { status: putRes.status, body: putRes.data });

  // ── Simulate FRONTEND new-record POST exactly ──
  // form starts with { status: "draft" }; user adds name
  const newPayload = { status: "draft", name: "Frontend Create Attempt" };
  const postRes = await api.post("/admin/cms/tribunals", newPayload);
  log("POST (frontend new-record payload with status:'draft')", {
    status: postRes.status,
    body: postRes.data,
  });

  // ── Cleanup ──
  const Tribunal = require("../models/Tribunal");
  await Tribunal.deleteMany({ name: MARKER });
  await mongoose.connection.close();
  console.log("\nRepro complete.");
})().catch((e) => {
  console.error("REPRO ERROR:", e.message);
  process.exit(1);
});
