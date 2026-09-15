// One-off cleanup for [SMOKE-CASES-TEST] records created during smoke runs.
require("dotenv").config();
const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({}, { strict: false });
const Case = mongoose.model("Case", caseSchema, "cases");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const r = await Case.deleteMany({ caseTitle: { $regex: "^\\[SMOKE-CASES-TEST\\]" } });
    console.log("cleanup deleted:", r.deletedCount);
    await mongoose.disconnect();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
