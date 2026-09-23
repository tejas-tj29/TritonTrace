import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  Lock,
  X,
} from "lucide-react";

export const DossierModal = ({ isOpen, onClose, incidentData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = {
        caseId: incidentData?.id || "UNASSIGNED",
        timestamp: incidentData?.createdAt || new Date().toISOString(),
        satelliteData: {
          sensor: "Sentinel-1",
          polarization: "VV/VH",
          backscatter: "-22.4 dB",
        },
        aisSuspect: {
          mmsi: "235088000",
          name: "NORDIC EXPLORER",
          confidence: 96.4,
        },
        chainOfCustody: { locked: true, signature: "0x3fA...bC4" },
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dossier_${incidentData?.id || "new"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 800);
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
              Case File: {incidentData?.id || "UNASSIGNED"}
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
                <strong className="text-slate-900">Sensor:</strong> Sentinel-1
                SAR
              </div>
              <div>
                <strong className="text-slate-900">Polarization:</strong> VV/VH
              </div>
              <div>
                <strong className="text-slate-900">Backscatter:</strong> -22.4
                dB
              </div>
              <div>
                <strong className="text-slate-900">Est. Slick Area:</strong> 4.2
                km²
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
              2. HINDCAST ORIGIN
            </span>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 shadow-sm leading-relaxed">
              <div>
                <strong className="text-slate-900">Target Origin:</strong>{" "}
                31.85°N, 28.25°E
              </div>
              <div>
                <strong className="text-slate-900">Drift Duration:</strong> 14.5
                Hours
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">
              3. AIS SUSPECT PROFILE
            </span>
            <div className="bg-rose-50 p-3 rounded-md border border-rose-200 text-rose-900 shadow-sm leading-relaxed">
              <div>
                <strong className="text-rose-700">Vessel:</strong> MT PACIFIC
                CROWN — PANAMA
              </div>
              <div>
                <strong className="text-rose-700">IMO/MMSI:</strong> 9481234 /
                352001928
              </div>
              <div>
                <strong className="text-rose-700">CPA:</strong> 0.42 nm @ 18:22
                UTC
              </div>
            </div>
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
