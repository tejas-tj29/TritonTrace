import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleGuard } from './components/auth/RoleGuard';
import { LandingPage } from './components/landing/LandingPage';
import { TopHUD } from './components/layout/TopHUD';
import { MapCanvas } from './components/map/MapCanvas';
import { mockIncident } from './utils/mockData';
import { 
  Flame, 
  Eye, 
  ShieldAlert, 
  Ship, 
  Activity, 
  Layers, 
  Radio, 
  Compass, 
  LogOut,
  FolderArchive,
  Radar,
  FileCheck2
} from 'lucide-react';

/**
 * Common Operational Workspace Shell for Portals
 * Mounts TopHUD + Unblurred Interactive MapCanvas + Floating Telemetry Tray + Role Specific Status
 */
function PortalWorkspace({ portalType }) {
  const { user, logout, roleDefinition } = useAuth();
  const navigate = useNavigate();
  const [engine, setEngine] = useState('leaflet');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Role-specific config
  const configs = {
    normal: {
      title: 'Normal User Console',
      subtitle: 'Field Observer & Local Response',
      accentColor: 'emerald',
      badge: 'FIELD OBSERVER',
      icon: Eye,
      quickTags: ['Field Observation Form', 'Historical Archive Feed', 'SAR Spill Classifier']
    },
    admin: {
      title: 'Lead Investigator Command Console',
      subtitle: 'Maritime Police / Coast Guard / Port State Control',
      accentColor: 'cyan',
      badge: 'LEAD INVESTIGATOR',
      icon: ShieldAlert,
      quickTags: ['Sentinel-1 SAR Detection', '12h Lagrangian Hindcast', 'DBSCAN Clustering', 'AIS Correlation Matrix']
    },
    commercial: {
      title: 'Commercial Operator Intelligence',
      subtitle: 'Shipowner / Fleet / P&I Club Exposure Analysis',
      accentColor: 'violet',
      badge: 'COMMERCIAL OPERATOR',
      icon: Ship,
      quickTags: ['Trajectory Consistency', 'P&I Liability Calculation', 'Exoneration Telemetry']
    }
  };

  const currentConfig = configs[portalType] || configs.normal;
  const RoleIcon = currentConfig.icon;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* TopHUD Mount */}
      <TopHUD 
        activeIncidentId={mockIncident.incident_id} 
        demoMode={false} 
        engine={engine}
      />

      {/* Unblurred Interactive Map Workspace */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MapCanvas 
          interactive={true} 
          onEngineResolved={(eng) => setEngine(eng)} 
        />

        {/* Foreground Operational Overlays */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
          {/* Top Left: Target Incident Telemetry Tray */}
          <div className="pointer-events-auto max-w-sm rounded-lg border border-slate-800 bg-slate-950/90 p-3.5 backdrop-blur-md shadow-2xl">
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
              <div className="rounded bg-slate-900/70 p-2 border border-slate-800/60">
                <div className="text-[10px] text-slate-500">SLICK AREA</div>
                <div className="text-cyan-300 font-semibold">{mockIncident.slick_area_sqkm} km²</div>
              </div>
              <div className="rounded bg-slate-900/70 p-2 border border-slate-800/60">
                <div className="text-[10px] text-slate-500">PERIMETER</div>
                <div className="text-slate-200 font-semibold">{mockIncident.perimeter_km} km</div>
              </div>
              <div className="rounded bg-slate-900/70 p-2 border border-slate-800/60">
                <div className="text-[10px] text-slate-500">SURFACE WIND</div>
                <div className="text-slate-200 font-semibold">
                  {mockIncident.metocean.wind_speed_ms} m/s ({mockIncident.metocean.wind_direction_deg}°)
                </div>
              </div>
              <div className="rounded bg-slate-900/70 p-2 border border-slate-800/60">
                <div className="text-[10px] text-slate-500">CURRENT DRIFT</div>
                <div className="text-slate-200 font-semibold">
                  {mockIncident.metocean.current_speed_ms} m/s ({mockIncident.metocean.current_direction_deg}°)
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>EST. AGE: {mockIncident.estimated_age_hours} hrs</span>
              <span className="text-rose-400 font-semibold">ELONGATION: {mockIncident.geometry_elongation_ratio}</span>
            </div>
          </div>

          {/* Bottom Floating Status Bar */}
          <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/90 px-4 py-2.5 backdrop-blur-md shadow-2xl text-xs font-mono">
            <div className="flex items-center space-x-3 text-slate-300">
              <div className={`flex h-6 w-6 items-center justify-center rounded border ${
                portalType === 'admin'
                  ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400'
                  : portalType === 'commercial'
                  ? 'border-violet-500/40 bg-violet-950/40 text-violet-400'
                  : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
              }`}>
                <RoleIcon className="h-3.5 w-3.5" />
              </div>
              <div>
                <span>ROUTE: <strong className={
                  portalType === 'admin' ? 'text-cyan-400' : portalType === 'commercial' ? 'text-violet-400' : 'text-emerald-400'
                }>{currentConfig.title}</strong></span>
                <span className="text-slate-600 hidden sm:inline mx-2">|</span>
                <span className="text-slate-400 hidden md:inline">{currentConfig.subtitle}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 font-mono">OPERATOR: {user?.agency || 'AUTHORIZED'}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-1 rounded border border-rose-500/40 bg-rose-950/40 px-2.5 py-1 text-[11px] text-rose-300 hover:bg-rose-900/50 transition"
              >
                <LogOut className="h-3 w-3" />
                <span>Switch Role / Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Route: Blurred map gateway asking which role to select */}
          <Route path="/" element={<LandingPage />} />

          {/* Distinct Portal Route: Normal User */}
          <Route
            path="/portal/normal"
            element={
              <RoleGuard allowedRoles={['normal']}>
                <PortalWorkspace portalType="normal" />
              </RoleGuard>
            }
          />

          {/* Distinct Portal Route: Lead Investigator (Admin) */}
          <Route
            path="/portal/admin"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <PortalWorkspace portalType="admin" />
              </RoleGuard>
            }
          />

          {/* Distinct Portal Route: Commercial Operator */}
          <Route
            path="/portal/commercial"
            element={
              <RoleGuard allowedRoles={['commercial']}>
                <PortalWorkspace portalType="commercial" />
              </RoleGuard>
            }
          />

          {/* Catch-all redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}