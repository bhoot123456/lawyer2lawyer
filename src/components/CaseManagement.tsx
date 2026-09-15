import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  FileText,
  ChevronRight,
  Filter
} from "lucide-react";
import { CaseRecord } from "../types";

export const CaseManagement: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for creating a new case
  const [formData, setFormData] = useState({
    caseTitle: "",
    caseNumber: "",
    client: "",
    court: "",
    judge: "",
    oppositeParty: "",
    nextHearingDate: "",
    currentStage: "Arguments on Charge",
    priority: "High" as "High" | "Medium" | "Low",
    status: "Active" as "Active" | "Pending" | "Disposed",
    importantNotes: "",
  });

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        const items = data.data || data.items || [];
        if (items.length > 0) {
          setCases(items);
          setLoading(false);
          return;
        }
      }
    } catch (_e) {}

    // Initial default seed cases
    const initialCases: CaseRecord[] = [
      {
        _id: "case-1",
        caseTitle: "M/s Apex Logistics vs. Global Exporters Ltd.",
        caseNumber: "CS (COMM) 184/2024",
        client: "Apex Logistics Pvt Ltd",
        court: "Delhi High Court (Commercial Division)",
        judge: "Hon'ble Mr. Justice C. Hari Shankar",
        oppositeParty: "Global Exporters Ltd",
        practiceArea: "Commercial Suit",
        nextHearingDate: "2025-04-12",
        currentStage: "Arguments on Interim Injunction (O. 39 R. 1&2)",
        status: "Active",
        priority: "High",
        importantNotes: "Replication filed. Prepare comparative balance sheet of disputed consignments.",
      },
      {
        _id: "case-2",
        caseTitle: "State vs. Rohan Verma",
        caseNumber: "BAIL APPLN 491/2025",
        client: "Rohan Verma",
        court: "Saket District Courts, New Delhi",
        judge: "Sh. Sanjeev Kumar, Additional Sessions Judge",
        oppositeParty: "State (NCT of Delhi)",
        practiceArea: "Criminal - Regular Bail",
        nextHearingDate: "2025-03-28",
        currentStage: "Hearing on Regular Bail under S. 483 BNSS",
        status: "Active",
        priority: "High",
        importantNotes: "Charge-sheet filed without arrest. Rely on Satender Kumar Antil guidelines.",
      },
      {
        _id: "case-3",
        caseTitle: "Vikramaditya Rao vs. Sunita Rao",
        caseNumber: "HMA 812/2023",
        client: "Vikramaditya Rao",
        court: "Family Court, Rohini Courts, Delhi",
        judge: "Ms. Neha Gupta, Principal Judge",
        oppositeParty: "Sunita Rao",
        practiceArea: "Matrimonial",
        nextHearingDate: "2025-05-04",
        currentStage: "Cross-Examination of Petitioner (PW-1)",
        status: "Pending",
        priority: "Medium",
        importantNotes: "Affidavit of Income and Assets in accordance with Rajnesh v. Neha to be tendered.",
      },
      {
        _id: "case-4",
        caseTitle: "FinServe Capital vs. Mehta Enterprises",
        caseNumber: "CC No. 1044/2024",
        client: "FinServe Capital Ltd",
        court: "Patiala House Courts, New Delhi",
        judge: "Metropolitan Magistrate (NI Act)",
        oppositeParty: "Karan Mehta",
        practiceArea: "Section 138 NI Act",
        nextHearingDate: "2025-04-20",
        currentStage: "Complainant Evidence (CW-1 Examination)",
        status: "Active",
        priority: "Medium",
        importantNotes: "Original return memo and statutory postal receipts marked as Ex.CW1/A to CW1/D.",
      },
    ];
    setCases(initialCases);
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseTitle || !formData.caseNumber) return;

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const result = await res.json();
        const created = result.data || { ...formData, _id: "case-" + Date.now() };
        setCases([created, ...cases]);
      } else {
        // local fallback
        const newCase: CaseRecord = {
          _id: "case-" + Date.now(),
          ...formData,
        };
        setCases([newCase, ...cases]);
      }
    } catch (_err) {
      const newCase: CaseRecord = {
        _id: "case-" + Date.now(),
        ...formData,
      };
      setCases([newCase, ...cases]);
    }

    setShowAddModal(false);
    setFormData({
      caseTitle: "",
      caseNumber: "",
      client: "",
      court: "",
      judge: "",
      oppositeParty: "",
      nextHearingDate: "",
      currentStage: "Arguments on Charge",
      priority: "High",
      status: "Active",
      importantNotes: "",
    });
  };

  const handleDeleteCase = async (id: string) => {
    try {
      await fetch(`/api/cases/${id}`, { method: "DELETE" });
    } catch (_e) {}
    setCases(cases.filter((c) => c._id !== id));
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court.toLowerCase().includes(searchQuery.toLowerCase());

    if (priorityFilter === "all") return matchesSearch;
    return matchesSearch && c.priority.toLowerCase() === priorityFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> Advocate Case Diary & Hearing Ledger
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-serif-legal">
            Active Matters & Cause Tracker
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Track daily court stages, upcoming next hearing dates, judicial notes, and opposing counsel details.
          </p>
        </div>

        <button
          id="btn-add-case"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Matter</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            id="search-cases"
            type="text"
            placeholder="Search by case title, matter number, client, or court..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs text-stone-500 font-medium">Priority:</span>
          <select
            id="filter-case-priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white border border-dashed border-stone-300 rounded-xl">
            <Briefcase className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-stone-800">No matching cases found</div>
            <p className="text-xs text-stone-500 mt-1">Add a new matter or adjust your search filter.</p>
          </div>
        ) : (
          filteredCases.map((c) => (
            <div
              key={c._id}
              className="bg-white border border-stone-200 rounded-xl p-5 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Number & Badges */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {c.caseNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.priority === "High"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-stone-100 text-stone-700 border border-stone-200"
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Case Title */}
                <h3 className="text-sm font-bold text-stone-900 leading-snug">
                  {c.caseTitle}
                </h3>

                {/* Court & Client details */}
                <div className="mt-3 space-y-1 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-medium text-stone-800">{c.court}</span>
                  </div>
                  {c.judge && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pl-5">
                      Bench: {c.judge}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Client: <strong className="text-stone-800">{c.client}</strong></span>
                    {c.oppositeParty && (
                      <span className="text-stone-400 text-[11px]">vs. {c.oppositeParty}</span>
                    )}
                  </div>
                </div>

                {/* Stage banner */}
                <div className="mt-3.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">
                    Current Judicial Stage
                  </div>
                  <div className="font-semibold text-stone-800 mt-0.5">
                    {c.currentStage || "Hearing Listed"}
                  </div>
                </div>

                {/* Notes */}
                {c.importantNotes && (
                  <p className="mt-2.5 text-[11px] text-stone-600 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                    "{c.importantNotes}"
                  </p>
                )}
              </div>

              {/* Card Footer with Next Date */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {c.nextHearingDate
                      ? `Next: ${new Date(c.nextHearingDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : "Date Pending"}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteCase(c._id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                  title="Remove matter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Adding New Case */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 font-serif-legal">
                Add New Case Matter to Diary
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">
                    Case Title / Caption *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar vs. State (NCT of Delhi)"
                    value={formData.caseTitle}
                    onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Case Number / Filing No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CRL.M.C. 420/2024"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Court / Forum
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High Court of Delhi"
                    value={formData.court}
                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Next Hearing Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextHearingDate}
                    onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Stage of Matter
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Final Arguments / Bail Hearing"
                    value={formData.currentStage}
                    onChange={(e) => setFormData({ ...formData, currentStage: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">
                    Advocate Brief / Case Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key arguments, documentary exhibits to tender, or citation references..."
                    value={formData.importantNotes}
                    onChange={(e) => setFormData({ ...formData, importantNotes: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Save Case Matter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
