import React, { useState } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { LiveCourtIntelligence } from "./components/LiveCourtIntelligence";
import { BareActsExplorer } from "./components/BareActsExplorer";
import { AILegalAssistant } from "./components/AILegalAssistant";
import { CaseManagement } from "./components/CaseManagement";
import { PoliceStationsDirectory } from "./components/PoliceStationsDirectory";
import { TribunalsDirectory } from "./components/TribunalsDirectory";
import { LegalCalculators } from "./components/LegalCalculators";
import { Scale, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("intelligence");

  return (
    <div className="min-h-screen flex flex-col bg-stone-100/70 text-stone-900 font-sans">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "intelligence" && <LiveCourtIntelligence />}
        {activeTab === "bare-acts" && <BareActsExplorer />}
        {activeTab === "ai-assistant" && <AILegalAssistant />}
        {activeTab === "cases" && <CaseManagement />}
        {activeTab === "police" && <PoliceStationsDirectory />}
        {activeTab === "tribunals" && <TribunalsDirectory />}
        {activeTab === "tools" && <LegalCalculators />}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <span className="font-serif-legal font-bold text-stone-200">
              LAWYER2LAWYER
            </span>
            <span>— India Judicial Network & Practice Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-stone-400">
            <a 
              href="https://main.sci.gov.in" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-stone-200 flex items-center gap-1"
            >
              Supreme Court <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://delhihighcourt.nic.in" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-stone-200 flex items-center gap-1"
            >
              Delhi High Court <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://ecourts.gov.in" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-stone-200 flex items-center gap-1"
            >
              eCourts Services <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
