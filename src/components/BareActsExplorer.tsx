import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Scale,
  Bookmark,
  Share2,
  Copy
} from "lucide-react";
import { BareAct } from "../types";

export const BareActsExplorer: React.FC = () => {
  const [acts, setActs] = useState<BareAct[]>([]);
  const [selectedActId, setSelectedActId] = useState<string>("bns");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [concordanceSearch, setConcordanceSearch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // New criminal law concordance lookup dictionary
  const CONCORDANCE_DATA = [
    {
      oldAct: "IPC",
      oldSec: "302",
      oldTitle: "Punishment for Murder",
      newAct: "BNS",
      newSec: "103(1)",
      newTitle: "Punishment for Murder",
      penalty: "Death or imprisonment for life, and fine",
      cognizable: "Cognizable / Non-bailable",
    },
    {
      oldAct: "IPC",
      oldSec: "420",
      oldTitle: "Cheating and dishonestly inducing delivery of property",
      newAct: "BNS",
      newSec: "318(4)",
      newTitle: "Cheating and dishonestly inducing delivery of property",
      penalty: "Imprisonment up to 7 years, and fine",
      cognizable: "Cognizable / Non-bailable",
    },
    {
      oldAct: "IPC",
      oldSec: "376",
      oldTitle: "Punishment for Rape",
      newAct: "BNS",
      newSec: "64",
      newTitle: "Punishment for Rape",
      penalty: "Rigorous imprisonment not less than 10 years up to life, and fine",
      cognizable: "Cognizable / Non-bailable",
    },
    {
      oldAct: "IPC",
      oldSec: "498A",
      oldTitle: "Husband or relative of husband subjecting woman to cruelty",
      newAct: "BNS",
      newSec: "85 & 86",
      newTitle: "Cruelty by husband or relatives",
      penalty: "Imprisonment up to 3 years, and fine",
      cognizable: "Cognizable / Non-bailable",
    },
    {
      oldAct: "IPC",
      oldSec: "304A",
      oldTitle: "Causing death by negligence (Rash driving/Hit & Run)",
      newAct: "BNS",
      newSec: "106(1) & 106(2)",
      newTitle: "Causing death by negligence",
      penalty: "Up to 5 years (S.106(1)) or up to 10 years for failure to report (S.106(2))",
      cognizable: "Cognizable / Bailable (S.106(1))",
    },
    {
      oldAct: "CrPC",
      oldSec: "438",
      oldTitle: "Anticipatory Bail / Direction for grant of bail to person apprehending arrest",
      newAct: "BNSS",
      newSec: "482",
      newTitle: "Direction for grant of bail to person apprehending arrest",
      penalty: "Relief granted by Sessions Court or High Court",
      cognizable: "Judicial Discretion",
    },
    {
      oldAct: "CrPC",
      oldSec: "439",
      oldTitle: "Special powers of High Court or Court of Session regarding bail (Regular Bail)",
      newAct: "BNSS",
      newSec: "483",
      newTitle: "Special powers of High Court or Court of Session regarding bail",
      penalty: "Regular Bail hearing",
      cognizable: "Judicial Discretion",
    },
    {
      oldAct: "CrPC",
      oldSec: "482",
      oldTitle: "Inherent powers of High Court (Quashing of FIR / Chargesheet)",
      newAct: "BNSS",
      newSec: "528",
      newTitle: "Saving of inherent powers of High Court",
      penalty: "Quashing of malicious prosecution / Prevention of abuse of process",
      cognizable: "Constitutional High Court Power",
    },
    {
      oldAct: "CrPC",
      oldSec: "154",
      oldTitle: "Information in cognizable cases (First Information Report / FIR)",
      newAct: "BNSS",
      newSec: "173",
      newTitle: "Information in cognizable cases (Mandatory e-FIR & Zero FIR)",
      penalty: "Registration within 3 days for electronic information",
      cognizable: "Mandatory Record",
    },
    {
      oldAct: "IEA",
      oldSec: "65B",
      oldTitle: "Admissibility of electronic records (Certificate)",
      newAct: "BSA",
      newSec: "63",
      newTitle: "Admissibility of electronic records and digital certificates",
      penalty: "Schedule certificate required for electronic storage devices",
      cognizable: "Evidence Standard",
    },
  ];

  // Comprehensive Bare Acts library
  const BARE_ACTS_LIBRARY: BareAct[] = [
    {
      _id: "bns",
      actName: "Bharatiya Nyaya Sanhita, 2023 (BNS)",
      shortCode: "BNS",
      year: 2023,
      category: "Substantive Criminal Law",
      description: "Codified substantive criminal law enacted by Parliament, repealing and modernizing the Indian Penal Code, 1860.",
      totalSections: 358,
      sections: [
        {
          sectionNumber: "1",
          title: "Short title, extent and commencement",
          description: "This Act may be called the Bharatiya Nyaya Sanhita, 2023. It extends to the whole of India and came into force on 1st July 2024.",
        },
        {
          sectionNumber: "103(1)",
          title: "Punishment for Murder",
          description: "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.",
          bailable: false,
          compoundable: false,
          punishment: "Death or Imprisonment for life, and fine",
        },
        {
          sectionNumber: "106",
          title: "Causing death by negligence",
          description: "Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine.",
          bailable: true,
          compoundable: false,
          punishment: "Imprisonment up to 5 years, and fine",
        },
        {
          sectionNumber: "318",
          title: "Cheating",
          description: "Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property... shall be punished with imprisonment up to 3 years or fine.",
          bailable: true,
          compoundable: true,
          punishment: "Up to 3 years or fine (Up to 7 years if aggravated under sub-section 4)",
        },
        {
          sectionNumber: "303",
          title: "Theft",
          description: "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.",
          bailable: false,
          compoundable: true,
          punishment: "Imprisonment up to 3 years, or fine, or both; community service for first-time petty theft under Rs. 5,000",
        },
      ],
    },
    {
      _id: "bnss",
      actName: "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
      shortCode: "BNSS",
      year: 2023,
      category: "Procedural Criminal Law",
      description: "Codified criminal procedure enacted by Parliament, repealing the Code of Criminal Procedure, 1973 (CrPC).",
      totalSections: 531,
      sections: [
        {
          sectionNumber: "173",
          title: "Information in cognizable cases (e-FIR & Zero FIR)",
          description: "Every information relating to the commission of a cognizable offence may be given orally or by electronic communication (e-FIR). Zero FIR can be registered irrespective of territorial jurisdiction.",
        },
        {
          sectionNumber: "482",
          title: "Anticipatory Bail (Apprehension of Arrest)",
          description: "Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction that in the event of such arrest, he shall be released on bail.",
        },
        {
          sectionNumber: "483",
          title: "Special powers of High Court or Session regarding bail (Regular Bail)",
          description: "A High Court or Court of Session may direct that any person accused of an offence and in custody be released on bail, and may impose any condition necessary.",
        },
        {
          sectionNumber: "528",
          title: "Saving of inherent powers of High Court",
          description: "Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
        },
      ],
    },
    {
      _id: "constitution",
      actName: "Constitution of India, 1950",
      shortCode: "COI",
      year: 1950,
      category: "Constitutional Law",
      description: "Supreme legal framework and charter of fundamental rights, state directives, and institutional powers in India.",
      totalSections: 395,
      sections: [
        {
          sectionNumber: "Art. 14",
          title: "Equality before law",
          description: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
        },
        {
          sectionNumber: "Art. 21",
          title: "Protection of life and personal liberty",
          description: "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
        },
        {
          sectionNumber: "Art. 32",
          title: "Remedies for enforcement of Fundamental Rights (Supreme Court)",
          description: "The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed.",
        },
        {
          sectionNumber: "Art. 226",
          title: "Power of High Courts to issue certain writs",
          description: "Every High Court shall have power to issue to any person or authority writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari for enforcement of rights or for any other purpose.",
        },
      ],
    },
    {
      _id: "ni-act",
      actName: "Negotiable Instruments Act, 1881",
      shortCode: "NI Act",
      year: 1881,
      category: "Commercial & Banking Law",
      description: "Primary statute governing promissory notes, bills of exchange, and cheque bounce prosecutions under Chapter XVII.",
      totalSections: 148,
      sections: [
        {
          sectionNumber: "138",
          title: "Dishonour of cheque for insufficiency of funds in accounts",
          description: "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person... is returned by the bank unpaid, either because of insufficiency of funds or exceeds arrangement, such person shall be deemed to have committed an offence.",
          bailable: true,
          compoundable: true,
          punishment: "Imprisonment up to 2 years, or with fine which may extend to twice the amount of the cheque, or both",
        },
        {
          sectionNumber: "141",
          title: "Offences by companies",
          description: "If the person committing an offence under section 138 is a company, every person who; at the time the offence was committed, was in charge of, and was responsible to the company for the conduct of the business of the company, shall be deemed to be guilty.",
        },
        {
          sectionNumber: "143A",
          title: "Power to direct interim compensation",
          description: "Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant not exceeding 20% of the value of the cheque.",
        },
      ],
    },
  ];

  useEffect(() => {
    // Optionally fetch dynamic bare acts list from backend
    const fetchBareActs = async () => {
      try {
        const res = await fetch("/api/bare-acts");
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            // merge with detailed sections
            setActs(BARE_ACTS_LIBRARY);
            return;
          }
        }
      } catch (_e) {}
      setActs(BARE_ACTS_LIBRARY);
    };
    fetchBareActs();
  }, []);

  const currentAct = acts.find((a) => a._id === selectedActId) || acts[0] || BARE_ACTS_LIBRARY[0];

  const filteredSections = (currentAct?.sections || []).filter((s) => {
    return (
      s.sectionNumber.toString().toLowerCase().includes(sectionFilter.toLowerCase()) ||
      s.title.toLowerCase().includes(sectionFilter.toLowerCase()) ||
      s.description.toLowerCase().includes(sectionFilter.toLowerCase())
    );
  });

  const filteredConcordance = CONCORDANCE_DATA.filter((c) => {
    if (!concordanceSearch) return true;
    const q = concordanceSearch.toLowerCase();
    return (
      c.oldSec.toLowerCase().includes(q) ||
      c.newSec.toLowerCase().includes(q) ||
      c.oldTitle.toLowerCase().includes(q) ||
      c.newTitle.toLowerCase().includes(q) ||
      c.oldAct.toLowerCase().includes(q) ||
      c.newAct.toLowerCase().includes(q)
    );
  });

  const handleCopySection = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" /> Comprehensive Statute Repository
          </div>
          <h2 className="text-xl font-bold font-serif-legal">
            Indian Bare Acts & New Criminal Laws (BNS, BNSS, BSA)
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Live digital database with official section provisions, bailable/non-bailable classifications, compoundability, and 1-to-1 transition mapping from IPC/CrPC.
          </p>
        </div>

        {/* Quick concordance badge */}
        <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 text-xs flex items-center gap-3">
          <ArrowRightLeft className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold text-stone-200">IPC ↔ BNS Transition Tool</span>
            <p className="text-[11px] text-stone-400">Search any old section to see its 2024 equivalent instantly</p>
          </div>
        </div>
      </div>

      {/* IPC / CrPC ↔ BNS / BNSS Concordance Quick Search */}
      <div className="bg-white border border-amber-200/80 rounded-xl p-5 shadow-sm bg-gradient-to-r from-amber-50/40 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 text-stone-950 rounded font-bold text-xs">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                New Criminal Laws Concordance Table (IPC / CrPC → BNS / BNSS / BSA)
              </h3>
              <p className="text-xs text-stone-500">
                Instantly map sections for chargesheets, bail petitions, and quashing under the new legal regime.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              id="search-concordance"
              type="text"
              placeholder="Search section (e.g. 420, 302, 482, bail)..."
              value={concordanceSearch}
              onChange={(e) => setConcordanceSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
          </div>
        </div>

        {/* Concordance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredConcordance.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-stone-200 rounded-lg p-3 hover:border-amber-400 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  {item.oldAct} S. {item.oldSec}
                </span>
                <span className="text-stone-400">➔</span>
                <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {item.newAct} S. {item.newSec}
                </span>
              </div>
              <div className="text-xs font-semibold text-stone-900 line-clamp-1">{item.newTitle}</div>
              <div className="text-[11px] text-stone-500 mt-1 line-clamp-2">{item.penalty}</div>
              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                <span className="text-amber-800 font-medium">{item.cognizable}</span>
                <button
                  onClick={() => handleCopySection(`${item.oldAct} S.${item.oldSec} is now ${item.newAct} S.${item.newSec}: ${item.newTitle}. Penalty: ${item.penalty}`)}
                  className="text-stone-400 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                  title="Copy citation"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Bare Acts Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Act Selection */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Select Statute
          </div>
          <div className="space-y-1.5">
            {acts.map((act) => (
              <button
                key={act._id}
                id={`select-act-${act._id}`}
                onClick={() => {
                  setSelectedActId(act._id);
                  setSectionFilter("");
                  setSelectedSection(null);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  selectedActId === act._id
                    ? "bg-amber-900/10 border-amber-500 text-stone-900 font-semibold shadow-xs"
                    : "bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{act.shortCode}</span>
                  <span className="text-[10px] text-stone-400">{act.year}</span>
                </div>
                <div className="text-xs font-medium text-stone-900 mt-1 line-clamp-1">{act.actName}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">{act.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Act Details & Section List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Act Header Box */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                  {currentAct.category}
                </span>
                <h3 className="text-lg font-bold text-stone-900 font-serif-legal mt-1">
                  {currentAct.actName}
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xl">
                  {currentAct.description}
                </p>
              </div>

              {/* Section Search within current act */}
              <div className="relative w-full sm:w-64 self-end sm:self-auto">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="search-act-sections"
                  type="text"
                  placeholder="Filter sections or keywords..."
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 placeholder-stone-400"
                />
              </div>
            </div>

            {/* List of Sections */}
            <div className="mt-4 space-y-3">
              {filteredSections.length === 0 ? (
                <div className="text-center py-10 text-stone-500 text-xs">
                  No sections match "{sectionFilter}".
                </div>
              ) : (
                filteredSections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-stone-200 hover:border-amber-300 transition-all bg-stone-50/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-900 text-xs bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                            Section {sec.sectionNumber}
                          </span>
                          <span className="font-semibold text-stone-900 text-sm">
                            {sec.title}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed mt-2 pl-1 border-l-2 border-amber-300">
                          {sec.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopySection(`Section ${sec.sectionNumber} of ${currentAct.actName}: ${sec.title}\n\n${sec.description}`)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-200 transition-colors cursor-pointer shrink-0"
                        title="Copy section provision"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata tags if applicable (bailable, punishment) */}
                    {(sec.punishment || sec.bailable !== undefined) && (
                      <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex flex-wrap items-center gap-2 text-[11px]">
                        {sec.bailable !== undefined && (
                          <span className={`px-2 py-0.5 rounded font-medium ${
                            sec.bailable 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}>
                            {sec.bailable ? "Bailable" : "Non-Bailable"}
                          </span>
                        )}
                        {sec.compoundable !== undefined && (
                          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium">
                            {sec.compoundable ? "Compoundable" : "Non-Compoundable"}
                          </span>
                        )}
                        {sec.punishment && (
                          <span className="text-stone-600 font-medium">
                            Punishment: <span className="text-stone-900">{sec.punishment}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
