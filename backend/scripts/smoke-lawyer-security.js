/**
 * Phase 1 — Lawyer security END-TO-END smoke test.
 * Requires a running backend (`npm start`) + MongoDB.
 *   cd backend && npm run test:smoke:lawyer
 * Verifies: role allow-list + admin downgrade on register; login reuse;
 * courtdesk authz matrix (401/403/200); lawyer A/B case isolation with
 * 404-on-cross-read; unassigned cases invisible. Cleans up its fixtures.
 */
require("dotenv").config();

const mongoose = require("mongoose");
const axios = require("axios");

const User = require("../models/User");
const Case = require("../models/Case");
const Session = require("../models/Session");

const API = process.env.API_BASE || "http://127.0.0.1:5000/api";
const stamp = Date.now();
const PASSWORD = `Phase123!${stamp}`;

const emailA = `phase1.lawyer-a.${stamp}@example.test`;
const emailB = `phase1.lawyer-b.${stamp}@example.test`;
const emailC = `phase1.client.${stamp}@example.test`;
const emailEsc = `phase1.escalator.${stamp}@example.test`;

const anon = axios.create({ baseURL: API, validateStatus: () => true });

let failures = 0;
const createdUserIds = [];
const createdCaseIds = [];

function check(cond, label, extra) {
  if (cond) {
    console.log(`  ok - ${label}`);
  } else {
    failures++;
    console.error(`  FAIL - ${label}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ""}`);
  }
}

async function register(name, email, role) {
  const res = await anon.post("/auth/register", {
    name,
    email,
    password: PASSWORD,
    role,
    state: "Maharashtra",
    city: "Mumbai",
    specialization: role === "lawyer" ? "Criminal" : undefined,
  });
  if (res.data?.user?._id) createdUserIds.push(res.data.user._id);
  return res;
}

async function main() {
  console.log(`== Phase 1 lawyer smoke — API ${API} (${new Date().toISOString()}) ==`);

  // Direct DB access for fixtures — connect with the same URI as the server.
  if (!process.env.MONGO_URI) {
    console.error("FATAL: MONGO_URI missing from .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  // 1 & 2: registration role handling
  const resA = await register("Phase1 Lawyer A", emailA, "lawyer");
  check(
    resA.status === 200 && resA.data?.user?.role === "lawyer",
    "lawyer self-registration accepted (role=lawyer preserved)",
    { status: resA.status, role: resA.data?.user?.role },
  );

  const resEsc = await register("Phase1 Escalator", emailEsc, "admin");
  check(
    resEsc.status === 200 && resEsc.data?.user?.role === "client",
    "admin escalation is downgraded to client",
    { role: resEsc.data?.user?.role },
  );

  const resC = await register("Phase1 Client", emailC, "client");
  check(resC.status === 200 && resC.data?.user?.role === "client", "client self-registration", resC.data?.user?.role);

  const resB = await register("Phase1 Lawyer B", emailB, "lawyer");
  check(resB.status === 200 && resB.data?.user?.role === "lawyer", "lawyer B self-registration", resB.data?.user?.role);

  // 3: login reuses existing /auth/login
  const loginA = await anon.post("/auth/login", { email: emailA, password: PASSWORD });
  check(loginA.status === 200 && !!loginA.data?.token, "lawyer login via /auth/login", loginA.status);
  const tokenA = loginA.data?.token;

  // 4: courtdesk authorization matrix
  const anonProfile = await anon.get("/courtdesk/profile");
  check(anonProfile.status === 401, "anonymous /courtdesk/profile → 401", anonProfile.status);

  const clientProfile = await anon.get("/courtdesk/profile", {
    headers: { Authorization: `Bearer ${resC.data?.token}` },
  });
  check(clientProfile.status === 403, "client token /courtdesk/profile → 403", clientProfile.status);

  const lawyerProfile = await anon.get("/courtdesk/profile", {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  check(
    lawyerProfile.status === 200 && lawyerProfile.data?.user?.email === emailA,
    "lawyer /courtdesk/profile → 200",
    lawyerProfile.status,
  );

  // 5 & 6: case isolation by assignedTo
  const lawyerA = await User.findOne({ email: emailA }).lean();
  const lawyerB = await User.findOne({ email: emailB }).lean();
  if (!lawyerA || !lawyerB) {
    check(false, "fixture lawyers exist", { lawyerA: !!lawyerA, lawyerB: !!lawyerB });
  } else {
    const caseA = await Case.create({
      caseNumber: `PHASE1-LAWYER-A-${stamp}`,
      title: "Lawyer A case",
      court: "Mumbai",
      practiceArea: "Criminal",
      status: "Pending",
      priority: "High",
      createdBy: lawyerA._id,
      assignedTo: lawyerA._id,
    });
    const caseB = await Case.create({
      caseNumber: `PHASE1-LAWYER-B-${stamp}`,
      title: "Lawyer B case",
      court: "Bengaluru",
      practiceArea: "Civil",
      status: "Pending",
      priority: "Medium",
      createdBy: lawyerB._id,
      assignedTo: lawyerB._id,
    });
    const caseU = await Case.create({
      caseNumber: `PHASE1-LAWYER-U-${stamp}`,
      title: "Unassigned",
      court: "Delhi",
      practiceArea: "Family",
      status: "Pending",
      priority: "Low",
      createdBy: null,
      assignedTo: null,
    });
    createdCaseIds.push(caseA._id, caseB._id, caseU._id);

    const listA = await anon.get("/courtdesk/cases", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const numbers = (listA.data?.cases || []).map((x) => x.caseNumber);
    check(listA.status === 200, "lawyer /courtdesk/cases → 200", listA.status);
    check(numbers.includes(caseA.caseNumber), "lawyer A sees own assigned case", numbers);
    check(!numbers.includes(caseB.caseNumber), "lawyer A does NOT see lawyer B's case", numbers);
    check(!numbers.includes(caseU.caseNumber), "lawyer A does NOT see unassigned case", numbers);

    const readB = await anon.get(`/courtdesk/cases/${caseB._id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    check(readB.status === 404, "lawyer A reading lawyer B's case → 404 (no enumeration)", readB.status);

    const readA = await anon.get(`/courtdesk/cases/${caseA._id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    check(readA.status === 200 && String(readA.data?.case?._id) === String(caseA._id), "lawyer A reading own case → 200", readA.status);
  }
// ── cleanup (best effort) ─────────────────────────────────────────────
  try {
    if (createdCaseIds.length) await Case.deleteMany({ _id: { $in: createdCaseIds } });
    if (createdUserIds.length) {
      await Session.deleteMany({ userId: { $in: createdUserIds } });
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    await mongoose.disconnect();
    console.log("  ok - fixture data cleaned up");
  } catch (e) {
    console.warn("  warn - cleanup incomplete:", e.message);
  }

  console.log(failures === 0 ? "\nRESULT: PASS" : `\nRESULT: FAIL (${failures} failed checks)`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exitCode = 1;
});