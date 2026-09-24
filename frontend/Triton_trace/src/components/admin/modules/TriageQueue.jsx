import { useState } from "react";
import { useIncident } from "../../../context/IncidentContext";
import { mockHistoricalIncidents } from "../../../utils/mockData";
import { DossierModal } from "./DossierModal";
import {
  FastForward,
  Download,
  Target,
  FileText,
} from "lucide-react";

const getInitialReports = () => {
  const formatted = mockHistoricalIncidents.map((inc) => ({
    id: inc.incident_id,
    createdAt: inc.detection_timestamp,
    status:
      inc.status === "under_investigation"
        ? "UNDER_REVIEW"
        : inc.status.toUpperCase(),
    lat: inc.coordinates.lat,
    lon: inc.coordinates.lon,
    spillType:
      inc.source_type === "satellite_detected"
        ? "SAR Detection"
        : "Field Report",
  }));

  return formatted.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
};

export const TriageQueue = () => {
  const [reports, setReports] = useState(getInitialReports);
  const {
    activeIncident,
    setActiveIncident,
    setPanToCoordinate,
    setActiveAnalysisMode,
    activeAnalysisMode,
  } = useIncident();
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const handleUpdateStatus = (e, reportId, newStatus) => {
    e.stopPropagation();
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
    );
  };

  const handleCardClick = (report) => {
    if (activeIncident === report.id) {
      setActiveIncident(null);
      setActiveAnalysisMode("none");
    } else {
      setActiveIncident(report.id);
      setActiveAnalysisMode("none");
      if (report.lat && report.lon) {
        setPanToCoordinate({
          lat: parseFloat(report.lat),
          lon: parseFloat(report.lon),
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
            VERIFIED
          </span>
        );
      case "FALSE_POSITIVE":
        return (
          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold">
            FALSE POSITIVE
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">
            UNDER REVIEW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4 font-sans text-left">
      <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
        Incident Triage Queue
      </h2>

      {reports.length === 0 ? (
        <div className="text-center p-6 bg-slate-50 rounded-md border border-dashed border-slate-300 text-slate-500 text-xs font-mono">
          NO PENDING INCIDENTS
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => {
            const isExpanded = activeIncident === report.id;

            return (
              <div
                key={report.id}
                className={`flex flex-col bg-white transition-all cursor-pointer overflow-hidden ${
                  isExpanded
                    ? "border border-brand-400 shadow-md rounded-lg ring-1 ring-brand-400/20"
                    : "border border-slate-200 rounded-md hover:border-slate-300 shadow-sm"
                }`}
                onClick={() => handleCardClick(report)}
              >
                {/* Compact Header */}
                <div
                  className={`flex justify-between items-start p-3 ${isExpanded ? "bg-brand-50/50" : "bg-white"}`}
                >
                  <div className="flex flex-col text-left">
                    <span
                      className={`${isExpanded ? "text-brand-700" : "text-slate-900"} font-mono font-bold text-xs transition-colors`}
                    >
                      {report.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="flex flex-col px-3 pb-3 border-t border-slate-100 mt-1 pt-3 animate-in fade-in duration-200 text-left">
                    {/* Status Modifiers */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={(e) => handleUpdateStatus(e, report.id, "VERIFIED")}
                        className="flex-1 py-1.5 flex justify-center items-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold transition-colors shadow-sm"
                      >
                        VERIFY
                      </button>
                      <button
                        onClick={(e) => handleUpdateStatus(e, report.id, "FALSE_POSITIVE")}
                        className="flex-1 py-1.5 flex justify-center items-center bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded text-[10px] font-bold transition-colors shadow-sm"
                      >
                        FLAG
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold">
                          COORDINATES
                        </span>
                        <span className="text-[10px] text-slate-900 font-mono font-medium">
                          {report.lat
                            ? `${parseFloat(report.lat).toFixed(3)}, ${parseFloat(report.lon).toFixed(3)}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold">
                          TYPE
                        </span>
                        <span className="text-[10px] text-slate-900 font-mono font-medium truncate">
                          {report.spillType || "UNKNOWN"}
                        </span>
                      </div>
                    </div>

                    {/* Mission Command Actions */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider mb-1">
                        MISSION COMMAND
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAnalysisMode("attribution");
                        }}
                        className={`flex flex-col items-start p-2.5 rounded-md border transition-all ${
                          activeAnalysisMode === "attribution"
                            ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[11px] font-bold tracking-wider">
                          <Target className="w-4 h-4" /> RUN ATTRIBUTION
                        </div>
                        <span className="text-[10px] text-slate-500 text-left leading-tight">
                          Initiates backward hindcast trajectory and AIS vessel
                          correlation.
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAnalysisMode("forward_track");
                        }}
                        className={`flex flex-col items-start p-2.5 rounded-md border transition-all ${
                          activeAnalysisMode === "forward_track"
                            ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[11px] font-bold tracking-wider">
                          <FastForward className="w-4 h-4" /> FORWARD TRACK
                        </div>
                        <span className="text-[10px] text-slate-500 text-left leading-tight">
                          Simulates forward propagation to identify coastal
                          impact zones.
                        </span>
                      </button>

                      <div className="w-full h-px bg-slate-100 my-2"></div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDossierOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold tracking-wider transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" /> DOSSIER
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDossierOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-[10px] font-bold tracking-wider transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" /> EXPORT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        incidentData={
          reports.find((r) => r.id === activeIncident) || {
            id: activeIncident || "Med-Spill-017",
            createdAt: new Date().toISOString(),
            status: "UNDER_REVIEW",
            lat: 32.5,
            lon: 33.1,
            spillType: "SAR Detection",
          }
        }
      />
    </div>
  );
};

