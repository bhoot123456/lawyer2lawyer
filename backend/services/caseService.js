const mongoose = require("mongoose");
const Case = require("../models/Case");
const User = require("../models/User");
const {
  validateCaseCreatePayload,
  validateCaseUpdatePayload,
  validatePaginationAndSorting,
} = require("../validation/caseValidation");

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory cases store when MongoDB is offline
const inMemoryCases = new Map([
  [
    "case-1",
    {
      _id: "case-1",
      caseTitle: "State of NCT of Delhi vs. Vikram Malhotra",
      caseNumber: "BAIL-402/2025",
      client: "Vikram Malhotra",
      advocate: "Adv. Rajesh Sharma",
      court: "Tis Hazari Court (Central)",
      judge: "Hon'ble Sh. Virender Kumar, ASJ-02",
      oppositeParty: "State (NCT of Delhi)",
      oppositeAdvocate: "Sh. A.K. Singh (Addl. PP)",
      practiceArea: "Criminal",
      caseType: "Regular Bail",
      filingDate: new Date(Date.now() - 14 * 86400000).toISOString(),
      registrationDate: new Date(Date.now() - 12 * 86400000).toISOString(),
      nextHearingDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      currentStage: "Arguments on Bail",
      status: "Active",
      priority: "High",
      description: "Application for regular bail in FIR No. 128/2024 PS Kotwali under Sections 316/318 BNS.",
      importantNotes: "IO directed to file status report with CDR records by next date.",
      caseTags: ["Bail", "BNS", "Tis Hazari"],
      timeline: [
        {
          type: "Case Created",
          description: "Bail application filed in Sessions Court",
          createdAt: new Date(Date.now() - 14 * 86400000),
        },
        {
          type: "Hearing",
          description: "Notice issued to State. Reply summoned for next date.",
          createdAt: new Date(Date.now() - 7 * 86400000),
        },
      ],
      createdAt: new Date(Date.now() - 14 * 86400000),
      updatedAt: new Date(),
    },
  ],
  [
    "case-2",
    {
      _id: "case-2",
      caseTitle: "Pooja Singhania vs. Rahul Singhania",
      caseNumber: "HMA-884/2024",
      client: "Pooja Singhania",
      advocate: "Adv. Meenakshi Lekhi",
      court: "Saket District Court (South)",
      judge: "Hon'ble Ms. Sunita Gupta, Principal Judge Family Court",
      oppositeParty: "Rahul Singhania",
      oppositeAdvocate: "Adv. K.P. Verma",
      practiceArea: "Family Law",
      caseType: "Matrimonial Dispute",
      filingDate: new Date(Date.now() - 45 * 86400000).toISOString(),
      registrationDate: new Date(Date.now() - 40 * 86400000).toISOString(),
      nextHearingDate: new Date(Date.now() + 6 * 86400000).toISOString(),
      currentStage: "Mediation / Settlement Talks",
      status: "Active",
      priority: "Medium",
      description: "Petition under Section 13(1)(ia) of Hindu Marriage Act along with interim maintenance under S. 24.",
      importantNotes: "Both parties directed to appear personally before Delhi Mediation Centre, Saket.",
      caseTags: ["HMA", "Mediation", "Maintenance"],
      timeline: [
        {
          type: "Case Created",
          description: "Petition registered and summons ordered",
          createdAt: new Date(Date.now() - 40 * 86400000),
        },
      ],
      createdAt: new Date(Date.now() - 45 * 86400000),
      updatedAt: new Date(),
    },
  ],
  [
    "case-3",
    {
      _id: "case-3",
      caseTitle: "Apex Infra Buildtech vs. Delhi Metro Rail Corp",
      caseNumber: "ARB-P-112/2025",
      client: "Apex Infra Buildtech Pvt Ltd",
      advocate: "Adv. Harish Salve Associate",
      court: "Delhi High Court",
      judge: "Hon'ble Mr. Justice Prathiba M. Singh",
      oppositeParty: "Delhi Metro Rail Corporation Ltd",
      oppositeAdvocate: "Senior Standing Counsel DMRC",
      practiceArea: "Commercial & Arbitration",
      caseType: "Section 9 Arbitration Petition",
      filingDate: new Date(Date.now() - 20 * 86400000).toISOString(),
      registrationDate: new Date(Date.now() - 18 * 86400000).toISOString(),
      nextHearingDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      currentStage: "Final Arguments on Interim Injunction",
      status: "Active",
      priority: "High",
      description: "Petition under S. 9 Arbitration & Conciliation Act seeking restraint against encashment of Bank Guarantee.",
      importantNotes: "Status quo granted till next date of hearing.",
      caseTags: ["Arbitration", "High Court", "Commercial"],
      timeline: [
        {
          type: "Interim Order",
          description: "Ad-interim injunction granted restraining encashment of bank guarantee.",
          createdAt: new Date(Date.now() - 10 * 86400000),
        },
      ],
      createdAt: new Date(Date.now() - 20 * 86400000),
      updatedAt: new Date(),
    },
  ],
]);

