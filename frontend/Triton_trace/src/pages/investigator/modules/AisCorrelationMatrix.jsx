import { useIncident } from '../../../context/IncidentContext';
import { Crosshair, Navigation, AlertTriangle } from 'lucide-react';

const mockSuspects = [
  {
    id: 'v1',
    name: 'NORDIC EXPLORER',
    mmsi: '235088000',
    type: 'Crude Tanker',
    flag: 'UK',
    cpa: '0.2 NM',
    score: 96.4,
    intersectCoord: [28.18, 31.78]
  },
  {
    id: 'v2',
    name: 'BALTIC SWAN',
    mmsi: '219028000',
    type: 'Chemical Tanker',
    flag: 'DK',
    cpa: '1.4 NM',
    score: 74.2,
    intersectCoord: [28.25, 31.72]
  },
  {
    id: 'v3',
    name: 'PACIFIC GLORY',
    mmsi: '477218000',
    type: 'Cargo',
    flag: 'HK',
    cpa: '3.8 NM',
    score: 22.1,
    intersectCoord: [28.05, 31.85]
  }
];

export const AisCorrelationMatrix = () => {
  const { setCorrelationMarker, correlationMarker, setPanToCoordinate } = useIncident();

  const handleIntersect = (vessel) => {
    setCorrelationMarker(vessel.intersectCoord);
    setPanToCoordinate({ lat: vessel.intersectCoord[1], lon: vessel.intersectCoord[0] });
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">AIS Correlation Matrix</h2>
        {correlationMarker && (
          <button 
            onClick={() => setCorrelationMarker(null)}
            className="text-[9px] text-slate-500 hover:text-slate-300 font-mono tracking-wider underline"
          >
            CLEAR MARKER
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {mockSuspects.map((vessel, index) => (
          <div 
            key={vessel.id}
            className={`flex flex-col bg-slate-950 border rounded-lg p-3 transition-colors ${
              correlationMarker && correlationMarker[0] === vessel.intersectCoord[0] 
                ? 'border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
                : 'border-slate-800'
            }`}
          >
            <div className="flex justify-between items-start mb-2 border-b border-slate-800 pb-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-200 font-bold text-xs">{vessel.name}</span>
                  {index === 0 && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">MMSI: {vessel.mmsi} | {vessel.flag}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-mono font-bold ${vessel.score > 90 ? 'text-rose-400' : vessel.score > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {vessel.score}%
                </span>
                <span className="text-[9px] text-slate-500">SUSPECT SCORE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500">VESSEL TYPE</span>
                <span className="text-[10px] text-slate-300 font-mono truncate">{vessel.type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500">CPA TO ORIGIN</span>
                <span className="text-[10px] text-slate-300 font-mono">{vessel.cpa}</span>
              </div>
            </div>

            <button 
              onClick={() => handleIntersect(vessel)}
              className={`w-full py-1.5 flex justify-center items-center gap-2 rounded text-[10px] font-bold tracking-wider transition-colors border ${
                correlationMarker && correlationMarker[0] === vessel.intersectCoord[0]
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-slate-900 border-slate-700 hover:border-cyan-500/50 text-cyan-500 hover:bg-slate-800'
              }`}
            >
              {correlationMarker && correlationMarker[0] === vessel.intersectCoord[0] ? (
                <>
                  <Crosshair className="w-3 h-3" />
                  TARGET LOCKED
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  INTERSECT ROUTE
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
