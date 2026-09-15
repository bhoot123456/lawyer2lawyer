import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  MapPin, 
  Globe, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Tribunal } from "../types";

export const TribunalsDirectory: React.FC = () => {
  const [tribunals, setTribunals] = useState<Tribunal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTribunal, setSelectedTribunal] = useState<Tribunal | null>(null);

  useEffect(() => {
    const fetchTribunals = async () => {
      try {
        const res = await fetch("/api/tribunals");
        if (res.ok) {
          const data = await res.json();
          const items = data.data || data.items || [];
          if (items.length > 0) {
            setTribunals(items);
            setSelectedTribunal(items[0]);
            setLoading(false);
            return;
          }
        }
      } catch (_e) {}

      // Default curated tribunals
      const defaultTribunals: Tribunal[] = [
        {
          _id: "nclt",
          name: "National Company Law Tribunal (NCLT)",
          shortName: "NCLT",
          headquarters: "CGO Complex, Lodhi Road, New Delhi",
          benchesCount: 16,
          jurisdiction: "Insolvency and Bankruptcy Code (IBC 2016) and Companies Act, 2013",
          actGoverned: "Section 408 of Companies Act, 2013",
          website: "https://nclt.gov.in",
          description: "Quasi-judicial body in India that adjudicates issues relating to Indian companies, corporate insolvency resolution process (CIRP), liquidation, and oppression & mismanagement petitions.",
          benches: [
            { benchName: "Principal Bench", city: "New Delhi", address: "Block-3, Ground Floor, CGO Complex, Lodhi Road" },
            { benchName: "Court-II / Court-III", city: "New Delhi", address: "4th Floor, Pt. Deendayal Antyodaya Bhawan, CGO Complex" },
            { benchName: "Mumbai Bench", city: "Mumbai", address: "4th Floor, MTNL Exchange Building, Cuffe Parade" },
            { benchName: "Bengaluru Bench", city: "Bengaluru", address: "Corporate Bhavan, Raheja Towers, M.G. Road" },
          ],
        },
        {
          _id: "nclat",
          name: "National Company Law Appellate Tribunal (NCLAT)",
          shortName: "NCLAT",
          headquarters: "B-3 Wing, 3rd Floor, Pt. Deendayal Antyodaya Bhawan, CGO Complex, New Delhi",
          benchesCount: 2,
          jurisdiction: "Appeals against orders of NCLT, Insolvency and Bankruptcy Board of India (IBBI), and Competition Commission of India (CCI)",
          actGoverned: "Section 410 of Companies Act, 2013",
          website: "https://nclat.nic.in",
          description: "Appellate tribunal hearing appeals arising out of orders of NCLT and Competition Commission of India.",
          benches: [
            { benchName: "Principal Bench", city: "New Delhi", address: "Pt. Deendayal Antyodaya Bhawan, CGO Complex" },
            { benchName: "Chennai Bench", city: "Chennai", address: "Corporation Alliance Building, EVR Periyar Salai" },
          ],
        },
        {
          _id: "cat",
          name: "Central Administrative Tribunal (CAT)",
          shortName: "CAT",
          headquarters: "Copernicus Marg, Near India Gate, New Delhi",
          benchesCount: 19,
          jurisdiction: "Adjudication of disputes relating to recruitment and conditions of service of persons appointed to public services and posts in connection with the affairs of the Union.",
          actGoverned: "Administrative Tribunals Act, 1985 (Article 323-A of Constitution)",
          website: "https://cgat.gov.in",
          description: "Specialized tribunal resolving service disputes of Union Government employees, All India Services (IAS, IPS, IFS), and notified autonomous bodies.",
          benches: [
            { benchName: "Principal Bench", city: "New Delhi", address: "61/35, Copernicus Marg, Mandi House" },
            { benchName: "Mumbai Bench", city: "Mumbai", address: "Gulshan Chambers, 4th Floor, 136 Fort" },
            { benchName: "Chandigarh Bench", city: "Chandigarh", address: "Sector 17-C, Chandigarh" },
          ],
        },
        {
          _id: "drt",
          name: "Debts Recovery Tribunal (DRT & DRAT)",
          shortName: "DRT",
          headquarters: "Jeevan Deep Building, Parliament Street, New Delhi",
          benchesCount: 39,
          jurisdiction: "Recovery of debts due to banks and financial institutions, SARFAESI appeals under Section 17",
          actGoverned: "Recovery of Debts and Bankruptcy Act, 1993 (RDB Act) & SARFAESI Act, 2002",
          website: "https://drt.etribunals.gov.in",
          description: "Forums established to facilitate the expeditious recovery of non-performing assets and loans due to scheduled banks and asset reconstruction companies.",
          benches: [
            { benchName: "DRT-I / DRT-II / DRT-III Delhi", city: "New Delhi", address: "Sanskriti Bhawan, Jhandewalan, New Delhi" },
            { benchName: "DRAT Delhi (Appellate)", city: "New Delhi", address: "Jeevan Deep Building, Parliament Street" },
          ],
        },
        {
          _id: "ngt",
          name: "National Green Tribunal (NGT)",
          shortName: "NGT",
          headquarters: "Faridkot House, Copernicus Marg, New Delhi",
          benchesCount: 5,
          jurisdiction: "Effective and expeditious disposal of cases relating to environmental protection and conservation of forests and other natural resources.",
          actGoverned: "National Green Tribunal Act, 2010",
          website: "https://greentribunal.gov.in",
          description: "Fast-track judicial body for environmental disputes, pollution control, forest clearance appeals, and ecological damage compensation.",
          benches: [
            { benchName: "Principal Bench", city: "New Delhi", address: "Faridkot House, Copernicus Marg" },
            { benchName: "Western Zone Bench", city: "Pune", address: "New Administrative Building, D-Wing" },
            { benchName: "Southern Zone Bench", city: "Chennai", address: "Kalas Mahal, Heritage Building, Chepauk" },
          ],
        },
      ];
      setTribunals(defaultTribunals);
      setSelectedTribunal(defaultTribunals[0]);
      setLoading(false);
    };

    fetchTribunals();
  }, []);

  const filteredTribunals = tribunals.filter((t) => {
    return (
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.jurisdiction && t.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> Specialized Judicial & Quasi-Judicial Forums
          </div>
          <h2 className="text-xl font-bold font-serif-legal">
            Indian Tribunals Directory (NCLT, CAT, DRT, NGT, ITAT)
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            National directory of specialized tribunals with bench registries, jurisdictional statutes, appellate hierarchies, and filing links.
          </p>
        </div>

        <div className="relative w-full sm:w-64 self-start sm:self-auto">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            id="search-tribunals"
            type="text"
            placeholder="Search tribunals or statutes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-100 placeholder-stone-400"
          />
        </div>
      </div>

      {/* Main Grid: Left List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tribunal Cards List */}
        <div className="space-y-3">
          {filteredTribunals.map((tribunal) => (
            <div
              key={tribunal._id}
              onClick={() => setSelectedTribunal(tribunal)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTribunal?._id === tribunal._id
                  ? "bg-amber-50/70 border-amber-500 shadow-xs"
                  : "bg-white border-stone-200 hover:border-stone-300 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm font-serif-legal text-stone-900">
                  {tribunal.shortName}
                </span>
                <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                  {tribunal.benchesCount} Benches
                </span>
              </div>

              <h4 className="text-xs font-semibold text-stone-800 mt-1 line-clamp-1">
                {tribunal.name}
              </h4>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                {tribunal.jurisdiction}
              </p>
            </div>
          ))}
        </div>

        {/* Right: Selected Tribunal Expanded Overview */}
        {selectedTribunal && (
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-200">
                  {selectedTribunal.shortName}
                </span>
                <h3 className="text-lg font-bold text-stone-900 font-serif-legal mt-2">
                  {selectedTribunal.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {selectedTribunal.description}
                </p>
              </div>

              {selectedTribunal.website && (
                <a
                  href={selectedTribunal.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors self-start shrink-0"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Statutory Framework */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Enabling Statutory Provision
                </span>
                <span className="font-semibold text-stone-800">
                  {selectedTribunal.actGoverned}
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Headquarters & Principal Registry
                </span>
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  {selectedTribunal.headquarters}
                </span>
              </div>
            </div>

            {/* Jurisdiction Coverage */}
            <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 text-xs">
              <div className="font-semibold text-amber-950 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Jurisdictional Competence
              </div>
              <p className="text-stone-700 leading-relaxed">
                {selectedTribunal.jurisdiction}
              </p>
            </div>

            {/* Benches Grid */}
            {selectedTribunal.benches && selectedTribunal.benches.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Key Benches & Sitting Registries
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTribunal.benches.map((b, idx) => (
                    <div key={idx} className="p-3 border border-stone-200 rounded-lg text-xs bg-stone-50/40">
                      <div className="font-bold text-stone-900">{b.benchName}</div>
                      <div className="text-[11px] text-amber-800 font-medium">{b.city}</div>
                      <div className="text-[11px] text-stone-500 mt-1">{b.address}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
