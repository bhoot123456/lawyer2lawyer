import api from "./api";

// ============================
// DASHBOARD
// ============================

export const getAdminDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

export const getRevenueStats = async () => {
  const res = await api.get("/admin/revenue-stats");
  return res.data;
};

// ============================
// LAWYERS MANAGEMENT
// ============================

export const getAdminLawyers = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/lawyers", { params });
  return res.data;
};

export const getAdminLawyerById = async (id: string) => {
  const res = await api.get(`/admin/lawyers/${id}`);
  return res.data;
};

export const updateAdminLawyer = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/lawyers/${id}`, data);
  return res.data;
};

export const verifyLawyer = async (id: string, status: string, rejectionReason?: string) => {
  const res = await api.patch(`/admin/lawyers/${id}/verify`, { status, rejectionReason });
  return res.data;
};

export const deleteAdminLawyer = async (id: string) => {
  const res = await api.delete(`/admin/lawyers/${id}`);
  return res.data;
};

// ============================
// CLIENTS MANAGEMENT
// ============================

export const getAdminClients = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/clients", { params });
  return res.data;
};

export const getAdminClientById = async (id: string) => {
  const res = await api.get(`/admin/clients/${id}`);
  return res.data;
};

export const updateAdminClient = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/clients/${id}`, data);
  return res.data;
};

export const deleteAdminClient = async (id: string) => {
  const res = await api.delete(`/admin/clients/${id}`);
  return res.data;
};

// ============================
// CASES MANAGEMENT
// ============================

export const getAdminCases = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/cases", { params });
  return res.data;
};

export const getAdminCaseById = async (id: string) => {
  const res = await api.get(`/admin/cases/${id}`);
  return res.data;
};

export const updateAdminCase = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/cases/${id}`, data);
  return res.data;
};

export const archiveAdminCase = async (id: string) => {
  const res = await api.patch(`/admin/cases/${id}/archive`);
  return res.data;
};

export const deleteAdminCase = async (id: string) => {
  const res = await api.delete(`/admin/cases/${id}`);
  return res.data;
};

// ============================
// ARTICLES MANAGEMENT
// ============================

export const getAdminArticles = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/articles", { params });
  return res.data;
};

export const getAdminArticleById = async (id: string) => {
  const res = await api.get(`/admin/articles/${id}`);
  return res.data;
};

export const createAdminArticle = async (data: Record<string, any>) => {
  const res = await api.post("/admin/articles", data);
  return res.data;
};

export const updateAdminArticle = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/articles/${id}`, data);
  return res.data;
};

export const publishAdminArticle = async (id: string) => {
  const res = await api.patch(`/admin/articles/${id}/publish`);
  return res.data;
};

export const unpublishAdminArticle = async (id: string) => {
  const res = await api.patch(`/admin/articles/${id}/unpublish`);
  return res.data;
};

export const deleteAdminArticle = async (id: string) => {
  const res = await api.delete(`/admin/articles/${id}`);
  return res.data;
};

// ============================
// USERS (generic)
// ============================

export const getAdminUsers = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

// ============================
// BARE ACTS (Admin CRUD)
// ============================

export const getAdminBareActs = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/bare-acts", { params });
  return res.data;
};

export const getAdminBareActById = async (id: string) => {
  const res = await api.get(`/admin/bare-acts/${id}`);
  return res.data;
};

export const createAdminBareAct = async (data: Record<string, any>) => {
  const res = await api.post(`/admin/bare-acts`, data);
  return res.data;
};

export const updateAdminBareAct = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/bare-acts/${id}`, data);
  return res.data;
};

export const deleteAdminBareAct = async (id: string) => {
  const res = await api.delete(`/admin/bare-acts/${id}`);
  return res.data;
};

// ============================
// REVENUE COURT PHASE 8 (Admin CRUD)
// ============================

export const getAdminRevenueCourtPhase8 = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/revenue-court-phase8", { params });
  return res.data;
};

export const getAdminRevenueCourtPhase8ById = async (id: string) => {
  const res = await api.get(`/admin/revenue-court-phase8/${id}`);
  return res.data;
};

export const createAdminRevenueCourtPhase8 = async (data: Record<string, any>) => {
  const res = await api.post(`/admin/revenue-court-phase8`, data);
  return res.data;
};

export const updateAdminRevenueCourtPhase8 = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/revenue-court-phase8/${id}`, data);
  return res.data;
};

export const deleteAdminRevenueCourtPhase8 = async (id: string) => {
  const res = await api.delete(`/admin/revenue-court-phase8/${id}`);
  return res.data;
};

// ============================
// TAX & CORPORATE PHASE 9 (Admin CRUD)
// ============================

export const getAdminTaxCorporatePhase9 = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/tax-corporate-phase9", { params });
  return res.data;
};

export const getAdminTaxCorporatePhase9ById = async (id: string) => {
  const res = await api.get(`/admin/tax-corporate-phase9/${id}`);
  return res.data;
};

export const createAdminTaxCorporatePhase9 = async (data: Record<string, any>) => {
  const res = await api.post(`/admin/tax-corporate-phase9`, data);
  return res.data;
};

export const updateAdminTaxCorporatePhase9 = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/tax-corporate-phase9/${id}`, data);
  return res.data;
};

export const deleteAdminTaxCorporatePhase9 = async (id: string) => {
  const res = await api.delete(`/admin/tax-corporate-phase9/${id}`);
  return res.data;
};

// ============================
// REPORTS (Admin CRUD)
// ============================

export const getAdminReports = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/reports", { params });
  return res.data;
};

export const getAdminReportById = async (id: string) => {
  const res = await api.get(`/admin/reports/${id}`);
  return res.data;
};

export const createAdminReport = async (data: Record<string, any>) => {
  const res = await api.post(`/admin/reports`, data);
  return res.data;
};

export const updateAdminReport = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/reports/${id}`, data);
  return res.data;
};

