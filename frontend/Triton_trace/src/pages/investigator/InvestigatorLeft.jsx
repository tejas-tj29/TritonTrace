import React from 'react';
import { PanelLeftClose, Activity } from 'lucide-react';
import { TriageQueue } from './modules/TriageQueue';

export const InvestigatorLeft = ({ onCollapse }) => {
  return (
    <aside className="w-full h-full bg-slate-900 flex flex-col shrink-0 z-40">
      {/* Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200">INCIDENT TRIAGE & FORENSICS</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold tracking-widest text-emerald-500 uppercase">LIVE QUEUE</span>
          </div>
        </div>
        
        {/* Dedicated Collapse Button */}
        <button
          onClick={onCollapse}
          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition"
          title="Collapse Panel"
        >
          <PanelLeftClose className="w-4 h-4"/>
        </button>
      </div>

      {/* Module Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
        <TriageQueue />
      </div>
    </aside>
  );
};
