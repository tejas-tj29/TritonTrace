import { FastForward, AlertTriangle, MapPin } from "lucide-react";

export const ForwardTrackPanel = () => {
  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
        <FastForward className="w-4 h-4 text-amber-600" />
        <span className="text-[10px] font-bold text-amber-700 tracking-wider">
          FORWARD TRAJECTORY ACTIVE (+48 HOURS)
        </span>
      </div>

      <div className="flex flex-col p-3 bg-white border border-slate-200 rounded-md shadow-sm gap-3">
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider">
            PREDICTED IMPACT ZONE
          </span>
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Alexandria
            Coastal Reserve
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              EST. LANDFALL
            </span>
            <span className="text-xs font-mono font-bold text-rose-600">
              38.5 Hours
            </span>
          </div>
          <div className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              CONFIDENCE
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">
              82.4%
            </span>
          </div>
        </div>

        <button className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-md shadow-sm transition-colors flex justify-center items-center gap-2">
          <MapPin className="w-3 h-3" /> DISPATCH LOCAL RESPONSE TEAMS
        </button>
      </div>
    </div>
  );
};
