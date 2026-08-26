/**
 * CENTRAL PERMISSION REGISTRY
 * ---------------------------
 * Single source of truth for every granular admin permission in Lawyer2Lawyer.
 *
 * Rules:
 *  - A permission is granted ONLY when it is explicitly `true` on the admin user.
 *  - Missing / undefined permissions are ALWAYS denied (secure by default).
 *  - Legacy flat permissions (manageLawyers, manageTribunals, ...) are mapped to
 *    their granular equivalents so existing production admins keep working
 *    without a data migration. See LEGACY_PERMISSION_MAP below.
 */

const MODULES = {
  dashboard: { label: "Dashboard", actions: ["view"] },

  users: { label: "Users", actions: ["view", "edit", "suspend", "delete"] },
  lawyers: { label: "Lawyers", actions: ["view", "edit", "verify", "delete"] },
  clients: { label: "Clients", actions: ["view", "edit", "delete"] },
  cases: { label: "Cases", actions: ["view", "edit", "archive", "delete"] },

  articles: { label: "Articles", actions: ["view", "create", "edit", "publish", "delete"] },
  knowledge_hub: { label: "Knowledge Hub", actions: ["view", "create", "edit", "publish", "delete"] },
  draft_library: { label: "Draft Library", actions: ["view", "create", "edit", "publish", "delete"] },
  misc_forms: { label: "Miscellaneous Forms", actions: ["view", "create", "edit", "publish", "delete"] },

  bare_acts: { label: "Bare Acts", actions: ["view", "create", "edit", "publish", "delete"] },
  criminal_laws: { label: "Criminal Laws", actions: ["view", "create", "edit", "publish", "delete"] },

  tribunals: { label: "Tribunals", actions: ["view", "create", "edit", "publish", "delete"] },
  supreme_court: { label: "Supreme Court", actions: ["view", "create", "edit", "publish", "delete"] },
  delhi_courts: { label: "Delhi Courts", actions: ["view", "create", "edit", "publish", "delete"] },
  district_courts: { label: "District Courts", actions: ["view", "create", "edit", "publish", "delete"] },
  judge_directory: { label: "Judge Directory", actions: ["view", "create", "edit", "delete"] },


  police: { label: "Police Stations", actions: ["view", "create", "edit", "publish", "delete"] },
  police_hierarchy: { label: "Police Hierarchy", actions: ["view", "create", "edit", "delete"] },

  revenue_court: { label: "Revenue Courts", actions: ["view", "create", "edit", "publish", "delete"] },
  tax_corporate: { label: "Tax & Corporate", actions: ["view", "create", "edit", "publish", "delete"] },
  quasi_judicial: { label: "Quasi-Judicial Authorities", actions: ["view", "create", "edit", "delete"] },

  court_holidays: { label: "Court Holidays", actions: ["view", "create", "edit", "delete"] },
  cause_lists: { label: "Daily Cause Lists", actions: ["view", "create", "edit", "delete"] },

  reports: { label: "Reports", actions: ["view", "create", "edit", "delete"] },

  audit_logs: { label: "Audit Logs", actions: ["view"] },
  admin_users: { label: "Admin Users", actions: ["view", "create", "edit", "delete"] },
  admin_permissions: { label: "Permissions", actions: ["manage"] },
  system: { label: "System", actions: ["view"] },
};

/** Flat list of every valid permission string, e.g. "tribunals.edit". */
const ALL_PERMISSIONS = Object.entries(MODULES).flatMap(([moduleKey, def]) =>
  def.actions.map((action) => `${moduleKey}.${action}`),
);

const PERMISSION_SET = new Set(ALL_PERMISSIONS);


/**
 * Legacy flat permissions -> granular permissions they imply.
 * Used ONLY to stay backward compatible with pre-existing admin accounts.
 * New code must always grant/check granular permissions.
 */
const LEGACY_PERMISSION_MAP = {
  manageLawyers: ["lawyers.view", "lawyers.edit", "lawyers.verify", "lawyers.delete"],
  manageClients: ["clients.view", "clients.edit", "clients.delete"],
  manageCases: ["cases.view", "cases.edit", "cases.archive", "cases.delete"],
  manageArticles: [
    "articles.view", "articles.create", "articles.edit", "articles.publish", "articles.delete",
  ],
  manageBareActs: [
    "bare_acts.view", "bare_acts.create", "bare_acts.edit", "bare_acts.publish", "bare_acts.delete",
  ],
  manageTribunals: [
    "tribunals.view", "tribunals.create", "tribunals.edit", "tribunals.publish", "tribunals.delete",
  ],
  manageRevenue: [
    "revenue_court.view", "revenue_court.create", "revenue_court.edit", "revenue_court.publish",
    "revenue_court.delete",
  ],
  manageTax: [
    "tax_corporate.view", "tax_corporate.create", "tax_corporate.edit", "tax_corporate.publish",
    "tax_corporate.delete",
  ],
  manageReports: ["reports.view", "reports.create", "reports.edit", "reports.delete"],
  manageJudgeDirectory: [
    "judge_directory.view", "judge_directory.create", "judge_directory.edit", "judge_directory.delete",
    "district_courts.view", "district_courts.create", "district_courts.edit",
    "district_courts.publish", "district_courts.delete",
  ],
  managePoliceStations: [
    "police.view", "police.create", "police.edit", "police.publish", "police.delete",
    "police_hierarchy.view", "police_hierarchy.create", "police_hierarchy.edit", "police_hierarchy.delete",
  ],
};

/** Reverse lookup: granular permission -> legacy keys that imply it. */
const GRANULAR_TO_LEGACY = {};
for (const [legacyKey, perms] of Object.entries(LEGACY_PERMISSION_MAP)) {
  for (const p of perms) {
    if (!GRANULAR_TO_LEGACY[p]) GRANULAR_TO_LEGACY[p] = [];
    GRANULAR_TO_LEGACY[p].push(legacyKey);
  }
}

/**
 * Explicit permission evaluation. SECURE BY DEFAULT.
 * Returns true only when the permission is explicitly true, either as a
 * granular permission or via an explicitly-true legacy permission.
 */
function hasExplicitPermission(permissions, permission) {
  if (!permissions || typeof permissions !== "object") return false;
  // Unknown permission strings are never grantable.
  if (!PERMISSION_SET.has(permission)) return false;

  // 1. Explicit granular grant.
  if (permissions[permission] === true) return true;

  // 2. Backward-compatible explicit legacy grant.
  const legacyKeys = GRANULAR_TO_LEGACY[permission];
  if (legacyKeys) {
    for (const legacyKey of legacyKeys) {
      if (permissions[legacyKey] === true) return true;
    }
  }

  // Everything else (undefined / false / missing) is DENIED.
  return false;
}

/** All granular permissions effectively held by a permissions object. */
function resolveEffectivePermissions(permissions) {
  return ALL_PERMISSIONS.filter((p) => hasExplicitPermission(permissions, p));
}

/** Grouped view model used by the Admin Users permission editor screen. */
function getGroupedPermissions() {
  return Object.entries(MODULES).map(([key, def]) => ({
    key,
    label: def.label,
    actions: def.actions,
    permissions: def.actions.map((a) => `${key}.${a}`),
  }));
}

module.exports = {
  MODULES,
  ALL_PERMISSIONS,
  PERMISSION_SET,
  LEGACY_PERMISSION_MAP,
  GRANULAR_TO_LEGACY,
  hasExplicitPermission,
  resolveEffectivePermissions,
  getGroupedPermissions,
};
