import { useState, useEffect } from "react";
import { NormalUserLeft } from "./NormalUserLeft";
import { MapCanvas } from "../../components/map/MapCanvas"; // Assumes MapCanvas is your main unified map component
import { TopHUD } from "../../components/layout/TopHUD";
import { PanelLeftOpen } from "lucide-react";
import { mockIncident } from "../../utils/mockData";

export const NormalUserPortal = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [engine, setEngine] = useState("leaflet");

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    return () => clearTimeout(timeout);
  }, [isSidebarOpen]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <TopHUD
        activeIncidentId={mockIncident.incident_id}
        demoMode={false}
        engine={engine}
      />

      <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* Collapsible Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out flex flex-shrink-0 relative z-20 ${
            isSidebarOpen ? "w-80 lg:w-96" : "w-0"
          }`}
        >
          <div className="w-80 lg:w-96 h-full overflow-hidden bg-white shadow-xl flex flex-col relative">
            <NormalUserLeft onCollapse={() => setIsSidebarOpen(false)} />
          </div>
        </div>

        {/* Expand Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2.5 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 text-slate-600 rounded-md shadow-md transition-all"
            title="Expand User Panel"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {/* Map Canvas */}
        <div className="flex-1 relative h-full w-full bg-slate-100 isolate">
          <MapCanvas
            interactive={true}
            onEngineResolved={(eng) => setEngine(eng)}
          />
        </div>
      </div>
    </div>
  );
};
