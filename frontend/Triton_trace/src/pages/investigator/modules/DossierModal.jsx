import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle, Lock, X } from 'lucide-react';

export const DossierModal = ({ isOpen, onClose, incidentData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = {
        caseId: incidentData?.id || 'UNASSIGNED',
        timestamp: incidentData?.createdAt || new Date().toISOString(),
        satelliteData: { sensor: 'Sentinel-1', polarization: 'VV/VH', backscatter: '-22.4 dB' },
        aisSuspect: { mmsi: '235088000', name: 'NORDIC EXPLORER', confidence: 96.4 },
        chainOfCustody: { locked: true, signature: '0x3fA...bC4' }
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dossier_${incidentData?.id || 'new'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden max-w-lg w-full">
        <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Case File: {incidentData?.id || 'UNASSIGNED'}</span>
          </div>
          <div className="flex items-center gap-4">
            <Lock className="w-3 h-3 text-emerald-500" />
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4 text-xs font-mono text-slate-300 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-sans font-bold">1. SATELLITE TELEMETRY</span>
            <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
              <div>Sensor: Sentinel-1 SAR</div>
              <div>Polarization: VV/VH</div>
              <div>Backscatter: -22.4 dB</div>
              <div>Est. Slick Area: 4.2 km²</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-sans font-bold">2. HINDCAST ORIGIN</span>
            <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
              <div>Target Origin: 31.85°N, 28.25°E</div>
              <div>Drift Duration: 14.5 Hours</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-sans font-bold">3. AIS SUSPECT PROFILE</span>
            <div className="bg-slate-900/50 p-2 rounded border border-rose-500/30 text-rose-300">
              <div>Vessel: MT PACIFIC CROWN — PANAMA</div>
              <div>IMO 9481234 / MMSI 352001928</div>
              <div>Closest Point of Approach: 0.42 nm @ 18:22 UTC</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-sans font-bold">4. FORWARD HAZARD PREDICTION</span>
            <div className="bg-slate-900/50 p-2 rounded border border-amber-500/30 text-amber-300">
              <div>Affected Sector: Egypt Coastal Zone A</div>
              <div>Landfall ETA: +48 Hours</div>
              <div>Impact Probability: High (88%)</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-sans font-bold">5. CHAIN OF CUSTODY</span>
            <div className="flex items-center gap-2 bg-emerald-500/10 p-2 rounded border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              <span>Audit hash verified (0x3fA...bC4)</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex gap-2">
          <button 
            onClick={handleExportJSON}
            disabled={isGenerating}
            className="flex-1 py-2 flex justify-center items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded text-[10px] font-bold tracking-wider transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isGenerating ? 'GENERATING...' : 'EXPORT DOSSIER (JSON)'}
          </button>
          <button 
            onClick={handlePrint}
            className="flex-shrink-0 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded transition-colors"
            title="Print Audit Brief"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
