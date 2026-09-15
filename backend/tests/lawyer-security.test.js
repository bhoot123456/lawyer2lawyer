/**
 * Phase 1 — Lawyer security tests (no database required).
 *
 * Covers the "Authenticated Lawyer Foundation" rules:
 *   1. Public registration can never mint a privileged role
 *      (authService.resolveSelfServiceRole).
 *   2. Lawyer read isolation: a lawyer sees ONLY cases assigned to them
 *      (caseService.canViewCase JWT path).
 *   3. Lawyer edit isolation: same assignedTo scoping (caseService.canEditCase).
 *   4. lawyerAuth.isLawyer gate: role + active/suspended state.
 *   5. Device-first P0 isolation is preserved (deviceId wins over JWT).
 *
 * Run: npm test (from backend/)
 */
const assert = require("assert");
const path = require("path");

const authService = require("../services/authService");
const caseService = require("../services/caseService");
const { isLawyer } = require("../middleware/lawyerAuth");

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

// ═══ 1. Registration role-resolution defense ═══════════════════════════
console.log("Self-service role resolution:");
const { resolveSelfServiceRole } = authService;

test("lawyer is allowed for self-service registration", () => {
  assert.strictEqual(resolveSelfServiceRole("lawyer"), "lawyer");
});

test("client is allowed and is the default", () => {
  assert.strictEqual(resolveSelfServiceRole("client"), "client");
  assert.strictEqual(resolveSelfServiceRole("Client"), "client");
  assert.strictEqual(resolveSelfServiceRole(undefined), "client");
  assert.strictEqual(resolveSelfServiceRole(null), "client");
  assert.strictEqual(resolveSelfServiceRole(""), "client");
});

test("admin is never self-service grantable", () => {
  assert.strictEqual(resolveSelfServiceRole("admin"), "client");
  assert.strictEqual(resolveSelfServiceRole("ADMIN"), "client");
  assert.strictEqual(resolveSelfServiceRole(" Admin "), "client");
});

test("unknown/exotic roles are downgraded to client", () => {
  assert.strictEqual(resolveSelfServiceRole("super_admin"), "client");
  assert.strictEqual(resolveSelfServiceRole("moderator"), "client");
  assert.strictEqual(resolveSelfServiceRole("lawyer'--"), "client");
});

// ═══ 2. isLawyer gate ═════════════════════════════════════════════════
console.log("== lawyerAuth.isLawyer gate:");

test("active lawyer passes the gate", () => {
  assert.strictEqual(isLawyer({ _id: "a", role: "lawyer" }), true);
  assert.strictEqual(isLawyer({ _id: "a", role: "lawyer", isActive: true, isSuspended: false }), true);
});

test("null/undefined user is not a lawyer", () => {
  assert.strictEqual(isLawyer(null), false);
  assert.strictEqual(isLawyer(undefined), false);
});

test("admin/client/unknown roles fail the gate", () => {
  assert.strictEqual(isLawyer({ role: "admin" }), false);
  assert.strictEqual(isLawyer({ role: "client" }), false);
  assert.strictEqual(isLawyer({ role: "super_admin" }), false);
  assert.strictEqual(isLawyer({}), false);
});

test("deactivated or suspended lawyer fails the gate", () => {
  assert.strictEqual(isLawyer({ role: "lawyer", isActive: false }), false);
  assert.strictEqual(isLawyer({ role: "lawyer", isSuspended: true }), false);
  assert.strictEqual(isLawyer({ role: "lawyer", isActive: false, isSuspended: true }), false);
});

// ═══ 3. Case ownership scoping ════════════════════════════════════════
console.log("== Case ownership scoping (canViewCase / canEditCase):");

const lawyerA = { _id: "ObjectId-lawyer-A", role: "lawyer" };
const lawyerB = { _id: "ObjectId-lawyer-B", role: "lawyer" };
const admin = { _id: "ObjectId-admin", role: "admin" };
const client = { _id: "ObjectId-client-1", role: "client" };

const myCase = { _id: "case-1", assignedTo: "ObjectId-lawyer-A", createdBy: "ObjectId-client-1" };
const othersCase = { _id: "case-2", assignedTo: "ObjectId-lawyer-B", createdBy: "ObjectId-client-2" };

test("lawyer can read their own assigned case", () => {
  assert.strictEqual(caseService.canViewCase({ user: lawyerA, caseDoc: myCase }), true);
});

test("lawyers cannot read each other's cases (A/B isolation)", () => {
  assert.strictEqual(caseService.canViewCase({ user: lawyerA, caseDoc: othersCase }), false);
  assert.strictEqual(caseService.canViewCase({ user: lawyerB, caseDoc: myCase }), false);
});

