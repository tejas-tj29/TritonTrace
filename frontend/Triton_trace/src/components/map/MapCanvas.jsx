import { useState, useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FallbackLeaflet } from "./FallbackLeaflet";
import { useIncident } from "../../context/IncidentContext";
import geofencesData from "../../utils/regional_alert_geofences.json";
import { densityGridByIncident } from "../../data/densityGrid";
import { topVesselsByIncident, colorForRank } from "../../data/aisTopVessels";
import { incidentParticlesById } from "../../data/incidentParticles";
import { computeHotspotStatuses } from "../../data/hotspotTimeline";
import * as turf from "@turf/turf";

const HOTSPOT_STATUS_COLORS = {
  CRITICAL: "#ef4444",
  WATCH: "#f59e0b",
  CLEAR: "#94a3b8",
};

const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };

// Applies the layer panel's on/off state to the underlying Mapbox layers.
// Shared by the initial "load" handler (so default-active layers are
// visible on first paint) and the ongoing styledata-driven sync effect.
const applyLayerVisibility = (map, layers) => {
  layers.forEach((layer) => {
    const visibility = layer.active ? "visible" : "none";
    if (layer.id === "sar_slick") {
      if (map.getLayer("sar_slick-halo"))
        map.setLayoutProperty("sar_slick-halo", "visibility", visibility);
      if (map.getLayer("sar_slick-points"))
        map.setLayoutProperty("sar_slick-points", "visibility", visibility);
    } else if (layer.id === "hindcast") {
      if (map.getLayer("hindcast-points"))
        map.setLayoutProperty("hindcast-points", "visibility", visibility);
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

export const MapCanvas = ({
  interactive = true,
  className = "",
  onEngineResolved,
  layers = [],
  commercialFleet = [],
  selectedVesselId = null,
  showDiversionRoute = false,
}) => {
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
    pickedCoordinate,
    setPickedCoordinate,
    allIncidentParticles,
    activeAnalysisMode,
    activeIncident,
    focusedVesselMmsi,
    focusedCandidateId,
    focusVessel,
    forwardTrackIncidentId,
    forwardTrackStep,
    forwardTrajectory,
  } = useIncident();

  // Which incident's source-attribution view (density cluster + top-15
  // routes/intersections) is currently open, if any.
  const attributionIncidentId =
    activeAnalysisMode === "attribution" ? activeIncident : null;

  const initialViewState = {
    longitude: defaultLon,
    latitude: defaultLat,
    zoom: defaultZoom,
  };

  const sarSlickParticlesGeoJSON = useMemo(() => {
    // While FORWARD TRACK is open, only the chosen incident's own slick
    // stays on the map — the other incident's is hidden, not just its AIS.
    const particles = forwardTrackIncidentId
      ? incidentParticlesById[forwardTrackIncidentId] || []
      : allIncidentParticles;
    return {
      type: "FeatureCollection",
      features: particles.map((p) => ({
        type: "Feature",
        properties: { id: p.id, confidence: p.confidence },
        geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      })),
    };
  }, [allIncidentParticles, forwardTrackIncidentId]);

  // The current forward-track step's actual particle positions — the
  // single source of truth for both what's drawn on the map and which
  // hotspots have really been entered (see geofencesGeoJSON below).
  const currentStepParticles = useMemo(() => {
    const frames = forwardTrajectory.particlesByStep;
    if (!forwardTrackIncidentId || frames.length === 0) return [];
    const step = Math.min(forwardTrackStep, frames.length - 1);
    return frames[step] || [];
  }, [forwardTrackIncidentId, forwardTrackStep, forwardTrajectory]);

  // Real forward-drift particle positions at the current hour, plus each
  // particle's cumulative drift path from t0 up to that hour — mirrors
  // final.png's cream parcels + dark-blue drift-path lines.
  const forwardTrackGeoJSON = useMemo(() => {
    const frames = forwardTrajectory.particlesByStep;
    if (!forwardTrackIncidentId || frames.length === 0) {
      return { points: EMPTY_FEATURE_COLLECTION, paths: EMPTY_FEATURE_COLLECTION };
    }
    const step = Math.min(forwardTrackStep, frames.length - 1);
    const currentFrame = currentStepParticles;

    const pointFeatures = currentFrame.map((p, i) => ({
      type: "Feature",
      properties: { id: i },
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
    }));

    const pathFeatures = [];
    for (let i = 0; i < currentFrame.length; i++) {
      const coords = [];
      for (let s = 0; s <= step; s++) {
        const point = frames[s] && frames[s][i];
        if (point) coords.push([point.lon, point.lat]);
      }
      if (coords.length >= 2) {
        pathFeatures.push({
          type: "Feature",
          properties: { id: i },
          geometry: { type: "LineString", coordinates: coords },
        });
      }
    }

    return {
      points: { type: "FeatureCollection", features: pointFeatures },
      paths: { type: "FeatureCollection", features: pathFeatures },
    };
  }, [forwardTrackIncidentId, forwardTrackStep, forwardTrajectory, currentStepParticles]);

  // Regional geofences: normally always shown with their static Watch/
  // Critical colors, but while FORWARD TRACK is open they instead only
  // highlight once the current step's actual particles have entered that
  // hotspot's own zone (computeHotspotStatuses checks real point-in-polygon
  // against the same geofences drawn on the map, not a separately
  // precomputed table that could disagree with what's actually rendered).
  const geofencesGeoJSON = useMemo(() => {
    if (!forwardTrackIncidentId) {
      return {
        ...geofencesData,
        features: geofencesData.features.map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            displayColor: f.properties.color,
            displayOpacity: 0.2,
            displayLineOpacity: 1,
          },
        })),
      };
    }
    const statuses = computeHotspotStatuses(currentStepParticles);
    return {
      ...geofencesData,
      features: geofencesData.features.map((f) => {
        const status = statuses[f.properties.name] || "CLEAR";
        const zoneMatchesStatus =
          (status === "CRITICAL" && f.properties.zone_level === "Critical Strike Zone") ||
          (status === "WATCH" && f.properties.zone_level === "Watch Zone");
        return {
          ...f,
          properties: {
            ...f.properties,
            displayColor: HOTSPOT_STATUS_COLORS[status],
            displayOpacity: zoneMatchesStatus ? 0.45 : 0,
            displayLineOpacity: zoneMatchesStatus ? 1 : 0,
          },
        };
      }),
    };
  }, [forwardTrackIncidentId, currentStepParticles]);

  const attributionDensityGeoJSON = useMemo(
    () => densityGridByIncident[attributionIncidentId] || EMPTY_FEATURE_COLLECTION,
    [attributionIncidentId],
  );

  // Top-15 vessel routes + where each one's route intersects the density
  // cluster (matched_candidate point), with a thin connector between a
  // vessel's own closest-approach position and that intersection point —
  // mirrors AIS_top15_tracks.png's flagged-vessel-vs-cluster view.
  const attributionVesselsGeoJSON = useMemo(() => {
    if (!attributionIncidentId) {
      return { routes: EMPTY_FEATURE_COLLECTION, intersections: EMPTY_FEATURE_COLLECTION, connectors: EMPTY_FEATURE_COLLECTION };
    }
    const fleetByMmsi = new Map(commercialFleet.map((v) => [v.id, v]));
    const allTopVessels = topVesselsByIncident[attributionIncidentId] || [];
    // Isolating one vessel or one origin candidate shows only the matching
    // route(s)/intersection(s)/connector(s) — a candidate can be matched by
    // more than one vessel (e.g. ow-0008's cand000).
    let topVessels = allTopVessels;
    if (focusedVesselMmsi) {
      topVessels = allTopVessels.filter((v) => v.mmsi === focusedVesselMmsi);
    } else if (focusedCandidateId) {
      topVessels = allTopVessels.filter(
        (v) => v.matchedCandidateId === focusedCandidateId,
      );
    }
    const isFocused = Boolean(focusedVesselMmsi || focusedCandidateId);

    const routeFeatures = [];
    const intersectionFeatures = [];
    const connectorFeatures = [];

    topVessels.forEach((v) => {
      const color = colorForRank(v.rank);
      const track = fleetByMmsi.get(v.mmsi);
      if (track && track.trajectory && track.trajectory.length >= 2) {
        routeFeatures.push({
          type: "Feature",
          properties: { rank: v.rank, name: v.name, color, isFocused },
          geometry: { type: "LineString", coordinates: track.trajectory },
        });
      }

      if (v.matchedCandidateLon != null && v.matchedCandidateLat != null) {
        intersectionFeatures.push({
          type: "Feature",
          properties: {
            rank: v.rank,
            name: v.name,
            mmsi: v.mmsi,
            color,
            isFocused,
            encounterTime: v.bestEncounterTimestamp
              ? new Date(v.bestEncounterTimestamp).toLocaleString()
              : "Unknown",
          },
          geometry: {
            type: "Point",
            coordinates: [v.matchedCandidateLon, v.matchedCandidateLat],
          },
        });

        if (v.bestEncounterLon != null && v.bestEncounterLat != null) {
          connectorFeatures.push({
            type: "Feature",
            properties: { rank: v.rank, color, isFocused },
            geometry: {
              type: "LineString",
              coordinates: [
                [v.bestEncounterLon, v.bestEncounterLat],
                [v.matchedCandidateLon, v.matchedCandidateLat],
              ],
            },
          });
        }
      }
    });

    return {
      routes: { type: "FeatureCollection", features: routeFeatures },
      intersections: { type: "FeatureCollection", features: intersectionFeatures },
      connectors: { type: "FeatureCollection", features: connectorFeatures },
    };
  }, [attributionIncidentId, commercialFleet, focusedVesselMmsi, focusedCandidateId]);

  // While ATTRIBUTION is open, the generic AIS layer narrows down to just
  // that incident's top-15 (already shown, colored, on the attribution
  // routes/intersections layers) instead of all 35 vessels — the extra 20
  // "nearest" vessels aren't relevant to a specific attribution and just
  // add clutter on top of it.
  const visibleVesselFleet = useMemo(() => {
    // FORWARD TRACK is a single-incident view of the forecast only — no AIS.
    if (forwardTrackIncidentId) return [];
    if (!attributionIncidentId) return commercialFleet;
    if (focusedVesselMmsi)
      return commercialFleet.filter((v) => v.id === focusedVesselMmsi);
    const allTopVessels = topVesselsByIncident[attributionIncidentId] || [];
    const relevantVessels = focusedCandidateId
      ? allTopVessels.filter((v) => v.matchedCandidateId === focusedCandidateId)
      : allTopVessels;
    const topMmsiSet = new Set(relevantVessels.map((v) => v.mmsi));
    return commercialFleet.filter((v) => topMmsiSet.has(v.id));
  }, [
    commercialFleet,
    attributionIncidentId,
    focusedVesselMmsi,
    focusedCandidateId,
    forwardTrackIncidentId,
  ]);

  const vesselTracksGeoJSON = useMemo(() => {
    if (!visibleVesselFleet) return EMPTY_FEATURE_COLLECTION;
    return {
      type: "FeatureCollection",
      features: visibleVesselFleet
        .filter((v) => v.trajectory && v.trajectory.length >= 2)
        .map((vessel) => ({
          type: "Feature",
          properties: { id: vessel.id },
          geometry: {
            type: "LineString",
            coordinates: vessel.trajectory,
          },
        })),
    };
  }, [visibleVesselFleet]);

  const vesselPointsGeoJSON = useMemo(() => {
    if (!visibleVesselFleet) return EMPTY_FEATURE_COLLECTION;
    return {
      type: "FeatureCollection",
      features: visibleVesselFleet.map((vessel) => ({
        type: "Feature",
        properties: {
          id: vessel.id,
          name: vessel.name,
          heading: vessel.heading || 0,
          type: vessel.type || "Unknown",
        },
        geometry: {
          type: "Point",
          coordinates: vessel.coordinates,
        },
      })),
    };
  }, [visibleVesselFleet]);

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

  // Create a ref for onEngineResolved to prevent infinite re-renders
  const engineResolvedRef = useRef(onEngineResolved);
  useEffect(() => {
    engineResolvedRef.current = onEngineResolved;
  }, [onEngineResolved]);

  const stateRef = useRef({ interactionMode, drawnPolygon, isPolygonClosed });
  useEffect(() => {
    stateRef.current = { interactionMode, drawnPolygon, isPolygonClosed };
  }, [interactionMode, drawnPolygon, isPolygonClosed]);

  useEffect(() => {
    if (useFallback) {
      if (engineResolvedRef.current) engineResolvedRef.current("leaflet");
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
          if (engineResolvedRef.current) engineResolvedRef.current("leaflet");
        }
      });

      map.on("load", () => {
        if (engineResolvedRef.current) engineResolvedRef.current("mapbox");

        try {
          // 1. SAR SLICK — real detected particles for the active incident
          // (initial_particles.csv). Dense overlapping points form the
          // visible slick shape; the halo layer gives it a soft edge glow.
          map.addSource("sar_slick-source", {
            type: "geojson",
            data: sarSlickParticlesGeoJSON,
          });
          map.addLayer({
            id: "sar_slick-halo",
            type: "circle",
            source: "sar_slick-source",
            layout: { visibility: "none" },
            paint: {
              "circle-radius": 7,
              "circle-color": "#d97706",
              "circle-opacity": 0.12,
              "circle-blur": 1,
            },
          });
          map.addLayer({
            id: "sar_slick-points",
            type: "circle",
            source: "sar_slick-source",
            layout: { visibility: "none" },
            paint: {
              "circle-radius": 2.5,
              "circle-color": "#050403",
              "circle-opacity": 0.92,
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
            data: vesselTracksGeoJSON,
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
              "line-opacity": 0.8,
            },
          });

          // 3.5 LIVE VESSELS
          map.addSource("live-vessels-source", {
            type: "geojson",
            data: vesselPointsGeoJSON,
          });
          map.addLayer({
            id: "live-vessels-symbol",
            type: "symbol",
            source: "live-vessels-source",
            layout: {
              "text-field": "▲",
              "text-rotate": ["get", "heading"],
              "text-size": 18,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "text-pitch-alignment": "map",
            },
            paint: {
              "text-color": [
                "match",
                ["get", "type"],
                "Crude Oil Tanker",
                "#ef4444",
                "Chemical Tanker",
                "#f97316",
                "LNG Carrier",
                "#eab308",
                "#ffffff",
              ],
              "text-halo-color": "#1e293b",
              "text-halo-width": 1.5,
            },
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

          // 5. REGIONAL GEOFENCES — displayColor/displayOpacity default to
          // the static always-shown styling, and switch to reflect the real
          // per-hour hotspot status while FORWARD TRACK is open (see
          // geofencesGeoJSON).
          map.addSource("geofences-source", {
            type: "geojson",
            data: geofencesGeoJSON,
          });
          map.addLayer({
            id: "geofences-fill",
            type: "fill",
            source: "geofences-source",
            paint: {
              "fill-color": ["get", "displayColor"],
              "fill-opacity": ["get", "displayOpacity"],
            },
          });
          map.addLayer({
            id: "geofences-line",
            type: "line",
            source: "geofences-source",
            paint: {
              "line-color": ["get", "displayColor"],
              "line-width": 1.5,
              "line-opacity": ["get", "displayLineOpacity"],
            },
          });

          // 5.5 FORWARD TRACK — real OpenOil forward-drift particles at the
          // current hour + each particle's cumulative drift path so far.
          // Sources start empty and are filled by the sync effect below.
          map.addSource("forward-track-path-source", {
            type: "geojson",
            data: forwardTrackGeoJSON.paths,
          });
          map.addLayer({
            id: "forward-track-path-line",
            type: "line",
            source: "forward-track-path-source",
            paint: { "line-color": "#1e3a8a", "line-width": 1, "line-opacity": 0.5 },
          });
          map.addSource("forward-track-points-source", {
            type: "geojson",
            data: forwardTrackGeoJSON.points,
          });
          map.addLayer({
            id: "forward-track-points-circle",
            type: "circle",
            source: "forward-track-points-source",
            paint: {
              "circle-radius": 4,
              "circle-color": "#fef3c7",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#78350f",
            },
          });

          // 6.5 SOURCE ATTRIBUTION — density cluster + top-15 routes/intersections
          // for whichever incident has ATTRIBUTION open. Sources start empty and
          // are filled by the sync effects below; layout stays "visible" since an
          // empty FeatureCollection already renders nothing.
          map.addSource("attribution-density-source", {
            type: "geojson",
            data: attributionDensityGeoJSON,
          });
          // Each grid cell's own density value is colored directly (viridis
          // scale, matching the source Python plots), rather than using a
          // KDE-style heatmap layer — the grid is already a raster of real
          // computed values, so summing overlapping points would misrepresent it.
          map.addLayer({
            id: "attribution-density-heatmap",
            type: "circle",
            source: "attribution-density-source",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 12, 9],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "density"],
                0, "#440154",
                0.25, "#3b528b",
                0.5, "#21908d",
                0.75, "#5dc963",
                1, "#fde725",
              ],
              "circle-opacity": 0.75,
              "circle-blur": 0.4,
            },
          });

          map.addSource("attribution-routes-source", {
            type: "geojson",
            data: attributionVesselsGeoJSON.routes,
          });
          map.addLayer({
            id: "attribution-routes-line",
            type: "line",
            source: "attribution-routes-source",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": ["get", "color"],
              "line-width": ["case", ["get", "isFocused"], 4, 1.5],
              "line-opacity": ["case", ["get", "isFocused"], 1, 0.85],
            },
          });

          map.addSource("attribution-connectors-source", {
            type: "geojson",
            data: attributionVesselsGeoJSON.connectors,
          });
          map.addLayer({
            id: "attribution-connectors-line",
            type: "line",
            source: "attribution-connectors-source",
            paint: {
              "line-color": ["get", "color"],
              "line-width": ["case", ["get", "isFocused"], 2, 1],
              "line-dasharray": [1, 1.5],
              "line-opacity": 0.9,
            },
          });

          map.addSource("attribution-intersections-source", {
            type: "geojson",
            data: attributionVesselsGeoJSON.intersections,
          });
          // Soft glow behind the isolated candidate/vessel marker — invisible
          // (radius 0) unless a vessel or candidate is focused.
          map.addLayer({
            id: "attribution-intersections-halo",
            type: "circle",
            source: "attribution-intersections-source",
            paint: {
              "circle-radius": ["case", ["get", "isFocused"], 22, 0],
              "circle-color": ["get", "color"],
              "circle-opacity": 0.3,
              "circle-blur": 0.6,
            },
          });
          map.addLayer({
            id: "attribution-intersections-circle",
            type: "circle",
            source: "attribution-intersections-source",
            paint: {
              "circle-radius": ["case", ["get", "isFocused"], 13, 9],
              "circle-color": ["get", "color"],
              "circle-stroke-width": ["case", ["get", "isFocused"], 3, 2],
              "circle-stroke-color": "#0f172a",
            },
          });
          map.addLayer({
            id: "attribution-intersections-label",
            type: "symbol",
            source: "attribution-intersections-source",
            layout: {
              "text-field": ["get", "rank"],
              "text-size": 10,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            },
            paint: { "text-color": "#ffffff" },
          });
          // The time each vessel was closest to the spill origin, shown
          // just below its numbered marker.
          map.addLayer({
            id: "attribution-intersections-time-label",
            type: "symbol",
            source: "attribution-intersections-source",
            layout: {
              "text-field": ["get", "encounterTime"],
              "text-size": 9,
              "text-offset": [0, 1.3],
              "text-anchor": "top",
              "text-allow-overlap": false,
              "text-optional": true,
            },
            paint: {
              "text-color": "#f8fafc",
              "text-halo-color": "#0f172a",
              "text-halo-width": 1.2,
            },
          });

          map.on("click", "attribution-intersections-circle", (e) => {
            const feature = e.features && e.features[0];
            if (!feature) return;
            const { name, rank, mmsi, encounterTime } = feature.properties;
            focusVessel(mmsi);
            new mapboxgl.Popup({ closeButton: true, offset: 12 })
              .setLngLat(e.lngLat)
              .setHTML(
                `<div style="font-family:monospace;font-size:11px;line-height:1.5;">` +
                  `<strong>#${rank} ${name}</strong><br/>` +
                  `Near spill origin: ${encounterTime}` +
                  `</div>`,
              )
              .addTo(map);
          });
          map.on("mouseenter", "attribution-intersections-circle", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "attribution-intersections-circle", () => {
            map.getCanvas().style.cursor = "";
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
          // Apply the layer panel's initial on/off state directly, since
          // the styledata-driven sync effect below can race style
          // readiness on first paint and silently leave layers hidden.
          applyLayerVisibility(map, layers);
        } catch {
          // Source addition handled cleanly
        }
      });

      mapRef.current = map;
    } catch {
      setTimeout(() => {
        setUseFallback(true);
        if (engineResolvedRef.current) engineResolvedRef.current("leaflet");
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // CRITICAL FIX: Removed onEngineResolved to prevent infinite re-renders
  }, [token, defaultLat, defaultLon, defaultZoom, interactive, useFallback]);

  // Sync SAR slick particle cloud for the active incident
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateSlickSource = () => {
      const source = map.getSource("sar_slick-source");
      if (source) source.setData(sarSlickParticlesGeoJSON);
    };

    updateSlickSource();
    map.on("styledata", updateSlickSource);
    return () => map.off("styledata", updateSlickSource);
  }, [sarSlickParticlesGeoJSON]);

  // Sync forward-track particles/paths for the current hour
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateForwardTrackSources = () => {
      const pointSource = map.getSource("forward-track-points-source");
      if (pointSource) pointSource.setData(forwardTrackGeoJSON.points);

      const pathSource = map.getSource("forward-track-path-source");
      if (pathSource) pathSource.setData(forwardTrackGeoJSON.paths);
    };

    updateForwardTrackSources();
    map.on("styledata", updateForwardTrackSources);
    return () => map.off("styledata", updateForwardTrackSources);
  }, [forwardTrackGeoJSON]);

  // Sync regional geofences' display color/opacity (static, or driven by
  // the active incident's real hotspot status while FORWARD TRACK is open)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateGeofencesSource = () => {
      const source = map.getSource("geofences-source");
      if (source) source.setData(geofencesGeoJSON);
    };

    updateGeofencesSource();
    map.on("styledata", updateGeofencesSource);
    return () => map.off("styledata", updateGeofencesSource);
  }, [geofencesGeoJSON]);

  // Sync the source-attribution view (density cluster + top-15 routes,
  // intersections, and connectors) for whichever incident has ATTRIBUTION open.
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateAttributionSources = () => {
      const densitySource = map.getSource("attribution-density-source");
      if (densitySource) densitySource.setData(attributionDensityGeoJSON);

      const routesSource = map.getSource("attribution-routes-source");
      if (routesSource) routesSource.setData(attributionVesselsGeoJSON.routes);

      const connectorsSource = map.getSource("attribution-connectors-source");
      if (connectorsSource)
        connectorsSource.setData(attributionVesselsGeoJSON.connectors);

      const intersectionsSource = map.getSource("attribution-intersections-source");
      if (intersectionsSource)
        intersectionsSource.setData(attributionVesselsGeoJSON.intersections);
    };

    updateAttributionSources();
    map.on("styledata", updateAttributionSources);
    return () => map.off("styledata", updateAttributionSources);
  }, [attributionDensityGeoJSON, attributionVesselsGeoJSON]);

  // Sync vessel trajectories and live vessels
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateSources = () => {
      const trackSource = map.getSource("ais_tracks-source");
      if (trackSource) trackSource.setData(vesselTracksGeoJSON);

      const pointSource = map.getSource("live-vessels-source");
      if (pointSource) pointSource.setData(vesselPointsGeoJSON);
    };

    updateSources();
    map.on("styledata", updateSources);
    return () => {
      map.off("styledata", updateSources);
    };
  }, [vesselTracksGeoJSON, vesselPointsGeoJSON]);

  // Sync layers visibility from MapEngine
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateVisibility = () => applyLayerVisibility(map, layers);

    updateVisibility();
    map.on("styledata", updateVisibility);
    return () => map.off("styledata", updateVisibility);
  }, [layers]);

  // Handle Map Drawing Interactions
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleClick = (e) => {
      const { interactionMode, drawnPolygon, isPolygonClosed } =
        stateRef.current;

      if (interactionMode === "pick_coordinate") {
        setPickedCoordinate({ lat: e.lngLat.lat, lon: e.lngLat.lng });
        return;
      }

      if (interactionMode === "draw_polygon" && !isPolygonClosed) {
        const newPoint = [e.lngLat.lng, e.lngLat.lat];
        if (drawnPolygon.length >= 3) {
          const firstPoint = drawnPolygon[0];
          const dist = turf.distance(
            turf.point(firstPoint),
            turf.point(newPoint),
            { units: "kilometers" },
          );
          if (dist < 50) {
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
  }, [
    addPolygonVertex,
    setCursorCoordinate,
    setIsPolygonClosed,
    setPickedCoordinate,
  ]);

  // Render Drawn Polygon
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateDrawnPolygon = () => {
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
          source.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates },
          });
        } else {
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

    updateDrawnPolygon();
    map.on("styledata", updateDrawnPolygon);
    return () => map.off("styledata", updateDrawnPolygon);
  }, [drawnPolygon, cursorCoordinate, isPolygonClosed, interactionMode]);

  // Camera FlyTo logic (cleaned up duplicate block)
  useEffect(() => {
    if (mapRef.current && panToCoordinate?.lat && panToCoordinate?.lon) {
      mapRef.current.flyTo({
        center: [panToCoordinate.lon, panToCoordinate.lat],
        zoom: 10, // Zoomed in closer so you can see the GPS selection clearly
        essential: true,
        duration: 2000,
      });
    }
  }, [panToCoordinate]);

  // Handle Picked Coordinate Visual Marker
  const pickedMarkerRef = useRef(null);
  useEffect(() => {
    if (!mapRef.current) return;

    if (pickedMarkerRef.current) {
      pickedMarkerRef.current.remove();
      pickedMarkerRef.current = null;
    }

    if (pickedCoordinate?.lat && pickedCoordinate?.lon) {
      // Creates a blue marker pin to show exactly where the user clicked/GPS locked
      pickedMarkerRef.current = new mapboxgl.Marker({ color: "#0ea5e9" })
        .setLngLat([pickedCoordinate.lon, pickedCoordinate.lat])
        .addTo(mapRef.current);
    }

    return () => {
      if (pickedMarkerRef.current) {
        pickedMarkerRef.current.remove();
        pickedMarkerRef.current = null;
      }
    };
  }, [pickedCoordinate]);

  // Handle Diversion Route
  useEffect(() => {
    if (!mapRef.current || useFallback) return;

    const updateRoute = () => {
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
        if (mapRef.current.getLayer("diversion-line")) {
          mapRef.current.setLayoutProperty(
            "diversion-line",
            "visibility",
            "none",
          );
        }
      }
    };

    updateRoute();
    mapRef.current.on("styledata", updateRoute);
    return () => {
      if (mapRef.current) mapRef.current.off("styledata", updateRoute);
    };
  }, [showDiversionRoute, selectedVesselId, commercialFleet, useFallback]);

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
