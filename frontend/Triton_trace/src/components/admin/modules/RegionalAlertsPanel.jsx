import { useIncident } from "../../../context/IncidentContext";
import geofencesData from "../../../utils/regional_alert_geofences.json";
import { MapPin, ShieldAlert, Waves } from "lucide-react";

export const RegionalAlertsPanel = () => {
  const { setPanToCoordinate } = useIncident();

  const handleFlyToZone = (lat, lon) => {
    setPanToCoordinate({ lat, lon });
  };

  return (
    <div className="flex flex-col gap-4 font-sans pb-4">
      <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
        Regional Watchlist
      </h2>

      <div className="flex flex-col gap-3">
        {geofencesData.features.map((feature, index) => {
          const zone = feature.properties;

          // Automatically extract [lon, lat] from the first point of the polygon
          const targetLon = feature.geometry.coordinates[0][0][0];
          const targetLat = feature.geometry.coordinates[0][0][1];

          const isCritical = zone.zone_level === "Critical Strike Zone";

          return (
            <button
              // Use index as fallback key since id wasn't in your JSON properties
              key={zone.id || `geo-${index}`}
              onClick={() => handleFlyToZone(targetLat, targetLon)}
              className="flex flex-col p-3 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 transition-all text-left group"
            >
              <div className="flex justify-between items-start w-full mb-3">
                <div className="flex items-center gap-2 pr-2">
                  {isCritical ? (
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Waves className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-bold text-xs text-slate-900 leading-tight">
                    {zone.name}
                  </span>
                </div>

                <span
                  className={`shrink-0 px-2 py-0.5 rounded border text-[9px] font-bold tracking-wider ${
                    isCritical
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {zone.zone_level.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center w-full mt-1 border-t border-slate-100 pt-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    Zone Type
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600">
                    {zone.type} ({zone.radius_km}km)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  FLY TO SECTOR
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
