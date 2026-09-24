export function FleetRadarPanel({ commercialFleet, selectedVesselId, onSelectVessel }) {
  return (
    <div className="absolute top-4 left-4 z-20 w-88 bg-white border border-slate-200 rounded-lg shadow-xl text-slate-900 flex flex-col max-h-[calc(100vh-14rem)]">
      {/* Fixed Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
        <h2 className="font-bold text-slate-800">COMMERCIAL FLEET RADAR</h2>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{commercialFleet.length} ASSETS</span>
      </div>

      {/* Scrollable List */}
      <div className="p-4 overflow-y-auto flex flex-col gap-3 flex-1 custom-scrollbar">
        {commercialFleet.map(vessel => (
          <div
            key={vessel.id}
            onClick={() => onSelectVessel(vessel.id)}
            className={`cursor-pointer p-3 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition ${selectedVesselId === vessel.id ? 'ring-2 ring-slate-400' : ''}`}
          >
            <div className="font-semibold">{vessel.name}</div>
            <div className="text-sm text-slate-600 flex justify-between mt-1">
              <span>{vessel.speed}</span>
              <span>{vessel.range}</span>
            </div>
            <div className={`mt-2 text-xs font-bold ${vessel.status === 'NORMAL' ? 'text-slate-500' : 'text-rose-600'}`}>
              {vessel.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
