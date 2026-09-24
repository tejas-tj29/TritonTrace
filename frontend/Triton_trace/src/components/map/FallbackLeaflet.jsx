import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet asset path resolution for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * FallbackLeaflet component
 * Silently mounts when Mapbox token is missing or initialization fails.
 * Uses CartoDB Dark Matter tiles for a tactical intelligence appearance.
 */
export const FallbackLeaflet = ({
  center = [31.350, 31.685], // Leaflet uses [Latitude, Longitude]
  zoom = 5.5,
  interactive = true,
  className = '',
  panToCoordinate,
  correlationMarker
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const correlationMarkerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      // Bounding box: Longitude 18.37°E to 45.0°E, Latitude 25.0°N to 37.7°N
      const bounds = L.latLngBounds([25.0, 18.37], [37.7, 45.0]);

      // Initialize Leaflet map instance
      const map = L.map(containerRef.current, {
        center: center,
        zoom: zoom,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive
      });

      // CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Attribution control in discreet corner
      L.control.attribution({
        position: 'bottomright',
        prefix: false
      }).addTo(map);

      if (interactive) {
        L.control.zoom({ position: 'bottomright' }).addTo(map);
      }

      // Incident Slick Polygon for Med-Spill-017 centered at Lat 32.5, Lon 33.1
      const slickCoords = [
        [32.52, 33.05],
        [32.51, 33.15],
        [32.48, 33.25],
        [32.45, 33.28],
        [32.47, 33.20],
        [32.50, 33.08],
        [32.52, 33.05]
      ];

      L.polygon(slickCoords, {
        color: '#22d3ee',
        weight: 2,
        fillColor: '#22d3ee',
        fillOpacity: 0.25,
        dashArray: '4, 4'
      }).addTo(map);

      // Hindcast Origin Uncertainty Circle (1.8km radius)
      L.circle([32.35, 32.92], {
        radius: 1800,
        color: '#34d399',
        weight: 1.5,
        fillColor: '#34d399',
        fillOpacity: 0.15,
        dashArray: '3, 3'
      }).addTo(map);

      // Discharge drift vector line (from origin to slick)
      L.polyline([
        [32.35, 32.92],
        [32.50, 33.10]
      ], {
        color: '#34d399',
        weight: 1.5,
        dashArray: '5, 5',
        opacity: 0.6
      }).addTo(map);

      // Target slick marker
      L.circleMarker([32.50, 33.10], {
        radius: 6,
        color: '#22d3ee',
        fillColor: '#0891b2',
        fillOpacity: 0.9,
        weight: 2
      }).addTo(map);

      // AIS Correlated Vessel (Pacific Horizon)
      L.circleMarker([32.36, 32.93], {
        radius: 5,
        color: '#f43f5e',
        fillColor: '#f43f5e',
        fillOpacity: 0.9,
        weight: 1.5
      }).addTo(map);

      mapRef.current = map;

      // Invalidate size to guarantee crisp tile alignment
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);

      return () => clearTimeout(timer);
    } catch (err) {
      // Suppress console-breaking errors per PRD requirements
      console.warn('FallbackLeaflet initialization error handled:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, interactive]);

  // Update center/zoom if changed
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Pan to requested incident or asset coordinate
  useEffect(() => {
    if (mapRef.current && panToCoordinate?.lat && panToCoordinate?.lon) {
      mapRef.current.flyTo([panToCoordinate.lat, panToCoordinate.lon], 7.5, {
        duration: 1.2
      });
    }
  }, [panToCoordinate]);

  // Render or remove AIS Intersect target marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (correlationMarkerRef.current) {
      correlationMarkerRef.current.remove();
      correlationMarkerRef.current = null;
    }
    if (correlationMarker && correlationMarker.length >= 2) {
      // correlationMarker is [lon, lat] -> Leaflet uses [lat, lon]
      const lat = correlationMarker[1];
      const lon = correlationMarker[0];
      const targetIcon = L.divIcon({
        className: 'custom-crosshair-marker',
        html: `<div style="width:24px;height:24px;border:2px solid #f43f5e;border-radius:50%;background:rgba(244,63,94,0.25);box-shadow:0 0 12px #f43f5e;display:flex;align-items:center;justify-content:center;animation:pulse 1.5s infinite;">
                 <div style="width:6px;height:6px;background:#f43f5e;border-radius:50%;"></div>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      correlationMarkerRef.current = L.marker([lat, lon], { icon: targetIcon }).addTo(mapRef.current);
    }
  }, [correlationMarker]);

  return (
    <div className={`relative h-full w-full select-none overflow-hidden bg-slate-950 ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Tactical Engine Indicator */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center space-x-1.5 rounded border border-slate-800 bg-slate-950/85 px-2.5 py-1 font-mono text-[10px] text-slate-400 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>MAP ENGINE: LEAFLET (CARTODB DARK MATTER)</span>
        <span className="text-slate-600">·</span>
        <span className="text-amber-300">FALLBACK ACTIVE</span>
      </div>
    </div>
  );
};

export default FallbackLeaflet;
