import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Radar, 
  LogOut, 
  Bell, 
  Clock, 
  Globe2, 
  Activity, 
  Sparkles,
  Shield,
  Eye,
  Ship
} from 'lucide-react';

export const TopHUD = ({ activeIncidentId = 'Med-Spill-017', demoMode = false, onToggleDemo }) => {
  const { role, user, logout, roleDefinition } = useAuth();
  const [utcTime, setUtcTime] = useState('');

  // Live ticking UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleIcon = () => {
    if (role === 'admin') return <Shield className="h-3.5 w-3.5" />;
    if (role === 'commercial') return <Ship className="h-3.5 w-3.5" />;
    return <Eye className="h-3.5 w-3.5" />;
  };

  const getRoleBadgeClasses = () => {
    if (role === 'admin') {
      return 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300';
    }
    if (role === 'commercial') {
      return 'border-violet-500/40 bg-violet-950/40 text-violet-300';
    }
    return 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300';
  };

  return (
    <header className="relative z-30 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-md">
      {/* Left: Brand + Active Incident + AOI */}
      <div className="flex items-center space-x-4">
        {/* Wordmark */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan-500/40 bg-cyan-950/50 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            <Radar className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-sm font-bold tracking-wider text-slate-100">TRITONTRACE</span>
              <span className="rounded bg-slate-800 px-1 py-0.2 font-mono text-[9px] font-semibold text-cyan-400">v2.0</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">MARITIME FORENSIC INTELLIGENCE</span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Active Incident Identifier */}
        <div className="hidden sm:flex items-center space-x-2 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">INCIDENT:</span>
          <span className="font-mono text-xs font-semibold text-cyan-400">{activeIncidentId}</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
          </span>
        </div>

        {/* AOI Location */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400">
          <Globe2 className="h-3.5 w-3.5 text-slate-500" />
          <span className="font-mono text-[11px] text-slate-300">Mediterranean Sea AOI</span>
          <span className="text-[10px] font-mono text-slate-500">(35.89°N, 14.51°E)</span>
        </div>
      </div>

      {/* Right: Engine Status + UTC Clock + Role Badge + Demo + Logout */}
      <div className="flex items-center space-x-3">
        {/* System & Engine Status */}
        <div className="hidden lg:flex items-center space-x-1.5 rounded border border-slate-800/80 bg-slate-900/50 px-2 py-0.5 font-mono text-[10px] text-slate-400">
          <Activity className="h-3 w-3 text-emerald-400" />
          <span className="text-slate-300 font-medium">SYS: ONLINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">GEO: READY</span>
        </div>

        {/* UTC Clock */}
        <div className="flex items-center space-x-1.5 rounded border border-slate-800 bg-slate-900/90 px-2.5 py-1 font-mono text-xs text-slate-200">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>{utcTime || '00:00:00 UTC'}</span>
        </div>

        {/* Active Role Badge */}
        <div className={`flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-xs font-medium font-mono ${getRoleBadgeClasses()}`}>
          {getRoleIcon()}
          <span>{roleDefinition?.badge || role?.toUpperCase()}</span>
        </div>

        {/* Demo Mode Toggle/Indicator */}
        {onToggleDemo && (
          <button
            type="button"
            onClick={onToggleDemo}
            className={`hidden sm:flex items-center space-x-1.5 rounded border px-2.5 py-1 text-xs font-mono transition ${
              demoMode
                ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>DEMO MODE</span>
          </button>
        )}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          title="Exit Session"
          className="flex items-center space-x-1.5 rounded-md border border-rose-500/30 bg-rose-950/20 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-900/40 hover:border-rose-500/50 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopHUD;
