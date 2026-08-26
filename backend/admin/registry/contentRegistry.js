/**
 * ADMIN CONTENT REGISTRY (server-side allowlist)
 * ----------------------------------------------
 * The ONLY way a collection becomes admin-CMS-manageable is by adding an
 * explicit, schema-aware entry here. There is deliberately NO generic
 * "edit any collection" endpoint: module keys are resolved through this
 * registry and every write is restricted to the entry's allowedFields.
 *
 * Each entry declares:
 *   key              url-safe module key (used in /api/admin/cms/:module)
 *   label            human-readable name
 *   model            mongoose model
 *   permissionKey    permission prefix (e.g. "tribunals" -> tribunals.edit)
 *   category         dashboard grouping
 *   allowedFields    fields the API may ever write (strict allowlist)
 *   requiredFields   mandatory on create
 *   searchFields     fields matched by ?search=
 *   sortableFields   whitelist for ?sortBy=
 *   filterFields     query params mapped to equality filters
 *   listFields       projection for list endpoints (keeps payloads small)
 *   statusField      workflow field name (or null)
 *   statusValues     allowed workflow values
 *   supportsPublish  whether publish/unpublish actions exist
 *   deletePolicy     "hard" | "archive" | "soft"
 *   immutableFields  never client-writable even if present on the model
 */

const Tribunal = require("../../models/Tribunal");
const SupremeCourt = require("../../models/SupremeCourt");
const Article = require("../../models/Article");
const BareAct = require("../../models/BareAct");
const CriminalLawAct = require("../../models/CriminalLawAct");
const KnowledgeHubItem = require("../../models/KnowledgeHubItem");
const MiscForm = require("../../models/MiscForm");
const JudgeDirectory = require("../../models/JudgeDirectory");
const DistrictCourtJudge = require("../../models/DistrictCourtJudge");
const RevenueCourtPhase8 = require("../../models/RevenueCourtPhase8");
const TaxCorporatePhase9 = require("../../models/TaxCorporatePhase9");
const CourtHoliday = require("../../models/CourtHoliday");
const DailyCauseListEntry = require("../../models/DailyCauseListEntry");
const PoliceStation = require("../../models/PoliceStation");
const PoliceHierarchyOffice = require("../../models/PoliceHierarchyOffice");

