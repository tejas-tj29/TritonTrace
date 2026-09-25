import React from "react";
import { useIncident } from "../../../context/IncidentContext";
import { mockHistoricalIncidents } from "../../../utils/mockData";

export const HistoricalFeed = () => {
  const { activeIncident, setActiveIncident } = useIncident();

  return (
    <div className="flex flex-col gap-4 font-sans">
      <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
        Historical Incidents
      </h2>

      <div className="flex flex-col gap-3">
        {mockHistoricalIncidents.map((inc) => (
          <button
            key={inc.id}
            onClick={() => setActiveIncident(inc.id)}
            className={`p-3 rounded-md border text-left flex flex-col gap-2 transition-all shadow-sm ${
              activeIncident === inc.id
                ? "bg-brand-50 border-brand-400 ring-1 ring-brand-400/20"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span
                className={`font-mono text-xs font-bold ${activeIncident === inc.id ? "text-brand-700" : "text-slate-800"}`}
              >
                {inc.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  inc.status === "ACTIVE"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : inc.status === "MONITORING"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {inc.status}
              </span>
            </div>

            <div className="flex justify-between items-end w-full">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  DETECTED
                </span>
                <span className="text-xs font-medium text-slate-700">
                  {new Date(inc.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  EST AREA
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {inc.area} km²
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
