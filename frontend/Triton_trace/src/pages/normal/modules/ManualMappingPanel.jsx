import { useMemo } from "react";
import { useIncident } from "../../../context/IncidentContext";
import { MousePointer2, Trash2 } from "lucide-react";
import * as turf from "@turf/turf";
import { mockHistoricalIncidents } from "../../../utils/mockData";
import { getIncidentsInsidePolygon } from "../../../lib/geoMath";

export const ManualMappingPanel = () => {
  const {
    interactionMode,
    setInteractionMode,
    drawnPolygon,
    clearPolygon,
    setActiveIncident,
    cursorCoordinate,
    isPolygonClosed,
  } = useIncident();
  const isDrawing = interactionMode === "draw_polygon";

  const toggleDrawing = () =>
    setInteractionMode(isDrawing ? "none" : "draw_polygon");

  const metrics = useMemo(() => {
    if (
      drawnPolygon.length < 2 &&
      (!cursorCoordinate || (drawnPolygon.length < 3 && isPolygonClosed))
    )
      return { area: 0, perimeter: 0 };
    try {
      const coords = [...drawnPolygon];
      if (!isPolygonClosed && cursorCoordinate) coords.push(cursorCoordinate);
      if (coords.length < 3) return { area: 0, perimeter: 0 };
      coords.push(coords[0]);

      const polygon = turf.polygon([coords]);
      return {
        area: (turf.area(polygon) / 1000000).toFixed(2),
        perimeter: turf.length(polygon, { units: "kilometers" }).toFixed(2),
      };
    } catch (e) {
      return { area: 0, perimeter: 0 };
    }
  }, [drawnPolygon, cursorCoordinate, isPolygonClosed]);

  const containedIncidents = useMemo(() => {
    if (!isPolygonClosed || drawnPolygon.length < 3) return [];
    return getIncidentsInsidePolygon(drawnPolygon, mockHistoricalIncidents);
  }, [drawnPolygon, isPolygonClosed]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
        Manual Mapping
      </h2>

      <div className="flex flex-col gap-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider">
            DRAW MODE
          </span>
          <button
            onClick={toggleDrawing}
            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-md border transition-colors ${
              isDrawing
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <MousePointer2 className="w-3.5 h-3.5 mr-1.5" />
            {isDrawing ? "ACTIVE" : "ENABLE"}
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Click on the map to drop vertices. You need at least 3 points to form
          a polygon.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col p-3 bg-slate-50 rounded border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">
              EST. AREA
            </span>
            <span className="font-mono text-brand-700 font-bold text-lg">
              {metrics.area}{" "}
              <span className="text-xs text-slate-500 font-sans">km²</span>
            </span>
          </div>
          <div className="flex flex-col p-3 bg-slate-50 rounded border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">
              PERIMETER
            </span>
            <span className="font-mono text-brand-700 font-bold text-lg">
              {metrics.perimeter}{" "}
              <span className="text-xs text-slate-500 font-sans">km</span>
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {drawnPolygon.length} VERTICES
          </span>
          <button
            onClick={clearPolygon}
            className="flex items-center text-xs font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> CLEAR
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          Incidents In Envelope
        </h3>

        {isPolygonClosed ? (
          containedIncidents.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-md border border-brand-200 w-max mb-1">
                {containedIncidents.length} Detected
              </span>
              {containedIncidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setActiveIncident(inc.id)}
                  className="flex flex-col gap-1.5 p-3 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:shadow-sm text-left transition-all"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {inc.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        inc.status === "ACTIVE"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : inc.status === "MONITORING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-300 rounded-md bg-slate-50 text-center">
              <span className="text-xs text-slate-500">
                0 historical incidents within current perimeter
              </span>
            </div>
          )
        ) : (
          <div className="p-4 border border-slate-200 rounded-md bg-slate-50 text-center">
            <span className="text-xs text-slate-500">
              {drawnPolygon.length > 0
                ? "Double-click map to close polygon"
                : "Draw a polygon to scan for incidents"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
