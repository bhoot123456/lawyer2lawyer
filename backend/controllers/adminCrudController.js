const BareAct = require("../models/BareAct");
const RevenueCourtPhase8 = require("../models/RevenueCourtPhase8");
const TaxCorporatePhase9 = require("../models/TaxCorporatePhase9");
const Report = require("../models/Report");
const JudgeDirectory = require("../models/JudgeDirectory");

const parseBool = (v) => v === "true" || v === true;

const buildPagination = (req) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "20");
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildSort = (req) => {
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder || "desc";
  return { sortBy, sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } };
};

// ============================
// Bare Acts
// ============================
exports.listBareActsAdmin = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { actName: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const { page, limit, skip } = buildPagination(req);
    const { sort } = buildSort(req);

    const [items, total] = await Promise.all([
      BareAct.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("title actName sectionNumber jurisdiction language status updatedAt createdAt"),
      BareAct.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        bareActs: items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (e) {
    console.error("listBareActsAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch bare acts" });
  }
};

exports.getBareActAdmin = async (req, res) => {
  try {
    const item = await BareAct.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Bare act not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("getBareActAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch bare act" });
  }
};

exports.createBareActAdmin = async (req, res) => {
  try {
    const { title, actName, sectionNumber, content, tags, jurisdiction, language, status } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    const item = new BareAct({
      title,
      actName: actName || "",
      sectionNumber: sectionNumber || "",
      content: content || "",
      tags: Array.isArray(tags) ? tags : [],
      jurisdiction: jurisdiction || "",
      language: language || "English",
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : undefined,
    });

    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    console.error("createBareActAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to create bare act" });
  }
};

exports.updateBareActAdmin = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "actName",
      "sectionNumber",
      "content",
      "tags",
      "jurisdiction",
      "language",
      "status",
    ];

    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (updates.status === "published") updates.publishedAt = new Date();

    const item = await BareAct.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Bare act not found" });

    res.json({ success: true, data: item });
  } catch (e) {
    console.error("updateBareActAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to update bare act" });
  }
};

exports.deleteBareActAdmin = async (req, res) => {
  try {
    const item = await BareAct.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Bare act not found" });
    res.json({ success: true, message: "Bare act deleted successfully" });
  } catch (e) {
    console.error("deleteBareActAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to delete bare act" });
  }
};

// ============================
// Revenue Court Phase 8
// ============================
exports.listRevenueCourtPhase8Admin = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { key: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    const { page, limit, skip } = buildPagination(req);
    const { sort } = buildSort(req);

    const [items, total] = await Promise.all([
      RevenueCourtPhase8.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("title key topic status updatedAt createdAt"),
      RevenueCourtPhase8.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (e) {
    console.error("listRevenueCourtPhase8Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch revenue court phase 8" });
  }
};

exports.getRevenueCourtPhase8Admin = async (req, res) => {
  try {
    const item = await RevenueCourtPhase8.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Revenue court item not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("getRevenueCourtPhase8Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch revenue court item" });
  }
};

exports.createRevenueCourtPhase8Admin = async (req, res) => {
  try {
    const { title, key, topic, content, tags, status } = req.body;
    if (!title || !key) return res.status(400).json({ success: false, message: "title and key are required" });

    const item = new RevenueCourtPhase8({
      title,
      key,
      topic: topic || "",
      content: content || "",
      tags: Array.isArray(tags) ? tags : [],
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : undefined,
    });

    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    console.error("createRevenueCourtPhase8Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to create revenue court item" });
  }
};

exports.updateRevenueCourtPhase8Admin = async (req, res) => {
  try {
    const allowedFields = ["title", "key", "topic", "content", "tags", "status"];
    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    if (updates.status === "published") updates.publishedAt = new Date();

    const item = await RevenueCourtPhase8.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Revenue court item not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("updateRevenueCourtPhase8Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to update revenue court item" });
  }
};

exports.deleteRevenueCourtPhase8Admin = async (req, res) => {
  try {
    const item = await RevenueCourtPhase8.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Revenue court item not found" });
    res.json({ success: true, message: "Revenue court item deleted successfully" });
  } catch (e) {
    console.error("deleteRevenueCourtPhase8Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to delete revenue court item" });
  }
};

// ============================
// Tax & Corporate Phase 9
// ============================
exports.listTaxCorporatePhase9Admin = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { key: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    const { page, limit, skip } = buildPagination(req);
    const { sort } = buildSort(req);

    const [items, total] = await Promise.all([
      TaxCorporatePhase9.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("title key topic status updatedAt createdAt"),
      TaxCorporatePhase9.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (e) {
    console.error("listTaxCorporatePhase9Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch tax corporate phase 9" });
  }
};

exports.getTaxCorporatePhase9Admin = async (req, res) => {
  try {
    const item = await TaxCorporatePhase9.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Tax corporate item not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("getTaxCorporatePhase9Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch tax corporate item" });
  }
};

exports.createTaxCorporatePhase9Admin = async (req, res) => {
  try {
    const { title, key, topic, content, tags, status } = req.body;
    if (!title || !key) return res.status(400).json({ success: false, message: "title and key are required" });

    const item = new TaxCorporatePhase9({
      title,
      key,
      topic: topic || "",
      content: content || "",
      tags: Array.isArray(tags) ? tags : [],
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : undefined,
    });

    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    console.error("createTaxCorporatePhase9Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to create tax corporate item" });
  }
};

