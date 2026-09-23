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
  center = [35.8989, 14.5146], // Leaflet uses [Latitude, Longitude]
  zoom = 6.8,
  interactive = true,
  className = ''
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      // Initialize Leaflet map instance
      const map = L.map(containerRef.current, {
        center: center,
        zoom: zoom,
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

      // Incident Slick Polygon for Med-Spill-017
      const slickCoords = [
        [35.9120, 14.4820],
        [35.9080, 14.5050],
        [35.8920, 14.5380],
        [35.8850, 14.5460],
        [35.8890, 14.5240],
        [35.9010, 14.4910],
        [35.9120, 14.4820]
      ];

      L.polygon(slickCoords, {
        color: '#22d3ee',
        weight: 2,
        fillColor: '#22d3ee',
        fillOpacity: 0.25,
        dashArray: '4, 4'
      }).addTo(map);

      // Hindcast Origin Uncertainty Circle (1.8km radius)
      L.circle([35.7410, 14.3280], {
        radius: 1800,
        color: '#34d399',
        weight: 1.5,
        fillColor: '#34d399',
        fillOpacity: 0.15,
        dashArray: '3, 3'
      }).addTo(map);

      // Discharge drift vector line (from origin to slick)
      L.polyline([
        [35.7410, 14.3280],
        [35.8989, 14.5146]
      ], {
        color: '#34d399',
        weight: 1.5,
        dashArray: '5, 5',
        opacity: 0.6
      }).addTo(map);

      // Target slick marker
      L.circleMarker([35.8989, 14.5146], {
        radius: 6,
        color: '#22d3ee',
        fillColor: '#0891b2',
        fillOpacity: 0.9,
        weight: 2
      }).addTo(map);

      // AIS Correlated Vessel (Pacific Horizon)
      L.circleMarker([35.7440, 14.3350], {
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
