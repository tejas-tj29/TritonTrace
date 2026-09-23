import React, { useState } from 'react';
import { useIncident } from '../../../context/IncidentContext';
import { reportService } from '../../../services/reportService';
import { MapPin, Target, LocateFixed, Loader2, Upload, Trash2 } from 'lucide-react';
import Button from '../../common/Button';

export const IncidentReportForm = () => {
  const { interactionMode, setInteractionMode, pickedCoordinate, setPickedCoordinate, setPanToCoordinate } = useIncident();
  const [severity, setSeverity] = useState('Moderate');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceError, setEvidenceError] = useState('');

  const isPicking = interactionMode === 'pick_coordinate';

  const togglePicking = () => {
    setInteractionMode(isPicking ? 'none' : 'pick_coordinate');
    setGeoError(''); // clear any errors
  };

  const handleAutoDetect = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('GEOLOCATION NOT SUPPORTED');
      return;
    }
    
    setIsDetecting(true);
    setInteractionMode('none'); // turn off manual pick mode if on

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        const { latitude, longitude } = position.coords;
        const coord = { lat: latitude, lon: longitude };
        setPickedCoordinate(coord);
        setPanToCoordinate(coord);
        
        setToast('GPS FIX ACQUIRED');
        setTimeout(() => setToast(''), 3000);
      },
      (error) => {
        setIsDetecting(false);
        let errorMsg = 'LOCATION ACCESS DENIED OR UNAVAILABLE';
        if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS REQUEST TIMED OUT';
        }
        setGeoError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageUpload = (e) => {
    setEvidenceError('');
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      setEvidenceError('INVALID FORMAT: ONLY JPEG / JPG SUPPORTED');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEvidenceError('FILE TOO LARGE: MAXIMUM SIZE IS 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEvidenceImage(event.target.result);
      setEvidenceFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) });
    };
    reader.onerror = () => {
      setEvidenceError('FAILED TO READ FILE');
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setEvidenceImage(null);
    setEvidenceFile(null);
    setEvidenceError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickedCoordinate) {
      alert("Please select a coordinate on the map.");
      return;
    }

    const report = reportService.createReport({
      lat: pickedCoordinate.lat,
      lon: pickedCoordinate.lon,
      severity,
      notes,
      evidenceImage
    });

    setToast(`Alert Generated: ${report.id}`);
    setTimeout(() => setToast(''), 5000);
    setPickedCoordinate(null);
    setNotes('');
    clearImage();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Report Incident</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 tracking-wider">LOCATION</label>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant={isPicking ? 'primary' : 'outline'}
              onClick={togglePicking}
              className="flex-1 text-xs px-2"
            >
              <Target className="w-3 h-3 mr-2" />
              {isPicking ? 'CLICK MAP' : 'MAP PICK'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className={`flex-1 text-xs px-2 ${isDetecting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isDetecting ? (
                <Loader2 className="w-3 h-3 mr-2 animate-spin text-cyan-500" />
              ) : (
                <LocateFixed className="w-3 h-3 mr-2 text-cyan-500" />
              )}
              {isDetecting ? 'ACQUIRING FIX...' : 'AUTO-DETECT GPS'}
            </Button>
          </div>
          
          {geoError && (
            <div className="text-[10px] font-bold mt-1 p-2 border rounded bg-rose-950/40 border-rose-800 text-rose-400">
              {geoError}
            </div>
          )}

          {pickedCoordinate && (
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded text-xs font-mono text-cyan-400">
              <MapPin className="w-3 h-3" />
              {pickedCoordinate.lat.toFixed(4)}, {pickedCoordinate.lon.toFixed(4)}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 tracking-wider">SEVERITY</label>
          <div className="flex gap-2">
            {['Minor', 'Moderate', 'Major'].map(sev => (
              <button
                type="button"
                key={sev}
                onClick={() => setSeverity(sev)}
                className={`flex-1 py-1.5 text-xs font-bold rounded border ${
                  severity === sev ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 tracking-wider">UPLOAD FIELD EVIDENCE (JPEG ONLY)</label>
          
          {!evidenceImage ? (
            <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded bg-slate-950/50 hover:border-cyan-500/50 transition-colors group cursor-pointer">
              <input 
                type="file" 
                accept="image/jpeg, .jpg, .jpeg"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" />
              <span className="text-xs text-slate-400 group-hover:text-slate-300">Drag & drop or browse .jpg / .jpeg</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-2 border border-slate-700 bg-slate-900 rounded">
              <div className="relative">
                <img src={evidenceImage} alt="Evidence Preview" className="w-full h-32 object-cover rounded opacity-80 mix-blend-screen" />
                <button 
                  type="button" 
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[200px]">{evidenceFile.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{evidenceFile.size} MB</span>
              </div>
            </div>
          )}
          
          {evidenceError && (
            <div className="text-[10px] font-bold mt-1 p-2 border rounded bg-rose-950/40 border-rose-800 text-rose-400">
              {evidenceError}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 tracking-wider">VISUAL NOTES</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 min-h-[80px]"
            placeholder="Describe slick appearance, odor, or local observations..."
          />
        </div>

        <Button type="submit" className="mt-4 w-full justify-center text-sm font-bold tracking-wider">
          SUBMIT INCIDENT ALERT
        </Button>
      </form>

      {toast && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-xs font-bold text-center rounded">
          {toast}
        </div>
      )}
    </div>
  );
};