exports.updateTaxCorporatePhase9Admin = async (req, res) => {
  try {
    const allowedFields = ["title", "key", "topic", "content", "tags", "status"];
    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    if (updates.status === "published") updates.publishedAt = new Date();

    const item = await TaxCorporatePhase9.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Tax corporate item not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("updateTaxCorporatePhase9Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to update tax corporate item" });
  }
};

exports.deleteTaxCorporatePhase9Admin = async (req, res) => {
  try {
    const item = await TaxCorporatePhase9.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Tax corporate item not found" });
    res.json({ success: true, message: "Tax corporate item deleted successfully" });
  } catch (e) {
    console.error("deleteTaxCorporatePhase9Admin error:", e);
    res.status(500).json({ success: false, message: "Failed to delete tax corporate item" });
  }
};

// ============================
// Reports
// ============================
exports.listReportsAdmin = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { key: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const { page, limit, skip } = buildPagination(req);
    const { sort } = buildSort(req);

    const [items, total] = await Promise.all([
      Report.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("title key description status updatedAt createdAt"),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (e) {
    console.error("listReportsAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
};

exports.getReportAdmin = async (req, res) => {
  try {
    const item = await Report.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Report not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("getReportAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch report" });
  }
};

exports.createReportAdmin = async (req, res) => {
  try {
    const { title, key, description, content, coverImage, tags, status } = req.body;
    if (!title || !key) return res.status(400).json({ success: false, message: "title and key are required" });

    const item = new Report({
      title,
      key,
      description: description || "",
      content: content || "",
      coverImage: coverImage || "",
      tags: Array.isArray(tags) ? tags : [],
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : undefined,
    });

    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    console.error("createReportAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to create report" });
  }
};

exports.updateReportAdmin = async (req, res) => {
  try {
    const allowedFields = ["title", "key", "description", "content", "coverImage", "tags", "status"];
    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    if (updates.status === "published") updates.publishedAt = new Date();

    const item = await Report.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Report not found" });

    res.json({ success: true, data: item });
  } catch (e) {
    console.error("updateReportAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to update report" });
  }
};

exports.deleteReportAdmin = async (req, res) => {
  try {
    const item = await Report.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Report not found" });
    res.json({ success: true, message: "Report deleted successfully" });
  } catch (e) {
    console.error("deleteReportAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to delete report" });
  }
};

// ============================
// Judge Directory
// ============================
exports.listJudgeDirectoryAdmin = async (req, res) => {
  try {
    const { search, status, courtId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (courtId) filter.courtId = courtId;
    if (search) {
      filter.$or = [
        { judgeName: { $regex: search, $options: "i" } },
        { courtRoom: { $regex: search, $options: "i" } },
        { courtName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const { page, limit, skip } = buildPagination(req);
    const sortBy = req.query.sortBy || "displayOrder";
    const sortOrder = req.query.sortOrder || "asc";
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      JudgeDirectory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("courtId courtName courtRoom bench judgeName vcLink meetingId email displayOrder status updatedAt createdAt"),
      JudgeDirectory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (e) {
    console.error("listJudgeDirectoryAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch judge directory" });
  }
};

exports.getJudgeDirectoryAdmin = async (req, res) => {
  try {
    const item = await JudgeDirectory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Judge not found" });
    res.json({ success: true, data: item });
  } catch (e) {
    console.error("getJudgeDirectoryAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch judge" });
  }
};

exports.createJudgeDirectoryAdmin = async (req, res) => {
  try {
    const { courtId, courtName, courtRoom, bench, judgeName, vcLink, meetingId, email, displayOrder, tags, status } = req.body;

    if (!courtId || !courtName || !courtRoom || !judgeName || !vcLink || !meetingId) {
      return res.status(400).json({
        success: false,
        message: "courtId, courtName, courtRoom, judgeName, vcLink, and meetingId are required",
      });
    }

    const item = new JudgeDirectory({
      courtId,
      courtName,
      courtRoom,
      bench: bench || "",
      judgeName,
      vcLink,
      meetingId,
      email: email || "",
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
      tags: Array.isArray(tags) ? tags : [],
      status: status || "published",
      publishedAt: status === "published" || !status ? new Date() : undefined,
    });

    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    console.error("createJudgeDirectoryAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to create judge entry" });
  }
};

exports.updateJudgeDirectoryAdmin = async (req, res) => {
  try {
    const allowedFields = [
      "courtId", "courtName", "courtRoom", "bench", "judgeName",
      "vcLink", "meetingId", "email", "displayOrder", "tags", "status",
    ];

    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (updates.status === "published") updates.publishedAt = new Date();

    const item = await JudgeDirectory.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ success: false, message: "Judge not found" });

    res.json({ success: true, data: item });
  } catch (e) {
    console.error("updateJudgeDirectoryAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to update judge entry" });
  }
};

exports.deleteJudgeDirectoryAdmin = async (req, res) => {
  try {
    const item = await JudgeDirectory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Judge not found" });
    res.json({ success: true, message: "Judge deleted successfully" });
  } catch (e) {
    console.error("deleteJudgeDirectoryAdmin error:", e);
    res.status(500).json({ success: false, message: "Failed to delete judge entry" });
  }
};

