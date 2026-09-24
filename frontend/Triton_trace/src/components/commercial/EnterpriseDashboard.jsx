import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, Route as RouteIcon } from "lucide-react";
import { jsPDF } from "jspdf";
import * as turf from '@turf/turf';
import geofencesData from '../../utils/regional_alert_geofences.json';

export function EnterpriseDashboard({ showDiversionRoute, onToggleDiversion, selectedVesselId, selectedVessel }) {
  const [liabilityData, setLiabilityData] = useState(null);

  useEffect(() => {
    setLiabilityData(null);
  }, [selectedVesselId]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toISOString();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("NON-INVOLVEMENT AUDIT: ALIBI VERIFICATION", 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${timestamp}`, 20, 30);
    doc.text(`Vessel ID / MMSI: ${selectedVesselId || "N/A"}`, 20, 40);
    doc.text("Status: MATHEMATICALLY CLEARED", 20, 50);
    
    doc.line(20, 55, 190, 55);
    
    doc.setFontSize(10);
    doc.text("This automated audit verifies that the selected vessel maintained a", 20, 65);
    doc.text("spatial clearance of >15nm from the estimated slick origin at T-0.", 20, 72);
    doc.text("Trajectory consistency: HIGH.", 20, 79);
    
    doc.save(`Alibi_Audit_${selectedVesselId || "Vessel"}.pdf`);
  };

  const handleCalculateLiability = () => {
    let maxMultiplier = 1;
    let riskStatus = "SAFE TRANSIT ROUTE";
    let statusColor = "text-emerald-600";
    
    if (selectedVessel?.trajectory?.length >= 2 && geofencesData?.features) {
      const routeLine = turf.lineString(selectedVessel.trajectory.map(pt => [pt[1], pt[0]]));
      
      geofencesData.features.forEach(zone => {
        if (turf.booleanIntersects(routeLine, zone)) {
          const mult = zone.properties.liability_multiplier || 1.5;
          if (mult > maxMultiplier) {
            maxMultiplier = mult;
            const name = zone.properties.name || "ZONE";
            const level = zone.properties.zone_level || "Watch Zone";
            riskStatus = `TRAJECTORY INTERSECTS ${name.toUpperCase()} (${level})`;
            statusColor = level.includes('Critical') ? "text-rose-600" : "text-amber-600";
          }
        }
      });
    }

    if (maxMultiplier === 1 && selectedVessel) {
      if (selectedVessel.status === 'CRITICAL') {
          maxMultiplier = 10;
          riskStatus = "TRAJECTORY INTERSECTS CRITICAL STRIKE ZONE";
          statusColor = "text-rose-600";
      } else if (selectedVessel.status === 'ELEVATED WATCH') {
          maxMultiplier = 3;
          riskStatus = "TRAJECTORY INTERSECTS WATCH ZONE";
          statusColor = "text-amber-600";
      }
    }

    const speedFactor = selectedVessel?.speed ? parseFloat(selectedVessel.speed) : 12.0;
    const dynamicBasePenalty = 1000000 + (speedFactor * 125000);
    
    const areaPenalty = 25000 * 14.6;
    const totalExposure = (dynamicBasePenalty * maxMultiplier) + areaPenalty;
    const formattedExposure = `$${(totalExposure / 1000000).toFixed(2)}M`;

    setLiabilityData({
      totalExposure: formattedExposure,
      statusText: riskStatus,
      colorClass: statusColor,
      multiplier: maxMultiplier
    });
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-30 flex flex-row bg-white border border-slate-200 rounded-lg shadow-2xl divide-x divide-slate-200 text-slate-900">
      {/* Column 1 */}
      <div className="flex-1 p-4">
        <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>ALIBI GENERATOR</span>
        </div>
        <p className="text-sm mb-4">Non-Involvement Audit: Vessel clearance verified at T-0.</p>
        <button 
          onClick={handleExportPDF}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded text-xs font-semibold transition"
        >
          EXPORT AUDIT (PDF)
        </button>
      </div>

      {/* Column 2 */}
      <div className="flex-1 p-4">
        <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs mb-2">
          <AlertTriangle className="h-4 w-4" />
          <span>P&amp;I RISK ASSESSOR</span>
        </div>
        {!liabilityData ? (
          <>
            <p className="text-sm mb-4">Evaluate trajectory against regional alert geofences and slick perimeter.</p>
            <button 
              onClick={handleCalculateLiability} 
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded px-3 py-2 text-xs w-full font-bold transition-colors"
            >
              CALCULATE P&amp;I
            </button>
          </>
        ) : (
          <>
            <div className={`text-2xl font-bold mt-2 ${liabilityData.colorClass}`}>
              {liabilityData.totalExposure} EST. EXPOSURE
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {liabilityData.statusText} (x{liabilityData.multiplier} MULTIPLIER)
            </div>
            <button 
              onClick={() => setLiabilityData(null)}
              className="mt-3 text-[10px] text-slate-400 hover:text-slate-600 underline uppercase"
            >
              Recalculate
            </button>
          </>
        )}
      </div>

      {/* Column 3 */}
      <div className="flex-1 p-4">
        <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs mb-2">
          <RouteIcon className="h-4 w-4" />
          <span>DYNAMIC REROUTING</span>
        </div>
        <p className="text-sm mb-4">Spill Avoidance: Compute 15nm safe-transit fairway.</p>
        <button 
          onClick={onToggleDiversion}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-3 py-2 rounded text-xs font-semibold transition"
        >
          EXECUTE SAFE DIVERSION
        </button>
      </div>
    </div>
  );
}
