import { useState, useEffect } from "react";
import { InvestigatorLeft } from "./InvestigatorLeft";
import { MapEngine } from "../map/MapEngine";
import { TopHUD } from "../layout/TopHUD";
import { PanelLeftOpen } from "lucide-react";
import { mockIncident } from "../../utils/mockData";

export const InvestigatorPortal = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [engine, setEngine] = useState("leaflet");

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    return () => clearTimeout(timeout);
  }, [isLeftSidebarOpen]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <TopHUD
        activeIncidentId={mockIncident.incident_id}
        demoMode={false}
        engine={engine}
      />

      <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* Left Sidebar Only */}
        <div
          className={`transition-all duration-300 ease-in-out flex shrink-0 relative z-20 ${
            isLeftSidebarOpen
              ? "w-80 lg:w-[420px] border-r border-slate-200"
              : "w-0"
          }`}
        >
          <div className="w-80 lg:w-[420px] h-full overflow-hidden bg-white shadow-xl flex flex-col relative">
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

        {/* Map Workspace */}
        <div className="flex-1 relative h-full w-full bg-slate-100 isolate">
          <MapEngine />
        </div>
      </div>
    </div>
  );
};
