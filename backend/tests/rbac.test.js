/**
 * RBAC & CMS Engine security tests (no database required).
 * Run: npm test  (from backend/)
 */
const assert = require("assert");
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok - ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.error(`  FAIL - ${name}\n    ${e.message}`);
  }
}

// ── Permission registry ─────────────────────────────────────────────────────
console.log("Permission registry:");
const {
  hasExplicitPermission,
  ALL_PERMISSIONS,
  PERMISSION_SET,
} = require("../admin/permissions/registry");

test("denies undefined permission (secure by default)", () => {
  assert.strictEqual(hasExplicitPermission({}, "tribunals.edit"), false);
});

test("denies null/missing permissions object", () => {
  assert.strictEqual(hasExplicitPermission(null, "tribunals.view"), false);
  assert.strictEqual(hasExplicitPermission(undefined, "tribunals.view"), false);
});

test("grants explicitly true granular permission", () => {
  assert.strictEqual(hasExplicitPermission({ "tribunals.edit": true }, "tribunals.edit"), true);
});

test("explicit false denies", () => {
  assert.strictEqual(hasExplicitPermission({ "bare_acts.delete": false }, "bare_acts.delete"), false);
});

test("unknown permission strings are never grantable", () => {
  assert.strictEqual(hasExplicitPermission({ "system.drop_database": true }, "system.drop_database"), false);
});

test("legacy manageTribunals=true implies tribunals.*", () => {
  assert.strictEqual(hasExplicitPermission({ manageTribunals: true }, "tribunals.view"), true);
  assert.strictEqual(hasExplicitPermission({ manageTribunals: true }, "tribunals.publish"), true);
  assert.strictEqual(hasExplicitPermission({ manageTribunals: true }, "police.view"), false);
});

test("legacy permission explicitly false does NOT grant granular", () => {
  assert.strictEqual(hasExplicitPermission({ manageTribunals: false }, "tribunals.view"), false);
});

test("registry contains required spec modules", () => {
  for (const p of [
    "dashboard.view", "users.view", "lawyers.verify", "cases.archive",
    "articles.publish", "bare_acts.create", "criminal_laws.edit",
    "tribunals.publish", "supreme_court.view", "district_courts.create",
    "judge_directory.delete", "police.view", "police_hierarchy.edit",
    "revenue_court.publish", "tax_corporate.edit", "knowledge_hub.publish",
    "draft_library.create", "misc_forms.view", "court_holidays.delete",
    "cause_lists.create", "audit_logs.view", "admin_users.create",
    "admin_permissions.manage",
  ]) {
    assert.ok(PERMISSION_SET.has(p), `missing ${p}`);
  }
  assert.ok(ALL_PERMISSIONS.length >= 80);
});

// ── Role hierarchy ───────────────────────────────────────────────────────────
console.log("Role hierarchy:");
const { getRoleTemplate, isValidAdminType, ADMIN_TYPES } = require("../admin/permissions/roles");

test("all role template permissions are valid registry permissions", () => {
  for (const t of ADMIN_TYPES) {
    for (const p of getRoleTemplate(t)) {
      assert.ok(PERMISSION_SET.has(p), `${t} has invalid permission ${p}`);
    }
  }
});

test("viewer is read-only", () => {
  const perms = getRoleTemplate("viewer");
  for (const p of perms) assert.ok(p.endsWith(".view"));
});

test("super_admin template covers every permission", () => {
  assert.deepStrictEqual(new Set(getRoleTemplate("super_admin")), PERMISSION_SET);
});

test("invalid admin types rejected", () => {
  assert.strictEqual(isValidAdminType("hacker"), false);
  assert.strictEqual(isValidAdminType("police_admin"), true);
});

// ── checkPermission middleware ──────────────────────────────────────────────
console.log("checkPermission middleware:");
const adminAuth = require("../middleware/adminAuth");

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(b) { this.body = b; return this; },
  };
}

function runCheck(user, permission) {
  const mw = adminAuth.checkPermission(permission);
  const req = { user };
  const res = mockRes();
  let nextCalled = false;
  mw(req, res, () => { nextCalled = true; });
  return { nextCalled, res };
}

