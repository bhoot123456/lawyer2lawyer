/**
 * ADMIN ROLE HIERARCHY
 * --------------------
 * Preserves `role = "admin"` for full backward compatibility with the existing
 * JWT authentication and login flows, and layers an `adminType` hierarchy on top.
 *
 *  super_admin        - unrestricted. Only role that can manage other admins.
 *  content_admin      - editorial content (articles, knowledge hub, drafts, forms).
 *  legal_data_admin   - legal reference data (bare acts, criminal laws, courts).
 *  police_admin       - police stations & police hierarchy.
 *  court_admin        - court information (holidays, cause lists, judges).
 *  editor             - create/edit own module content, cannot publish/delete.
 *  viewer             - read-only.
 *
 * Role templates are BASELINES applied at assignment time; individual grants and
 * revocations on the admin user document always win afterwards.
 */

const ADMIN_TYPES = [
  "super_admin",
  "content_admin",
  "legal_data_admin",
  "police_admin",
  "court_admin",
  "editor",
  "viewer",
];

const VIEW_ONLY_MODULES = [
  "dashboard.view",
];

const ROLE_TEMPLATES = {
  super_admin: null, // resolved dynamically: every permission.

  content_admin: [
    "dashboard.view",
    "articles.view", "articles.create", "articles.edit", "articles.publish", "articles.delete",
    "knowledge_hub.view", "knowledge_hub.create", "knowledge_hub.edit", "knowledge_hub.publish", "knowledge_hub.delete",
    "draft_library.view", "draft_library.create", "draft_library.edit", "draft_library.publish", "draft_library.delete",
    "misc_forms.view", "misc_forms.create", "misc_forms.edit", "misc_forms.publish", "misc_forms.delete",
  ],

  legal_data_admin: [
    "dashboard.view",
    "bare_acts.view", "bare_acts.create", "bare_acts.edit", "bare_acts.publish", "bare_acts.delete",
    "criminal_laws.view", "criminal_laws.create", "criminal_laws.edit", "criminal_laws.publish", "criminal_laws.delete",
    "tribunals.view", "tribunals.create", "tribunals.edit", "tribunals.publish", "tribunals.delete",
    "supreme_court.view", "supreme_court.create", "supreme_court.edit", "supreme_court.publish", "supreme_court.delete",
    "delhi_courts.view", "delhi_courts.create", "delhi_courts.edit", "delhi_courts.publish", "delhi_courts.delete",
    "district_courts.view", "district_courts.create", "district_courts.edit", "district_courts.publish", "district_courts.delete",
    "judge_directory.view", "judge_directory.create", "judge_directory.edit", "judge_directory.delete",
    "quasi_judicial.view", "quasi_judicial.create", "quasi_judicial.edit", "quasi_judicial.delete",
    "revenue_court.view", "revenue_court.create", "revenue_court.edit", "revenue_court.publish", "revenue_court.delete",
    "tax_corporate.view", "tax_corporate.create", "tax_corporate.edit", "tax_corporate.publish", "tax_corporate.delete",
  ],

  police_admin: [
    "dashboard.view",
    "police.view", "police.create", "police.edit", "police.publish", "police.delete",
    "police_hierarchy.view", "police_hierarchy.create", "police_hierarchy.edit", "police_hierarchy.delete",
  ],

  court_admin: [
    "dashboard.view",
    "court_holidays.view", "court_holidays.create", "court_holidays.edit", "court_holidays.delete",
    "cause_lists.view", "cause_lists.create", "cause_lists.edit", "cause_lists.delete",
    "judge_directory.view", "judge_directory.create", "judge_directory.edit", "judge_directory.delete",
    "district_courts.view", "district_courts.edit",
    "supreme_court.view", "supreme_court.edit",
  ],

  editor: [
    "dashboard.view",
    "articles.view", "articles.create", "articles.edit",
    "knowledge_hub.view", "knowledge_hub.create", "knowledge_hub.edit",
    "misc_forms.view", "misc_forms.create", "misc_forms.edit",
  ],

  viewer: VIEW_ONLY_MODULES.slice(),
};

/** Lazily build the super admin permission set without a circular import. */
let superAdminCache = null;
function getSuperAdminPermissions() {
  if (!superAdminCache) {
    const {
      ALL_PERMISSIONS,
    } = require("./registry");
    superAdminCache = ALL_PERMISSIONS.slice();
  }
  return superAdminCache;
}

/** Resolve the baseline permission set for an adminType. */
function getRoleTemplate(adminType) {
  if (adminType === "super_admin") return getSuperAdminPermissions();
  return ROLE_TEMPLATES[adminType] || [];
}

function isValidAdminType(t) {
  return ADMIN_TYPES.includes(t);
}

module.exports = {
  ADMIN_TYPES,
  ROLE_TEMPLATES,
  getRoleTemplate,
  isValidAdminType,
};
