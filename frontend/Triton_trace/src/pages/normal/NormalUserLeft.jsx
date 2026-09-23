import React, { useState } from 'react';
import { Layers, History, PenTool, Radio, PanelLeftClose } from 'lucide-react';
import { HistoricalFeed } from './modules/HistoricalFeed';
import { IncidentReportForm } from './modules/IncidentReportForm';
import { ManualMappingPanel } from './modules/ManualMappingPanel';
import { SpillClassifier } from './modules/SpillClassifier';

export const NormalUserLeft = ({ onCollapse }) => {
  const [activeTab, setActiveTab] = useState('report');

  const tabs = [
    { id: 'report', icon: Radio, label: 'Report' },
    { id: 'history', icon: History, label: 'Feed' },
    { id: 'map', icon: PenTool, label: 'Map' },
    { id: 'classifier', icon: Layers, label: 'Analysis' }
  ];

  return (
    <aside className="w-full h-full bg-slate-900 flex flex-col shrink-0 z-40">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-2 py-1">
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 flex flex-col items-center justify-center transition-colors ${
                activeTab === tab.id 
                  ? 'text-cyan-300 border-b-2 border-cyan-400 bg-slate-900' 
                  : 'text-slate-500 border-b-2 border-transparent hover:text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span className="text-[11px] font-mono tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Dedicated Collapse Button */}
        <button
          onClick={onCollapse}
          className="flex-shrink-0 p-1.5 ml-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition"
          title="Collapse Panel"
        >
          <PanelLeftClose className="w-4 h-4"/>
        </button>
      </div>

      {/* Module Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar">
        {activeTab === 'report' && <IncidentReportForm />}
        {activeTab === 'history' && <HistoricalFeed />}
        {activeTab === 'map' && <ManualMappingPanel />}
        {activeTab === 'classifier' && <SpillClassifier />}
      </div>
    </aside>
  );
};
