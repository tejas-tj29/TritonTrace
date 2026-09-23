export const WorkflowHero = ({ onLaunchPortal }) => {
  return (
    <div className="w-full bg-white border-b border-slate-200 py-16 md:py-24 lg:py-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Cerulean's "product-header-2-col" equivalent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column (Heading) */}
          <div className="lg:col-span-5">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 m-0 leading-none">
              Triton<span className="text-brand-600">Trace</span>
            </h1>
          </div>

          {/* Right Column (Description & Button) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 lg:pt-4">
            
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl">
              An end-to-end automated platform that uses AI, satellite SAR imagery, and oceanographic modeling to expose chronic marine oil pollution and attribute it to suspect vessels.
            </p>
            
            {/* Cerulean's "outline-dark" button with the exact SVG arrow */}
            <button 
              onClick={onLaunchPortal}
              className="group inline-flex items-center gap-3 px-6 py-3.5 border-2 border-slate-900 text-slate-900 text-sm font-bold tracking-wide rounded hover:bg-slate-900 hover:text-white transition-all duration-300"
            >
              <span>Launch TritonTrace</span>
              
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 18 14" 
                fill="none" 
                className="w-5 h-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <circle cx="1" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="4" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="7" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="10" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="13" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="13" cy="11" r="1" fill="currentColor"></circle>
                <circle cx="11" cy="13" r="1" fill="currentColor"></circle>
                <circle cx="11" cy="1" r="1" fill="currentColor"></circle>
                <circle cx="13" cy="3" r="1" fill="currentColor"></circle>
                <circle cx="15" cy="5" r="1" fill="currentColor"></circle>
                <circle cx="17" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="15" cy="9" r="1" fill="currentColor"></circle>
              </svg>
            </button>
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WorkflowHero;