function makeTimelineEntry({ type, description, actor, meta }) {
  return {
    type,
    description: description || "",
    actor,
    meta: meta || {},
    createdAt: new Date(),
  };
}

function canEditCase({ user, deviceId, caseDoc }) {
  // If user exists, use JWT/RBAC logic
  if (user) {
    const role = user?.role;
    if (role === "admin") return true;
    if (!caseDoc) return false;

    // assignedTo is a User ObjectId
    const assignedToId = String(caseDoc.assignedTo);
    return role === "lawyer" && String(user._id) === assignedToId;
  }
  
  // If anonymous, rely on deviceId
  if (deviceId && caseDoc) {
    return caseDoc.deviceId === deviceId;
  }
  
  return false;
}

function toObjectIdIfPossible(id) {
  // Keep it simple: Mongoose will validate casting, but we avoid failing early here.
  return id;
}

function buildCaseQueryFilters({ query, user, deviceId }) {
  // Filters: caseNumber, clientName, court, practiceArea, status, priority, advocate, nextHearing
  const filter = {};

  if (query?.caseNumber) {
    filter.caseNumber = { $regex: String(query.caseNumber).trim(), $options: "i" };
  }

  if (query?.clientName) {
    filter.client = { $regex: String(query.clientName).trim(), $options: "i" };
  }

  if (query?.court) {
    filter.court = { $regex: String(query.court).trim(), $options: "i" };
  }

  if (query?.practiceArea) {
    filter.practiceArea = { $regex: String(query.practiceArea).trim(), $options: "i" };
  }

  if (query?.status) {
    filter.status = String(query.status).trim();
  }

  if (query?.priority) {
    filter.priority = String(query.priority).trim();
  }

  if (query?.advocate) {
    filter.advocate = { $regex: String(query.advocate).trim(), $options: "i" };
  }

  if (query?.nextHearing) {
    // Accept either YYYY-MM-DD or a date. Filter by exact date (ignoring time).
    const d = new Date(query.nextHearing);
    if (!Number.isNaN(d.getTime())) {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      filter.nextHearingDate = { $gte: start, $lte: end };
    }
  }

  // If user is authenticated
  if (user) {
    const role = user.role;
    if (role === "admin") return filter;
  
    if (role === "lawyer") {
      filter.assignedTo = toObjectIdIfPossible(user._id);
      return filter;
    }
  
    if (role === "client") {
      filter.createdBy = toObjectIdIfPossible(user._id);
      return filter;
    }
    return filter;
  }
  
  // If anonymous, scope strictly to deviceId
  if (deviceId) {
    filter.deviceId = deviceId;
    // ensure we only return anonymous cases, not all orphaned cases
    // if deviceId somehow matched null, which is impossible due to validation, but for safety:
    return filter;
  }
  
  // If neither user nor deviceId, return a query that matches nothing
  filter._id = null;
  return filter;
}

