import { ShieldAlert } from "lucide-react";

export const MapLegend = () => {
  return (
    <div className="w-64 bg-white border border-slate-200 rounded-md shadow-md p-4 flex flex-col gap-4 shrink-0 font-sans">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <ShieldAlert className="w-4 h-4 text-brand-600" />
        <h3 className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">
          Visual Legend
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-cyan-50 border border-cyan-400 rounded-sm" />
          <span className="text-xs font-semibold text-slate-700">
            Detected Oil Spill (SAR)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 bg-rose-300 rounded-full" />
            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Hindcast Trajectory
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-4 border-t-2 border-dashed border-amber-500" />
          <span className="text-xs font-semibold text-slate-700">
            AIS Vessel Route
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full border-[2px] border-rose-600 flex items-center justify-center">
            <div className="w-1 h-1 bg-rose-600 rounded-full" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Correlation Point
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-dashed border-amber-500 bg-amber-50" />
          <span className="text-xs font-semibold text-slate-700">
            Watch Zone (50km)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-rose-500 bg-rose-50" />
          <span className="text-xs font-semibold text-slate-700">
            Critical Strike Zone (15km)
          </span>
        </div>
      </div>
    </div>
  );
};
