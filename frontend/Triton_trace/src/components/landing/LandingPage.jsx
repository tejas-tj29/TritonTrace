import { 
  Radar, 
  Satellite, 
  Waves, 
  Ship, 
  ArrowRight, 
  ShieldAlert, 
  ExternalLink,
  Database,
  Globe2,
  FileCheck2,
  Lock
} from 'lucide-react';
import { WorkflowHero } from './WorkflowHero';
import { LiveStatsBar } from './LiveStatsBar';

/**
 * LandingPage Component (Phase 1 — Public Landing Experience)
 * SkyTruth Cerulean visual aesthetics:
 * - Top operational navigation bar
 * - Two-column WorkflowHero (Hero copy + LandingMapPreview)
 * - 4 LiveStatsBar telemetry tiles
 * - 3-stage workflow strip (SAR Detection ➔ Lagrangian Hindcast ➔ AIS Correlation)
 * - Data source credits strip & operational footer
 */
export const LandingPage = () => {
  const handleLaunchPortal = () => {
    console.log('Launch Portal clicked');
  };

  const workflowStages = [
    {
      step: '01',
      title: 'SAR Detection & Segmentation',
      shortName: 'SAR DETECTION',
      icon: Satellite,
      accent: 'cyan',
      description: 'Sentinel-1 dual-polarization (VV/VH) radar scans suppress ocean clutter to segment dark oil slick contours, computing area, perimeter, and elongation ratio.',
      source: 'COPERNICUS SENTINEL-1 C-SAR'
    },
    {
      step: '02',
      title: 'Lagrangian Drift Hindcast',
      shortName: 'LAGRANGIAN HINDCAST',
      icon: Waves,
      accent: 'emerald',
      description: 'Backward 12-hour numerical simulation backtracks slick displacement using CMEMS ocean currents and wind leeway vectors (α = 0.03) to project the spatiotemporal discharge origin.',
      source: 'CMEMS / HYCOM CURRENT + WIND'
    },
    {
      step: '03',
      title: 'AIS Anomaly Correlation',
      shortName: 'AIS CORRELATION',
      icon: Ship,
      accent: 'rose',
      description: 'Cross-examines origin release window against historical vessel trajectories, identifying loitering maneuvers, sharp SOG drops, and dark shipping transponder gaps.',
      source: 'MARINE CADASTRE / AIS TELEMETRY'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Tactical Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-brand-200 bg-brand-50 text-brand-600">
              <Radar className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold tracking-widest text-slate-900">TRITONTRACE</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-brand-600 border border-slate-200">v2.0</span>
              </div>
              <span className="text-[10px] text-slate-500 tracking-tight font-mono hidden sm:inline">
                SATELLITE GROUND FORENSICS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-mono text-slate-600">
            <a href="#overview" className="hover:text-brand-600 transition">Overview</a>
            <a href="#workflow" className="hover:text-brand-600 transition">3-Stage Workflow</a>
            <a href="#sources" className="hover:text-brand-600 transition">Data Sources</a>
            <a href="#disclaimer" className="hover:text-brand-600 transition">Limitations</a>
          </nav>

          {/* Action / Launch Portal CTA */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-1.5 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-mono text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
              <span>MEDITERRANEAN AOI ONLINE</span>
            </div>

            <button
              type="button"
              onClick={handleLaunchPortal}
              className="inline-flex items-center space-x-2 rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition cursor-pointer"
            >
              <span>Launch Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div id="overview" className="bg-white border-b border-slate-200">
          <WorkflowHero onLaunchPortal={handleLaunchPortal} />
        </div>

        {/* Live Stats Telemetry Bar */}
        <LiveStatsBar />

        {/* 3-Stage Connected Workflow Section */}
        <section id="workflow" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 font-mono text-[10px] text-brand-600 mb-3">
              <span>END-TO-END MARITIME ATTRIBUTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Three-Stage Forensic Pipeline
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              From raw SAR backscatter suppression to backward drift physics and AIS transponder correlation.
            </p>
          </div>

          {/* Workflow Stage Cards connected by arrows */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {workflowStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div 
                  key={stage.step}
                  className="relative rounded-md border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 transition"
                >
                  <div>
                    {/* Header: Stage Number + Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                        STAGE {stage.step}
                      </span>
                      <div className={`p-2 rounded-md border ${
                        stage.accent === 'cyan' 
                          ? 'border-brand-200 bg-brand-50 text-brand-600' 
                          : stage.accent === 'emerald'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : 'border-rose-200 bg-rose-50 text-rose-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-2">
                      {stage.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  {/* Stage Source Badge */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">DATA FEED:</span>
                    <span className={`font-semibold ${
                      stage.accent === 'cyan' ? 'text-brand-600' : stage.accent === 'emerald' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {stage.source}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Data Source Strip */}
        <section id="sources" className="w-full border-y border-slate-200 bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-brand-600 shrink-0" />
                <div>
                  <h4 className="font-mono text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    INTEGRATED GEOSPATIAL DATA STREAMS
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Demonstration environment calibrated with real-world oceanographic & satellite inputs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono">
                <span className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                  Copernicus Sentinel-1 C-SAR
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                  CMEMS Physical Ocean Analysis
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                  Marine Cadastre Historical AIS
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                  NOAA GFS Surface Winds
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Operational Footer */}
      <footer id="disclaimer" className="w-full border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-900">TRITONTRACE</span>
            <span>·</span>
            <span>Marine Oil Spill Forensic Intelligence Console</span>
          </div>

          <div className="text-center md:text-right max-w-xl text-[11px] text-slate-500 leading-normal">
            Demonstration analytical platform. Trajectory backcasts and correlation matrices are simulated models 
            for operational intelligence and do not constitute legal determinations of culpability.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
