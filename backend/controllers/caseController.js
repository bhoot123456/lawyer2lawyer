const caseService = require("../services/caseService");

function sendError(res, statusCode, message, details) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

exports.createCase = async (req, res) => {
  try {
    const result = await caseService.createCase({ payload: req.body, user: req.user });
    if (!result.ok) {
      return sendError(res, 400, result.message || "Unable to create case", result.details);
    }
    return res.status(201).json({ success: true, case: result.case });
  } catch (err) {
    // Handle duplicate caseNumber gracefully
    if (err && err.code === 11000) {
      return sendError(res, 409, "Case number already exists");
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to create case");
  }
};

exports.updateCase = async (req, res) => {
  try {
    const result = await caseService.updateCase({ id: req.params.id, payload: req.body, user: req.user });
    if (!result.ok) {
      return sendError(res, result.code || 400, result.message || "Unable to update case", result.details);
    }
    return res.json({ success: true, case: result.case });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to update case");
  }
};

exports.deleteCase = async (req, res) => {
  try {
    const result = await caseService.deleteCase({ id: req.params.id, user: req.user });
    if (!result.ok) {
      return sendError(res, result.code || 400, result.message || "Unable to delete case");
    }
    return res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to delete case");
  }
};

exports.getSingleCase = async (req, res) => {
  try {
    const result = await caseService.getCaseById({ id: req.params.id, user: req.user });
    if (!result.ok) {
      return sendError(res, result.code || 400, result.message || "Unable to fetch case");
    }
    return res.json({ success: true, case: result.case });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to fetch case");
  }
};

exports.getAllCases = async (req, res) => {
  try {
    const result = await caseService.getAllCases({ query: req.query, user: req.user });
    if (!result.ok) {
      return sendError(res, 400, result.message || "Unable to fetch cases", result.details);
    }
    return res.json({
      success: true,
      cases: result.cases,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to fetch cases");
  }
};

exports.addTimelineEntry = async (req, res) => {
  try {
    const { type, description, meta } = req.body;
    if (!type) {
      return sendError(res, 400, "type is required");
    }

    const result = await caseService.addTimeline({
      id: req.params.id,
      type,
      description,
      actor: req.user._id,
      meta,
    });

    if (!result.ok) {
      return sendError(res, result.code || 400, result.message || "Unable to add timeline entry");
    }

    return res.status(201).json({ success: true, timeline: result.timeline });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to add timeline entry");
  }
};

exports.addNote = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    if (!title) return sendError(res, 400, "title is required");

    const result = await caseService.addNote({
      id: req.params.id,
      note: { title, description, date },
      user: req.user,
    });

    if (!result.ok) {
      return sendError(res, result.code || 400, result.message || "Unable to add note");
    }

    return res.status(201).json({ success: true, notes: result.notes, timeline: result.timeline });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to add note");
  }
};

exports.addDocument = async (req, res) => {
  try {
    const { documentName, fileUrl, category } = req.body;

    if (!documentName) return sendError(res, 400, "documentName is required");
    if (!fileUrl) return sendError(res, 400, "fileUrl is required");

    const result = await caseService.addDocument({
      id: req.params.id,
      document: { documentName, fileUrl, category },
      user: req.user,
    });

    if (!result.ok) {
      return sendError(res, result.code || 400, result.message || "Unable to add document");
    }

    return res.status(201).json({ success: true, documents: result.documents, timeline: result.timeline });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to add document");
  }
};

exports.updateExpenses = async (req, res) => {
  try {
    const { courtFee, stamp, printing, travel, miscellaneous } = req.body;

    const result = await caseService.updateExpenses({
      id: req.params.id,
      expenses: { courtFee, stamp, printing, travel, miscellaneous },
      user: req.user,
    });

    if (!result.ok) {
      return sendError(res, result.code || 400, result.message || "Unable to update expenses");
    }

    return res.json({ success: true, expenses: result.expenses, timeline: result.timeline });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return sendError(res, 500, "Unable to update expenses");
  }
};