const CONTENT_REGISTRY = {
  tribunals: {
    key: "tribunals",
    label: "Tribunals",
    model: Tribunal,
    permissionKey: "tribunals",
    category: "legal_data",
    titleField: "name",
    allowedFields: [
      "name", "abbreviation", "category", "jurisdiction", "description", "location", "website",
      "subCategory", "tribunalType", "jurisdictionLevel", "state", "district", "benchType",
      "benchName", "benchCode", "principalBench", "circuitBench",
      "address", "city", "pincode", "email", "phone", "fax", "googleMapsLink",
      "workingDays", "workingHours", "filingMode", "eFilingAvailable", "videoConferenceAvailable",
      "causeListLink", "ordersLink", "judgmentsLink", "notificationsLink", "circularsLink",
      "formsLink", "rulesLink", "governingAct", "governingActLink",
      "displayOrder", "isFeatured", "isActive",
      "sourceId", "sourceName", "sourceUrl", "sourceType", "verificationStatus", "lastVerifiedAt", "verifiedBy", "dataVersion",
    ],
    requiredFields: ["name"],
    searchFields: ["name", "abbreviation", "category", "jurisdiction", "state", "description"],
    sortableFields: ["name", "category", "state", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["category", "state", "isActive", "isFeatured", "status"],
    listFields: "name abbreviation category state jurisdiction isActive isFeatured displayOrder verificationStatus updatedAt createdAt",
    statusField: null,
    supportsPublish: true,
    deletePolicy: "archive",
  },

  "supreme-court": {
    key: "supreme-court",
    label: "Supreme Court",
    model: SupremeCourt,
    permissionKey: "supreme_court",
    category: "legal_data",
    titleField: "courtRoom",
    // NOTE: isFavourite is per-user-facing favourite state managed by the
    // public favourite endpoint — it is NOT admin-editable content.
    allowedFields: [
      "courtRoom", "vcLink", "meetingId", "email", "status", "displayOrder",
    ],
    requiredFields: ["courtRoom"],
    searchFields: ["courtRoom"],
    sortableFields: ["courtRoom", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["status"],
    listFields: "courtRoom vcLink meetingId email status displayOrder updatedAt createdAt",
    statusField: "status",
    statusEnum: ["Live", "Scheduled", "Offline"],
    supportsPublish: false,
    deletePolicy: "hard",
  },


  "criminal-laws": {
    key: "criminal-laws",
    label: "Criminal Laws",
    model: CriminalLawAct,
    permissionKey: "criminal_laws",
    category: "legal_data",
    titleField: "title",
    allowedFields: [
      "sourceId", "title", "actName", "category", "description", "pdfUrl", "language",
      "status", "displayOrder", "isFeatured",
      "sourceName", "sourceUrl", "verificationStatus", "lastVerifiedAt", "verifiedBy",
      "versionNumber", "changeSummary",
    ],
    requiredFields: ["title"],
    searchFields: ["title", "actName", "category", "description"],
    sortableFields: ["title", "category", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["status", "category"],
    listFields: "sourceId title actName category pdfUrl status isFeatured displayOrder verificationStatus updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "soft",
  },

  "knowledge-hub": {
    key: "knowledge-hub",
    label: "Knowledge Hub",
    model: KnowledgeHubItem,
    permissionKey: "knowledge_hub",
    category: "content",
    titleField: "label",
    allowedFields: [
      "sectionKey", "sectionTitle", "sectionIcon", "sectionDescription",
      "label", "url", "description",
      "status", "isFeatured", "displayOrder",
      "sourceName", "verificationStatus", "lastVerifiedAt", "verifiedBy",
      "versionNumber", "changeSummary",
    ],
    requiredFields: ["label", "url", "sectionKey"],
    searchFields: ["label", "sectionTitle", "description", "url"],
    sortableFields: ["label", "sectionKey", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["status", "sectionKey"],
    listFields: "sectionKey sectionTitle label url status isFeatured displayOrder verificationStatus updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "soft",
  },

  "misc-forms": {
    key: "misc-forms",
    label: "Miscellaneous Forms",
    model: MiscForm,
    permissionKey: "misc_forms",
    category: "content",
    titleField: "name",
    allowedFields: [
      "category", "name", "url", "description", "language",
      "status", "isFeatured", "displayOrder",
      "sourceName", "verificationStatus", "lastVerifiedAt", "verifiedBy",
      "versionNumber", "changeSummary",
    ],
    requiredFields: ["name", "url", "category"],
    searchFields: ["name", "category", "description"],
    sortableFields: ["name", "category", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["status", "category"],
    listFields: "category name url language status isFeatured displayOrder verificationStatus updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "soft",
  },

  articles: {
    key: "articles",
    label: "Articles",
    model: Article,
    permissionKey: "articles",
    category: "content",
    titleField: "title",
    allowedFields: [
      "title", "slug", "content", "excerpt", "category", "tags", "coverImage",
      "status", "isFeatured", "publishedAt", "readTime",
    ],
    requiredFields: ["title", "slug", "content", "category"],
    searchFields: ["title", "excerpt", "category"],
    sortableFields: ["title", "category", "publishedAt", "createdAt", "updatedAt"],
    filterFields: ["status", "category", "isFeatured"],
    listFields: "title slug category excerpt coverImage status isFeatured publishedAt views createdAt updatedAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "hard",
  },

  "bare-acts": {
    key: "bare-acts",
    label: "Bare Acts",
    model: BareAct,
    permissionKey: "bare_acts",
    category: "legal_data",
    titleField: "title",
    allowedFields: [
      "slug", "title", "actName", "shortName", "year", "category", "ministry",
      "language", "pdfUrl", "sourceName", "sourceType", "indiaCodeSearchUrl",
      "indiaCodeUrl", "pdfVerificationStatus", "statusNote", "isPopular", "isNewLaw",
      "sectionNumber", "content", "jurisdiction", "status", "publishedAt",
    ],
    requiredFields: ["title"],
    searchFields: ["title", "actName", "shortName", "category"],
    sortableFields: ["title", "category", "year", "createdAt", "updatedAt"],
    filterFields: ["status", "category", "isPopular", "isNewLaw"],
    listFields: "title actName shortName year category jurisdiction language status isPopular isNewLaw updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "archive",
  },

  "judge-directory": {
    key: "judge-directory",
    label: "Judge Directory",
    model: JudgeDirectory,
    permissionKey: "judge_directory",
    category: "legal_data",
    titleField: "judgeName",
    allowedFields: [
      "courtId", "courtName", "courtRoom", "bench", "judgeName",
      "vcLink", "meetingId", "email", "displayOrder", "tags", "status", "publishedAt",
    ],
    requiredFields: ["courtId", "courtName", "courtRoom", "judgeName", "vcLink", "meetingId"],
    searchFields: ["judgeName", "courtName", "courtRoom"],
    sortableFields: ["judgeName", "courtName", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["status", "courtId"],
    listFields: "courtId courtName courtRoom bench judgeName vcLink meetingId email displayOrder status updatedAt createdAt",
    statusField: "status",
    supportsPublish: false,
    deletePolicy: "archive",
  },

  "district-court-judges": {
    key: "district-court-judges",
    label: "District Court Judges",
    model: DistrictCourtJudge,
    permissionKey: "district_courts",
    category: "legal_data",
    titleField: "judgeName",
    allowedFields: [
      "complexId", "districtId", "judgeName", "designation", "jurisdiction",
      "courtRoom", "vcLink", "meetingId", "email", "displayOrder",
      "isActive", "status", "isOnLeave", "leaveFrom", "leaveTo", "leaveReason", "publishedAt",
    ],
    requiredFields: ["districtId", "judgeName", "vcLink", "meetingId"],
    searchFields: ["judgeName", "designation", "jurisdiction", "courtRoom"],
    sortableFields: ["judgeName", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["status", "isActive", "districtId", "isOnLeave"],
    listFields: "districtId judgeName designation jurisdiction courtRoom vcLink meetingId email displayOrder isActive status isOnLeave updatedAt createdAt",
    statusField: "status",
    supportsPublish: true,
    deletePolicy: "archive",
  },

  "revenue-courts": {
    key: "revenue-courts",
    label: "Revenue Courts",
    model: RevenueCourtPhase8,
    permissionKey: "revenue_court",
    category: "legal_data",
    titleField: "title",
    allowedFields: ["title", "key", "topic", "content", "status", "publishedAt"],
    requiredFields: ["title", "key"],
    searchFields: ["title", "topic", "content"],
    sortableFields: ["title", "topic", "createdAt", "updatedAt"],
    filterFields: ["status", "topic"],
    listFields: "title key topic status views updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "archive",
  },

  "tax-corporate": {
    key: "tax-corporate",
    label: "Tax & Corporate",
    model: TaxCorporatePhase9,
    permissionKey: "tax_corporate",
    category: "legal_data",
    titleField: "title",
    allowedFields: ["title", "key", "topic", "content", "status", "publishedAt"],
    requiredFields: ["title", "key"],
    searchFields: ["title", "topic", "content"],
    sortableFields: ["title", "topic", "createdAt", "updatedAt"],
    filterFields: ["status", "topic"],
    listFields: "title key topic status views updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "archive",
  },

  "court-holidays": {
    key: "court-holidays",
    label: "Court Holidays",
    model: CourtHoliday,
    permissionKey: "court_holidays",
    category: "court_info",
    titleField: "title",
    // dedupeKey/sourceId are migration identity — not client-writable.
    allowedFields: [
      "title", "jurisdiction", "court", "holidayDate", "holidayType",
      "effectiveFrom", "effectiveTo", "reason", "sourceUrl", "status", "meta",
    ],
    requiredFields: ["title", "court", "holidayDate"],
    searchFields: ["title", "court", "jurisdiction", "reason"],
    sortableFields: ["holidayDate", "court", "jurisdiction", "createdAt", "updatedAt"],
    filterFields: ["status", "jurisdiction", "court"],
    listFields: "title jurisdiction court holidayDate holidayType reason sourceUrl status updatedAt createdAt",
    statusField: "status",
    supportsPublish: false,
    deletePolicy: "hard",
  },

  "cause-lists": {
    key: "cause-lists",
    label: "Daily Cause Lists",
    model: DailyCauseListEntry,
    permissionKey: "cause_lists",
    category: "court_info",
    titleField: "caseTitle",
    allowedFields: [
      "court", "jurisdiction", "district", "causeListDate", "caseNumber",
      "caseTitle", "bench", "causeStage", "parties", "displayOrder",
      "notes", "publishedAt", "sourceUrl", "status", "meta",
    ],
    requiredFields: ["court", "causeListDate"],
    searchFields: ["caseNumber", "caseTitle", "court", "parties"],
    sortableFields: ["causeListDate", "court", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["status", "jurisdiction", "court"],
    listFields: "court jurisdiction district causeListDate caseNumber caseTitle bench causeStage parties displayOrder notes sourceUrl status updatedAt createdAt",
    statusField: "status",
    supportsPublish: false,
    deletePolicy: "hard",
  },
  // ── Police Administration (Delhi Police) ──────────────────────────────────
  // Reuses the existing PoliceStation / PoliceHierarchyOffice models and their
  // public controllers — NO parallel collection is created. `sho` and
  // `location` are embedded sub-documents; they are editable only through the
  // engine's whitelisted `structuredFields` mechanism (primitive values only).
  "police-stations": {
    key: "police-stations",
    label: "Police Stations",
    model: PoliceStation,
    permissionKey: "police",
    category: "police",
    titleField: "name",
    allowedFields: [
      "name", "district", "subdivision", "type",
      "address", "pinCode", "phone", "email",
      "source", "sourceUrl", "lastVerified",
      "status", "isActive", "isFeatured", "displayOrder",
    ],
    structuredFields: ["sho", "location"],
    requiredFields: ["name"],
    searchFields: ["name", "district", "subdivision", "address", "phone"],
    sortableFields: ["name", "district", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["district", "subdivision", "status", "isActive", "isFeatured"],
    listFields: "name district subdivision type address pinCode phone email status isActive isFeatured displayOrder updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "archive",
  },

  "police-hierarchy": {
    key: "police-hierarchy",
    label: "Police Hierarchy",
    model: PoliceHierarchyOffice,
    permissionKey: "police_hierarchy",
    category: "police",
    titleField: "designation",
    allowedFields: [
      "jurisdictionLevel", "jurisdiction", "designation",
      "name", "rank", "phone", "email", "address",
      "source", "sourceUrl", "lastVerified",
      "status", "isActive", "displayOrder",
    ],
    requiredFields: ["jurisdictionLevel", "jurisdiction", "designation"],
    searchFields: ["designation", "name", "jurisdiction"],
    sortableFields: ["jurisdictionLevel", "jurisdiction", "designation", "displayOrder", "createdAt", "updatedAt"],
    filterFields: ["jurisdictionLevel", "jurisdiction", "status", "isActive"],
    listFields: "jurisdictionLevel jurisdiction designation name rank phone email address status isActive displayOrder updatedAt createdAt",
    statusField: "status",
    statusEnum: ["draft", "published", "archived"],
    supportsPublish: true,
    deletePolicy: "archive",
  },

};

/** Get a registry entry or null. Unknown modules are never served. */
function getModule(key) {
  return CONTENT_REGISTRY[key] || null;
}

function listModules() {
  return Object.values(CONTENT_REGISTRY).map(({ model, ...rest }) => rest);
}

module.exports = { CONTENT_REGISTRY, getModule, listModules };
