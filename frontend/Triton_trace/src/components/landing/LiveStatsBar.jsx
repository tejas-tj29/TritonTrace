import { mockIncident, mockAISVessels } from '../../utils/mockData';
import { 
  Layers, 
  Clock, 
  ShieldCheck, 
  Ship,
  TrendingUp,
  Activity
} from 'lucide-react';

/**
 * LiveStatsBar Component
 * Renders 4 compact telemetry metric tiles populated directly from mockData.js:
 * 1. Area Segmented (slick_area_sqkm)
 * 2. Hindcast Horizon (hindcast window / estimated age)
 * 3. Classification Confidence (analytical score)
 * 4. Vessels Correlated (candidate AIS matches)
 */
export const LiveStatsBar = () => {
  const stats = [
    {
      id: 'area-segmented',
      label: 'AREA SEGMENTED',
      value: `${mockIncident.slick_area_sqkm} km²`,
      sublabel: `Perimeter: ${mockIncident.perimeter_km} km`,
      provenance: 'Sentinel-1 Dual-Pol SAR',
      icon: Layers,
      accent: 'text-brand-600',
      badgeClass: 'border-brand-200 bg-brand-50 text-brand-600'
    },
    {
      id: 'hindcast-horizon',
      label: 'HINDCAST HORIZON',
      value: '12.0 hrs',
      sublabel: `Est. Age: ${mockIncident.estimated_age_hours} hrs`,
      provenance: 'Lagrangian 3% Wind Leeway',
      icon: Clock,
      accent: 'text-emerald-600',
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-600'
    },
    {
      id: 'classification-confidence',
      label: 'ANALYTICAL CONFIDENCE',
      value: '94.2%',
      sublabel: `Backscatter: ${mockIncident.metocean.radar_backscatter_db} dB`,
      provenance: 'Petroleum Class-1 Verified',
      icon: ShieldCheck,
      accent: 'text-amber-600',
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-600'
    },
    {
      id: 'vessels-correlated',
      label: 'VESSELS CORRELATED',
      value: `${mockAISVessels.length} Candidates`,
      sublabel: `${mockAISVessels[0].vessel_name} (High)`,
      provenance: 'AIS Spatiotemporal Matrix',
      icon: Ship,
      accent: 'text-rose-600',
      badgeClass: 'border-rose-200 bg-rose-50 text-rose-600'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-brand-600" />
            <h2 className="font-mono text-xs font-bold tracking-wider text-slate-800">
              OPERATIONAL TELEMETRY READOUTS · MEDITERRANEAN AOI
            </h2>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">
            INCIDENT: {mockIncident.incident_id}
          </span>
        </div>

        {/* 4 Metric Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500">
                    {item.label}
                  </span>
                  <div className={`p-1.5 rounded border ${item.badgeClass}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="mt-2 flex items-baseline space-x-2">
                  <span className={`font-mono text-2xl font-bold tracking-tight ${item.accent}`}>
                    {item.value}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-700 font-medium">{item.sublabel}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>METHOD</span>
                  <span className="text-slate-600 font-medium">{item.provenance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LiveStatsBar;
