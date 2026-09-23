import React, { useState, useEffect } from 'react';
import { NormalUserLeft } from './NormalUserLeft';
import { MapEngine } from '../map/MapEngine';
import { TopHUD } from '../common/TopHUD';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export const NormalUserPortal = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Dispatch resize after the CSS transition (300ms) to ensure the map fills the new space
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    return () => clearTimeout(timeout);
  }, [isSidebarOpen]);
  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden">
      <TopHUD />
      
      <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* Collapsible Sidebar Container */}
        <div className={`transition-all duration-300 ease-in-out flex flex-shrink-0 relative z-20 ${
          isSidebarOpen ? 'w-96 border-r border-slate-800' : 'w-0'
        }`}>
          <div className="w-96 h-full overflow-hidden bg-slate-900/95 flex flex-col relative">
            <NormalUserLeft onCollapse={() => setIsSidebarOpen(false)} />
          </div>
        </div>

        {/* Floating Expand Button (when collapsed) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-slate-300 rounded shadow-lg transition-colors"
            title="EXPAND PANEL"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {/* Map Canvas */}
        <div className="flex-1 relative h-full w-full bg-slate-950 isolate">
          <MapEngine />
        </div>
      </div>
    </div>
  );
};
