import { useState, useRef } from "react";
import { UploadCloud, RotateCcw, Activity } from "lucide-react";

export const SpillClassifier = () => {
  const [customImage, setCustomImage] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const [metrics, setMetrics] = useState({
    backscatter: "-22.4",
    confidence: "94.2",
    area: "14.6",
    flash: false,
  });

  const handleFileUpload = (e) => {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image/jpeg")) {
      setUploadError("INVALID ASSET: REQUIRES JPEG / JPG");
      e.target.value = "";
      return;
    }

    setIsProcessing(true);
    setMetrics((prev) => ({ ...prev, flash: false }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        setCustomImage(event.target.result);
        setImageMeta({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
        });
        setIsProcessing(false);
        setMetrics({
          backscatter: (-20 - Math.random() * 5).toFixed(1),
          confidence: (85 + Math.random() * 14).toFixed(1),
          area: (10 + Math.random() * 10).toFixed(1),
          flash: true,
        });
      }, 1500);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setCustomImage(null);
    setImageMeta(null);
    setUploadError("");
    setMetrics({
      backscatter: "-22.4",
      confidence: "94.2",
      area: "14.6",
      flash: false,
    });
  };

  return (
    <div className="flex flex-col gap-4 font-sans pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
          SAR Classifier
        </h2>
        {customImage && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/jpeg, .jpg"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex justify-center items-center gap-2 w-full py-2.5 bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50 rounded-md text-xs font-bold text-slate-700 transition-all shadow-sm disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4 text-brand-600" /> UPLOAD SAR CAPTURE
          (JPEG)
        </button>
        {uploadError && (
          <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded">
            {uploadError}
          </div>
        )}
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="relative bg-slate-900">
          <img
            src={customImage || "/oil_spill.jpg"}
            alt="SAR Target"
            className={`w-full h-44 md:h-48 object-cover mix-blend-screen transition-opacity ${isProcessing ? "opacity-30" : "opacity-80"}`}
          />
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <Activity className="w-6 h-6 text-brand-600 animate-pulse mb-2" />
              <div className="text-[10px] font-bold text-brand-700 tracking-widest uppercase animate-pulse">
                Processing Matrices...
              </div>
            </div>
          )}
        </div>

        {customImage && imageMeta && !isProcessing && (
          <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-slate-50">
            <span className="text-[10px] font-mono font-bold text-slate-600 truncate">
              {imageMeta.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {imageMeta.size}
            </span>
          </div>
        )}

        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider">
              CLASSIFICATION
            </span>
            <span
              className={`px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded ${metrics.flash ? "animate-pulse" : ""}`}
            >
              PETROLEUM-LIKE — CLASS 1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            {[
              { label: "POLARIZATION", val: "VV/VH" },
              { label: "WIND VELOCITY", val: "4.2 m/s" },
              { label: "WIND DIR.", val: "284° WNW" },
              {
                label: "BACKSCATTER",
                val: `${metrics.backscatter} dB`,
                highlight: metrics.flash,
              },
              {
                label: "SLICK AREA",
                val: `${metrics.area} km²`,
                highlight: metrics.flash,
              },
              {
                label: "CONFIDENCE",
                val: `${metrics.confidence}%`,
                highlight: metrics.flash,
                emerald: true,
              },
            ].map((m, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 p-2 bg-slate-50 rounded border border-slate-100"
              >
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                  {m.label}
                </span>
                <span
                  className={`font-mono font-bold text-xs ${m.highlight ? (m.emerald ? "text-emerald-600" : "text-brand-600") : "text-slate-700"}`}
                >
                  {m.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