async function createCase({ payload, user, deviceId }) {
  const validation = validateCaseCreatePayload(payload);
  if (!validation.ok) {
    return validation;
  }
  
  if (!user && !deviceId) {
    return { ok: false, message: "Authentication or valid Device ID required to create a case" };
  }
  
  let assignedTo = null;
  let createdBy = null;
  let finalDeviceId = null;
  let timeline = [];
  
  // If no caseNumber is provided, generate a collision-resistant one
  let finalCaseNumber = payload.caseNumber;
  if (!finalCaseNumber || finalCaseNumber.trim() === "") {
    finalCaseNumber = `ANON-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  if (user) {
    // Authenticated path
    if (!payload.assignedTo) {
      return { ok: false, message: "assignedTo is required" };
    }
    
    // Ensure assignedTo exists
    const assignedUser = await User.findById(payload.assignedTo).select("_id role");
    if (!assignedUser) {
      return { ok: false, message: "assignedTo user not found" };
    }
    
    assignedTo = payload.assignedTo;
    createdBy = user._id;
    // For authenticated, deviceId is null to avoid cross-contamination
    finalDeviceId = null; 
    
    timeline = [
      makeTimelineEntry({
        type: "Case Created",
        description: `Case created: ${finalCaseNumber}`,
        actor: user._id,
        meta: { caseNumber: finalCaseNumber },
      }),
    ];
  } else {
    // Anonymous path
    finalDeviceId = deviceId;
    createdBy = null;
    assignedTo = null;
    timeline = []; // No actor for anonymous timeline
  }

  if (!isDbConnected()) {
    const newCase = {
      _id: `case-${Date.now()}`,
      caseTitle: payload.caseTitle,
      caseNumber: finalCaseNumber,
      client: payload.client,
      advocate: payload.advocate,
      court: payload.court,
      judge: payload.judge,
      oppositeParty: payload.oppositeParty,
      oppositeAdvocate: payload.oppositeAdvocate,
      practiceArea: payload.practiceArea,
      caseType: payload.caseType,
      filingDate: payload.filingDate || new Date().toISOString(),
      registrationDate: payload.registrationDate || new Date().toISOString(),
      nextHearingDate: payload.nextHearingDate,
      currentStage: payload.currentStage || "Filing",
      status: payload.status || "Active",
      priority: payload.priority || "Medium",
      description: payload.description,
      importantNotes: payload.importantNotes,
      caseTags: payload.caseTags || [],
      createdBy,
      assignedTo,
      deviceId: finalDeviceId,
      expenses: payload.expenses || [],
      documents: payload.documents || [],
      notes: payload.notes || [],
      timeline,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryCases.set(newCase._id, newCase);
    return { ok: true, case: newCase };
  }

  // Prevent creating with status/stage values invalid (validation already checked if provided)
  const doc = await Case.create({
    caseTitle: payload.caseTitle,
    caseNumber: finalCaseNumber,

    client: payload.client,
    advocate: payload.advocate,

    court: payload.court,
    judge: payload.judge,

    oppositeParty: payload.oppositeParty,
    oppositeAdvocate: payload.oppositeAdvocate,

    practiceArea: payload.practiceArea,
    caseType: payload.caseType,

    filingDate: payload.filingDate,
    registrationDate: payload.registrationDate,
    nextHearingDate: payload.nextHearingDate,

    currentStage: payload.currentStage,
    status: payload.status,
    priority: payload.priority,

    description: payload.description,
    importantNotes: payload.importantNotes,

    caseTags: payload.caseTags,

    createdBy,
    assignedTo,
    deviceId: finalDeviceId,

    expenses: payload.expenses,
    documents: payload.documents,
    notes: payload.notes,
    timeline,
  });

  return { ok: true, case: doc };
}

async function updateCase({ id, payload, user, deviceId }) {
  if (!isDbConnected()) {
    const existing = inMemoryCases.get(id);
    if (!existing) return { ok: false, message: "Case not found", code: 404 };
    Object.assign(existing, payload);
    existing.updatedAt = new Date();
    return { ok: true, case: existing };
  }

  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };

  if (!canEditCase({ user, deviceId, caseDoc: existing })) {
    return { ok: false, message: "Forbidden: Not authorized to edit this case", code: 403 };
  }

  const validation = validateCaseUpdatePayload(payload);
  if (!validation.ok) return validation;

  // If status/next hearing changes, append timeline entries (only if user)
  const nextTimeline = [...(existing.timeline || [])];

  const update = { ...payload };
  // safety checks: ignore attempts to inject ownership
  delete update.caseNumber;
  delete update.deviceId;
  delete update.createdBy;
  delete update.assignedTo;

  if (user) {
    if (payload.nextHearingDate !== undefined) {
      nextTimeline.push(
        makeTimelineEntry({
          type: "Next Hearing Changed",
          description: `Next hearing updated for ${existing.caseNumber}`,
          actor: user._id,
          meta: { nextHearingDate: payload.nextHearingDate },
        }),
      );
    }
  
    if (payload.status !== undefined) {
      nextTimeline.push(
        makeTimelineEntry({
          type: "Status Updated",
          description: `Status updated for ${existing.caseNumber}`,
          actor: user._id,
          meta: { status: payload.status },
        }),
      );
    }
  }

  // Apply update + timeline
  Object.assign(existing, update);
  existing.timeline = nextTimeline;

  await existing.save();
  return { ok: true, case: existing };
}

async function deleteCase({ id, user, deviceId }) {
  if (!isDbConnected()) {
    const existing = inMemoryCases.get(id);
    if (!existing) return { ok: false, message: "Case not found", code: 404 };
    inMemoryCases.delete(id);
    return { ok: true };
  }

  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };

  if (!canEditCase({ user, deviceId, caseDoc: existing })) {
    return { ok: false, message: "Forbidden: Not authorized to delete this case", code: 403 };
  }

  await Case.deleteOne({ _id: id });
  return { ok: true };
}

async function getCaseById({ id, user, deviceId }) {
  if (!isDbConnected()) {
    const doc = inMemoryCases.get(id);
    if (!doc) return { ok: false, message: "Case not found", code: 404 };
    return { ok: true, case: doc };
  }

  const doc = await Case.findById(id);
  if (!doc) return { ok: false, message: "Case not found", code: 404 };

  // View visibility
  if (user) {
    if (user.role === "admin") return { ok: true, case: doc };
    if (user.role === "lawyer" && String(doc.assignedTo) !== String(user._id)) {
      return { ok: false, message: "Forbidden", code: 403 };
    }
    if (user.role === "client" && String(doc.createdBy) !== String(user._id)) {
      return { ok: false, message: "Forbidden", code: 403 };
    }
  } else {
    // anonymous
    if (doc.deviceId !== deviceId) {
      return { ok: false, message: "Forbidden", code: 403 }; // or 404
    }
  }

  return { ok: true, case: doc };
}

async function getAllCases({ query, user, deviceId }) {
  const pagination = validatePaginationAndSorting(query);
  if (!pagination.ok) return pagination;

  const { page, limit, sort } = pagination;

  if (!isDbConnected()) {
    let items = Array.from(inMemoryCases.values());
    if (query?.status) {
      items = items.filter((c) => c.status?.toLowerCase() === query.status.toLowerCase());
    }
    if (query?.court) {
      items = items.filter((c) => c.court?.toLowerCase().includes(query.court.toLowerCase()));
    }
    if (query?.caseNumber) {
      items = items.filter((c) => c.caseNumber?.toLowerCase().includes(query.caseNumber.toLowerCase()));
    }
    const total = items.length;
    const skip = (page - 1) * limit;
    const paginated = items.slice(skip, skip + limit);
    return { ok: true, cases: paginated, total, page, limit };
  }

  const filter = buildCaseQueryFilters({ query, user, deviceId });

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Case.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Case.countDocuments(filter),
  ]);

  return { ok: true, cases: items, total, page, limit };
}

async function addTimeline({ id, type, description, actor, meta }) {
  const doc = await Case.findById(id);
  if (!doc) return { ok: false, message: "Case not found", code: 404 };

  doc.timeline = doc.timeline || [];
  doc.timeline.push(
    makeTimelineEntry({ type, description, actor, meta }),
  );
  await doc.save();

  return { ok: true, timeline: doc.timeline };
}

async function addNote({ id, note, user }) {
  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };
  if (!canEditCase({ user, caseDoc: existing })) {
    return { ok: false, message: "Forbidden", code: 403 };
  }

  existing.notes = existing.notes || [];
  existing.notes.push({
    title: note.title,
    description: note.description || "",
    author: user._id,
    date: note.date || new Date(),
  });

  existing.timeline = existing.timeline || [];
  existing.timeline.push(
    makeTimelineEntry({
      type: "Note Added",
      description: `Note added to ${existing.caseNumber}`,
      actor: user._id,
      meta: { title: note.title },
    }),
  );

  await existing.save();
  return { ok: true, notes: existing.notes, timeline: existing.timeline };
}

async function addDocument({ id, document, user }) {
  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };
  if (!canEditCase({ user, caseDoc: existing })) {
    return { ok: false, message: "Forbidden", code: 403 };
  }

  existing.documents = existing.documents || [];
  existing.documents.push({
    documentName: document.documentName,
    fileUrl: document.fileUrl,
    uploadedBy: user._id,
    uploadedAt: document.uploadedAt || new Date(),
    category: document.category || "Other",
  });

  existing.timeline = existing.timeline || [];
  existing.timeline.push(
    makeTimelineEntry({
      type: "Document Uploaded",
      description: `Document uploaded to ${existing.caseNumber}`,
      actor: user._id,
      meta: { documentName: document.documentName, category: document.category || "Other" },
    }),
  );

  await existing.save();
  return { ok: true, documents: existing.documents, timeline: existing.timeline };
}

async function updateExpenses({ id, expenses, user }) {
  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };
  if (!canEditCase({ user, caseDoc: existing })) {
    return { ok: false, message: "Forbidden", code: 403 };
  }

  existing.expenses = {
    courtFee: expenses.courtFee ?? existing.expenses?.courtFee ?? 0,
    stamp: expenses.stamp ?? existing.expenses?.stamp ?? 0,
    printing: expenses.printing ?? existing.expenses?.printing ?? 0,
    travel: expenses.travel ?? existing.expenses?.travel ?? 0,
    miscellaneous: expenses.miscellaneous ?? existing.expenses?.miscellaneous ?? 0,
  };

  existing.timeline = existing.timeline || [];
  existing.timeline.push(
    makeTimelineEntry({
      type: "Expense Updated",
      description: `Expenses updated for ${existing.caseNumber}`,
      actor: user._id,
      meta: expenses,
    }),
  );

  await existing.save();
  return { ok: true, expenses: existing.expenses, timeline: existing.timeline };
}

module.exports = {
  createCase,
  updateCase,
  deleteCase,
  getCaseById,
  getAllCases,
  addNote,
  addDocument,
  addTimeline,
  updateExpenses,
};

