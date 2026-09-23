import { MapEngine } from "../map/MapEngine";
import { TopHUD } from "../common/TopHUD";
import { ShieldAlert, Navigation } from "lucide-react";

export const CommercialPortal = () => {
  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden">
      <TopHUD />

      <div className="flex-1 relative h-full w-full bg-slate-950 isolate">
        <MapEngine />

        {/* Floating Proximity Radar Panel */}
        <div className="absolute top-4 left-4 z-1000 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/50">
            <Navigation className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">
              Proximity Radar
            </h3>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Advisory Badge */}
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/50 rounded text-amber-500">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">
                  ADVISORY: DIVERSIFY ROUTE
                </span>
                <span className="text-[10px] font-mono mt-1 opacity-80">
                  Reroute minimum 12 NM North of active slick envelope.
                </span>
              </div>
            </div>

            {/* Fleet Assets */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Fleet Assets
              </span>

              <div className="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">
                    NORDIC EXPLORER
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    MMSI: 235088000
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    4.2 NM
                  </span>
                  <span className="text-[9px] text-slate-500">
                    to slick edge
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">
                    BALTIC SWAN
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    MMSI: 219028000
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    18.5 NM
                  </span>
                  <span className="text-[9px] text-slate-500">
                    to slick edge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
