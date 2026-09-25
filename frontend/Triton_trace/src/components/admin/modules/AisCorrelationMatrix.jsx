import { useIncident } from "../../../context/IncidentContext";
import { Crosshair, Navigation, AlertTriangle } from "lucide-react";

const mockSuspects = [
  {
    id: "v1",
    name: "PACIFIC HORIZON",
    mmsi: "419999999",
    type: "Crude Tanker",
    flag: "PA",
    cpa: "0.8 NM",
    score: 94.2,
    intersectCoord: [28.18, 31.78],
  },
  {
    id: "v2",
    name: "BALTIC SWAN",
    mmsi: "219028000",
    type: "Chem Tanker",
    flag: "DK",
    cpa: "1.4 NM",
    score: 74.2,
    intersectCoord: [28.25, 31.72],
  },
  {
    id: "v3",
    name: "PACIFIC GLORY",
    mmsi: "477218000",
    type: "Cargo",
    flag: "HK",
    cpa: "3.8 NM",
    score: 22.1,
    intersectCoord: [28.05, 31.85],
  },
];

export const AisCorrelationMatrix = () => {
  const { setCorrelationMarker, correlationMarker, setPanToCoordinate } =
    useIncident();

  const handleIntersect = (vessel) => {
    if (correlationMarker && correlationMarker[0] === vessel.intersectCoord[0]) {
      setCorrelationMarker(null);
      return;
    }
    setCorrelationMarker(vessel.intersectCoord);
    setPanToCoordinate({
      lat: vessel.intersectCoord[1],
      lon: vessel.intersectCoord[0],
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-4 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
          AIS Correlation Matrix
        </h2>
        {correlationMarker && (
          <button
            onClick={() => setCorrelationMarker(null)}
            className="text-[10px] text-slate-500 hover:text-slate-800 font-mono tracking-wider underline font-bold"
          >
            CLEAR MARKER
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {mockSuspects.map((vessel, index) => (
          <div
            key={vessel.id}
            className={`flex flex-col bg-white border rounded-md p-4 transition-colors shadow-sm ${
              correlationMarker &&
              correlationMarker[0] === vessel.intersectCoord[0]
                ? "border-rose-400 ring-1 ring-rose-400/20 bg-rose-50/30"
                : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 font-bold text-xs">
                    {vessel.name}
                  </span>
                  {index === 0 && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                  MMSI: {vessel.mmsi} | {vessel.flag}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className={`text-sm font-mono font-bold ${vessel.score > 90 ? "text-rose-600" : vessel.score > 50 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {vessel.score}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                  THREAT SCORE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                  VESSEL TYPE
                </span>
                <span className="text-[10px] text-slate-900 font-mono font-semibold truncate">
                  {vessel.type}
                </span>
              </div>
              <div className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                  CPA TO ORIGIN
                </span>
                <span className="text-[10px] text-slate-900 font-mono font-semibold">
                  {vessel.cpa}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleIntersect(vessel)}
              className={`w-full py-2 flex justify-center items-center gap-2 rounded-md text-[10px] font-bold tracking-wider transition-colors shadow-sm border ${
                correlationMarker &&
                correlationMarker[0] === vessel.intersectCoord[0]
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {correlationMarker &&
              correlationMarker[0] === vessel.intersectCoord[0] ? (
                <>
                  <Crosshair className="w-3.5 h-3.5" /> TARGET LOCKED
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" /> INTERSECT ROUTE
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
