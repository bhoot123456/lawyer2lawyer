const mongoose = require("mongoose");
const staticBareActs = require("../data/bareActs");

const BareAct = require("../models/BareAct");

function parseNumber(val, fallback) {
  if (val === undefined || val === null) return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function parseSort(sortBy, sortOrder) {
  const order = String(sortOrder).toLowerCase() === "desc" ? -1 : 1;
  const map = {
    title: "title",
    actName: "actName",
    shortName: "shortName",
    year: "year",
    category: "category",
    publishedAt: "publishedAt",
    views: "views",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

  const field = map[sortBy] || "title";
  return { [field]: order };
}

function pickBareActFields(actDoc) {
  // Keep response compatible with existing frontend usage.
  // Return full document except Mongo internals.
  const obj = actDoc.toObject ? actDoc.toObject({ getters: false, virtuals: false }) : actDoc;
  const {
    _id,
    slug,
    title,
    actName,
    sectionNumber,
    jurisdiction,
    language,
    status,
    content,
    tags,
    shortName,
    year,
    category,
    ministry,
    keywords,
    pdfUrl,
    sourceName,
    sourceType,
    indiaCodeSearchUrl,
    indiaCodeUrl,
    pdfVerificationStatus,
    statusNote,
    isPopular,
    isNewLaw,
    publishedAt,
    views,
    createdAt,
    updatedAt,
  } = obj;

    return {
    _id,
    slug,
    title,
    actName,
    sectionNumber,
    jurisdiction,
    language,
    status,
    content,
    tags,
    shortName,
    year,
    category,
    ministry,
    keywords,
    pdfUrl,
    sourceName,
    sourceType,
    indiaCodeSearchUrl,
    indiaCodeUrl,
    pdfVerificationStatus,
    statusNote,
    isPopular,
    isNewLaw,
    publishedAt,
    views,
    createdAt,
    updatedAt,
  };
}

async function getBareActs(req, res) {
  try {
    const page = Math.max(1, parseNumber(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, parseNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const search = req.query.search ? String(req.query.search).trim() : "";
    const category = req.query.category ? String(req.query.category).trim() : "";

    const sortBy = req.query.sortBy ? String(req.query.sortBy).trim() : "title";
    const sortOrder = req.query.sortOrder ? String(req.query.sortOrder).trim() : "asc";

    const sort = parseSort(sortBy, sortOrder);

    const filter = {};
    if (category) filter.category = category;

    let query;
    if (search) {
      // $text requires a text index.
      // Combine category filter (if present) with $text.
      query = {
        $and: [
          filter,
          {
            $text: { $search: search },
          },
        ],
      };
    } else {
      query = filter;
    }

    // Use projection to keep response small.
    const projection = {
      slug: 1,
      title: 1,
      actName: 1,
      sectionNumber: 1,
      jurisdiction: 1,
      language: 1,
      status: 1,
      content: 1,
      tags: 1,
      shortName: 1,
      year: 1,
      category: 1,
      ministry: 1,
      keywords: 1,
      pdfUrl: 1,
      sourceName: 1,
      sourceType: 1,
      indiaCodeSearchUrl: 1,
      indiaCodeUrl: 1,
      pdfVerificationStatus: 1,
      statusNote: 1,
      isPopular: 1,
      isNewLaw: 1,
      publishedAt: 1,
      views: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    let items = [];
    let total = 0;

    try {
      const [dbItems, dbTotal] = await Promise.all([
        BareAct.find(query)
          .sort(
            search
              ? { score: { $meta: "textScore" }, ...sort }
              : sort,
          )
          .skip(skip)
          .limit(limit)
          .select(projection)
          .lean(false),
        BareAct.countDocuments(query),
      ]);
      items = dbItems || [];
      total = dbTotal || 0;
    } catch (dbErr) {
      console.warn("BareAct DB query failed, using static fallback:", dbErr.message);
    }

    if (items.length === 0 && Array.isArray(staticBareActs)) {
      let filtered = staticBareActs;
      if (category) {
        filtered = filtered.filter(
          (a) => a.category && a.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            (a.title && a.title.toLowerCase().includes(s)) ||
            (a.actName && a.actName.toLowerCase().includes(s)) ||
            (a.shortName && a.shortName.toLowerCase().includes(s)) ||
            (Array.isArray(a.keywords) && a.keywords.some((k) => k.toLowerCase().includes(s)))
        );
      }
      total = filtered.length;
      items = filtered.slice(skip, skip + limit).map((a, idx) => ({
        _id: a._id || `act-${skip + idx + 1}`,
        ...a,
      }));
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const mapped = items.map(pickBareActFields);

    return res.status(200).json({
      success: true,
      pagination: {
        totalItems: total,
        totalPages,
        page,
        limit,
      },
      data: {
        bareActs: mapped,
      },
      // Backward compatibility with existing frontend.
      count: total,
      bareActs: mapped,
    });
  } catch (error) {
    console.error("getBareActs error", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch bare acts",
      error: error?.message,
    });
  }
}

async function getBareActById(req, res) {
  try {
    const { id } = req.params;

    let bareAct = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      try {
        bareAct = await BareAct.findById(id);
      } catch (_e) {}
    }

    if (!bareAct && Array.isArray(staticBareActs)) {
      bareAct = staticBareActs.find(
        (a) =>
          String(a._id) === id ||
          a.shortName?.toLowerCase() === id.toLowerCase() ||
          a.title?.toLowerCase() === id.toLowerCase() ||
          `act-${staticBareActs.indexOf(a) + 1}` === id
      );
    }

    if (!bareAct) {
      return res.status(404).json({ success: false, message: "Bare act not found" });
    }

    return res.status(200).json({
      success: true,
      bareAct: pickBareActFields(bareAct),
      data: { bareAct: pickBareActFields(bareAct) },
    });
  } catch (error) {
    console.error("getBareActById error", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch bare act",
      error: error?.message,
    });
  }
}

async function searchBareActs(req, res) {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";
    if (!q) {
      return res.status(200).json({
        success: true,
        pagination: { totalItems: 0, totalPages: 1, page: 1, limit: 20 },
        data: { bareActs: [] },
        count: 0,
        bareActs: [],
      });
    }

    // Reuse getBareActs logic by mapping q -> search.
    req.query.search = q;
    return getBareActs(req, res);
  } catch (error) {
    console.error("searchBareActs error", error);
    return res.status(500).json({
      success: false,
      message: "Cannot search bare acts",
      error: error?.message,
    });
  }
}

async function getBareActsByCategory(req, res) {
  try {
    const category = req.params.category ? String(req.params.category).trim() : "";
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    req.query.category = category;
    return getBareActs(req, res);
  } catch (error) {
    console.error("getBareActsByCategory error", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch bare acts by category",
      error: error?.message,
    });
  }
}

module.exports = {
  getBareActs,
  getBareActById,
  searchBareActs,
  getBareActsByCategory,
};