test("non-admin user -> 403", () => {
  const { res, nextCalled } = runCheck({ role: "client" }, "tribunals.view");
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test("admin without permission -> 403 with PERMISSION_DENIED", () => {
  const { res, nextCalled } = runCheck(
    { role: "admin", permissions: {} },
    "tribunals.edit",
  );
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.code, "PERMISSION_DENIED");
  assert.strictEqual(nextCalled, false);
});

test("admin WITH explicit permission -> allowed", () => {
  const { nextCalled } = runCheck(
    { role: "admin", permissions: { "criminal_laws.publish": true } },
    "criminal_laws.publish",
  );
  assert.strictEqual(nextCalled, true);
});

test("legacy admin (manage* defaults) keeps access via mapping", () => {
  const { nextCalled } = runCheck(
    {
      role: "admin",
      permissions: {
        manageLawyers: true, manageClients: true, manageCases: true,
        manageArticles: true, manageBareActs: true, manageTribunals: true,
        manageRevenue: true, manageTax: true, manageReports: true,
        manageJudgeDirectory: true, managePoliceStations: true,
      },
    },
    "tax_corporate.edit",
  );
  assert.strictEqual(nextCalled, true);
});

test("revoked legacy permission immediately blocks API access", () => {
  const { res, nextCalled } = runCheck(
    { role: "admin", permissions: { manageTribunals: false } },
    "tribunals.view",
  );
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test("super_admin bypasses all checks", () => {
  const { nextCalled } = runCheck(
    { role: "admin", adminType: "super_admin", permissions: {} },
    "admin_users.create",
  );
  assert.strictEqual(nextCalled, true);
});

// ── CRUD engine field/sort/filter safety ────────────────────────────────────
console.log("CRUD engine safety:");
const crudEngine = require("../admin/services/crudEngine");

const fakeMod = {
  key: "criminal-laws",
  label: "Criminal Laws",
  deletePolicy: "soft",
  statusField: "status",
  statusEnum: ["draft", "published", "archived"],
  allowedFields: ["title", "actName", "category", "description", "pdfUrl", "status"],
  requiredFields: ["title"],
  searchFields: ["title", "category"],
  sortableFields: ["title", "updatedAt"],
  filterFields: ["status", "category"],
};

test("pickAllowed rejects unknown fields outright", () => {
  assert.throws(
    () => crudEngine.pickAllowed(fakeMod, { title: "ok", isAdmin: true }, { partial: true }),
    /Unknown or restricted field/,
  );
});

test("pickAllowed keeps whitelisted fields and ignores concurrency token", () => {
  const out = crudEngine.pickAllowed(
    fakeMod,
    { title: "NDPS Act", expectedUpdatedAt: new Date().toISOString(), status: "published" },
    { partial: true },
  );
  assert.deepStrictEqual(out, { title: "NDPS Act", status: "published" });
});

test("pickAllowed enforces required fields on create", () => {
  assert.throws(
    () => crudEngine.pickAllowed(fakeMod, { category: "x" }, { partial: false }),
    /"title" is required/,
  );
});

test("buildSort whitelists sortBy (arbitrary expressions rejected)", () => {
  const s1 = crudEngine.buildSort(fakeMod, { sortBy: "passwordHash" });
  assert.deepStrictEqual(s1, { updatedAt: -1 }); // falls back to default
  const s2 = crudEngine.buildSort(fakeMod, { sortBy: "title", sortOrder: "asc" });
  assert.deepStrictEqual(s2, { title: 1 });
});

test("buildFilter rejects invalid status values", () => {
  assert.throws(() => crudEngine.buildFilter(fakeMod, { status: { $ne: null } }), /Invalid status/);
});

test("buildFilter escapes regex in search input (NoSQL injection guard)", () => {
  const f = crudEngine.buildFilter(fakeMod, { search: "^.*$" });
  assert.ok(f.$or[0].title.source.includes("\\^"));
});

test("coerce rejects object payloads on scalar fields", () => {
  assert.throws(
    () => crudEngine.pickAllowed(fakeMod, { pdfUrl: { $gt: "" } }, { partial: true }),
    /must be a primitive/,
  );
});

test("soft-delete modules always scope list filters away deleted docs", () => {
  const f = crudEngine.buildFilter(fakeMod, {});
  assert.deepStrictEqual(f.isDeleted, { $ne: true });
});

// ── Audit sanitizer ─────────────────────────────────────────────────────────
console.log("Audit sanitizer:");
const { deepSanitize } = require("../admin/audit/auditService");

test("passwords are redacted from audit payloads", () => {
  const out = deepSanitize({ name: "x", password: "hunter2", nested: { refreshToken: "abc" } });
  assert.strictEqual(out.password, "[redacted]");
  assert.strictEqual(out.nested.refreshToken, "[redacted]");
  assert.strictEqual(out.name, "x");
});

test("oversized content is truncated in audit payloads", () => {
  const out = deepSanitize({ content: "a".repeat(5000) });
  assert.ok(out.content.length < 3000);
});

// ── CMS module authorization (/admin/cms/_modules) ─────────────────────────
console.log("CMS module authorization:");
const { computeAuthorizedModules } = require("../admin/controllers/cmsController");
const { CONTENT_REGISTRY } = require("../admin/registry/contentRegistry");

test("registry exposes police administration modules (Part 13)", () => {
  assert.ok(CONTENT_REGISTRY["police-stations"], "police-stations missing from registry");
  assert.ok(CONTENT_REGISTRY["police-hierarchy"], "police-hierarchy missing from registry");
  assert.strictEqual(CONTENT_REGISTRY["police-stations"].permissionKey, "police");
  assert.strictEqual(CONTENT_REGISTRY["police-hierarchy"].permissionKey, "police_hierarchy");
});

test("super admin sees every module with full grants", () => {
  const mods = computeAuthorizedModules({ role: "admin", adminType: "super_admin", permissions: {} });
  assert.ok(mods.length >= 15);
  const trib = mods.find((m) => m.key === "tribunals");
  for (const a of ["view", "create", "edit", "publish", "archive", "delete"]) {
    assert.strictEqual(trib.permissions[a], true, `super admin lacks ${a} on tribunals`);
  }
});

test("restricted admin sees ONLY explicitly granted modules/actions", () => {
  const mods = computeAuthorizedModules({
    role: "admin",
    adminType: "sub_admin",
    permissions: { "tribunals.view": true, "tribunals.edit": true },
  });
  assert.strictEqual(mods.length, 1);
  assert.strictEqual(mods[0].key, "tribunals");
  assert.deepStrictEqual(mods[0].permissions, {
    view: true, create: false, edit: true,
    publish: false, archive: true, delete: false,
  });
});

test("admin with zero grants receives an empty module list", () => {
  assert.deepStrictEqual(
    computeAuthorizedModules({ role: "admin", adminType: "viewer", permissions: {} }),
    [],
  );
});

test("legacy manageTribunals=true still surfaces the tribunals module", () => {
  const mods = computeAuthorizedModules({ role: "admin", permissions: { manageTribunals: true } });
  assert.ok(mods.some((m) => m.key === "tribunals"));
});

// ── Structured fields (embedded sub-document editing) ───────────────────────
console.log("Structured fields:");
const policeMod = CONTENT_REGISTRY["police-stations"];

test("whitelisted structured fields accept flat primitive objects", () => {
  const out = crudEngine.pickAllowed(
    policeMod,
    { name: "PS X", sho: { name: "Inspector A", phone: "100" }, location: { latitude: 28.6 } },
    { partial: true },
  );
  assert.deepStrictEqual(out.sho, { name: "Inspector A", phone: "100" });
  assert.deepStrictEqual(out.location, { latitude: 28.6 });
});

test("structured fields reject operator keys and nested objects", () => {
  assert.throws(
    () => crudEngine.pickAllowed(policeMod, { sho: { $gt: 1 } }, { partial: true }),
    /forbidden key/,
  );
  assert.throws(
    () => crudEngine.pickAllowed(policeMod, { sho: { nested: { a: 1 } } }, { partial: true }),
    /primitive values/,
  );
});

test("object payloads on NON-structured fields are still rejected", () => {
  assert.throws(
    () => crudEngine.pickAllowed(policeMod, { address: { $gt: "" } }, { partial: true }),
    /must be a primitive value or array/,
  );
});

// ── summary ─────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
