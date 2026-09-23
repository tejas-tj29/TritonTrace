export default function Footer() {
  return (
    <footer id="disclaimer" className="w-full border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 mt-auto">
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
  );
}
