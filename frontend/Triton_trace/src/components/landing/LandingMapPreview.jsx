import { useState, useEffect } from 'react';
import { 
  Crosshair, 
  Layers, 
  Radio, 
  Compass, 
  MapPin, 
  Maximize2,
  Activity,
  Wind
} from 'lucide-react';
import { mockIncident, mockAISVessels } from '../../utils/mockData';

/**
 * LandingMapPreview Component
 * SkyTruth Cerulean inspired tactical map preview for the Mediterranean AOI.
 * Displays high-contrast dark basemap, Sentinel-1 slick footprint, hindcast trajectory, and AIS tracks.
 */
export const LandingMapPreview = () => {
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-md border border-slate-200 bg-[#071322] overflow-hidden shadow-sm group">
      {/* Background Radial & Bathymetry */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_60%_30%,rgba(14,165,233,0.12),#071322)]" />

      {/* Tactical Geographic Coordinate Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(8, 145, 178, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(8, 145, 178, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Coordinate Markings */}
      <div className="absolute top-3 left-3 font-mono text-[10px] bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md shadow-sm z-10 flex items-center space-x-2">
        <span className="flex h-1.5 w-1.5 rounded-full bg-brand-600 animate-ping" />
        <span className="font-semibold text-brand-600">AOI: EASTERN MEDITERRANEAN</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">SECTOR 4</span>
      </div>
      <div className="absolute top-3 right-3 font-mono text-[10px] bg-white text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md shadow-sm z-10 font-semibold">
        31°21'00"N 31°41'06"E
      </div>

      {/* Vector Visualization Surface */}
      <svg 
        viewBox="0 0 700 520" 
        className="relative w-full h-full stroke-cyan-500/30 select-none"
      >
        <defs>
          {/* Slick Gradient Glow */}
          <radialGradient id="slickGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#0891b2" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          {/* Origin Glow */}
          <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle Regional Coastline Vectors (Sicily & Maltese Archipelago) */}
        <path 
          d="M 120,110 Q 180,85 270,120 T 430,135 T 560,105 T 670,165" 
          fill="none" 
          stroke="rgba(34, 211, 238, 0.22)" 
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
        <path 
          d="M 80,380 Q 200,350 330,390 T 500,370 T 650,420" 
          fill="none" 
          stroke="rgba(34, 211, 238, 0.15)" 
          strokeWidth="1"
        />

        {/* Sentinel-1 SAR Scan Swath Outline */}
        <rect 
          x="220" 
          y="100" 
          width="320" 
          height="340" 
          fill="rgba(6, 182, 212, 0.02)" 
          stroke="rgba(34, 211, 238, 0.28)" 
          strokeWidth="1" 
          strokeDasharray="5 3"
        />
        <text x="230" y="120" fill="rgba(34, 211, 238, 0.5)" fontSize="9" fontFamily="monospace">
          SENTINEL-1 SAR PASS · DUAL-POL VV/VH
        </text>

        {/* Backward Lagrangian Drift Track (Drift 120° Current Vector) */}
        <g>
          {/* Drift line */}
          <line 
            x1="320" 
            y1="340" 
            x2="450" 
            y2="235" 
            stroke="#34d399" 
            strokeWidth="1.5" 
            strokeDasharray="4 3"
            opacity="0.7"
          />
          {/* Drift Particle Pulses */}
          <circle cx="360" cy="305" r="2.5" fill="#34d399" opacity="0.9" />
          <circle cx="400" cy="272" r="2.5" fill="#34d399" opacity="0.9" />
          <circle cx="430" cy="250" r="2.5" fill="#34d399" opacity="0.9" />

          {/* Backward drift arrow indicator */}
          <text x="350" y="325" fill="#34d399" fontSize="8" fontFamily="monospace" transform="rotate(-38 350 325)">
            ◄ 12H HINDCAST DRIFT VECTOR
          </text>
        </g>

        {/* Estimated Discharge Origin (Emerald Circle & Reticle) */}
        <g transform="translate(320, 340)">
          <circle cx="0" cy="0" r="32" fill="url(#originGlow)" />
          <circle cx="0" cy="0" r="26" fill="none" stroke="#34d399" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="0" cy="0" r="4" fill="#34d399" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#34d399" strokeWidth="1" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#34d399" strokeWidth="1" />
          
          <text x="-55" y="44" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
            ORIGIN CENTROID
          </text>
          <text x="-55" y="55" fill="rgba(148, 163, 184, 0.8)" fontSize="7.5" fontFamily="monospace">
            UNCERTAINTY: ±1.8 km
          </text>
        </g>

        {/* AIS Candidate Track: Pacific Horizon (Red Anomaly) */}
        <g>
          {/* Vessel past transit track */}
          <path 
            d="M 240,430 L 310,360 L 330,345" 
            fill="none" 
            stroke="#f43f5e" 
            strokeWidth="1.5" 
            opacity="0.8"
          />
          {/* Dark shipping gap: dashed */}
          <path 
            d="M 330,345 L 370,305" 
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="1.5" 
            strokeDasharray="3 2"
          />
          {/* SOG drop point */}
          <polygon points="325,340 335,345 325,350" fill="#f43f5e" />
          <circle cx="330" cy="345" r="9" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" />
          <text x="345" y="358" fill="#fda4af" fontSize="8" fontFamily="monospace">
            Pacific Horizon [SOG: 1.2kt]
          </text>
          <text x="345" y="368" fill="#f43f5e" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
            AIS GAP & ANOMALY DETECTED
          </text>
        </g>

        {/* Detected Oil Slick Polygon (Cyan Elongated Slick - Med-Spill-017) */}
        <g transform="translate(450, 235)">
          <path 
            d="M -45,-16 C 5,-42 75,-25 110,-6 C 130,8 120,34 85,42 C 35,50 -15,40 -35,24 Z" 
            fill="url(#slickGlow)" 
            stroke="#22d3ee" 
            strokeWidth="2"
            className="transition-all"
          />
          {/* High concentration discharge spine */}
          <path 
            d="M -25,2 L 95,20" 
            stroke="rgba(34, 211, 238, 0.95)" 
            strokeWidth="1.8"
            strokeDasharray="4 2"
          />

          {/* Centroid Reticle */}
          <circle cx="20" cy="10" r="14" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="6" y1="10" x2="34" y2="10" stroke="#22d3ee" strokeWidth="1" />
          <line x1="20" y1="-4" x2="20" y2="24" stroke="#22d3ee" strokeWidth="1" />

          {/* Incident Callout */}
          <g transform="translate(40, -25)">
            <rect x="0" y="0" width="145" height="36" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="8" y="15" fill="#0891b2" fontSize="9" fontFamily="monospace" fontWeight="bold">
              {mockIncident.incident_id}
            </text>
            <text x="8" y="27" fill="#334155" fontSize="7.5" fontFamily="monospace">
              AREA: {mockIncident.slick_area_sqkm} km² · ELONG: 1:8.2
            </text>
          </g>
        </g>
      </svg>

      {/* Floating Tactical Overlay HUD (Bottom) - Stark white and flat */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-3 rounded-md border border-slate-200 bg-white shadow-md text-[11px] font-mono text-slate-700">
        <div className="flex items-center space-x-2">
          <Activity className="h-3.5 w-3.5 text-brand-600" />
          <span className="text-slate-500">RADAR BACKSCATTER:</span>
          <span className="text-brand-600 font-bold">{mockIncident.metocean.radar_backscatter_db} dB</span>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <Wind className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-slate-500">SURFACE WIND:</span>
          <span className="text-slate-900 font-semibold">{mockIncident.metocean.wind_speed_ms} m/s @ {mockIncident.metocean.wind_direction_deg}°</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>SIMULATION: DETERMINISTIC</span>
        </div>
      </div>
    </div>
  );
};

export default LandingMapPreview;
