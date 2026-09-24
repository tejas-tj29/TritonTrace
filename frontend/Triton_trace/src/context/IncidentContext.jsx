import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Papa from "papaparse";
import aisDataUrl from "../utils/east_med_massive_random_ais.csv?url";
import spillDatabaseUrl from "../utils/database_payload.json?url";

const IncidentContext = createContext();

// Helper function to generate the PRD-mandated 1000 particle swarm
// Centered around the suspected discharge origin from your dossier (Lon: 28.25, Lat: 31.85)
const generateParticleSwarm = (centerLon, centerLat, count) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    // Generate a random Gaussian-like distribution (approx 2km radius spread)
    const u = Math.random();
    const v = Math.random();
    const radius = 0.02 * Math.sqrt(u); // ~2km in decimal degrees
    const theta = 2 * Math.PI * v;

    particles.push({
      id: `p_${i}`,
      lon: centerLon + radius * Math.cos(theta),
      lat: centerLat + radius * Math.sin(theta),
      age: 0,
    });
  }
  return particles;
};

const realIncidents = [
  {
    id: "ow-0008",
    title: "SAR Detection: ow-0008",
    date: "2019-06-14T20:35:58",
    status: "REVIEW",
    image: "/ow-0008.jpg",
    center: [35.264054, 34.074996], // [lon, lat]
    polygon: [
      [35.208083, 34.007546],
      [35.320026, 34.007546],
      [35.320026, 34.142445],
      [35.208083, 34.142445],
      [35.208083, 34.007546] // Close loop
    ]
  },
  {
    id: "ow-0009",
    title: "SAR Detection: ow-0009",
    date: "2019-04-28T15:38:41",
    status: "UNDER_REVIEW",
    image: "/ow-0009.jpg",
    center: [34.889357, 34.606175], // [lon, lat]
    polygon: [
      [34.807722, 34.558783],
      [34.970992, 34.558783],
      [34.970992, 34.653566],
      [34.807722, 34.653566],
      [34.807722, 34.558783] // Close loop
    ]
  }
];

export const IncidentProvider = ({ children }) => {
  // 1. Global Incident State
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidents, setIncidents] = useState(realIncidents);
  const [panToCoordinate, setPanToCoordinate] = useState(null); // {lat, lon}

  // 2. Normal User Manual Mapping State
  // interactionMode: 'none' | 'pick_coordinate' | 'draw_polygon'
  const [interactionMode, setInteractionMode] = useState("none");
  const [pickedCoordinate, setPickedCoordinate] = useState(null);
  const [drawnPolygon, setDrawnPolygon] = useState([]); // array of [lon, lat]
  const [cursorCoordinate, setCursorCoordinate] = useState(null); // [lon, lat]
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);

  // 2.5 Live Fleet State
  const [commercialFleet, setCommercialFleet] = useState([]);

  useEffect(() => {
    Papa.parse(aisDataUrl, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const grouped = {};
        results.data.forEach(row => {
          if (!row.mmsi || !row.lat || !row.lon) return;
          if (!grouped[row.mmsi]) grouped[row.mmsi] = [];
          grouped[row.mmsi].push(row);
        });

        const liveFleet = Object.values(grouped).map(pings => {
          pings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          const latest = pings[pings.length - 1];
          return {
            id: latest.mmsi.toString(),
            name: latest.vessel_name || `UNKNOWN-${latest.mmsi}`,
            type: latest.vessel_type,
            speed: latest.sog,
            heading: latest.cog,
            status: 'NORMAL',
            coordinates: [parseFloat(latest.lon), parseFloat(latest.lat)],
            lat: parseFloat(latest.lat),
            lon: parseFloat(latest.lon),
            trajectory: pings.map(p => [parseFloat(p.lon), parseFloat(p.lat)])
          };
        }).filter(v => v.trajectory.length >= 2);

        setCommercialFleet(liveFleet.slice(0, 10)); // Load top 10 ships
      }
    });
  }, []);

  const [spillDatabase, setSpillDatabase] = useState(null);
  
  useEffect(() => {
    fetch(spillDatabaseUrl)
      .then(res => res.json())
      .then(data => setSpillDatabase(data))
      .catch(err => console.error("Failed to load spill database:", err));
  }, []);

  // 3. Admin / Investigator Analytical State
  const [activeAnalysisMode, setActiveAnalysisMode] = useState("none"); // 'none' | 'attribution' | 'forward_track'
  const [correlationMarker, setCorrelationMarker] = useState(null); // [lon, lat]

  // Initialize the 1000-particle swarm exactly once on load
  const [baseHindcastParticles] = useState(() =>
    generateParticleSwarm(28.25, 31.85, 1000),
  );
  const [hindcastData, setHindcastData] = useState(baseHindcastParticles);

  // 4. Physics & Simulation Methods
  const updateHindcastTimeline = useCallback(
    (offsetHours) => {
      // PRD Section 17: Lagrangian Drift = Current Vector + (Wind Vector * Leeway Factor)
      // offsetHours is negative (e.g., 0 to -12).
      // If the spill drifted Southeast, a backward hindcast moves the particles Northwest.
      const driftFactorX = -0.015; // longitude backward drift per hour
      const driftFactorY = 0.012; // latitude backward drift per hour

      // Simulate windage dispersal (particles spread out slightly the further back in time we go)
      const dispersalSpread = Math.abs(offsetHours) * 0.0005;

      setHindcastData(
        baseHindcastParticles.map((p) => {
          // Apply deterministic random spread based on the particle's ID so the cloud expands naturally
          const uniqueSpreadX =
            Math.sin(parseInt(p.id.split("_")[1])) * dispersalSpread;
          const uniqueSpreadY =
            Math.cos(parseInt(p.id.split("_")[1])) * dispersalSpread;

          return {
            ...p,
            lon: p.lon + offsetHours * driftFactorX + uniqueSpreadX,
            lat: p.lat + offsetHours * driftFactorY + uniqueSpreadY,
            age: offsetHours,
          };
        }),
      );
    },
    [baseHindcastParticles],
  );

  // Custom setter for drawn polygon to easily add vertices
  const addPolygonVertex = useCallback((coord) => {
    setDrawnPolygon((prev) => [...prev, coord]);
  }, []);

  const clearPolygon = useCallback(() => {
    setDrawnPolygon([]);
    setCursorCoordinate(null);
    setIsPolygonClosed(false);
  }, []);

  const value = {
    activeIncident,
    setActiveIncident,
    interactionMode,
    setInteractionMode,
    pickedCoordinate,
    setPickedCoordinate,
    drawnPolygon,
    setDrawnPolygon,
    addPolygonVertex,
    clearPolygon,
    cursorCoordinate,
    setCursorCoordinate,
    isPolygonClosed,
    setIsPolygonClosed,
    panToCoordinate,
    setPanToCoordinate,
    hindcastData,
    updateHindcastTimeline,
    correlationMarker,
    setCorrelationMarker,
    activeAnalysisMode,
    setActiveAnalysisMode,
    commercialFleet,
    incidents,
    setIncidents,
    spillDatabase,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error("useIncident must be used within an IncidentProvider");
  }
  return context;
};
