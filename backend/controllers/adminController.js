const User = require("../models/User");
const Case = require("../models/Case");
const Booking = require("../models/Booking");
const Article = require("../models/Article");
const Tribunal = require("../models/Tribunal");
const Notification = require("../models/Notification");
const PoliceStation = require("../models/PoliceStation");

// ============================
// DASHBOARD
// ============================

exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [
      totalUsers,
      totalLawyers,
      totalClients,
      totalCases,
      totalArticles,
      totalTribunals,
      pendingVerifications,
      recentLawyers,
      recentClients,
      recentCases,
      casesByStatus,
      usersByState,
      activeLawyers,
      suspendedUsers,
      publishedArticles,
        draftArticles,
        todaysHearings,
        unreadNotifications,
        totalPoliceStations,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "lawyer" }),
      User.countDocuments({ role: "client" }),
      Case.countDocuments({}),
      Article.countDocuments({}),
      Tribunal.countDocuments({}),
      User.countDocuments({ role: "lawyer", verificationStatus: "pending" }),
      User.find({ role: "lawyer" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email city state specialization verificationStatus createdAt"),
      User.find({ role: "client" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email city state createdAt"),
      Case.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "name email")
        .select("caseTitle caseNumber status priority createdAt"),
      Case.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      User.countDocuments({ role: "lawyer", isActive: true, isSuspended: false }),
      User.countDocuments({ isSuspended: true }),
      Article.countDocuments({ status: "published" }),
      Article.countDocuments({ status: "draft" }),
      Case.countDocuments({ nextHearingDate: { $gte: todayStart, $lt: todayEnd } }),
      Notification.countDocuments({ status: "unread" }),
      PoliceStation.countDocuments({ status: "published" }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalLawyers,
        totalClients,
        totalCases,
        totalArticles,
        totalTribunals,
        pendingVerifications,
        recentLawyers,
        recentClients,
        recentCases,
        casesByStatus,
        usersByState,
        activeLawyers,
        suspendedUsers,
        publishedArticles,
        draftArticles,
        todaysHearings,
        unreadNotifications,
        totalPoliceStations,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

exports.getRevenueStats = async (req, res) => {
  try {
    // Revenue stats from bookings (placeholder for future payment integration)
    const totalBookings = await Booking.countDocuments({});
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("client", "name email")
      .populate("lawyer", "name email");

    res.json({
      success: true,
      data: {
        totalBookings,
        recentBookings,
        // Future: payment stats, revenue by month, etc.
      },
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch revenue data" });
  }
};

// ============================
// LAWYERS MANAGEMENT
// ============================

exports.getAllLawyers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      state,
      city,
      specialization,
      verificationStatus,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { role: "lawyer" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { barCouncilNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (specialization) filter.specialization = { $regex: specialization, $options: "i" };
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [lawyers, total] = await Promise.all([
      User.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        lawyers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get all lawyers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lawyers" });
  }
};

exports.getLawyerById = async (req, res) => {
  try {
    const lawyer = await User.findById(req.params.id).select("-password");
    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    const casesCount = await Case.countDocuments({
      $or: [{ createdBy: lawyer._id }, { assignedTo: lawyer._id }],
    });

    res.json({
      success: true,
      data: {
        lawyer,
        casesCount,
      },
    });
  } catch (error) {
    console.error("Get lawyer error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lawyer" });
  }
};

exports.updateLawyer = async (req, res) => {
  try {
    const allowedFields = [
      "name", "email", "state", "city", "specialization", "phone", "about",
      "experience", "barCouncilNumber", "courts", "states",
      "consultationFee", "availableForConsultation", "isActive", "isSuspended",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const lawyer = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    res.json({ success: true, data: lawyer });
  } catch (error) {
    console.error("Update lawyer error:", error);
    res.status(500).json({ success: false, message: "Failed to update lawyer" });
  }
};

exports.verifyLawyer = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid verification status" });
    }

    const updateData = { verificationStatus: status };
    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const lawyer = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    ).select("-password");

    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    res.json({ success: true, data: lawyer });
  } catch (error) {
    console.error("Verify lawyer error:", error);
    res.status(500).json({ success: false, message: "Failed to verify lawyer" });
  }
};

exports.deleteLawyer = async (req, res) => {
  try {
    const lawyer = await User.findOneAndDelete({ _id: req.params.id, role: "lawyer" });
    if (!lawyer) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    // Also remove associated cases
    await Case.deleteMany({
      $or: [{ createdBy: lawyer._id }, { assignedTo: lawyer._id }],
    });

    res.json({ success: true, message: "Lawyer deleted successfully" });
  } catch (error) {
    console.error("Delete lawyer error:", error);
    res.status(500).json({ success: false, message: "Failed to delete lawyer" });
  }
};

// ============================
// CLIENTS MANAGEMENT
// ============================

exports.getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      state,
      city,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { role: "client" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [clients, total] = await Promise.all([
      User.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get all clients error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch clients" });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await User.findById(req.params.id).select("-password");
    if (!client || client.role !== "client") {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const consultationHistory = await Booking.find({ client: client._id })
      .populate("lawyer", "name email specialization")
      .sort({ createdAt: -1 })
      .limit(20);

    const casesCount = await Case.countDocuments({ createdBy: client._id });

    res.json({
      success: true,
      data: {
        client,
        consultationHistory,
        casesCount,
      },
    });
  } catch (error) {
    console.error("Get client error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch client" });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const allowedFields = [
      "name", "email", "state", "city", "phone", "about", "isActive", "isSuspended",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const client = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!client || client.role !== "client") {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ success: false, message: "Failed to update client" });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await User.findOneAndDelete({ _id: req.params.id, role: "client" });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    res.json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({ success: false, message: "Failed to delete client" });
  }
};

// ============================
// CASES MANAGEMENT (Admin)
// ============================

exports.getAllCasesAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      priority,
      court,
      assignedTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { caseTitle: { $regex: search, $options: "i" } },
        { caseNumber: { $regex: search, $options: "i" } },
        { client: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (court) filter.court = { $regex: court, $options: "i" };
    if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email specialization"),
      Case.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get all cases admin error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cases" });
  }
};

exports.getCaseByIdAdmin = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email specialization phone");

    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    res.json({ success: true, data: caseData });
  } catch (error) {
    console.error("Get case admin error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch case" });
  }
};