export const deleteAdminReport = async (id: string) => {
  const res = await api.delete(`/admin/reports/${id}`);
  return res.data;
};

// ============================
// JUDGE DIRECTORY (Admin CRUD)
// ============================

export const getAdminJudgeDirectory = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/judge-directory", { params });
  return res.data;
};

export const getAdminJudgeDirectoryById = async (id: string) => {
  const res = await api.get(`/admin/judge-directory/${id}`);
  return res.data;
};

export const createAdminJudgeDirectory = async (data: Record<string, any>) => {
  const res = await api.post(`/admin/judge-directory`, data);
  return res.data;
};

export const updateAdminJudgeDirectory = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/judge-directory/${id}`, data);
  return res.data;
};

export const deleteAdminJudgeDirectory = async (id: string) => {
  const res = await api.delete(`/admin/judge-directory/${id}`);
  return res.data;
};

// ============================
// ADMIN CONTEXT / PERMISSIONS (permission-aware UI)
// ============================

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  adminType: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
}

export const getAdminProfile = async (): Promise<AdminProfile> => {
  const res = await api.get("/admin/system/me");
  return res.data?.data;
};

// ============================
// UNIVERSAL ADMIN CMS ENGINE
// Server-side allowlisted modules only — see backend CONTENT_REGISTRY.
// ============================

export interface CmsModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  publish: boolean;
  archive: boolean;
  delete: boolean;
}
export interface CmsModuleMeta {
  key: string;
  label: string;
  permissionKey: string;
  category: string;
  supportsPublish: boolean;
  deletePolicy: "hard" | "archive" | "soft";
  searchFields: string[];
  sortableFields: string[];
    /**
   * Server-side allowlist for which fields the CMS may write to this module.
   * The generic editor filters its outgoing payload through this list so it
   * never submits schema-only/system fields the registry does not expose.
   */
  allowedFields: string[];
  requiredFields?: string[];
  /** Workflow field name, or null when the module has no status workflow. */
  statusField?: string | null;
  filterFields: string[];
  /** Server-computed per-action grants for THIS admin (backend remains the authority). */
  permissions?: CmsModulePermissions;
}

export const getCmsModules = async (): Promise<CmsModuleMeta[]> => {
  const res = await api.get("/admin/cms/_modules");
  return res.data?.data?.modules || [];
};

export interface CmsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

export const cmsList = async (
  moduleKey: string,
  params: CmsListParams = {},
) => {
  const res = await api.get(`/admin/cms/${moduleKey}`, { params });
  return res.data; // { success, data: { items, label, pagination } }
};

export const cmsGet = async (moduleKey: string, id: string) => {
  const res = await api.get(`/admin/cms/${moduleKey}/${id}`);
  return res.data;
};

export const cmsCreate = async (moduleKey: string, data: Record<string, any>) => {
  const res = await api.post(`/admin/cms/${moduleKey}`, data);
  return res.data;
};

export const cmsUpdate = async (
  moduleKey: string,
  id: string,
  data: Record<string, any>,
) => {
  const res = await api.put(`/admin/cms/${moduleKey}/${id}`, data);
  return res.data;
};

export type CmsStatusAction =
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "activate"
  | "deactivate"
  | "verify";

export const cmsStatusAction = async (
  moduleKey: string,
  id: string,
  action: CmsStatusAction,
) => {
  const res = await api.patch(`/admin/cms/${moduleKey}/${id}/status`, { action });
  return res.data;
};

export const cmsDelete = async (moduleKey: string, id: string) => {
  const res = await api.delete(`/admin/cms/${moduleKey}/${id}`);
  return res.data;
};

// ============================
// DATA HEALTH DASHBOARD
// ============================

export interface DataHealthRow {
  module: string;
  label: string;
  category: string;
  total?: number;
  published?: number;
  draft?: number;
  archived?: number;
  unverified?: number | null;
  missingSource?: number | null;
  recentlyModified?: number;
  error?: string;
}

export const getDataHealth = async (): Promise<DataHealthRow[]> => {
  const res = await api.get("/admin/system/data-health");
  return res.data?.data?.modules || [];
};

// ============================
// AUDIT LOGS
// ============================

export interface AuditLogEntry {
  _id: string;
  adminName: string;
  adminEmail?: string;
  action: string;
  module: string;
  recordId?: string;
  recordLabel?: string;
  changedFields?: string[];
  before?: any;
  after?: any;
  ip?: string;
  createdAt: string;
}

export const getAuditLogs = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/system/audit-logs", { params });
  return res.data; // { success, data: { logs, pagination } }
};

// ============================
// ADMIN USERS MANAGEMENT (super admin governed)
// ============================

export interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  adminType?: string;
  isActive: boolean;
  isSuspended: boolean;
  lastLoginAt?: string;
  createdAt: string;
  permissions?: Record<string, boolean>;
}

export const getPermissionCatalog = async () => {
  const res = await api.get("/admin/admin-users/permission-catalog");
  return res.data?.data as {
    groups: { key: string; label: string; actions: string[]; permissions: string[] }[];
    adminTypes: string[];
  };
};

export const getAdminUserAccounts = async (params: Record<string, any> = {}) => {
  const res = await api.get("/admin/admin-users", { params });
  return res.data; // { success, data: { admins, pagination } }
};

export const createAdminUser = async (data: Record<string, any>) => {
  const res = await api.post("/admin/admin-users", data);
  return res.data;
};

export const updateAdminUser = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/admin-users/${id}`, data);
  return res.data;
};
