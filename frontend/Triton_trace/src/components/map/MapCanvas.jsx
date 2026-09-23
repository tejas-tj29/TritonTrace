import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FallbackLeaflet } from './FallbackLeaflet';

/**
 * MapCanvas Component
 * Attempts to initialize Mapbox GL with mapbox://styles/mapbox/dark-v11 using [Longitude, Latitude].
 * If VITE_MAPBOX_ACCESS_TOKEN is missing or initialization fails, silently mounts FallbackLeaflet.
 */
export const MapCanvas = ({
  interactive = true,
  className = '',
  onEngineResolved
}) => {
  // Read environment configuration with explicit numeric casting per PRD 6.2
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const defaultLat = Number(import.meta.env.VITE_DEFAULT_LAT) || 31.350;
  const defaultLon = Number(import.meta.env.VITE_DEFAULT_LON) || 31.685;
  const defaultZoom = Number(import.meta.env.VITE_DEFAULT_ZOOM) || 5.5;

  const initialViewState = {
    longitude: defaultLon,
    latitude: defaultLat,
    zoom: defaultZoom
  };

  // Target AOI Bounding Box: Longitude 18.37°E to 45.0°E, Latitude 25.0°N to 37.7°N
  const aoiMaxBounds = [
    [18.37, 25.0], // Southwest [lng, lat]
    [45.0, 37.7]   // Northeast [lng, lat]
  ];

  // If token is missing, activate fallback immediately to avoid any Mapbox console warnings
  const [useFallback, setUseFallback] = useState(!token || token.trim() === '');
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // If token is absent or fallback already flagged, notify and return
    if (!token || token.trim() === '' || useFallback) {
      if (onEngineResolved) onEngineResolved('leaflet');
      return;
    }

    // Verify WebGL support prior to Mapbox instantiation
    if (!mapboxgl.supported || !mapboxgl.supported()) {
      setUseFallback(true);
      if (onEngineResolved) onEngineResolved('leaflet');
      return;
    }

    try {
      mapboxgl.accessToken = token;

      // Mapbox GL coordinate format is [Longitude, Latitude]
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        maxBounds: aoiMaxBounds,
        interactive: interactive,
        attributionControl: false
      });

      // Catch asynchronous token authorization, style loading, or WebGL tile errors
      map.on('error', (e) => {
        // Prevent console pollution and gracefully fallback
        if (e && e.error && (e.error.status === 401 || e.error.status === 403 || e.error.message?.includes('token'))) {
          setUseFallback(true);
          if (onEngineResolved) onEngineResolved('leaflet');
        }
      });

      map.on('load', () => {
        if (onEngineResolved) onEngineResolved('mapbox');

        // Add incident slick GeoJSON polygon for Med-Spill-017 centered in Eastern Med AOI
        try {
          map.addSource('slick-source', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [33.05, 32.52],
                  [33.15, 32.51],
                  [33.25, 32.48],
                  [33.28, 32.45],
                  [33.20, 32.47],
                  [33.08, 32.50],
                  [33.05, 32.52]
                ]]
              },
              properties: {
                id: 'Med-Spill-017',
                area: 14.6
              }
            }
          });

          map.addLayer({
            id: 'slick-fill',
            type: 'fill',
            source: 'slick-source',
            paint: {
              'fill-color': '#22d3ee',
              'fill-opacity': 0.3
            }
          });

          map.addLayer({
            id: 'slick-outline',
            type: 'line',
            source: 'slick-source',
            paint: {
              'line-color': '#22d3ee',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          });
        } catch {
          // Source addition handled cleanly
        }
      });

      mapRef.current = map;
    } catch {
      // Catch synchronous construction errors (e.g. invalid token string format)
      setUseFallback(true);
      if (onEngineResolved) onEngineResolved('leaflet');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token, defaultLat, defaultLon, defaultZoom, interactive, useFallback, onEngineResolved]);

  // If fallback is triggered, mount FallbackLeaflet silently
  if (useFallback) {
    return (
      <FallbackLeaflet
        center={[defaultLat, defaultLon]}
        zoom={defaultZoom}
        interactive={interactive}
        className={className}
      />
    );
  }

  return (
    <div className={`relative h-full w-full select-none overflow-hidden bg-slate-950 ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      {/* Mapbox active engine badge */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center space-x-1.5 rounded border border-slate-800 bg-slate-950/85 px-2.5 py-1 font-mono text-[10px] text-slate-400 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>MAP ENGINE: MAPBOX GL (DARK-V11)</span>
        <span className="text-slate-600">·</span>
        <span className="text-cyan-300">ONLINE</span>
      </div>
    </div>
  );
};

export default MapCanvas;
