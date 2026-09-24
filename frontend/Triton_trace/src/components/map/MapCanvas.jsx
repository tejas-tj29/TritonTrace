import { useState, useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FallbackLeaflet } from "./FallbackLeaflet";
import { useIncident } from "../../context/IncidentContext";
import geofencesData from "../../utils/regional_alert_geofences.json";
import * as turf from "@turf/turf";

/**
 * MapCanvas Component
 * Attempts to initialize Mapbox GL with mapbox://styles/mapbox/dark-v11 using [Longitude, Latitude].
 * If VITE_MAPBOX_ACCESS_TOKEN is missing or initialization fails, silently mounts FallbackLeaflet.
 */
export const MapCanvas = ({
  interactive = true,
  className = "",
  onEngineResolved,
  layers = [],
  commercialFleet = [],
  selectedVesselId = null,
  showDiversionRoute = false,
}) => {
  // Read environment configuration with explicit numeric casting per PRD 6.2
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const defaultLat = Number(import.meta.env.VITE_DEFAULT_LAT) || 31.35;
  const defaultLon = Number(import.meta.env.VITE_DEFAULT_LON) || 31.685;
  const defaultZoom = Number(import.meta.env.VITE_DEFAULT_ZOOM) || 5.5;

  const {
    panToCoordinate,
    correlationMarker,
    interactionMode,
    drawnPolygon,
    addPolygonVertex,
    cursorCoordinate,
    setCursorCoordinate,
    isPolygonClosed,
    setIsPolygonClosed,
    activeIncident,
    incidents,
    spillDatabase,
  } = useIncident();

  const initialViewState = {
    longitude: defaultLon,
    latitude: defaultLat,
    zoom: defaultZoom,
  };

  const vesselTracksGeoJSON = useMemo(() => {
    if (!commercialFleet || commercialFleet.length === 0) return null;
    return {
      type: 'FeatureCollection',
      features: commercialFleet
        .filter(v => v.trajectory && v.trajectory.length >= 2)
        .map(vessel => ({
          type: 'Feature',
          properties: { id: vessel.id },
          geometry: {
            type: 'LineString',
            coordinates: vessel.trajectory
          }
        }))
    };
  }, [commercialFleet]);

  const vesselPointsGeoJSON = useMemo(() => {
    if (!commercialFleet || commercialFleet.length === 0) return null;
    return {
      type: 'FeatureCollection',
      features: commercialFleet.map(vessel => ({
        type: 'Feature',
        properties: { 
          id: vessel.id,
          name: vessel.name,
          heading: vessel.heading || 0, // Ensure a fallback
          type: vessel.type || 'Unknown'
        },
        geometry: {
          type: 'Point',
          coordinates: vessel.coordinates 
        }
      }))
    };
  }, [commercialFleet]);

  const sarSlicksGeoJSON = useMemo(() => {
    if (!incidents) return null;
    return {
      type: 'FeatureCollection',
      features: incidents.filter(i => i.polygon).map(inc => ({
        type: 'Feature',
        properties: { id: inc.id },
        geometry: {
          type: 'Polygon',
          coordinates: [inc.polygon] // Array of arrays for Polygons
        }
      }))
    };
  }, [incidents]);

  const hindcastGeoJSON = useMemo(() => {
    // Match the active incident ID (e.g., "ow-0008") to the image_filename in the JSON
    const activeSpillData = spillDatabase?.spills?.find(s => 
      activeIncident && s.image_filename.includes(activeIncident.id)
    );
    
    if (!activeSpillData || !activeSpillData.parcels) return null;
    
    return {
      type: 'FeatureCollection',
      features: activeSpillData.parcels.map(p => ({
        type: 'Feature',
        properties: { mass: p.mass_kg, confidence: p.confidence },
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] }
      }))
    };
  }, [spillDatabase, activeIncident]);

  // Target AOI Bounding Box: Longitude 18.37°E to 45.0°E, Latitude 25.0°N to 37.7°N
  const aoiMaxBounds = [
    [18.37, 25.0], // Southwest [lng, lat]
    [45.0, 37.7], // Northeast [lng, lat]
  ];

  // Check token and WebGL support at initial state to avoid setState inside effect
  const [useFallback, setUseFallback] = useState(() => {
    if (!token || token.trim() === "") return true;
    if (!mapboxgl.supported || !mapboxgl.supported()) return true;
    return false;
  });
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // State ref for event handlers to access latest state without rebinding
  const stateRef = useRef({ interactionMode, drawnPolygon, isPolygonClosed });
  useEffect(() => {
    stateRef.current = { interactionMode, drawnPolygon, isPolygonClosed };
  }, [interactionMode, drawnPolygon, isPolygonClosed]);

  useEffect(() => {
    // If fallback is already active, notify engine resolution and return
    if (useFallback) {
      if (onEngineResolved) onEngineResolved("leaflet");
      return;
    }

    try {
      mapboxgl.accessToken = token;

      // Mapbox GL coordinate format is [Longitude, Latitude]
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        maxBounds: aoiMaxBounds,
        interactive: interactive,
        attributionControl: false,
      });

      // Catch asynchronous token authorization, style loading, or WebGL tile errors
      map.on("error", (e) => {
        // Prevent console pollution and gracefully fallback
        if (
          e &&
          e.error &&
          (e.error.status === 401 ||
            e.error.status === 403 ||
            e.error.message?.includes("token"))
        ) {
          setUseFallback(true);
          if (onEngineResolved) onEngineResolved("leaflet");
        }
      });

      map.on("load", () => {
        if (onEngineResolved) onEngineResolved("mapbox");

        try {
          // 1. SAR SLICK (Using dynamic incidents)
          map.addSource("sar_slick-source", {
            type: "geojson",
            data: sarSlicksGeoJSON || { type: 'FeatureCollection', features: [] }
          });
          map.addLayer({
            id: "sar_slick-fill",
            type: "fill",
            source: "sar_slick-source",
            layout: { visibility: "none" },
            paint: { "fill-color": "#06b6d4", "fill-opacity": 0.2 },
          });
          map.addLayer({
            id: "sar_slick-outline",
            type: "line",
            source: "sar_slick-source",
            layout: { visibility: "none" },
            paint: {
              "line-color": "#22d3ee",
              "line-width": 2,
              "line-dasharray": [2, 2],
            },
          });

          // 2. HINDCAST PARTICLES
          map.addSource("hindcast-source", {
            type: "geojson",
            data: hindcastGeoJSON || { type: 'FeatureCollection', features: [] }
          });
          map.addLayer({
            id: 'hindcast-particles-circle',
            type: 'circle',
            source: 'hindcast-source',
            layout: { visibility: "none" },
            paint: {
              // Scale radius dynamically by mass (e.g., 200kg / 40 = 5px radius)
              'circle-radius': ['/', ['get', 'mass'], 40],
              
              // Color gradient based on confidence score (Rose-200 to Rose-700)
              'circle-color': [
                'interpolate', ['linear'], ['get', 'confidence'],
                0.25, '#fecdd3', // Low confidence
                0.35, '#f43f5e', // Medium confidence
                0.40, '#be123c'  // High confidence
              ],
              'circle-opacity': 0.8,
              'circle-stroke-width': 0.5,
              'circle-stroke-color': '#ffffff' // White border for contrast
            }
          });

          // 3. AIS TRACKS
          map.addSource("ais_tracks-source", {
            type: "geojson",
            data: vesselTracksGeoJSON || { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "ais_tracks-line",
            type: "line",
            source: "ais_tracks-source",
            layout: { visibility: "visible" },
            paint: { 
              "line-color": "#94a3b8", 
              "line-width": 2, 
              "line-dasharray": [2, 2],
              "line-opacity": 0.8
            },
          });

          // 3.5 LIVE VESSELS
          map.addSource("live-vessels-source", {
            type: "geojson",
            data: vesselPointsGeoJSON || { type: "FeatureCollection", features: [] }
          });
          map.addLayer({
            id: 'live-vessels-symbol',
            type: 'symbol',
            source: 'live-vessels-source',
            layout: {
              'text-field': '▲', // Up-pointing triangle points North at 0 degrees
              'text-rotate': ['get', 'heading'], // Rotates based on ship's real heading
              'text-size': 18,
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'text-pitch-alignment': 'map'
            },
            paint: {
              'text-color': [
                'match',
                ['get', 'type'],
                'Crude Oil Tanker', '#ef4444',    // Red
                'Chemical Tanker', '#f97316',     // Orange
                'LNG Carrier', '#eab308',         // Yellow
                'Product Tanker', '#ec4899',      // Pink
                'Bulk Carrier', '#3b82f6',        // Blue
                'Container Ship', '#8b5cf6',      // Purple
                'General Cargo', '#14b8a6',       // Teal
                'Fishing', '#22c55e',             // Green
                '#ffffff'                         // Default White
              ],
              'text-halo-color': '#1e293b',       // Dark slate outline for contrast
              'text-halo-width': 1.5
            }
          });

          // 4. DIVERSION ROUTE
          map.addSource("diversion-source", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: { type: "LineString", coordinates: [] },
            },
          });
          map.addLayer({
            id: "diversion-line",
            type: "line",
            source: "diversion-source",
            layout: { visibility: "none" },
            paint: {
              "line-color": "#10b981",
              "line-width": 3,
              "line-dasharray": [3, 3],
            },
          });

          // 5. REGIONAL GEOFENCES
          map.addSource("geofences-source", {
            type: "geojson",
            data: geofencesData,
          });
          map.addLayer({
            id: "geofences-fill",
            type: "fill",
            source: "geofences-source",
            paint: { "fill-color": ["get", "color"], "fill-opacity": 0.2 },
          });
          map.addLayer({
            id: "geofences-line",
            type: "line",
            source: "geofences-source",
            paint: { "line-color": ["get", "color"], "line-width": 1.5 },
          });

          // 6. DRAWN POLYGON (Manual Mapping)
          map.addSource("drawn-polygon-source", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "drawn-polygon-fill",
            type: "fill",
            source: "drawn-polygon-source",
            paint: { "fill-color": "#4f46e5", "fill-opacity": 0.3 },
          });
          map.addLayer({
            id: "drawn-polygon-line",
            type: "line",
            source: "drawn-polygon-source",
            paint: {
              "line-color": "#4f46e5",
              "line-width": 2,
              "line-dasharray": [2, 2],
            },
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
        if (onEngineResolved) onEngineResolved("leaflet");
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    token,
    defaultLat,
    defaultLon,
    defaultZoom,
    interactive,
    useFallback,
    onEngineResolved,
    // intentional: we don't put vesselTracksGeoJSON here so it doesn't re-init the whole map
  ]);

  // Sync vessel trajectories, live vessels, and sar slicks
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    const updateSources = () => {
      if (!map.isStyleLoaded()) return;
      
      const trackSource = map.getSource("ais_tracks-source");
      if (trackSource && vesselTracksGeoJSON) {
        trackSource.setData(vesselTracksGeoJSON);
      }
      
      const pointSource = map.getSource("live-vessels-source");
      if (pointSource && vesselPointsGeoJSON) {
        pointSource.setData(vesselPointsGeoJSON);
      }

      const sarSource = map.getSource("sar_slick-source");
      if (sarSource && sarSlicksGeoJSON) {
        sarSource.setData(sarSlicksGeoJSON);
      }

      const hindcastSource = map.getSource("hindcast-source");
      if (hindcastSource && hindcastGeoJSON) {
        hindcastSource.setData(hindcastGeoJSON);
      }
    };

    updateSources();
    map.on("styledata", updateSources);
    return () => {
      map.off("styledata", updateSources);
    };
  }, [vesselTracksGeoJSON, vesselPointsGeoJSON, sarSlicksGeoJSON, hindcastGeoJSON]);

  // Sync layers visibility from MapEngine
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateVisibility = () => {
      if (!map.isStyleLoaded()) return;

      layers.forEach((layer) => {
        const visibility = layer.active ? "visible" : "none";
        if (layer.id === "sar_slick") {
          if (map.getLayer("sar_slick-fill"))
            map.setLayoutProperty("sar_slick-fill", "visibility", visibility);
          if (map.getLayer("sar_slick-outline"))
            map.setLayoutProperty(
              "sar_slick-outline",
              "visibility",
              visibility,
            );
        } else if (layer.id === "hindcast") {
          if (map.getLayer("hindcast-particles-circle"))
            map.setLayoutProperty("hindcast-particles-circle", "visibility", visibility);
        } else if (layer.id === "ais_tracks") {
          if (map.getLayer("ais_tracks-line"))
            map.setLayoutProperty("ais_tracks-line", "visibility", visibility);
        } else if (layer.id === "geofences") {
          if (map.getLayer("geofences-line"))
            map.setLayoutProperty("geofences-line", "visibility", visibility);
          if (map.getLayer("geofences-fill"))
            map.setLayoutProperty("geofences-fill", "visibility", visibility);
        }
      });
    };

    updateVisibility();
    map.on("styledata", updateVisibility);

    return () => {
      map.off("styledata", updateVisibility);
    };
  }, [layers]);

  // Handle Map Drawing Interactions
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleClick = (e) => {
      const { interactionMode, drawnPolygon, isPolygonClosed } =
        stateRef.current;
      if (interactionMode === "draw_polygon" && !isPolygonClosed) {
        const newPoint = [e.lngLat.lng, e.lngLat.lat];

        // Auto-close if clicked near the first vertex
        if (drawnPolygon.length >= 3) {
          const firstPoint = drawnPolygon[0];
          const dist = turf.distance(
            turf.point(firstPoint),
            turf.point(newPoint),
            { units: "kilometers" },
          );

          if (dist < 50) {
            // 50km tolerance
            setIsPolygonClosed(true);
            setCursorCoordinate(null);
            return;
          }
        }
        addPolygonVertex(newPoint);
      }
    };

    const handleMouseMove = (e) => {
      const { interactionMode, isPolygonClosed } = stateRef.current;
      if (interactionMode === "draw_polygon" && !isPolygonClosed) {
        setCursorCoordinate([e.lngLat.lng, e.lngLat.lat]);
      }
    };

    const handleDblClick = (e) => {
      const { interactionMode, drawnPolygon, isPolygonClosed } =
        stateRef.current;
      if (
        interactionMode === "draw_polygon" &&
        !isPolygonClosed &&
        drawnPolygon.length >= 3
      ) {
        e.preventDefault();
        setIsPolygonClosed(true);
        setCursorCoordinate(null);
      }
    };

    map.on("click", handleClick);
    map.on("mousemove", handleMouseMove);
    map.on("dblclick", handleDblClick);

    return () => {
      map.off("click", handleClick);
      map.off("mousemove", handleMouseMove);
      map.off("dblclick", handleDblClick);
    };
  }, [addPolygonVertex, setCursorCoordinate, setIsPolygonClosed]);

  // Render Drawn Polygon
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateDrawnPolygon = () => {
      if (!map.isStyleLoaded()) return;
      const source = map.getSource("drawn-polygon-source");
      if (!source) return;

      let coordinates = [...drawnPolygon];
      if (
        interactionMode === "draw_polygon" &&
        !isPolygonClosed &&
        cursorCoordinate
      ) {
        coordinates.push(cursorCoordinate);
      }

      if (coordinates.length > 0) {
        if (coordinates.length < 3) {
          // Draw as a line
          source.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates },
          });
        } else {
          // Draw as a polygon, must be closed ring
          const polyCoords = [...coordinates];
          polyCoords.push(polyCoords[0]);
          source.setData({
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [polyCoords] },
          });
        }
      } else {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    };

    // Update immediately
    updateDrawnPolygon();

    // And update on style load just in case
    map.on("styledata", updateDrawnPolygon);
    return () => {
      map.off("styledata", updateDrawnPolygon);
    };
  }, [drawnPolygon, cursorCoordinate, isPolygonClosed, interactionMode]);

  // Fly to generic pan coordinate
  useEffect(() => {
    if (mapRef.current && panToCoordinate?.lat && panToCoordinate?.lon) {
      mapRef.current.flyTo({
        center: [panToCoordinate.lon, panToCoordinate.lat],
        zoom: 7.5,
        essential: true,
      });
    }
  }, [panToCoordinate]);

  // Fly to active incident
  useEffect(() => {
    if (activeIncident?.center && mapRef.current) {
      mapRef.current.flyTo({
        center: activeIncident.center,
        zoom: 11,
        essential: true,
        duration: 2000
      });
    }
  }, [activeIncident]);

  // Fly to selected vessel
  useEffect(() => {
    if (!mapRef.current || useFallback) return;

    if (selectedVesselId && commercialFleet.length > 0) {
      const vessel = commercialFleet.find((v) => v.id === selectedVesselId);
      if (vessel && vessel.lat !== undefined && vessel.lon !== undefined) {
        mapRef.current.flyTo({
          center: [vessel.lon, vessel.lat],
          zoom: 9,
          duration: 1500,
          essential: true,
        });
      }
    }
  }, [selectedVesselId, commercialFleet, useFallback]);


  // Diversion Route Update
  useEffect(() => {
    if (!mapRef.current || useFallback) return;

    const updateRoute = () => {
      if (!mapRef.current.isStyleLoaded()) return;
      const source = mapRef.current.getSource("diversion-source");
      if (!source) return;

      if (showDiversionRoute && selectedVesselId) {
        const vessel = commercialFleet.find((v) => v.id === selectedVesselId);
        if (vessel) {
          const coords = [
            [vessel.lon, vessel.lat],
            [vessel.lon + 0.5, vessel.lat + 0.8],
            [vessel.lon + 1.2, vessel.lat + 0.9],
          ];
          source.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords },
          });
          mapRef.current.setLayoutProperty(
            "diversion-line",
            "visibility",
            "visible",
          );
        }
      } else {
        mapRef.current.setLayoutProperty(
          "diversion-line",
          "visibility",
          "none",
        );
      }
    };

    updateRoute();
    mapRef.current.on("styledata", updateRoute);
    return () => {
      if (mapRef.current) {
        mapRef.current.off("styledata", updateRoute);
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
    <div
      className={`relative h-full w-full select-none overflow-hidden bg-slate-950 ${className}`}
    >
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
