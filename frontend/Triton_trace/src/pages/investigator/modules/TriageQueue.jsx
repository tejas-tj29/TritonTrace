import React, { useState, useEffect } from 'react';
import { reportService } from '../../../services/reportService';
import { useIncident } from '../../../context/IncidentContext';
import { DossierModal } from './DossierModal';
import { ShieldAlert, ShieldCheck, HelpCircle, Rewind, FastForward, Download, Target, Play, Pause, Clock, Crosshair, Activity, FileText } from 'lucide-react';

export const TriageQueue = () => {
  const [reports, setReports] = useState([]);
  const { activeIncident, setActiveIncident, setPanToCoordinate, setActiveAnalysisMode, activeAnalysisMode, updateHindcastTimeline, setCorrelationMarker } = useIncident();
  const [isExporting, setIsExporting] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying && activeAnalysisMode === 'attribution') {
      interval = setInterval(() => {
        setTimeOffset(prev => {
          const next = prev - 1;
          if (next < -24) {
            setIsPlaying(false);
            return -24;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeAnalysisMode]);

  useEffect(() => {
    if (activeAnalysisMode === 'attribution') {
      updateHindcastTimeline(timeOffset);
    }
  }, [timeOffset, updateHindcastTimeline, activeAnalysisMode]);

  const loadReports = () => {
    setReports(reportService.getReports().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (e, id, newStatus) => {
    e.stopPropagation();
    reportService.updateReport(id, { status: newStatus });
    loadReports();
  };

  const handleCardClick = (report) => {
    if (activeIncident === report.id) {
      // Toggle off if already active
      setActiveIncident(null);
      setActiveAnalysisMode('none');
    } else {
      setActiveIncident(report.id);
      setActiveAnalysisMode('none'); // Reset mode on new selection
      if (report.lat && report.lon) {
        setPanToCoordinate({ lat: parseFloat(report.lat), lon: parseFloat(report.lon) });
      }
    }
  };

  const handleExport = (e, report) => {
    e.stopPropagation();
    setIsExporting(true);
    setTimeout(() => {
      const data = {
        caseId: report.id,
        timestamp: new Date().toISOString(),
        coordinates: { lat: report.lat, lon: report.lon },
        status: report.status
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dossier_${report.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 800);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded text-[9px] font-bold">VERIFIED</span>;
      case 'FALSE_POSITIVE':
        return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded text-[9px] font-bold">FALSE POSITIVE</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded text-[9px] font-bold">UNDER REVIEW</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 border border-slate-600 rounded text-[9px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Incident Triage Queue</h2>
      
      {reports.length === 0 ? (
        <div className="text-center p-6 bg-slate-950/50 rounded border border-dashed border-slate-800 text-slate-500 text-xs font-mono">
          NO PENDING INCIDENTS
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(report => {
            const isExpanded = activeIncident === report.id;
            
            return (
              <div 
                key={report.id} 
                className={`flex flex-col bg-slate-950 border transition-all cursor-pointer overflow-hidden ${
                  isExpanded ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] rounded-lg' : 'border-slate-800 rounded hover:border-slate-600'
                }`}
                onClick={() => handleCardClick(report)}
              >
                {/* Compact Header */}
                <div className="flex justify-between items-start p-3">
                  <div className="flex flex-col">
                    <span className={`${isExpanded ? 'text-cyan-400' : 'text-slate-300'} font-mono font-bold text-xs transition-colors`}>{report.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="flex flex-col px-3 pb-3 border-t border-slate-800/50 mt-1 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Status Modifiers */}
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={(e) => handleStatusChange(e, report.id, 'VERIFIED')}
                        className="flex-1 py-1 flex justify-center items-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-[9px] font-bold transition-colors"
                      >
                        VERIFY
                      </button>
                      <button 
                        onClick={(e) => handleStatusChange(e, report.id, 'FALSE_POSITIVE')}
                        className="flex-1 py-1 flex justify-center items-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded text-[9px] font-bold transition-colors"
                      >
                        FLAG
                      </button>
                    </div>

                    {report.imagePreview && (
                      <img 
                        src={report.imagePreview} 
                        alt="Evidence" 
                        className="w-full h-32 object-cover rounded border border-slate-800 mb-3 mix-blend-screen opacity-90" 
                      />
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold">COORDINATES</span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          {report.lat ? `${parseFloat(report.lat).toFixed(3)}, ${parseFloat(report.lon).toFixed(3)}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold">TYPE</span>
                        <span className="text-[10px] text-slate-300 font-mono truncate">{report.spillType || 'UNKNOWN'}</span>
                      </div>
                    </div>

                    {/* Mission Command Actions */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">MISSION COMMAND</span>
                      
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveAnalysisMode('attribution'); 
                          setCorrelationMarker([28.15, 31.78]);
                        }}
                        className={`flex flex-col items-start p-2 rounded border transition-all ${
                          activeAnalysisMode === 'attribution' 
                            ? 'border-cyan-400 bg-cyan-900/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                            : 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[10px] font-bold tracking-wider">
                          <Target className="w-3.5 h-3.5" />
                          RUN ATTRIBUTION
                        </div>
                        <span className="text-[9px] font-mono opacity-70 text-left">Initiates backward hindcast trajectory and AIS vessel correlation.</span>
                      </button>

                      {/* Inline Attribution Readout */}
                      {activeAnalysisMode === 'attribution' && (
                        <div className="flex flex-col bg-slate-950 border border-slate-800 rounded p-3 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-2 mb-3 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[9px] font-bold text-emerald-400 tracking-wider">ATTRIBUTION SOLVED — 96.4% CONFIDENCE</span>
                          </div>

                          <div className="flex flex-col gap-1 mb-3 pb-3 border-b border-slate-800/50">
                            <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2">
                              <Crosshair className="w-3 h-3 text-cyan-400" /> MT PACIFIC CROWN — PANAMA
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 pl-5">IMO 9481234 / MMSI 352001928</span>
                            <span className="text-[10px] font-mono text-slate-500 pl-5">Crude Oil Tanker</span>
                            <div className="grid grid-cols-2 gap-2 mt-2 pl-5">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-500 tracking-wider">CPA</span>
                                <span className="text-[9px] font-mono text-slate-300">0.42 nm @ 18:22 UTC</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-500 tracking-wider">EST. ORIGIN</span>
                                <span className="text-[9px] font-mono text-slate-300">31.85°N, 28.25°E</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-500 tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> HINDCAST TIMELINE</span>
                              <span className="text-[10px] font-mono font-bold text-cyan-400">{timeOffset}h</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                              >
                                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              </button>
                              <input 
                                type="range" 
                                min="-24" 
                                max="0" 
                                step="1"
                                value={timeOffset}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setTimeOffset(parseInt(e.target.value));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveAnalysisMode('forward_track'); }}
                        className={`flex flex-col items-start p-2 rounded border transition-all ${
                          activeAnalysisMode === 'forward_track'
                            ? 'border-amber-400 bg-amber-900/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'border-amber-500/30 bg-amber-950/20 text-amber-500 hover:bg-amber-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[10px] font-bold tracking-wider">
                          <FastForward className="w-3.5 h-3.5" />
                          FORWARD TRACK
                        </div>
                        <span className="text-[9px] font-mono opacity-70 text-left">Simulates forward propagation to identify coastal impact zones.</span>
                      </button>

                      <div className="w-full h-px bg-slate-800 my-1"></div>

                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsDossierOpen(true); }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-bold tracking-wider transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          VIEW DOSSIER
                        </button>
                        <button 
                          onClick={(e) => handleExport(e, report)}
                          disabled={isExporting}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-400 text-[10px] font-bold tracking-wider transition-colors disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {isExporting ? 'DOWNLOADING...' : 'DOWNLOAD JSON'}
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DossierModal 
        isOpen={isDossierOpen} 
        onClose={() => setIsDossierOpen(false)} 
        incidentData={reports.find(r => r.id === activeIncident)}
      />
    </div>
  );
};
