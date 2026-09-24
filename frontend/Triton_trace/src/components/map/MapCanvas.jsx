import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FallbackLeaflet } from './FallbackLeaflet';
import { useIncident } from '../../context/IncidentContext';
import geofencesData from '../../data/regional_alert_geofences.json';

/**
 * MapCanvas Component
 * Attempts to initialize Mapbox GL with mapbox://styles/mapbox/dark-v11 using [Longitude, Latitude].
 * If VITE_MAPBOX_ACCESS_TOKEN is missing or initialization fails, silently mounts FallbackLeaflet.
 */
export const MapCanvas = ({
  interactive = true,
  className = '',
  onEngineResolved,
  layers = [],
  commercialFleet = [],
  selectedVesselId = null,
  showDiversionRoute = false
}) => {
  // Read environment configuration with explicit numeric casting per PRD 6.2
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const defaultLat = Number(import.meta.env.VITE_DEFAULT_LAT) || 31.350;
  const defaultLon = Number(import.meta.env.VITE_DEFAULT_LON) || 31.685;
  const defaultZoom = Number(import.meta.env.VITE_DEFAULT_ZOOM) || 5.5;

  const { panToCoordinate, correlationMarker } = useIncident();

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

  // Check token and WebGL support at initial state to avoid setState inside effect
  const [useFallback, setUseFallback] = useState(() => {
    if (!token || token.trim() === '') return true;
    if (!mapboxgl.supported || !mapboxgl.supported()) return true;
    return false;
  });
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // If fallback is already active, notify engine resolution and return
    if (useFallback) {
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

        try {
          // 1. SAR SLICK (Using existing coordinates)
          map.addSource('sar_slick-source', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [33.05, 32.52], [33.15, 32.51], [33.25, 32.48],
                  [33.28, 32.45], [33.20, 32.47], [33.08, 32.50], [33.05, 32.52]
                ]]
              },
              properties: { id: 'Med-Spill-017', area: 14.6 }
            }
          });
          map.addLayer({
            id: 'sar_slick-fill',
            type: 'fill',
            source: 'sar_slick-source',
            layout: { visibility: 'none' }, // will be set by useEffect
            paint: { 'fill-color': '#22d3ee', 'fill-opacity': 0.3 }
          });
          map.addLayer({
            id: 'sar_slick-outline',
            type: 'line',
            source: 'sar_slick-source',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#22d3ee', 'line-width': 2, 'line-dasharray': [2, 2] }
          });

          // 2. HINDCAST PARTICLES
          map.addSource('hindcast-source', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                { type: 'Feature', geometry: { type: 'Point', coordinates: [33.1, 32.5] } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: [33.12, 32.51] } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: [33.15, 32.49] } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: [33.08, 32.48] } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: [33.2, 32.46] } }
              ]
            }
          });
          map.addLayer({
            id: 'hindcast-points',
            type: 'circle',
            source: 'hindcast-source',
            layout: { visibility: 'none' },
            paint: { 'circle-color': '#f43f5e', 'circle-radius': 4 }
          });

          // 3. AIS TRACKS
          map.addSource('ais_tracks-source', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: [[32.5, 32.0], [32.8, 32.2], [33.1, 32.5]] }
            }
          });
          map.addLayer({
            id: 'ais_tracks-line',
            type: 'line',
            source: 'ais_tracks-source',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#f59e0b', 'line-width': 3 }
          });

          // 4. DIVERSION ROUTE
          map.addSource('diversion-source', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: [] }
            }
          });
          map.addLayer({
            id: 'diversion-line',
            type: 'line',
            source: 'diversion-source',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#10b981', 'line-width': 3, 'line-dasharray': [3, 3] }
          });

          // 5. REGIONAL GEOFENCES
          map.addSource('geofences-source', {
            type: 'geojson',
            data: geofencesData
          });
          map.addLayer({
            id: 'geofences-fill',
            type: 'fill',
            source: 'geofences-source',
            paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.2 }
          });
          map.addLayer({
            id: 'geofences-line',
            type: 'line',
            source: 'geofences-source',
            paint: { 'line-color': ['get', 'color'], 'line-width': 1.5 }
          });

        } catch {
          // Source addition handled cleanly
        }
      });

      mapRef.current = map;
    } catch {
      // Catch synchronous construction errors (e.g. invalid token string format)
      setTimeout(() => {
        setUseFallback(true);
        if (onEngineResolved) onEngineResolved('leaflet');
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token, defaultLat, defaultLon, defaultZoom, interactive, useFallback, onEngineResolved]);

  // Sync layers visibility from MapEngine
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateVisibility = () => {
      if (!map.isStyleLoaded()) return;

      layers.forEach(layer => {
        const visibility = layer.active ? 'visible' : 'none';
        if (layer.id === 'sar_slick') {
          if (map.getLayer('sar_slick-fill')) map.setLayoutProperty('sar_slick-fill', 'visibility', visibility);
          if (map.getLayer('sar_slick-outline')) map.setLayoutProperty('sar_slick-outline', 'visibility', visibility);
        } else if (layer.id === 'hindcast') {
          if (map.getLayer('hindcast-points')) map.setLayoutProperty('hindcast-points', 'visibility', visibility);
        } else if (layer.id === 'ais_tracks') {
          if (map.getLayer('ais_tracks-line')) map.setLayoutProperty('ais_tracks-line', 'visibility', visibility);
        } else if (layer.id === 'geofences') {
          if (map.getLayer('geofences-line')) map.setLayoutProperty('geofences-line', 'visibility', visibility);
          if (map.getLayer('geofences-fill')) map.setLayoutProperty('geofences-fill', 'visibility', visibility);
        }
      });
    };

    updateVisibility();
    map.on('styledata', updateVisibility);
    
    return () => {
      map.off('styledata', updateVisibility);
    };
  }, [layers]);

  useEffect(() => {
    if (mapRef.current && panToCoordinate?.lat && panToCoordinate?.lon) {
      mapRef.current.flyTo({
        center: [panToCoordinate.lon, panToCoordinate.lat],
        zoom: 7.5,
        essential: true,
      });
    }
  }, [panToCoordinate]);

  // Fly to selected vessel
  useEffect(() => {
    if (!mapRef.current || useFallback) return;
    
    if (selectedVesselId && commercialFleet.length > 0) {
      const vessel = commercialFleet.find(v => v.id === selectedVesselId);
      if (vessel && vessel.lat !== undefined && vessel.lon !== undefined) {
        mapRef.current.flyTo({
          center: [vessel.lon, vessel.lat], 
          zoom: 9,
          duration: 1500,
          essential: true
        });
      }
    }
  }, [selectedVesselId, commercialFleet, useFallback]);

  // Commercial Fleet Markers
  const fleetMarkersRef = useRef({});

  useEffect(() => {
    if (!mapRef.current || useFallback) return;
    
    // Clear old markers
    Object.values(fleetMarkersRef.current).forEach(marker => marker.remove());
    fleetMarkersRef.current = {};

    commercialFleet.forEach(vessel => {
      const el = document.createElement('div');
      el.className = 'w-5 h-5 bg-cyan-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold';
      el.style.boxShadow = '0 0 12px rgba(6,182,212,0.8)';
      el.style.transform = `rotate(${vessel.heading || 0}deg)`;
      el.innerHTML = '↑';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([vessel.lon, vessel.lat])
        .addTo(mapRef.current);
      
      fleetMarkersRef.current[vessel.id] = marker;
    });
  }, [commercialFleet, useFallback]);

  // Diversion Route Update
  useEffect(() => {
    if (!mapRef.current || useFallback) return;
    
    const updateRoute = () => {
      if (!mapRef.current.isStyleLoaded()) return;
      const source = mapRef.current.getSource('diversion-source');
      if (!source) return;

      if (showDiversionRoute && selectedVesselId) {
        const vessel = commercialFleet.find(v => v.id === selectedVesselId);
        if (vessel) {
          const coords = [
            [vessel.lon, vessel.lat],
            [vessel.lon + 0.5, vessel.lat + 0.8],
            [vessel.lon + 1.2, vessel.lat + 0.9]
          ];
          source.setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords }
          });
          mapRef.current.setLayoutProperty('diversion-line', 'visibility', 'visible');
        }
      } else {
        mapRef.current.setLayoutProperty('diversion-line', 'visibility', 'none');
      }
    };

    updateRoute();
    mapRef.current.on('styledata', updateRoute);
    return () => {
      if (mapRef.current) {
        mapRef.current.off('styledata', updateRoute);
      }
    };
  }, [showDiversionRoute, selectedVesselId, commercialFleet, useFallback]);

  // If fallback is triggered, mount FallbackLeaflet silently
  if (useFallback) {
    return (
      <FallbackLeaflet
        center={[defaultLat, defaultLon]}
        zoom={defaultZoom}
        interactive={interactive}
        className={className}
        panToCoordinate={panToCoordinate}
        correlationMarker={correlationMarker}
        commercialFleet={commercialFleet}
        selectedVesselId={selectedVesselId}
        showDiversionRoute={showDiversionRoute}
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
