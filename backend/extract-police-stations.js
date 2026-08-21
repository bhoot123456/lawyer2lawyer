/**
 * RESEARCH/EXTRACTION SCRIPT — DELHI POLICE TELEPHONE DIRECTORY
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracts per-district territorial police station lists from the official
 * Delhi Police Telephone Directory (ASP.NET WebForms POST extraction).
 *
 * USAGE:
 *   node extract-police-stations.js [--out <path>] [--only <DistrictName>,...]
 *
 * This is a TEMPORARY research script. It writes app/backend/data/delhi-police-stations.js
 * with the extracted records, to be validated by seed-police-stations.js --dry-run.
 *
 * SAFETY:
 *   • Only reads the public Delhi Police telephone directory.
 *   • No DB writes.
 *   • No fabricated data — only what the official grid returns.
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE = "https://delhipolice.gov.in";
const TELDIR_URL = BASE + "/telephonedirectory.aspx";
const MAX_RETRIES = 4;
const TIMEOUT_MS = 45000;

// ── Territorial districts + their dropdown value in the directory ────────
// Values taken verbatim from the official <select name="ctl00$MainContent$ddldistrict">.
const TERRITORIAL_DISTRICTS = [
  "CENTRAL DISTRICT",
  "EAST DISTRICT",
  "NEW DELHI DISTRICT",
  "NORTH DISTRICT",
  "NORTH-WEST DISTRICT",
  "NORTH-EAST DISTRICT",
  "OUTER DISTRICT",
  "OUTER NORTH DISTT",
  "ROHINI",
  "SHAHDARA",
  "SOUTH DISTRICT",
  "SOUTH-EAST DISTRICT",
  "SOUTH-WEST DISTRICT",
  "WEST DISTRICT",
  "DWARKA",
];

// Map official directory district label -> our normalized verified district name.
const DISTRICT_NAME_MAP = {
  "CENTRAL DISTRICT": "Central",
  "EAST DISTRICT": "East",
  "NEW DELHI DISTRICT": "New Delhi",
  "NORTH DISTRICT": "North",
  "NORTH-WEST DISTRICT": "North-West",
  "NORTH-EAST DISTRICT": "North-East",
  "OUTER DISTRICT": "Outer",
  "OUTER NORTH DISTT": "Outer North",
  "ROHINI": "Rohini",
  "SHAHDARA": "Shahdara",
  "SOUTH DISTRICT": "South",
  "SOUTH-EAST DISTRICT": "South-East",
  "SOUTH-WEST DISTRICT": "South-West",
  "WEST DISTRICT": "West",
  "DWARKA": "Dwarka",
};

/** Normalized district names (matches delhi-police-stations.js VERIFIED_DISTRICTS). */
const VERIFIED_DISTRICTS_ARRAY = Object.freeze(
  Object.values(DISTRICT_NAME_MAP),
);

