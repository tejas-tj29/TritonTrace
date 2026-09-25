import { useState, useEffect } from "react";
import { useIncident } from "../../../context/IncidentContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Wind,
  Compass,
} from "lucide-react";

export const HindcastController = () => {
  const { updateHindcastTimeline } = useIncident();
  const [isPlaying, setIsPlaying] = useState(false);
  const [offsetHours, setOffsetHours] = useState(0);

  useEffect(() => {
    updateHindcastTimeline(offsetHours);
  }, [offsetHours, updateHindcastTimeline]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setOffsetHours((prev) => {
          if (prev <= -24) {
            setIsPlaying(false);
            return -24;
          }
          return prev - 0.5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleScrub = (e) => {
    setOffsetHours(parseFloat(e.target.value));
    setIsPlaying(false);
  };

  const getEstimatedOriginTimestamp = () => {
    const baseDate = new Date("2026-09-22T06:30:00Z");
    const originTime = new Date(baseDate.getTime() + offsetHours * 3600 * 1000);
    return originTime.toISOString().replace(".000", "");
  };

  return (
    <div className="flex flex-col gap-4 font-sans text-left">
      <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
        Hindcast Trajectory
      </h2>

      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex flex-col gap-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setOffsetHours(Math.max(-24, offsetHours - 1))}
              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-brand-50 border border-brand-200 hover:bg-brand-100 rounded text-brand-700 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setOffsetHours(Math.min(0, offsetHours + 1))}
              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-brand-700 font-mono text-xs font-bold shadow-sm">
            {offsetHours === 0 ? "T±0.0 hrs" : `T${offsetHours.toFixed(1)} hrs`}
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
            className="w-full accent-brand-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-semibold">
            <span>-24h (Origin)</span>
            <span>0h (Detection)</span>
          </div>
        </div>
      </div>

      {/* Telemetry */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 font-bold">
            <Compass className="w-3.5 h-3.5" /> DRIFT VECTOR
          </div>
          <span className="text-xs font-mono font-bold text-slate-900">
            0.8 kts @ 210°
          </span>
        </div>
        <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 font-bold">
            <Wind className="w-3.5 h-3.5" /> WINDAGE
          </div>
          <span className="text-xs font-mono font-bold text-slate-900">
            3.2% Factor
          </span>
        </div>
      </div>

      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm flex flex-col gap-1 text-left">
        <span className="text-[10px] font-bold text-slate-500 uppercase">
          Estimated Release Origin
        </span>
        <span className="text-xs font-mono font-bold text-slate-900">
          {offsetHours <= -20 ? getEstimatedOriginTimestamp() : "CALCULATING..."}
        </span>
      </div>
    </div>
  );
};

