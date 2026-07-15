require("dotenv").config();
console.log("OpenRouter Key:", process.env.OPENROUTER_API_KEY);

// OpenRouter uses `OPENROUTER_API_KEY`.
// const dotenv = require("dotenv");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const lawyerRoutes = require("./routes/lawyers");

const stateRoutes = require("./routes/states");
const bareActsRoutes = require("./routes/bare-acts");
const criminalLawActsRoutes = require("./routes/criminal-law-acts");
const miscFormsRoutes = require("./routes/misc-forms");
const tribunalRoutes = require("./routes/tribunalRoutes");
const caseRoutes = require("./routes/cases");
const revenueCourtRoutes = require("./routes/revenue-court");
const taxCorporateRoutes = require("./routes/tax-corporate");
const knowledgeHubRoutes = require("./routes/knowledge-hub");
const draftLibraryRoutes = require("./routes/draft-library");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notifications");
const aiRoutes = require("./routes/ai");
const judicialIntelligenceSearchRoutes = require("./routes/judicial-intelligence-search");
const supremeCourtRoutes = require("./routes/supreme-court");





const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true, // reflect request origin (works better for web during development)
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/lawyers", lawyerRoutes);
app.use("/api/states", stateRoutes);

app.use("/api/bare-acts", bareActsRoutes);
app.use("/api/criminal-law-acts", criminalLawActsRoutes);
app.use("/api/misc-forms", miscFormsRoutes);
app.use("/api/tribunals", tribunalRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/revenue-court", revenueCourtRoutes);
app.use("/api/tax-corporate", taxCorporateRoutes);
app.use("/api/knowledge-hub", knowledgeHubRoutes);
app.use("/api/draft-library", draftLibraryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/judicial-intelligence", judicialIntelligenceSearchRoutes);
app.use("/api/supreme-court", supremeCourtRoutes);


app.get("/", (req, res) => {

  res.json({ message: "Lawyer2Lawyer backend is running" });
});

// Simple health check for clients
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lawyer2lawyer";

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Start Judicial Intelligence Engine cron jobs (v1 placeholder runner)
    try {
      const judicialJobRunner = require("./jobs/judicialIntelligenceJobRunner");
      const intervalMs =
        process.env.JIE_JOB_INTERVAL_MS &&
        Number.isFinite(Number(process.env.JIE_JOB_INTERVAL_MS))
          ? Number(process.env.JIE_JOB_INTERVAL_MS)
          : undefined;

      judicialJobRunner.start({
        intervalMs: intervalMs || undefined,
        logger: console,
      });
    } catch (e) {
      // Never block server boot.
      console.error("[JIE] Failed to start job runner:", e);
    }


    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });

