import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { TopHUD } from './components/layout/TopHUD';
import { mockIncident, mockAISVessels } from './utils/mockData';
import { 
  Compass, 
  Layers, 
  Radio, 
  Crosshair, 
  MapPin, 
  Wind, 
  Waves, 
  Maximize2, 
  ShieldCheck, 
  Satellite,
  Lock,
  ChevronRight,
  Flame
} from 'lucide-react';

function TacticalMapBackground({ isBlurred }) {
  return (
    <div 
      className={`absolute inset-0 z-0 overflow-hidden bg-slate-950 transition-all duration-700 ease-out select-none ${
        isBlurred ? 'filter blur-md brightness-60 scale-102 pointer-events-none' : 'filter blur-none brightness-100 scale-100'
      }`}
    >
      {/* Bathymetry & deep ocean gradient simulation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(2,6,23,1))]" />
      
      {/* Tactical Coordinate Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 211, 238, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 211, 238, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Lat/Lon Guide Marks */}
      <div className="absolute top-20 left-6 font-mono text-[10px] text-cyan-500/40 tracking-wider">
        LAT: 35.8989°N | LON: 14.5146°E | GRID: MED-SECTOR-4
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-slate-500/60">
        SENSOR: SENTINEL-1 C-SAR (VV/VH) | RES: 10m/px
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-slate-500/60">
        DATUM: WGS 84 / UTM ZONE 33N
      </div>

      {/* Synthetic Mediterranean Map Surface Visualization */}
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Malta / Sicily Coastal Outline Representation */}
        <svg 
          viewBox="0 0 1000 700" 
          className="w-full h-full max-w-6xl max-h-[85vh] text-slate-800/40 stroke-cyan-500/20 fill-slate-900/30"
        >
          {/* Subtle coastline vectors */}
          <path 
            d="M 220,180 Q 280,160 360,190 T 520,210 T 680,180 T 780,240 T 890,290" 
            fill="none" 
            stroke="rgba(34, 211, 238, 0.2)" 
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path 
            d="M 180,450 Q 290,430 420,470 T 610,460 T 790,520 T 920,490" 
            fill="none" 
            stroke="rgba(34, 211, 238, 0.12)" 
            strokeWidth="1"
          />

          {/* Sentinel-1 SAR Scan Swath Boundary */}
          <rect 
            x="340" 
            y="180" 
            width="340" 
            height="320" 
            fill="rgba(6, 182, 212, 0.03)" 
            stroke="rgba(34, 211, 238, 0.3)" 
            strokeWidth="1" 
            strokeDasharray="6 3"
          />
          <text x="350" y="200" fill="rgba(34, 211, 238, 0.5)" fontSize="10" fontFamily="monospace">
            SAR ACQUISITION SWATH · SENTINEL-1
          </text>

          {/* Incident Oil Slick Polygon (Med-Spill-017) */}
          <g transform="translate(510, 340)">
            {/* Slick glow */}
            <path 
              d="M -30,-12 C 10,-35 60,-20 85,-5 C 100,5 95,28 70,35 C 30,42 -10,32 -25,20 Z" 
              fill="rgba(34, 211, 238, 0.22)" 
              stroke="rgba(34, 211, 238, 0.85)" 
              strokeWidth="2"
              className="animate-pulse"
            />
            {/* Core discharge line */}
            <path 
              d="M -20,0 L 75,15" 
              stroke="rgba(244, 63, 94, 0.9)" 
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />

            {/* Target Reticle */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="-24" y1="0" x2="24" y2="0" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1" />
            <line x1="0" y1="-24" x2="0" y2="24" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1" />

            <text x="25" y="-18" fill="#22d3ee" fontSize="11" fontFamily="monospace" fontWeight="bold">
              Med-Spill-017 [14.6 km²]
            </text>
            <text x="25" y="-5" fill="rgba(203, 213, 225, 0.8)" fontSize="9" fontFamily="monospace">
              STATUS: UNDER_INVESTIGATION
            </text>
          </g>

          {/* Hindcast Origin Estimation (Emerald Circle) */}
          <g transform="translate(430, 420)">
            <circle cx="0" cy="0" r="28" fill="rgba(52, 211, 153, 0.08)" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx="0" cy="0" r="4" fill="#34d399" />
            <line x1="0" y1="0" x2="80" y2="-80" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1.2" strokeDasharray="2 2" />
            <text x="-70" y="42" fill="#34d399" fontSize="10" fontFamily="monospace">
              ESTIMATED DISCHARGE ORIGIN
            </text>
            <text x="-70" y="54" fill="rgba(148, 163, 184, 0.7)" fontSize="8" fontFamily="monospace">
              UNCERTAINTY RADIUS: 1.8 km
            </text>
          </g>

          {/* AIS Correlated Vessel (Pacific Horizon) */}
          <g transform="translate(440, 410)">
            <polygon points="0,-6 5,6 -5,6" fill="#f43f5e" />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" />
            <text x="12" y="4" fill="#fda4af" fontSize="9" fontFamily="monospace">
              Pacific Horizon (MMSI: 419999999) [0.942 THREAT]
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function MainConsole() {
  const { isAuthenticated, role, user, roleDefinition, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(!isAuthenticated);

  // If authentication changes, synchronize modal state
  React.useEffect(() => {
    if (isAuthenticated) {
      setModalOpen(false);
    } else {
      setModalOpen(true);
    }
  }, [isAuthenticated]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Full-screen map background (blurred when unauthenticated) */}
      <TacticalMapBackground isBlurred={!isAuthenticated} />

      {/* When Authenticated: Mount TopHUD */}
      {isAuthenticated && (
        <TopHUD 
          activeIncidentId={mockIncident.incident_id} 
          demoMode={false} 
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Unauthenticated Gateway Launcher Overlay (if modal closed) */}
        {!isAuthenticated && !modalOpen && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-8 backdrop-blur-xl text-center shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-400 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <Satellite className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">TRITONTRACE GATEWAY</h1>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Marine Oil Spill Forensic Intelligence & Vessel Attribution Platform. Operational access requires verified credentials.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-6 w-full flex items-center justify-center space-x-2 rounded-lg bg-cyan-500 py-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                <span>Launch TritonTrace Console</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2-Step Auth Modal */}
        {!isAuthenticated && modalOpen && (
          <AuthModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
          />
        )}

        {/* Authenticated Workspace Content */}
        {isAuthenticated && (
          <div className="flex-1 p-4 pointer-events-none flex flex-col justify-between">
            {/* Top Left Floating Incident Telemetry Tray */}
            <div className="pointer-events-auto max-w-sm rounded-lg border border-slate-800 bg-slate-950/85 p-3.5 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    TARGET: {mockIncident.incident_id}
                  </span>
                </div>
                <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                  {mockIncident.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="rounded bg-slate-900/60 p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">SLICK AREA</div>
                  <div className="text-cyan-300 font-semibold">{mockIncident.slick_area_sqkm} km²</div>
                </div>
                <div className="rounded bg-slate-900/60 p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">PERIMETER</div>
                  <div className="text-slate-200 font-semibold">{mockIncident.perimeter_km} km</div>
                </div>
                <div className="rounded bg-slate-900/60 p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">SURFACE WIND</div>
                  <div className="text-slate-200 font-semibold">{mockIncident.metocean.wind_speed_ms} m/s ({mockIncident.metocean.wind_direction_deg}°)</div>
                </div>
                <div className="rounded bg-slate-900/60 p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">CURRENT DRIFT</div>
                  <div className="text-slate-200 font-semibold">{mockIncident.metocean.current_speed_ms} m/s ({mockIncident.metocean.current_direction_deg}°)</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>EST. DISCHARGE AGE: {mockIncident.estimated_age_hours} hrs</span>
                <span className="text-rose-400 font-semibold">ELONGATION: {mockIncident.geometry_elongation_ratio}</span>
              </div>
            </div>

            {/* Bottom Floating Operational Status Bar */}
            <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/85 px-4 py-2.5 backdrop-blur-md shadow-xl text-xs font-mono">
              <div className="flex items-center space-x-3 text-slate-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ACTIVE WORKSPACE: <strong className="text-cyan-400">{roleDefinition?.title}</strong></span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-400 hidden md:inline">{roleDefinition?.subtitle}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500">Operator: {user?.agency || 'AUTHORIZED'}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition"
                >
                  Switch Domain / Lock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainConsole />
    </AuthProvider>
  );
}