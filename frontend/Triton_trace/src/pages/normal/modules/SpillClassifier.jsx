import React, { useState, useRef } from 'react';
import { UploadCloud, RotateCcw, Activity } from 'lucide-react';

export const SpillClassifier = () => {
  const [customImage, setCustomImage] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Dynamic metrics based on default or custom image
  const [metrics, setMetrics] = useState({
    backscatter: '-22.4',
    confidence: '94.2',
    area: '14.6',
    flash: false
  });

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/jpeg') && !file.name.match(/\.jpe?g$/i)) {
      setUploadError('INVALID ASSET: SAR CLASSIFIER REQUIRES JPEG / JPG');
      e.target.value = '';
      return;
    }

    setIsProcessing(true);
    setMetrics(prev => ({ ...prev, flash: false }));

    const reader = new FileReader();
    reader.onload = (event) => {
      // Simulate 1.5s processing sequence
      setTimeout(() => {
        setCustomImage(event.target.result);
        setImageMeta({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });
        setIsProcessing(false);
        // Randomize some metrics to simulate analysis
        setMetrics({
          backscatter: (-20 - Math.random() * 5).toFixed(1),
          confidence: (85 + Math.random() * 14).toFixed(1),
          area: (10 + Math.random() * 10).toFixed(1),
          flash: true
        });
      }, 1500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReset = () => {
    setCustomImage(null);
    setImageMeta(null);
    setUploadError('');
    setMetrics({
      backscatter: '-22.4',
      confidence: '94.2',
      area: '14.6',
      flash: false
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Spill Classifier</h2>
        {customImage && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Default
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input 
          type="file" 
          accept="image/jpeg, .jpg, .jpeg" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex justify-center items-center gap-2 w-full py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 rounded text-xs text-slate-300 font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud className="w-4 h-4" />
          UPLOAD SAR CAPTURE (JPEG)
        </button>

        {uploadError && (
          <div className="px-3 py-2 bg-rose-950/40 border border-rose-800 text-rose-400 text-[10px] font-mono rounded">
            {uploadError}
          </div>
        )}
      </div>
      
      <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative">
        <div className="relative">
          <img 
            src={customImage || "/oil_spill.jpg"} 
            alt="SAR Target Asset" 
            className={`w-full h-44 md:h-48 object-cover mix-blend-screen transition-opacity ${isProcessing ? 'opacity-30' : 'opacity-80'}`}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-sm z-10 border border-cyan-500/50">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse mb-2" />
              <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase animate-pulse">
                Processing Backscatter Matrix...
              </div>
              {/* Scanline effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 blur-[2px] animate-[scan_1.5s_ease-in-out_infinite]" />
            </div>
          )}
        </div>

        {customImage && imageMeta && !isProcessing && (
          <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-slate-900/50">
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">{imageMeta.name}</span>
            <span className="text-[10px] font-mono text-slate-500">{imageMeta.size}</span>
          </div>
        )}
        
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300">CLASSIFICATION</span>
            <span className={`px-2 py-0.5 bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[10px] font-bold rounded ${metrics.flash ? 'animate-pulse' : ''}`}>
              PETROLEUM-LIKE SLICK — CLASS 1
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500">POLARIZATION</span>
              <span className="font-mono text-xs text-slate-200">VV/VH</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500">WIND VELOCITY</span>
              <span className="font-mono text-xs text-slate-200">4.2 m/s</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500">WIND DIRECTION</span>
              <span className="font-mono text-xs text-slate-200">284° WNW</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500">BACKSCATTER SUPP.</span>
              <span className={`font-mono text-xs ${metrics.flash ? 'text-cyan-300 transition-colors' : 'text-slate-200'}`}>{metrics.backscatter} dB</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500">SLICK AREA</span>
              <span className={`font-mono text-xs ${metrics.flash ? 'text-cyan-300 transition-colors' : 'text-slate-200'}`}>{metrics.area} km²</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500">ANALYTICAL CONF.</span>
              <span className={`font-mono text-xs ${metrics.flash ? 'text-cyan-400 transition-colors' : 'text-emerald-400'}`}>{metrics.confidence}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
