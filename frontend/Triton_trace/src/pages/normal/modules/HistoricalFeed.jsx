import React from 'react';
import { useIncident } from '../../../context/IncidentContext';
import { mockHistoricalIncidents } from '../../../utils/mockData';
import { Target } from 'lucide-react';

export const HistoricalFeed = () => {
  const { activeIncident, setActiveIncident } = useIncident();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Historical Incidents</h2>
      
      <div className="flex flex-col gap-3">
        {mockHistoricalIncidents.map(inc => (
          <button
            key={inc.id}
            onClick={() => setActiveIncident(inc.id)}
            className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-colors ${
              activeIncident === inc.id 
                ? 'bg-slate-800 border-cyan-500/50 ring-1 ring-cyan-500/20' 
                : 'bg-slate-900 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-mono text-xs text-slate-200">{inc.id}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                inc.status === 'ACTIVE' ? 'bg-rose-500/20 text-rose-400' :
                inc.status === 'MONITORING' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {inc.status}
              </span>
            </div>
            
            <div className="flex justify-between items-end w-full">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">DETECTED</span>
                <span className="text-xs text-slate-300">{new Date(inc.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500">EST AREA</span>
                <span className="text-xs font-mono text-slate-300">{inc.area} km²</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
