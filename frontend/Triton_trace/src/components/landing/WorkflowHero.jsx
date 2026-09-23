import { ArrowRight, Radar, Satellite, Compass } from 'lucide-react';
import { LandingMapPreview } from './LandingMapPreview';

/**
 * WorkflowHero Component
 * Two-column desktop layout:
 * Left side: Eyebrow, headline, analytical summary, glowing 'Launch Portal' CTA.
 * Right side: LandingMapPreview geospatial visualization.
 */
export const WorkflowHero = ({ onLaunchPortal }) => {
  const handleLaunchClick = () => {
    console.log('Launch Portal clicked');
    if (onLaunchPortal) {
      onLaunchPortal();
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Intelligence Platform Overview */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 font-mono text-[11px] text-brand-600">
            <span className="flex h-1.5 w-1.5 rounded-full bg-brand-600 animate-ping" />
            <span className="font-semibold tracking-wider">MARITIME FORENSIC INTELLIGENCE</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Tracking Marine Oil Pollution From Orbit
          </h1>

          {/* Subcopy */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            TritonTrace combines Sentinel-1 dual-polarization C-SAR satellite imaging, a backward 
            Lagrangian hydrodynamic hindcast, and historical AIS transponder anomaly correlation to 
            pinpoint marine slick geometry, backtrack ocean drift, and identify candidate discharge vessels.
          </p>

          {/* Key Pipeline Badges */}
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 flex items-center space-x-1.5">
              <Satellite className="h-3 w-3 text-brand-600" />
              <span>Sentinel-1 SAR</span>
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 flex items-center space-x-1.5">
              <Compass className="h-3 w-3 text-emerald-600" />
              <span>Lagrangian Hindcast</span>
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 flex items-center space-x-1.5">
              <Radar className="h-3 w-3 text-rose-600" />
              <span>AIS Dark Shipping Analysis</span>
            </span>
          </div>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            {/* Flat Solid Launch Portal CTA */}
            <button
              type="button"
              id="launch-portal-cta"
              onClick={handleLaunchClick}
              className="relative inline-flex items-center justify-center space-x-2.5 rounded-md bg-brand-600 px-6 py-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-brand-500 active:bg-brand-700 cursor-pointer"
            >
              <span className="tracking-wide">Launch Portal</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Secondary Documentation Link */}
            <a
              href="#methodology"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors font-mono"
            >
              <span>View Methodology</span>
            </a>
          </div>

          {/* Operational AOI indicator */}
          <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span>PRIMARY AOI: MEDITERRANEAN SEA (FIXED v1 DEMONSTRATION)</span>
          </div>
        </div>

        {/* Right Column: SkyTruth Tactical Map Preview */}
        <div className="lg:col-span-6 w-full">
          <LandingMapPreview />
        </div>
      </div>
    </section>
  );
};

export default WorkflowHero;
