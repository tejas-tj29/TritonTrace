import React, { useState, useEffect } from 'react';
import { useIncident } from '../../../context/IncidentContext';
import { Play, Pause, SkipBack, SkipForward, Wind, Compass } from 'lucide-react';

export const HindcastController = () => {
  const { updateHindcastTimeline } = useIncident();
  const [isPlaying, setIsPlaying] = useState(false);
  const [offsetHours, setOffsetHours] = useState(0); // 0 to -24

  useEffect(() => {
    updateHindcastTimeline(offsetHours);
  }, [offsetHours, updateHindcastTimeline]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setOffsetHours(prev => {
          if (prev <= -24) {
            setIsPlaying(false);
            return -24;
          }
          return prev - 0.5;
        });
      }, 500); // tick every 500ms
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleScrub = (e) => {
    setOffsetHours(parseFloat(e.target.value));
    setIsPlaying(false);
  };

  const formatOffset = (hours) => {
    if (hours === 0) return 'T±0.0 hrs';
    return `T${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Hindcast Trajectory</h2>

      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setOffsetHours(Math.max(-24, offsetHours - 1))}
              className="p-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded text-slate-300 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 rounded text-cyan-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setOffsetHours(Math.min(0, offsetHours + 1))}
              className="p-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded text-slate-300 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-cyan-400 font-mono text-xs font-bold">
            {formatOffset(offsetHours)}
          </div>
        </div>

        {/* Scrubber */}
        <div className="flex flex-col gap-1">
          <input 
            type="range" 
            min="-24" 
            max="0" 
            step="0.5" 
            value={offsetHours}
            onChange={handleScrub}
            className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
            <span>-24h (Origin)</span>
            <span>0h (Detection)</span>
          </div>
        </div>
      </div>

      {/* Telemetry */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
            <Compass className="w-3 h-3" />
            <span>DRIFT VECTOR</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">0.8 kts @ 210°</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
            <Wind className="w-3 h-3" />
            <span>WINDAGE</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">3.2% Factor</span>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 uppercase">Estimated Release Origin</span>
        <span className="text-xs font-mono text-slate-300">
          {offsetHours <= -23 ? "2026-08-13T09:22:00Z" : "CALCULATING..."}
        </span>
      </div>
    </div>
  );
};