test("lawyer can only edit their own assigned case", () => {
  assert.strictEqual(caseService.canEditCase({ user: lawyerA, caseDoc: myCase }), true);
  assert.strictEqual(caseService.canEditCase({ user: lawyerA, caseDoc: othersCase }), false);
  assert.strictEqual(caseService.canEditCase({ user: lawyerB, caseDoc: myCase }), false);
});

test("admin reads everything; client reads only their own", () => {
  assert.strictEqual(caseService.canViewCase({ user: admin, caseDoc: othersCase }), true);
  assert.strictEqual(caseService.canViewCase({ user: admin, caseDoc: myCase }), true);
  assert.strictEqual(caseService.canViewCase({ user: client, caseDoc: myCase }), true); // createdBy matches
  assert.strictEqual(caseService.canViewCase({ user: client, caseDoc: othersCase }), false);
});

test("deviceId wins over JWT (P0 isolation preserved)", () => {
  const deviceOwned = { _id: "case-3", deviceId: "dev-1" };
  assert.strictEqual(caseService.canViewCase({ user: admin, deviceId: "dev-1", caseDoc: deviceOwned }), true);
  assert.strictEqual(caseService.canViewCase({ user: admin, deviceId: "dev-2", caseDoc: deviceOwned }), false);
  assert.strictEqual(caseService.canViewCase({ user: null, caseDoc: deviceOwned }), false);
});

// ═══ 4. Delete authorization (canDeleteCase) ════════════════════════════════
console.log("== Delete authorization (canDeleteCase):");

const deviceOwned = { _id: "case-4", deviceId: "dev-1" };
const jwtCase = { _id: "case-5", assignedTo: "ObjectId-lawyer-A", createdBy: "ObjectId-client-1" };

test("device owner can delete their own device-scoped case", () => {
  assert.strictEqual(caseService.canDeleteCase({ deviceId: "dev-1", caseDoc: deviceOwned }), true);
});

test("a different device cannot delete someone else's device-scoped case", () => {
  assert.strictEqual(caseService.canDeleteCase({ deviceId: "dev-2", caseDoc: deviceOwned }), false);
});

test("device request can NEVER delete a JWT-scoped case (cross-scope guard)", () => {
  assert.strictEqual(caseService.canDeleteCase({ deviceId: "dev-1", caseDoc: jwtCase }), false);
});

test("JWT-only admin can NEVER delete a device-scoped case (cross-scope guard)", () => {
  assert.strictEqual(caseService.canDeleteCase({ user: admin, caseDoc: deviceOwned }), false);
});

test("JWT-only lawyer can delete their own assigned case", () => {
  assert.strictEqual(caseService.canDeleteCase({ user: lawyerA, caseDoc: jwtCase }), true);
});

test("JWT-only lawyer cannot delete another lawyer's case", () => {
  assert.strictEqual(caseService.canDeleteCase({ user: lawyerB, caseDoc: jwtCase }), false);
});

test("JWT-only admin can delete a JWT-scoped case", () => {
  assert.strictEqual(caseService.canDeleteCase({ user: admin, caseDoc: jwtCase }), true);
});

test("creator (e.g. client) can delete the case they created (createdBy match)", () => {
  assert.strictEqual(caseService.canDeleteCase({ user: client, caseDoc: jwtCase }), true);
  const ownJwtCase = { _id: "case-6", assignedTo: "ObjectId-lawyer-A", createdBy: "ObjectId-client-1" };
  assert.strictEqual(caseService.canDeleteCase({ user: client, caseDoc: ownJwtCase }), true);
});

test("delete denied to clients who did not create the case", () => {
  const otherClientCase = { _id: "case-7", assignedTo: "ObjectId-lawyer-A", createdBy: "ObjectId-client-2" };
  assert.strictEqual(caseService.canDeleteCase({ user: client, caseDoc: otherClientCase }), false);
});

test("no identity can never delete (no device, no user)", () => {
  assert.strictEqual(caseService.canDeleteCase({ user: null, caseDoc: deviceOwned }), false);
  assert.strictEqual(caseService.canDeleteCase({ user: null, caseDoc: jwtCase }), false);
});

test("canDeleteCase is false for missing documents", () => {
  assert.strictEqual(caseService.canDeleteCase({ user: admin, caseDoc: null }), false);
  assert.strictEqual(caseService.canDeleteCase({ deviceId: "dev-1", caseDoc: undefined }), false);
});

// ═══ Summary ══════════════════════════════════════════════════════════
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  for (const f of failures) console.error(`FAILED: ${f.name}\n  ${f.error}`);
  process.exit(1);
}