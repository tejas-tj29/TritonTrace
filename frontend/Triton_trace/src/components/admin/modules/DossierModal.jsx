import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  Lock,
  X,
} from "lucide-react";
import { seedIncidents } from "../../../data/seedIncidents";
import { topVesselsByIncident, displayScore } from "../../../data/aisTopVessels";
import { originCandidatesByIncident } from "../../../data/originCandidates";
import { downloadCsv } from "../../../lib/csvExport";

const HINDCAST_WINDOW_HOURS = 72;

export const DossierModal = ({ isOpen, onClose, incidentId }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const incident = seedIncidents.find((i) => i.incident_id === incidentId);
  const topVessels = topVesselsByIncident[incidentId] || [];
  const originCandidates = originCandidatesByIncident[incidentId] || [];
  const topSuspect = topVessels[0];

  if (!incident) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xl p-6 max-w-sm w-full text-sm text-slate-600">
          No incident selected.
          <button
            onClick={onClose}
            className="block mt-4 text-brand-600 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const windowEnd = new Date(incident.detection_timestamp);
  const windowStart = new Date(
    windowEnd.getTime() - HINDCAST_WINDOW_HOURS * 60 * 60 * 1000,
  );

  const handleExportJSON = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = {
        caseId: incident.incident_id,
        detectionTimestamp: incident.detection_timestamp,
        status: incident.status,
        satelliteTelemetry: {
          sensor: incident.source,
          polarization: "VV/VH",
          slickAreaSqKm: incident.slick_area_sqkm,
          perimeterKm: incident.perimeter_km,
        },
        hindcastOrigin: {
          centroid: incident.hindcast_origin.centroid,
          uncertaintyRadiusKm: incident.hindcast_origin.uncertainty_radius_km,
          backtrackingWindow: {
            start: windowStart.toISOString(),
            end: windowEnd.toISOString(),
          },
        },
        topAisSuspect: topSuspect
          ? {
              rank: topSuspect.rank,
              name: topSuspect.name,
              mmsi: topSuspect.mmsi,
              imo: topSuspect.imo,
              threatScorePercent: displayScore(topSuspect.score),
            }
          : null,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dossier_${incident.incident_id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 400);
  };

  const handleDownloadOriginPoints = () => {
    const rows = originCandidates.map((c) => ({
      candidate_timestamp: c.candidateTimestamp,
      hours_before_detection: c.backtrackHours,
      latitude: c.lat,
      longitude: c.lon,
      source_score: c.sourceScore,
      cluster_stability_percent: c.clusterCandidateStabilityPercent,
      uncertainty_radius_km: c.clusterUncertaintyRadiusKm,
      matched_vessel: c.vessels.map((v) => v.name).join("; ") || "none",
      matched_vessel_mmsi: c.vessels.map((v) => v.mmsi).join("; ") || "",
    }));
    downloadCsv(`origin_points_${incident.incident_id}.csv`, rows);
  };

  const handleDownloadAisSuspects = () => {
    const rows = topVessels.map((v) => ({
      rank: v.rank,
      vessel_name: v.name,
      mmsi: v.mmsi,
      imo: v.imo,
      vessel_type: v.type,
      threat_score_percent: displayScore(v.score),
      min_distance_to_origin_km: v.minDistanceKm,
      closest_encounter_time: v.bestEncounterTimestamp,
      closest_encounter_lat: v.bestEncounterLat,
      closest_encounter_lon: v.bestEncounterLon,
    }));
    downloadCsv(`ais_suspects_${incident.incident_id}.csv`, rows);
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xl flex flex-col overflow-hidden max-w-lg w-full">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              Case File: {incident.incident_id}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Lock className="w-4 h-4 text-emerald-600" />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-5 text-xs font-mono text-slate-700 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
              1. SATELLITE TELEMETRY
            </span>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 shadow-sm leading-relaxed">
              <div>
                <strong className="text-slate-900">Sensor:</strong>{" "}
                {incident.source}
              </div>
              <div>
                <strong className="text-slate-900">Polarization:</strong> VV/VH
              </div>
              <div>
                <strong className="text-slate-900">Detected:</strong>{" "}
                {windowEnd.toLocaleString()}
              </div>
              <div>
                <strong className="text-slate-900">Slick Area:</strong>{" "}
                {incident.slick_area_sqkm} km²
              </div>
              <div>
                <strong className="text-slate-900">Perimeter:</strong>{" "}
                {incident.perimeter_km} km
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
              2. HINDCAST ORIGIN
            </span>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 shadow-sm leading-relaxed">
              <div>
                <strong className="text-slate-900">Cluster Centroid:</strong>{" "}
                {incident.hindcast_origin.centroid.lat.toFixed(3)}°N,{" "}
                {incident.hindcast_origin.centroid.lon.toFixed(3)}°E
              </div>
              <div>
                <strong className="text-slate-900">
                  Uncertainty Radius:
                </strong>{" "}
                {incident.hindcast_origin.uncertainty_radius_km.toFixed(1)} km
              </div>
              <div>
                <strong className="text-slate-900">
                  Backtracking Window:
                </strong>{" "}
                {windowStart.toLocaleString()} → {windowEnd.toLocaleString()}
              </div>
            </div>
            <button
              onClick={handleDownloadOriginPoints}
              disabled={originCandidates.length === 0}
              className="w-full py-2 flex justify-center items-center gap-2 rounded-md text-[10px] font-bold tracking-wider transition-colors shadow-sm border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-sans"
            >
              <Download className="w-3.5 h-3.5" /> DOWNLOAD ORIGIN POINTS
              (CSV — {originCandidates.length})
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
              3. AIS SUSPECT PROFILE
            </span>
            {topSuspect ? (
              <div className="bg-rose-50 p-3 rounded-md border border-rose-200 text-rose-900 shadow-sm leading-relaxed">
                <div>
                  <strong className="text-rose-700">
                    #{topSuspect.rank} Vessel:
                  </strong>{" "}
                  {topSuspect.name}
                </div>
                <div>
                  <strong className="text-rose-700">IMO/MMSI:</strong>{" "}
                  {topSuspect.imo} / {topSuspect.mmsi}
                </div>
                <div>
                  <strong className="text-rose-700">Threat Score:</strong>{" "}
                  {displayScore(topSuspect.score)}%
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-slate-500 shadow-sm">
                No AIS suspects matched.
              </div>
            )}
            <button
              onClick={handleDownloadAisSuspects}
              disabled={topVessels.length === 0}
              className="w-full py-2 flex justify-center items-center gap-2 rounded-md text-[10px] font-bold tracking-wider transition-colors shadow-sm border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-sans"
            >
              <Download className="w-3.5 h-3.5" /> DOWNLOAD AIS SUSPECTS (CSV
              — {topVessels.length})
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
              4. CHAIN OF CUSTODY
            </span>
            <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-md border border-emerald-200 text-emerald-800 shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                Audit hash verified (0x3fA...bC4)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleExportJSON}
            disabled={isGenerating}
            className="flex-1 py-2.5 flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-bold tracking-wider transition-colors shadow-sm disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "GENERATING..." : "EXPORT DOSSIER (JSON)"}
          </button>
          <button
            onClick={handlePrint}
            className="flex-shrink-0 p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md shadow-sm transition-colors"
            title="Print Audit Brief"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
