import React from "react";
import { 
  Scale, 
  BookOpen, 
  Bot, 
  Briefcase, 
  ShieldAlert, 
  Building2, 
  FileText,
  Activity
} from "lucide-react";

export type ActiveTab = 
  | "intelligence"
  | "bare-acts"
  | "ai-assistant"
  | "cases"
  | "police"
  | "tribunals"
  | "tools";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "intelligence" as ActiveTab, label: "Court Intelligence", icon: Activity },
    { id: "bare-acts" as ActiveTab, label: "Bare Acts (BNS/BNSS)", icon: BookOpen },
    { id: "ai-assistant" as ActiveTab, label: "AI Legal Counsel", icon: Bot, highlight: true },
    { id: "cases" as ActiveTab, label: "Case Diary", icon: Briefcase },
    { id: "police" as ActiveTab, label: "Delhi Police Directory", icon: ShieldAlert },
    { id: "tribunals" as ActiveTab, label: "Tribunals", icon: Building2 },
    { id: "tools" as ActiveTab, label: "Drafts & Calculators", icon: FileText },
  ];

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Banner with Brand and Live Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600 rounded-lg shadow-inner text-stone-950 font-bold">
              <Scale className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-legal text-xl font-bold tracking-wide text-amber-400">
                  LAWYER2LAWYER
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  India Legal Network
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Supreme Court • High Courts • BNS / BNSS / BSA Intelligence Platform
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-md border border-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-stone-300 font-medium">Judicial Registry Live</span>
            </div>
            <div className="text-stone-400 font-mono">
              {currentDate}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <nav className="bg-stone-950 border-t border-stone-800 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-stone-950 font-semibold shadow-sm"
                    : tab.highlight
                    ? "text-amber-300 hover:text-white hover:bg-stone-850 bg-amber-950/40 border border-amber-500/20"
                    : "text-stone-300 hover:text-white hover:bg-stone-850"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-stone-950" : tab.highlight ? "text-amber-400" : "text-stone-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
