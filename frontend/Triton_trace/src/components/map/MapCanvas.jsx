import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FallbackLeaflet } from "./FallbackLeaflet";
import { useIncident } from "../../context/IncidentContext";
import geofencesData from "../../utils/regional_alert_geofences.json";

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
}) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const defaultLat = Number(import.meta.env.VITE_DEFAULT_LAT) || 31.35;
  const defaultLon = Number(import.meta.env.VITE_DEFAULT_LON) || 31.685;
  const defaultZoom = Number(import.meta.env.VITE_DEFAULT_ZOOM) || 5.5;

  const { panToCoordinate, correlationMarker } = useIncident();

  const initialViewState = {
    longitude: defaultLon,
    latitude: defaultLat,
    zoom: defaultZoom,
  };

  const aoiMaxBounds = [
    [18.37, 25.0],
    [45.0, 37.7],
  ];

  const [useFallback, setUseFallback] = useState(() => {
    if (!token || token.trim() === "") return true;
    if (!mapboxgl.supported || !mapboxgl.supported()) return true;
    return false;
  });

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (useFallback) {
      if (onEngineResolved) onEngineResolved("leaflet");
      return;
    }

    try {
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        maxBounds: aoiMaxBounds,
        interactive: interactive,
        attributionControl: false,
      });

      map.on("error", (e) => {
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
          // 1. SAR SLICK
          map.addSource("sar_slick-source", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [33.05, 32.52],
                    [33.15, 32.51],
                    [33.25, 32.48],
                    [33.28, 32.45],
                    [33.2, 32.47],
                    [33.08, 32.5],
                    [33.05, 32.52],
                  ],
                ],
              },
              properties: { id: "Med-Spill-017", area: 14.6 },
            },
          });
          map.addLayer({
            id: "sar_slick-fill",
            type: "fill",
            source: "sar_slick-source",
            layout: { visibility: "none" },
            paint: { "fill-color": "#22d3ee", "fill-opacity": 0.3 },
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
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [33.1, 32.5] },
                },
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [33.12, 32.51] },
                },
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [33.15, 32.49] },
                },
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [33.08, 32.48] },
                },
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [33.2, 32.46] },
                },
              ],
            },
          });
          map.addLayer({
            id: "hindcast-points",
            type: "circle",
            source: "hindcast-source",
            layout: { visibility: "none" },
            paint: { "circle-color": "#f43f5e", "circle-radius": 4 },
          });

          // 3. AIS TRACKS
          map.addSource("ais_tracks-source", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [32.5, 32.0],
                  [32.8, 32.2],
                  [33.1, 32.5],
                ],
              },
            },
          });
          map.addLayer({
            id: "ais_tracks-line",
            type: "line",
            source: "ais_tracks-source",
            layout: { visibility: "none" },
            paint: { "line-color": "#f59e0b", "line-width": 3 },
          });

          // 4. GEOFENCES (Outer Boundaries)
          map.addSource("geofences-source", {
            type: "geojson",
            data: geofencesData,
          });

          map.addLayer({
            id: "geofences-fill",
            type: "fill",
            source: "geofences-source",
            layout: { visibility: "none" },
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": 0.15,
            },
          });

          map.addLayer({
            id: "geofences-line-watch",
            type: "line",
            source: "geofences-source",
            layout: { visibility: "none" },
            filter: ["==", ["get", "zone_level"], "Watch Zone"],
            paint: {
              "line-color": ["get", "color"],
              "line-width": 1.5,
              "line-dasharray": [4, 4],
              "line-opacity": 0.85,
            },
          });

          map.addLayer({
            id: "geofences-line-critical",
            type: "line",
            source: "geofences-source",
            layout: { visibility: "none" },
            filter: ["==", ["get", "zone_level"], "Critical Strike Zone"],
            paint: {
              "line-color": ["get", "color"],
              "line-width": 2,
              "line-opacity": 0.85,
            },
          });

          // 5. GEOFENCE HOTSPOTS (Center Circles)
          const geofencesCentersData = {
            type: "FeatureCollection",
            features: geofencesData.features.map((f) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                // Extract first coordinate from polygon ring to act as a center point hotspot
                coordinates: [
                  f.geometry.coordinates[0][0][0],
                  f.geometry.coordinates[0][0][1],
                ],
              },
              properties: { color: f.properties.color },
            })),
          };

          map.addSource("geofences-centers-source", {
            type: "geojson",
            data: geofencesCentersData,
          });

          map.addLayer({
            id: "geofences-centers-layer",
            type: "circle",
            source: "geofences-centers-source",
            layout: { visibility: "none" },
            paint: {
              "circle-color": ["get", "color"],
              "circle-radius": 4,
              "circle-opacity": 0.9,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#020617", // Slate 950 border for high contrast
            },
          });
        } catch {
          // Source addition handled cleanly
        }
      });

      mapRef.current = map;
    } catch {
      // Catch synchronous construction errors
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
  }, [token, defaultLat, defaultLon, defaultZoom, interactive, useFallback]);

  // Sync layers visibility from MapEngine
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateVisibility = () => {
      if (!map.isStyleLoaded()) return;

      layers.forEach((layer) => {
        const visibility = layer.active ? "visible" : "none";

        const toggleLayer = (layerId) => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, "visibility", visibility);
          }
        };

        if (layer.id === "sar_slick") {
          toggleLayer("sar_slick-fill");
          toggleLayer("sar_slick-outline");
        } else if (layer.id === "hindcast") {
          toggleLayer("hindcast-points");
        } else if (layer.id === "ais_tracks") {
          toggleLayer("ais_tracks-line");
        } else if (layer.id === "geofences") {
          // Toggle all geofence sub-layers including the new hotspot centers
          toggleLayer("geofences-fill");
          toggleLayer("geofences-line-watch");
          toggleLayer("geofences-line-critical");
          toggleLayer("geofences-centers-layer");
        }
      });
    };

    updateVisibility();
    map.on("styledata", updateVisibility);

    return () => {
      map.off("styledata", updateVisibility);
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

  // Handle correlationMarker for Mapbox engine
  useEffect(() => {
    if (!mapRef.current || !correlationMarker?.lat || !correlationMarker?.lon)
      return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = new mapboxgl.Marker({ color: "#f43f5e" })
      .setLngLat([correlationMarker.lon, correlationMarker.lat])
      .addTo(mapRef.current);

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [correlationMarker]);

  if (useFallback) {
    return (
      <FallbackLeaflet
        center={[defaultLat, defaultLon]}
        zoom={defaultZoom}
        interactive={interactive}
        className={className}
        panToCoordinate={panToCoordinate}
        correlationMarker={correlationMarker}
        layers={layers}
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