async function fetchWithRetry(url, options) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await axios({ url, timeout: TIMEOUT_MS, ...options });
    } catch (err) {
      lastErr = err;
      const delay = 1500 * attempt;
      console.log(`    [retry ${attempt}/${MAX_RETRIES}] ${err.message} — waiting ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// ── Cookie helpers (ASP.NET ViewState is session-scoped) ─────────────────
function extractCookies(res) {
  const cookies = [];
  const raw = res.headers["set-cookie"];
  if (raw) {
    for (const c of Array.isArray(raw) ? raw : [raw]) {
      const name = String(c).split(";")[0];
      if (name) cookies.push(name);
    }
  }
  return cookies;
}

function cookieHeader(cookies) {
  return cookies.join("; ");
}

// ── HTML helpers ──────────────────────────────────────────────────────────
function attrValue(html, attr) {
  const m = html.match(new RegExp('name="' + attr + '"[^>]*value="([^"]*)"'));
  return m ? m[1] : null;
}

function stripTags(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(str) {
  // Build entity strings at runtime to avoid HTML-entity mangling by editors.
  const AMP = String.fromCharCode(38); // &
  const LT = String.fromCharCode(60); // <
  const GT = String.fromCharCode(62); // >
  const NBSP = String.fromCharCode(160);

  return String(str || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(new RegExp(AMP + "amp;", "g"), AMP)
    .replace(new RegExp(AMP + "lt;", "g"), LT)
    .replace(new RegExp(AMP + "gt;", "g"), GT)
    .replace(new RegExp(AMP + "quot;", "g"), '"')
    .replace(new RegExp(AMP + "apos;", "g"), "'")
    .replace(new RegExp(AMP + "nbsp;", "g"), NBSP);
}

// ── Grid parsing ──────────────────────────────────────────────────────────
function parseGridRows(html) {
  // Find the grid table
  const tableMatch = html.match(/<table[^>]*id="MainContent_grddata"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return { rows: [], raw: null };

  const tableHtml = tableMatch[1];
  const rowMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const rows = [];

  for (const rm of rowMatches) {
    const rowHtml = rm[1];
    if (/HeaderStyle/i.test(rowHtml)) continue;

    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cm) =>
      decodeEntities(stripTags(cm[1])),
    );

    // Expect at least: S.No., Office/Police Station, Telephone, Mobile, Fax, District/Unit, Email
    if (cells.length < 6) continue;

    // Drop empty spacer rows (the grid has one empty <tr class="RowStyle">)
    if (cells.every((c) => !String(c).trim())) continue;

    rows.push(cells);
  }

  return { rows, raw: tableHtml };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function extract() {
  const args = process.argv.slice(2);
  const onlyArgIdx = args.indexOf("--only");
  const onlyList = onlyArgIdx >= 0
    ? args[onlyArgIdx + 1].split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const districtsToFetch = onlyList.length
    ? TERRITORIAL_DISTRICTS.filter((d) => onlyList.includes(d.toLowerCase()) || onlyList.includes(d))
    : TERRITORIAL_DISTRICTS;

  console.log("═".repeat(72));
  console.log("📞 DELHI POLICE TELEPHONE DIRECTORY — POST EXTRACTION");
  console.log("═".repeat(72));
  console.log("  Source      : " + TELDIR_URL);
  console.log("  Districts   : " + districtsToFetch.length);

  // Step 1: GET the page to obtain ASP.NET form state
  console.log("\n[1/2] Fetching telephone directory page (GET)…");
  const getRes = await fetchWithRetry(TELDIR_URL, { method: "GET", headers: { "User-Agent": "Mozilla/5.0" } });
  const pageHtml = getRes.data;

  let viewstate = attrValue(pageHtml, "__VIEWSTATE");
  const viewstateGen = attrValue(pageHtml, "__VIEWSTATEGENERATOR");
  let eventValidation = attrValue(pageHtml, "__EVENTVALIDATION");

  if (!viewstate || !eventValidation) {
    throw new Error("Could not extract __VIEWSTATE/__EVENTVALIDATION from page");
  }
  console.log("  __VIEWSTATE bytes         : " + viewstate.length);
  console.log("  __EVENTVALIDATION bytes   : " + eventValidation.length);

  // Preserve session cookies — ASP.NET ViewState is session-scoped.
   const cookies = extractCookies(getRes);
  let cookieHeaderStr = cookieHeader(cookies);
  console.log("  Session cookies           : " + (cookies.length ? cookies.join(", ") : "(none)"));

  // Step 2: POST per district to load the grid
  const allRecords = [];
  const failures = [];

  for (let i = 0; i < districtsToFetch.length; i++) {
    const districtLabel = districtsToFetch[i];
    const districtName = DISTRICT_NAME_MAP[districtLabel];
    console.log("\n[" + (i + 1) + "/" + districtsToFetch.length + "] POST district: " + districtLabel + " → " + districtName);

    const form = new URLSearchParams();
    form.set("__EVENTTARGET", "");
    form.set("__EVENTARGUMENT", "");
    form.set("__VIEWSTATE", viewstate);
    form.set("__VIEWSTATEGENERATOR", viewstateGen);
    form.set("__EVENTVALIDATION", eventValidation);
    form.set("ctl00$hdnLanguage", "");
    form.set("ctl00$MainContent$ddldistrict", districtLabel);
    form.set("ctl00$MainContent$txtsearch", "");
    form.set("ctl00$MainContent$btn_search", "Search");
    form.set("ctl00$MainContent$ddlrecord", "200");

    try {
      const postRes = await fetchWithRetry(TELDIR_URL, {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": cookieHeaderStr,
          "Referer": TELDIR_URL,
        },
        data: form.toString(),
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 500,
       });

      // Update session cookies + VIEWSTATE from the POST response if the server rotated them
      const postCookies = extractCookies(postRes);
      if (postCookies.length) {
        const merged = Array.from(new Set([...cookies, ...postCookies]));
        cookies.length = 0;
        cookies.push(...merged);
        cookieHeaderStr = cookieHeader(cookies);
      }

      const newViewstate = attrValue(postRes.data, "__VIEWSTATE");
      if (newViewstate) {
        viewstate = newViewstate;
        form.set("__VIEWSTATE", viewstate);
      }

      const newEventValidation = attrValue(postRes.data, "__EVENTVALIDATION");
      if (newEventValidation) eventValidation = newEventValidation;

      const { rows } = parseGridRows(postRes.data);
      console.log("  Rows returned: " + rows.length);


      if (!rows.length) {
        failures.push({ district: districtLabel, reason: "no grid rows returned" });
        continue;
      }

      for (const cells of rows) {
        const [snoRaw, office, phone, mobile, fax, districtRaw, email] = cells;
        const sno = String(snoRaw || "").trim();
        const stationName = String(office || "").trim();

        // Only include rows that look like territorial police stations
        const isStationLike = /(^|\s)(P\.?\s?S\.?|Police Station|Thana)/i.test(stationName) ||
          /PS\s/i.test(stationName) ||
          stationName.toLowerCase().includes("police station");

        // Keep ALL rows for the district — the telephone directory district list
        // contains the station rows for that district. We filter later.
        allRecords.push({
          sNo: sno,
          name: stationName,
          phone: String(phone || "").trim() || null,
          mobile: String(mobile || "").trim() || null,
          fax: String(fax || "").trim() || null,
          districtLabel: districtLabel,
          district: districtName,
          districtRaw: String(districtRaw || "").trim() || null,
          email: String(email || "").trim() || null,
          isStationLike,
        });
      }
    } catch (err) {
      console.log("  ❌ FAILED: " + err.message);
      failures.push({ district: districtLabel, reason: err.message });
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(72));
  console.log("📊 EXTRACTION REPORT");
  console.log("═".repeat(72));
  console.log("  Total raw rows scraped     : " + allRecords.length);
  console.log("  Station-like rows          : " + allRecords.filter((r) => r.isStationLike).length);
  console.log("  Districts failed           : " + failures.length);
  failures.forEach((f) => console.log("    - " + f.district + ": " + f.reason));

  // Per-district breakdown
  const byDistrict = {};
  for (const r of allRecords) {
    byDistrict[r.districtLabel] = (byDistrict[r.districtLabel] || 0) + 1;
  }
  console.log("\n  Raw rows by district:");
  for (const d of districtsToFetch) {
    console.log("    " + d + ": " + (byDistrict[d] || 0));
  }

  // ── Output ──────────────────────────────────────────────────────────────
  const outArgIdx = args.indexOf("--out");
  const outPath = outArgIdx >= 0
    ? args[outArgIdx + 1]
    : path.join(__dirname, "data", "delhi-police-stations.js");

   fs.writeFileSync(
     path.join(__dirname, "research-extraction-raw.json"),
     JSON.stringify({ source: TELDIR_URL, extractedAt: new Date().toISOString(), failures, records: allRecords }, null, 2),
   );
   console.log("\n  Raw JSON written: app/backend/research-extraction-raw.json");

   // ── Optional: write schema-validated data file ───────────────────────────
   const writeData = args.includes("--write-data");
   if (writeData) {
     const written = writeDataFile(allRecords);
     console.log("  Data file written: app/backend/data/delhi-police-stations.js (" + written + " records)");
   }

   return allRecords;
}

// ── Convert extracted records -> PoliceStation schema shape ─────────────────
function toDataRecord(raw) {
  const name = normalizeStationName(raw.name);
  const phoneParts = [];
  if (raw.phone) phoneParts.push(raw.phone);
  if (raw.mobile) phoneParts.push(raw.mobile);
  // Delhi Police numbers: landline like "011-XXXXXX" or "XXXXXX" — prefix 011 if missing
  let combinedPhone = phoneParts.length ? phoneParts.join(" / ") : null;

  return {
    name,
    district: raw.district,
    subdivision: null, // subdivision not exposed in telephone directory grid
    type: /thana/i.test(raw.name) ? "Thana" : "Police Station",
    address: null,
    pinCode: null,
    phone: combinedPhone,
    email: raw.email || null,
    sho: { name: null, rank: null, phone: null, email: null },
    location: { latitude: null, longitude: null },
    source: "Delhi Police Telephone Directory",
    sourceUrl: TELDIR_URL,
    lastVerified: new Date().toISOString().split("T")[0],
    status: "published",
    isActive: true,
    displayOrder: 0,
  };
}

function normalizeStationName(name) {
  let n = String(name || "").trim().replace(/\s+/g, " ");
  // Standardise "P.S." / "PS" prefix to "PS"
  n = n.replace(/^P\.S\.\s+/i, "PS ").replace(/^P\.?S\.?\s+/i, "PS ");
  return n;
}

function writeDataFile(records) {
  // Keep only station-like records, dedupe by normalized name+district
  const valid = records.filter((r) => r.isStationLike);
  const seen = new Set();
  const deduped = [];
  for (const r of valid) {
    const key = normalizeStationName(r.name).toLowerCase() + "|" + r.district;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(toDataRecord(r));
  }
  deduped.sort((a, b) => {
    if (a.district < b.district) return -1;
    if (a.district > b.district) return 1;
    return a.name.localeCompare(b.name);
  });

  const now = new Date().toISOString();
  const content = `/**
 * Delhi Police Territorial Station Dataset
 * Source: Delhi Police Telephone Directory (https://delhipolice.gov.in/telephonedirectory.aspx)
 * Extracted: ${now}
 * Records: ${deduped.length} territorial police stations across ${TERRITORIAL_DISTRICTS.length} districts
 *
 * Fields not available in the official telephone directory grid (address, pinCode,
 * GPS coordinates, SHO details) are intentionally null — no fabrication.
 */

const VERIFIED_DISTRICTS = Object.freeze([
${VERIFIED_DISTRICTS_ARRAY.map((d) => "  \"" + d + "\",").join("\n")}
]);

const DELHI_POLICE_STATIONS = [
${deduped.map((r) => "  " + JSON.stringify(r) + ",").join("\n")}
];

module.exports = DELHI_POLICE_STATIONS;
module.exports.VERIFIED_DISTRICTS = VERIFIED_DISTRICTS;
`;

  fs.writeFileSync(
    path.join(__dirname, "data", "delhi-police-stations.js"),
    content,
  );
  console.log("\n  ── Station names per district (extracted) ──");
  const byDistrict = {};
  for (const r of deduped) {
    (byDistrict[r.district] = byDistrict[r.district] || []).push(r.name);
  }
  for (const d of VERIFIED_DISTRICTS_ARRAY) {
    const list = byDistrict[d] || [];
    console.log("  " + d + " (" + list.length + "): " + (list.length ? list.join(", ") : "(none)"));
  }

  return deduped.length;
}

if (require.main === module) {
  extract()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal:", err);
      process.exit(1);
    });
}

module.exports = { extract, TERRITORIAL_DISTRICTS, DISTRICT_NAME_MAP, VERIFIED_DISTRICTS_ARRAY, parseGridRows, toDataRecord, writeDataFile };