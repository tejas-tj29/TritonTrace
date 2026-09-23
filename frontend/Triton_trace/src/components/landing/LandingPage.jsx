import { useState } from "react";
import { WorkflowHero } from "./WorkflowHero";
import { LiveStatsBar } from "./LiveStatsBar";
import { AuthModal } from "../auth/AuthModal";

export const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLaunchPortal = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col font-sans antialiased overflow-x-hidden">
      {/* 1. Hero Section (Includes Map Preview) */}
      <section id="overview" className="bg-white border-b border-slate-200">
        <WorkflowHero onLaunchPortal={handleLaunchPortal} />
      </section>

      <div className="w-full h-75 md:h-112.5 lg:h-150 overflow-hidden border-y border-slate-200">
        <img
          src="/oilspill.jpg" /* <-- Change this to your exact file name */
          alt="Marine environment"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* 2. Live Stats Telemetry Bar */}
      <LiveStatsBar />

      {/* 3. 3-Stage Connected Workflow Section */}
      <section
        id="workflow"
        className="w-full bg-slate-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 font-mono text-[10px] text-brand-600 mb-4">
            <span>END-TO-END MARITIME ATTRIBUTION</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            From raw SAR backscatter suppression to backward drift physics and
            AIS transponder correlation.
          </p>
        </div>
      </section>

      {/* 4. Data Source Strip */}
      <section
        id="sources"
        className="w-full border-t border-slate-200 bg-white py-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3 text-center md:text-left">
              <div>
                <h4 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
                  INTEGRATED GEOSPATIAL DATA STREAMS
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Demonstration environment calibrated with real-world
                  oceanographic & satellite inputs.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 sm:gap-3 text-[11px] font-mono font-medium">
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

      {/* 5. Role Gateway & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
