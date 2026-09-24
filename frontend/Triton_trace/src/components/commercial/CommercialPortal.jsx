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

const INITIAL_LAYERS = [
  { id: "sar_slick", label: "SAR Slick Polygons", active: true, color: "bg-cyan-500" },
  { id: "hindcast", label: "Hindcast Particles", active: true, color: "bg-rose-500" },
  { id: "ais_tracks", label: "AIS Vessel Tracks", active: true, color: "bg-amber-500" },
  { id: "geofences", label: "Regional Alert Geofences", active: true, color: "bg-emerald-500" },
];

export function CommercialPortal() {
  const { user, logout } = useAuth();
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

  const commercialFleet = [
    { 
      id: "v1", name: "MV HELIOS LEADER", speed: "14.2 kn", range: "12 NM", status: "ELEVATED WATCH", heading: 45, lat: 32.36, lon: 32.93,
      trajectory: [[32.36, 32.93], [32.40, 32.95], [32.44, 32.98]]
    },
    { 
      id: "v2", name: "MT AEGEAN GLORY", speed: "11.5 kn", range: "45 NM", status: "NORMAL", heading: 110, lat: 31.9, lon: 31.2,
      trajectory: [[31.9, 31.2], [31.85, 31.3], [31.80, 31.4]]
    },
    { 
      id: "v3", name: "MV NORDIC TRADER", speed: "13.8 kn", range: "8 NM", status: "CRITICAL", heading: 15, lat: 32.48, lon: 33.0,
      trajectory: [[32.48, 33.0], [32.6, 33.1], [32.8, 33.2], [33.0, 33.3]]
    },
    {
      id: "v4", name: "MSC ISABELLA", speed: "18.5 kn", range: "85 NM", status: "NORMAL", heading: 270, lat: 31.5, lon: 34.0,
      trajectory: [[31.5, 34.0], [31.5, 33.8], [31.5, 33.5]]
    },
    {
      id: "v5", name: "GASLOG WARSAW", speed: "16.2 kn", range: "32 NM", status: "ELEVATED WATCH", heading: 320, lat: 32.0, lon: 33.5,
      trajectory: [[32.0, 33.5], [32.2, 33.3], [32.4, 33.1]]
    },
    {
      id: "v7", name: "SEAWAYS REYMAR", speed: "12.0 kn", range: "14 NM", status: "CRITICAL", heading: 350, lat: 32.3, lon: 33.1,
      trajectory: [[32.3, 33.1], [32.5, 33.05], [32.7, 33.0], [32.9, 32.95]]
    },
    {
      id: "v8", name: "AL ZUBARAH", speed: "13.4 kn", range: "60 NM", status: "NORMAL", heading: 180, lat: 32.8, lon: 34.2,
      trajectory: [[32.8, 34.2], [32.6, 34.2], [32.4, 34.2]]
    }
  ];

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
