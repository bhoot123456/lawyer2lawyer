const router = require("express").Router();

// Universal search across Judicial Intelligence Engine collections.
// v1 scope (for now): Judgments, Court Holidays, Cause Lists.

const JudicialJudgment = require("../models/JudicialJudgment");
const CourtHoliday = require("../models/CourtHoliday");
const DailyCauseListEntry = require("../models/DailyCauseListEntry");

function normalizeQuery(q) {
  const s = String(q || "").trim();
  return s;
}

function toDateParam(x) {
  if (!x) return null;
  const d = new Date(String(x));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

router.get("/", async (req, res) => {
  try {
    const q = normalizeQuery(req.query.q);
    const type = req.query.type ? String(req.query.type) : null;

    // Optional filters for “today”-type search usage
    const date = toDateParam(req.query.date);
    const court = req.query.court ? String(req.query.court) : null;
    const jurisdiction = req.query.jurisdiction
      ? String(req.query.jurisdiction)
      : null;

    if (!q && !date && !court && !jurisdiction) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one filter: q, date, court, or jurisdiction.",
      });
    }

    const kindsToSearch = (() => {
      const all = [
        "judgments",
        "court_holidays",
        "cause_list",
      ];
      if (!type) return all;
      const t = String(type).toLowerCase();
      if (t === "judgment" || t === "judgments") return ["judgments"];
      if (t === "holiday" || t === "holidays" || t === "court_holiday")
        return ["court_holidays"];
      if (t === "cause_list" || t === "cause" || t === "causelist")
        return ["cause_list"];
      return all;
    })();

    const dateStart = date ? new Date(date) : null;
    const dateEnd = date ? new Date(date) : null;
    if (dateStart && dateEnd) {
      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);
    }

    const courtFilter = court ? { court } : {};
    const jurisFilter = jurisdiction ? { jurisdiction } : {};

    const searchText = q
      ? {
          $text: { $search: q },
        }
      : {};

    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const queries = [];

    if (kindsToSearch.includes("judgments")) {
      const filter = {
        ...(q ? searchText : {}),
        ...(courtFilter || {}),
        ...(jurisFilter || {}),
        ...(dateStart && dateEnd
          ? { judgmentDate: { $gte: dateStart, $lte: dateEnd } }
          : {}),
        status: "active",
      };
      queries.push(
        JudicialJudgment.find(filter)
          .sort({ publishedAt: -1, judgmentDate: -1 })
          .limit(limit)
          .select(
            "dedupeKey title court jurisdiction bench citation judgmentDate publishedAt sourceUrl contentText"
          )
          .lean()
          .then((items) =>
            items.map((it) => ({
              kind: "judgment",
              id: it.dedupeKey,
              title: it.title,
              court: it.court,
              jurisdiction: it.jurisdiction,
              date: it.judgmentDate || it.publishedAt,
              url: it.sourceUrl || undefined,
              snippet: it.contentText
                ? String(it.contentText).slice(0, 200)
                : undefined,
            }))
          )
      );
    }

    if (kindsToSearch.includes("court_holidays")) {
      const filter = {
        ...(q ? searchText : {}),
        ...(courtFilter || {}),
        ...(jurisFilter || {}),
        ...(dateStart && dateEnd
          ? { holidayDate: { $gte: dateStart, $lte: dateEnd } }
          : {}),
        status: "active",
      };

      queries.push(
        CourtHoliday.find(filter)
          .sort({ holidayDate: 1, publishedAt: -1 })
          .limit(limit)
          .select(
            "dedupeKey title court jurisdiction holidayDate holidayType reason publishedAt sourceUrl"
          )
          .lean()
          .then((items) =>
            items.map((it) => ({
              kind: "court_holiday",
              id: it.dedupeKey,
              title: it.title,
              court: it.court,
              jurisdiction: it.jurisdiction,
              date: it.holidayDate,
              url: it.sourceUrl || undefined,
              snippet: it.reason || undefined,
              extra: {
                holidayType: it.holidayType,
              },
            }))
          )
      );
    }

    if (kindsToSearch.includes("cause_list")) {
      const filter = {
        ...(q ? searchText : {}),
        ...(courtFilter || {}),
        ...(jurisFilter || {}),
        ...(dateStart && dateEnd
          ? { causeListDate: { $gte: dateStart, $lte: dateEnd } }
          : {}),
        status: "active",
      };

      queries.push(
        DailyCauseListEntry.find(filter)
          .sort({ displayOrder: 1 })
          .limit(limit)
          .select(
            "dedupeKey court jurisdiction causeListDate caseNumber caseTitle bench causeStage sourceUrl notes"
          )
          .lean()
          .then((items) =>
            items.map((it) => ({
              kind: "cause_list",
              id: it.dedupeKey,
              title: it.caseTitle || it.caseNumber,
              court: it.court,
              jurisdiction: it.jurisdiction,
              date: it.causeListDate,
              url: it.sourceUrl || undefined,
              snippet: it.notes || undefined,
              extra: {
                caseNumber: it.caseNumber,
                bench: it.bench,
                causeStage: it.causeStage,
              },
            }))
          )
      );
    }

    const resultsNested = await Promise.all(queries);
    const results = resultsNested.flat();

    // Simple ranking: date desc then kind.
    const normTime = (x) => {
      const d = x?.date ? new Date(x.date) : null;
      return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
    };

    results.sort((a, b) => normTime(b) - normTime(a));

    res.json({
      success: true,
      data: {
        query: { q, type, date: req.query.date || null, court, jurisdiction },
        results,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[JIE] universal search error:", err);
    res.status(500).json({
      success: false,
      message: "Universal search failed",
    });
  }
});

module.exports = router;

