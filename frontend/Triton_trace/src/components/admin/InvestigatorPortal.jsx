import { useState, useEffect } from "react";
import { InvestigatorLeft } from "./InvestigatorLeft";
import { MapEngine } from "../map/MapEngine";
import { TopHUD } from "../layout/TopHUD";
import { PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { mockIncident } from "../../utils/mockData";
import { HindcastController } from "./modules/HindcastController";
import { AisCorrelationMatrix } from "./modules/AisCorrelationMatrix";
import { useIncident } from "../../context/IncidentContext";

export const InvestigatorPortal = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // Default to false
  const [engine, setEngine] = useState("leaflet");
  const { activeIncident, activeAnalysisMode } = useIncident();

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    return () => clearTimeout(timeout);
  }, [isLeftSidebarOpen, isRightSidebarOpen]);

  // Open right sidebar automatically when attribution or forward track is clicked
  useEffect(() => {
    if (activeAnalysisMode === "attribution" || activeAnalysisMode === "forward_track") {
      setIsRightSidebarOpen(true);
    }
  }, [activeAnalysisMode]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <TopHUD
        activeIncidentId={activeIncident || mockIncident.incident_id}
        demoMode={false}
        engine={engine}
      />

      <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* 1. Left Sidebar (Triage Queue) */}
        <div
          className={`transition-all duration-300 ease-in-out flex shrink-0 relative z-20 ${
            isLeftSidebarOpen ? "w-80 lg:w-96 border-r border-slate-200" : "w-0"
          }`}
        >
          <div className="w-80 lg:w-96 h-full overflow-hidden bg-white shadow-xl flex flex-col relative">
            <InvestigatorLeft onCollapse={() => setIsLeftSidebarOpen(false)} />
          </div>
        </div>

        {!isLeftSidebarOpen && (
          <button
            onClick={() => setIsLeftSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2.5 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 text-slate-600 rounded-md shadow-md transition-all"
            title="Expand Triage Panel"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {/* 2. Map Workspace */}
        <div className="flex-1 relative h-full w-full bg-slate-100 isolate">
          <MapEngine
            interactive={true}
            onEngineResolved={(eng) => setEngine(eng)}
          />
        </div>

        {/* 3. Right Sidebar (Orchestration Panel) */}
        <div
          className={`transition-all duration-300 ease-in-out flex shrink-0 relative z-20 ${
            isRightSidebarOpen
              ? "w-80 lg:w-96 border-l border-slate-200"
              : "w-0"
          }`}
        >
          <div className="w-80 lg:w-96 h-full overflow-hidden bg-slate-50 shadow-xl flex flex-col relative">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                Orchestration Panel
              </span>
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                title="Collapse Panel"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
              <HindcastController />
              <div className="w-full h-px bg-slate-200"></div>
              <AisCorrelationMatrix />
            </div>
          </div>
        </div>

        {!isRightSidebarOpen && (
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            className="absolute top-4 right-4 z-[1001] p-2.5 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 text-slate-600 rounded-md shadow-md transition-all"
            title="Expand Orchestration Panel"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
