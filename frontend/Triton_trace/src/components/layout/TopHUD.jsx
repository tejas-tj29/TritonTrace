import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const TopHUD = ({ activeIncidentId = 'Med-Spill-017', demoMode = false, onToggleDemo, engine = 'leaflet' }) => {
  const { role, user, logout, roleDefinition } = useAuth();
  const navigate = useNavigate();
  const [utcTime, setUtcTime] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
      return 'border-brand-200 bg-brand-50 text-brand-700';
    }
    if (role === 'commercial') {
      return 'border-violet-200 bg-violet-50 text-violet-700';
    }
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  };

  return (
    <header className="relative z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm select-none text-slate-900">
      {/* Left: Brand + Active Incident + AOI */}
      <div className="flex items-center space-x-4">
        {/* Wordmark */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-brand-200 bg-brand-50 text-brand-600">
            <Radar className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-sm font-bold tracking-wider text-slate-900">TRITONTRACE</span>
              <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] font-semibold text-brand-600 border border-slate-200">v2.0</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">MARITIME FORENSIC INTELLIGENCE</span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Active Incident Identifier */}
        <div className="hidden sm:flex items-center space-x-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">INCIDENT:</span>
          <span className="font-mono text-xs font-bold text-brand-600">{activeIncidentId}</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
          </span>
        </div>

        {/* AOI Location */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500">
          <Globe2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-mono text-[11px] text-slate-700 font-medium">Eastern Mediterranean AOI</span>
          <span className="text-[10px] font-mono text-slate-400">(31.35°N, 31.69°E)</span>
        </div>
      </div>

      {/* Right: Engine Status + UTC Clock + Role Badge + Demo + Logout */}
      <div className="flex items-center space-x-3">
        {/* System & Engine Status */}
        <div className="hidden lg:flex items-center space-x-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-600">
          <Activity className="h-3 w-3 text-emerald-600" />
          <span className="text-slate-800 font-semibold">SYS: ONLINE</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 uppercase">GEO: {engine}</span>
        </div>

        {/* UTC Clock */}
        <div className="flex items-center space-x-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-800">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span className="font-semibold">{utcTime || '00:00:00 UTC'}</span>
        </div>

        {/* Active Role Badge */}
        <div className={`flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-mono ${getRoleBadgeClasses()}`}>
          {getRoleIcon()}
          <span>{roleDefinition?.badge || role?.toUpperCase()}</span>
        </div>

        {/* Demo Mode Toggle/Indicator */}
        {onToggleDemo && (
          <button
            type="button"
            onClick={onToggleDemo}
            className={`hidden sm:flex items-center space-x-1.5 rounded border px-2.5 py-1 text-xs font-mono font-medium transition cursor-pointer ${
              demoMode
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>DEMO MODE</span>
          </button>
        )}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-600" />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title="Exit Session"
          className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-rose-600 transition cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-semibold">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopHUD;