exports.updateCaseAdmin = async (req, res) => {
  try {
    const allowedFields = [
      "caseTitle", "caseNumber", "status", "priority", "currentStage",
      "court", "judge", "client", "advocate", "oppositeParty",
      "oppositeAdvocate", "practiceArea", "caseType", "description",
      "importantNotes", "nextHearingDate", "assignedTo",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email specialization");

    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    res.json({ success: true, data: caseData });
  } catch (error) {
    console.error("Update case admin error:", error);
    res.status(500).json({ success: false, message: "Failed to update case" });
  }
};

exports.deleteCaseAdmin = async (req, res) => {
  try {
    const caseData = await Case.findByIdAndDelete(req.params.id);
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    res.json({ success: true, message: "Case deleted successfully" });
  } catch (error) {
    console.error("Delete case admin error:", error);
    res.status(500).json({ success: false, message: "Failed to delete case" });
  }
};

exports.archiveCase = async (req, res) => {
  try {
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "Closed", currentStage: "Closed" } },
      { new: true },
    );

    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    res.json({ success: true, data: caseData, message: "Case archived successfully" });
  } catch (error) {
    console.error("Archive case error:", error);
    res.status(500).json({ success: false, message: "Failed to archive case" });
  }
};

// ============================
// ARTICLES MANAGEMENT
// ============================

exports.getAllArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      isFeatured,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("author", "name email"),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get all articles error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch articles" });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate("author", "name email");
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch article" });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, coverImage, status, isFeatured } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required",
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check for duplicate slug
    const existingArticle = await Article.findOne({ slug });
    if (existingArticle) {
      // Append a timestamp to make unique
      slug += `-${Date.now()}`;
    }

    const article = new Article({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category,
      tags: tags || [],
      coverImage: coverImage || "",
      author: req.user._id,
      status: status || "draft",
      isFeatured: isFeatured || false,
      readTime: Math.ceil(content.split(/\s+/).length / 200), // approx read time
      publishedAt: status === "published" ? new Date() : null,
    });

    await article.save();

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error("Create article error:", error);
    res.status(500).json({ success: false, message: "Failed to create article" });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const allowedFields = [
      "title", "content", "excerpt", "category", "tags",
      "coverImage", "status", "isFeatured",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title) {
      updates.slug = updates.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    if (updates.status === "published") {
      updates.publishedAt = new Date();
    }

    if (updates.content) {
      updates.readTime = Math.ceil(updates.content.split(/\s+/).length / 200);
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({ success: false, message: "Failed to update article" });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({ success: false, message: "Failed to delete article" });
  }
};

exports.publishArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "published",
          publishedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.json({ success: true, data: article, message: "Article published successfully" });
  } catch (error) {
    console.error("Publish article error:", error);
    res.status(500).json({ success: false, message: "Failed to publish article" });
  }
};

exports.unpublishArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "draft" } },
      { new: true },
    );

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.json({ success: true, data: article, message: "Article unpublished successfully" });
  } catch (error) {
    console.error("Unpublish article error:", error);
    res.status(500).json({ success: false, message: "Failed to unpublish article" });
  }
};

