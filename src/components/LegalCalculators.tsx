import React, { useState } from "react";
import { 
  Calculator, 
  Calendar, 
  FileText, 
  Copy, 
  Check, 
  Clock, 
  Scale, 
  ArrowRight,
  AlertCircle
} from "lucide-react";

export const LegalCalculators: React.FC = () => {
  const [activeTool, setActiveTool] = useState<"limitation" | "court-fees" | "drafts">("limitation");

  // Limitation Calculator State
  const [causeDate, setCauseDate] = useState<string>("");
  const [matterType, setMatterType] = useState<string>("money-recovery");
  const [limitationResult, setLimitationResult] = useState<any | null>(null);

  // Court Fees Calculator State
  const [suitValuation, setSuitValuation] = useState<number>(500000);
  const [courtFeeResult, setCourtFeeResult] = useState<number | null>(null);

  // Drafts State
  const [draftType, setDraftType] = useState<string>("ni-138");
  const [clientName, setClientName] = useState<string>("M/s Alpha Commercials");
  const [oppositeName, setOppositeName] = useState<string>("Sh. Rajesh Gupta");
  const [chequeAmount, setChequeAmount] = useState<string>("4,50,000");
  const [chequeNumber, setChequeNumber] = useState<string>("482910");
  const [chequeDate, setChequeDate] = useState<string>("15th January 2025");
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  // Calculate Limitation
  const handleCalculateLimitation = () => {
    if (!causeDate) return;

    const date = new Date(causeDate);
    let deadline = new Date(date);
    let statute = "The Limitation Act, 1963";
    let article = "";
    let periodText = "";

    switch (matterType) {
      case "money-recovery":
        deadline.setFullYear(deadline.getFullYear() + 3);
        article = "Article 19 & 22";
        periodText = "3 Years from the date loan was made or demand made";
        break;
      case "specific-performance":
        deadline.setFullYear(deadline.getFullYear() + 3);
        article = "Article 54";
        periodText = "3 Years from the date fixed for performance, or when plaintiff noticed refusal";
        break;
      case "immovable-property":
        deadline.setFullYear(deadline.getFullYear() + 12);
        article = "Article 65";
        periodText = "12 Years when possession of defendant becomes adverse";
        break;
      case "appeal-hc":
        deadline.setDate(deadline.getDate() + 60);
        article = "Article 115(b)";
        periodText = "60 Days from the date of the decree or sentence";
        break;
      case "appeal-sessions":
        deadline.setDate(deadline.getDate() + 30);
        article = "Article 115(c)";
        periodText = "30 Days from sentence or order";
        break;
      case "ni-138-notice":
        deadline.setDate(deadline.getDate() + 30);
        article = "Section 138(b) NI Act";
        periodText = "30 Days from receipt of bank dishonour memo";
        break;
      default:
        deadline.setFullYear(deadline.getFullYear() + 3);
        article = "Article 113 (Residual)";
        periodText = "3 Years when right to sue accrues";
    }

    const today = new Date();
    const isExpired = deadline < today;
    const diffTime = deadline.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setLimitationResult({
      statute,
      article,
      periodText,
      deadlineStr: deadline.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      isExpired,
      daysLeft,
    });
  };

  // Calculate Court Fees
  const handleCalculateCourtFees = () => {
    // Standard Delhi/Model ad-valorem court fee schedule approximation
    const val = Number(suitValuation) || 0;
    let fees = 0;

    if (val <= 100000) {
      fees = val * 0.05;
    } else if (val <= 500000) {
      fees = 5000 + (val - 100000) * 0.035;
    } else if (val <= 2000000) {
      fees = 19000 + (val - 500000) * 0.02;
    } else {
      fees = 49000 + (val - 2000000) * 0.01;
    }

    setCourtFeeResult(Math.round(fees));
  };

  // Generate Draft Text
  const generateDraft = () => {
    if (draftType === "ni-138") {
      return `LEGAL DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

To,
${oppositeName}
[Address of Opposite Party / Drawer]

Sir / Madam,

Under instructions from and on behalf of my client, ${clientName}, having its registered office / residing at [Address], I hereby serve upon you the following Statutory Legal Notice:

1. That you, the Noticee, in discharge of your legally enforceable debt and financial liability towards my client, issued and tendered Account Payee Cheque bearing No. ${chequeNumber} dated ${chequeDate} for an amount of Rs. ${chequeAmount}/- (Rupees only) drawn on [Bank Name and Branch].

2. That upon presentation of the said cheque by my client through its banker [Bank Name], the said cheque was dishonoured and returned unpaid by your banker with remarks "FUNDS INSUFFICIENT" / "EXCEEDS ARRANGEMENT" vide Cheque Return Memo dated [Memo Date].

3. That you have intentionally and deliberately failed to maintain sufficient balance in your bank account, thereby dishonestly cheating my client and committing a statutory offence punishable under Section 138 of the Negotiable Instruments Act, 1881.

I, THEREFORE, hereby call upon you through this notice to pay the entire amount of Rs. ${chequeAmount}/- to my client within 15 (fifteen) days from the date of receipt of this notice, failing which my client shall be constrained to institute criminal complaint proceedings against you under Section 138 read with Section 141 of the Negotiable Instruments Act, 1881 and Section 318(4) of the Bharatiya Nyaya Sanhita, 2023, holding you liable for all costs, penal damages, and consequences thereof.

Copy kept in my office for record and further legal proceedings.

ADVOCATE
High Court of Delhi`;
    }

    return `LEGAL NOTICE FOR RECOVERY OF DUES AND BREACH OF CONTRACT

To,
${oppositeName}

Under instructions from my client, ${clientName}, I hereby call upon you to clear the outstanding sum of Rs. ${chequeAmount}/- along with interest @ 18% per annum within 15 days, failing which a Commercial Suit for recovery under the Commercial Courts Act, 2015 shall be filed.

ADVOCATE`;
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generateDraft());
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" /> Judicial Calculators & Pre-Formatted Drafts
          </div>
          <h2 className="text-xl font-bold font-serif-legal">
            Legal Utilities: Limitation, Court Fees & Notices
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Compute statutory periods under the Limitation Act 1963, calculate ad-valorem court fees for civil suits, and generate instant statutory notices.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTool("limitation")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
              activeTool === "limitation"
                ? "bg-amber-500 text-stone-950 font-semibold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            Limitation Act
          </button>
          <button
            onClick={() => setActiveTool("court-fees")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
              activeTool === "court-fees"
                ? "bg-amber-500 text-stone-950 font-semibold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            Court Fees
          </button>
          <button
            onClick={() => setActiveTool("drafts")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
              activeTool === "drafts"
                ? "bg-amber-500 text-stone-950 font-semibold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            Notice Drafts
          </button>
        </div>
      </div>

      {/* Limitation Tool */}
      {activeTool === "limitation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Limitation Period Calculator (The Limitation Act, 1963)
              </h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Cause of Action Arising Date / Event Date *
              </label>
              <input
                id="input-cause-date"
                type="date"
                value={causeDate}
                onChange={(e) => setCauseDate(e.target.value)}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Nature of Matter / Cause of Action
              </label>
              <select
                id="select-matter-type"
                value={matterType}
                onChange={(e) => setMatterType(e.target.value)}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="money-recovery">Suit for Recovery of Money (Articles 19 & 22 - 3 Years)</option>
                <option value="specific-performance">Specific Performance of Contract (Article 54 - 3 Years)</option>
                <option value="immovable-property">Possession of Immovable Property (Article 65 - 12 Years)</option>
                <option value="appeal-hc">Criminal Appeal to High Court from Conviction (Art. 115(b) - 60 Days)</option>
                <option value="appeal-sessions">Criminal Appeal to Sessions Court (Art. 115(c) - 30 Days)</option>
                <option value="ni-138-notice">S. 138 NI Act: Statutory Demand Notice Window (30 Days)</option>
              </select>
            </div>

            <button
              onClick={handleCalculateLimitation}
              disabled={!causeDate}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Calculate Statutory Deadline
            </button>
          </div>

          {/* Result Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
            {limitationResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-200">
                    {limitationResult.article}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      limitationResult.isExpired
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {limitationResult.isExpired ? "Barred by Limitation" : "Within Limitation"}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-stone-500">Last Date to File (Deadline)</div>
                  <div className="text-xl font-bold text-stone-900 font-serif-legal mt-0.5">
                    {limitationResult.deadlineStr}
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-lg text-xs space-y-1.5">
                  <div className="text-stone-600">
                    <strong>Statutory Period:</strong> {limitationResult.periodText}
                  </div>
                  <div className="text-stone-600">
                    <strong>Days Status:</strong>{" "}
                    {limitationResult.isExpired
                      ? `Lapsed by ${Math.abs(limitationResult.daysLeft)} days. Section 5 condonation application required.`
                      : `${limitationResult.daysLeft} days remaining to file.`}
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 italic">
                  Note: Under Section 4 of the Limitation Act, if the court is closed on the expiration day, the suit/application may be instituted on the reopening day.
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400 text-xs">
                Select an event date and nature of matter to compute the statutory limitation deadline.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Court Fees Tool */}
      {activeTool === "court-fees" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Scale className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Civil Suit Valuation & Court Fee Estimator
              </h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Suit Valuation / Claim Amount (INR)
              </label>
              <input
                id="input-suit-val"
                type="number"
                value={suitValuation}
                onChange={(e) => setSuitValuation(Number(e.target.value))}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 focus:outline-none font-mono"
              />
            </div>

            <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-600 space-y-1">
              <div>• ₹0 to ₹1,00,000: 5.0% ad-valorem</div>
              <div>• ₹1,00,001 to ₹5,00,000: ₹5,000 + 3.5% on excess</div>
              <div>• ₹5,00,001 to ₹20,00,000: ₹19,000 + 2.0% on excess</div>
              <div>• Above ₹20,00,000: ₹49,000 + 1.0% on excess</div>
            </div>

            <button
              onClick={handleCalculateCourtFees}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Estimate Court Fee Payable
            </button>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
            {courtFeeResult !== null ? (
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded">
                  Court Fees Act Schedule
                </span>

                <div>
                  <div className="text-xs text-stone-500">Estimated Court Fee Payable</div>
                  <div className="text-3xl font-bold text-stone-900 font-serif-legal text-amber-900 mt-1">
                    ₹{courtFeeResult.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 space-y-1">
                  <div>Suit Valuation: ₹{Number(suitValuation).toLocaleString("en-IN")}</div>
                  <div>Mode of Payment: e-Court Fee stamp paper or electronic payment gateway (SHCIL)</div>
                </div>

                <p className="text-[11px] text-stone-500 italic">
                  Applicable for Delhi High Court & District Courts. Specific State Court Fees amendments (e.g. Maharashtra, UP) may vary slightly.
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400 text-xs">
                Enter claim valuation to compute estimated judicial stamp fees.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notice Drafts Tool */}
      {activeTool === "drafts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3.5 text-xs">
            <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
              Notice Generator Parameters
            </h3>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Notice Template</label>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="ni-138">Section 138 NI Act Cheque Dishonour Notice</option>
                <option value="recovery">Commercial Recovery Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Client / Complainant</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Opposite Party / Noticee</label>
              <input
                type="text"
                value={oppositeName}
                onChange={(e) => setOppositeName(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Cheque / Claim Amount (INR)</label>
              <input
                type="text"
                value={chequeAmount}
                onChange={(e) => setChequeAmount(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Cheque Number</label>
              <input
                type="text"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Cheque Date</label>
              <input
                type="text"
                value={chequeDate}
                onChange={(e) => setChequeDate(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-stone-300">Formatted Legal Notice</span>
              </div>
              <button
                onClick={handleCopyDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Notice</span>
                  </>
                )}
              </button>
            </div>

            <div className="my-3 overflow-y-auto max-h-[380px] p-4 bg-stone-950 rounded-lg font-mono text-[11px] leading-relaxed text-stone-300 whitespace-pre-wrap border border-stone-800 select-all">
              {generateDraft()}
            </div>

            <div className="text-[10px] text-stone-500">
              Lawyer2Lawyer notice templates follow Delhi High Court rules and standard bar practice.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
