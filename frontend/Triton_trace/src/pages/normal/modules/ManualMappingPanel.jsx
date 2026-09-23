import React, { useMemo } from 'react';
import { useIncident } from '../../../context/IncidentContext';
import { MousePointer2, Trash2 } from 'lucide-react';
import Button from '../../common/Button';
import * as turf from '@turf/turf';
import { mockHistoricalIncidents } from '../../../utils/mockData';
import { getIncidentsInsidePolygon } from '../../../lib/geoMath';

export const ManualMappingPanel = () => {
  const { interactionMode, setInteractionMode, drawnPolygon, clearPolygon, setActiveIncident, cursorCoordinate, isPolygonClosed } = useIncident();

  const isDrawing = interactionMode === 'draw_polygon';

  const toggleDrawing = () => {
    setInteractionMode(isDrawing ? 'none' : 'draw_polygon');
  };

  const metrics = useMemo(() => {
    // If we have fewer than 2 vertices, we can't form a polygon even with a cursor
    if (drawnPolygon.length < 2 && (!cursorCoordinate || drawnPolygon.length < 3 && isPolygonClosed)) return { area: 0, perimeter: 0 };
    
    try {
      const coords = [...drawnPolygon];
      if (!isPolygonClosed && cursorCoordinate) {
        coords.push(cursorCoordinate);
      }
      
      if (coords.length < 3) return { area: 0, perimeter: 0 };

      coords.push(coords[0]); // close the polygon

      const polygon = turf.polygon([coords]);
      const area = turf.area(polygon) / 1000000; // sq meters to sq km
      const perimeter = turf.length(polygon, { units: 'kilometers' });

      return { area: area.toFixed(2), perimeter: perimeter.toFixed(2) };
    } catch (e) {
      console.error("Turf calculation error", e);
      return { area: 0, perimeter: 0 };
    }
  }, [drawnPolygon, cursorCoordinate, isPolygonClosed]);

  const containedIncidents = useMemo(() => {
    if (!isPolygonClosed || drawnPolygon.length < 3) return [];
    return getIncidentsInsidePolygon(drawnPolygon, mockHistoricalIncidents);
  }, [drawnPolygon, isPolygonClosed]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Manual Mapping</h2>
      
      <div className="flex flex-col gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider">DRAW MODE</span>
          <Button 
            variant={isDrawing ? 'primary' : 'outline'}
            onClick={toggleDrawing}
            className="text-xs px-3 py-1"
          >
            <MousePointer2 className="w-3 h-3 mr-1" />
            {isDrawing ? 'ACTIVE' : 'ENABLE'}
          </Button>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          Click on the map to drop vertices. You need at least 3 points to form a polygon.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">ESTIMATED AREA</span>
            <span className="font-mono text-cyan-400 text-lg">{metrics.area} <span className="text-xs text-slate-500">km²</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">PERIMETER</span>
            <span className="font-mono text-cyan-400 text-lg">{metrics.perimeter} <span className="text-xs text-slate-500">km</span></span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
          <span className="text-[10px] font-mono text-slate-500">{drawnPolygon.length} VERTICES</span>
          <Button variant="ghost" onClick={clearPolygon} className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 px-2 py-1">
            <Trash2 className="w-3 h-3 mr-1" />
            CLEAR
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-slate-500 tracking-wider">INCIDENTS IN ENVELOPE</h3>
        
        {isPolygonClosed ? (
          containedIncidents.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded inline-block w-max border border-cyan-500/20 mb-1">
                {containedIncidents.length} Detected
              </span>
              {containedIncidents.map(inc => (
                <button
                  key={inc.id}
                  onClick={() => setActiveIncident(inc.id)}
                  className="flex flex-col gap-1 p-2 bg-slate-900 border border-slate-700 rounded-md hover:border-slate-500 text-left transition-colors"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-xs text-slate-200">{inc.id}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      inc.status === 'ACTIVE' ? 'bg-rose-500/20 text-rose-400' :
                      inc.status === 'MONITORING' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center w-full text-[10px] text-slate-400">
                    <span>{new Date(inc.timestamp).toLocaleDateString()}</span>
                    <span className="font-mono">{inc.area} km²</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 border border-dashed border-slate-700 rounded bg-slate-950/50 text-center">
              <span className="text-xs text-slate-500">0 historical incidents within current perimeter</span>
            </div>
          )
        ) : (
          <div className="p-3 border border-dashed border-slate-800 rounded bg-slate-950 text-center">
            <span className="text-xs text-slate-600">
              {drawnPolygon.length > 0 ? "Double-click or click near start to close polygon" : "Draw a polygon to scan for incidents"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
