import { useState } from "react";
import { TopHUD } from "../layout/TopHUD";
import { MapCanvas } from "../map/MapCanvas";
import { mockIncident } from "../../utils/mockData";
import { FleetRadarPanel } from "./FleetRadarPanel";
import { EnterpriseDashboard } from "./EnterpriseDashboard";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { LayerControl } from "../map/LayerControl";
import { MapLegend } from "../map/MapLegend";

import { useIncident } from "../../context/IncidentContext";

const INITIAL_LAYERS = [
  { id: "sar_slick", label: "SAR Slick Polygons", active: true, color: "bg-cyan-500" },
  { id: "hindcast", label: "Hindcast Particles", active: true, color: "bg-rose-500" },
  { id: "ais_tracks", label: "AIS Vessel Tracks", active: true, color: "bg-amber-500" },
  { id: "geofences", label: "Regional Alert Geofences", active: true, color: "bg-emerald-500" },
];

export function CommercialPortal() {
  const { user, logout } = useAuth();
  const { commercialFleet } = useIncident();
  const navigate = useNavigate();
  const [engine, setEngine] = useState("leaflet");
  const [selectedVesselId, setSelectedVesselId] = useState(null);
  const [showDiversionRoute, setShowDiversionRoute] = useState(false);
  const [layers, setLayers] = useState(INITIAL_LAYERS);

  const toggleLayer = (id) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, active: !layer.active } : layer
      )
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const selectedVessel = commercialFleet.find(v => v.id === selectedVesselId);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      <TopHUD
        activeIncidentId={mockIncident.incident_id}
        demoMode={false}
        engine={engine}
      />
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MapCanvas
          interactive={true}
          onEngineResolved={(eng) => setEngine(eng)}
          commercialFleet={commercialFleet}
          selectedVesselId={selectedVesselId}
          showDiversionRoute={showDiversionRoute}
          layers={layers}
        />
        
        <FleetRadarPanel
          commercialFleet={commercialFleet}
          selectedVesselId={selectedVesselId}
          onSelectVessel={setSelectedVesselId}
        />
        
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
          <LayerControl layers={layers} toggleLayer={toggleLayer} />
          <MapLegend />
        </div>
        
        {selectedVesselId && (
          <EnterpriseDashboard
            showDiversionRoute={showDiversionRoute}
            onToggleDiversion={() => setShowDiversionRoute(!showDiversionRoute)}
            selectedVesselId={selectedVesselId}
            selectedVessel={selectedVessel}
          />
        )}
        
        {/* Quick logout positioned bottom right for demo completeness */}
        <div className="absolute bottom-6 right-6 z-30">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-1 rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition shadow-md"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-semibold">Switch Role</span>
          </button>
        </div>
      </div>
    </div>
  );
}
