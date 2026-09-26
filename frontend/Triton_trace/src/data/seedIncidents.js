/**
 * Seeded incident data for the Investigator (admin) portal's Triage Queue.
 *
 * Sourced from the two real SAR runs under data/ow-0008.../ow-0008 and
 * data/ow-0009.../ow-0009 (copied into src/data/incidents/<id>/). Values below
 * come from each run's source_origin_summary.txt (T0 timestamp, dominant
 * cluster centroid, uncertainty radius) and initial_particles.csv (the T0
 * particle footprint, used as a bounding-box approximation of the observed
 * slick extent and its area/perimeter — not an authoritative slick polygon).
 *
 * This feeds only the admin Triage Queue; it intentionally does not touch
 * mockData.js, which other portals (landing, normal user, commercial) still use.
 */

const KM_PER_DEG_LAT = 111.32;
const kmPerDegLon = (lat) => KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);

// [minLon, minLat, maxLon, maxLat]
const boxToPolygon = ([minLon, minLat, maxLon, maxLat]) => [
  [minLon, minLat],
  [maxLon, minLat],
  [maxLon, maxLat],
  [minLon, maxLat],
  [minLon, minLat],
];

const boxCenter = ([minLon, minLat, maxLon, maxLat]) => ({
  lat: Math.round(((minLat + maxLat) / 2) * 1e6) / 1e6,
  lon: Math.round(((minLon + maxLon) / 2) * 1e6) / 1e6,
});

const boxAreaSqKm = ([minLon, minLat, maxLon, maxLat]) => {
  const midLat = (minLat + maxLat) / 2;
  const widthKm = (maxLon - minLon) * kmPerDegLon(midLat);
  const heightKm = (maxLat - minLat) * KM_PER_DEG_LAT;
  return Math.round(widthKm * heightKm * 10) / 10;
};

const boxPerimeterKm = ([minLon, minLat, maxLon, maxLat]) => {
  const midLat = (minLat + maxLat) / 2;
  const widthKm = (maxLon - minLon) * kmPerDegLon(midLat);
  const heightKm = (maxLat - minLat) * KM_PER_DEG_LAT;
  return Math.round(2 * (widthKm + heightKm) * 10) / 10;
};

// Bounding boxes of initial_particles.csv lat/lon extent for each run.
const OW_0008_PARTICLE_BOX = [35.257496, 34.064984, 35.275424, 34.090278];
const OW_0009_PARTICLE_BOX = [34.818565, 34.561746, 34.898924, 34.633203];

export const seedIncidents = [
  {
    incident_id: "ow-0008",
    aoi_name: "Eastern Mediterranean — SAR ow-0008",
    region: "Eastern Mediterranean — SAR ow-0008",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "under_investigation",
    severity: "Major",
    coordinates: boxCenter(OW_0008_PARTICLE_BOX),
    slick_area_sqkm: boxAreaSqKm(OW_0008_PARTICLE_BOX),
    perimeter_km: boxPerimeterKm(OW_0008_PARTICLE_BOX),
    detection_timestamp: "2019-06-14T20:35:58Z",
    hindcast_origin: {
      centroid: { lat: 34.31432, lon: 35.11652 },
      uncertainty_radius_km: 30.07,
    },
    slick_polygon: boxToPolygon(OW_0008_PARTICLE_BOX),
  },
  {
    incident_id: "ow-0009",
    aoi_name: "Eastern Mediterranean — SAR ow-0009",
    region: "Eastern Mediterranean — SAR ow-0009",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "under_investigation",
    severity: "Major",
    coordinates: boxCenter(OW_0009_PARTICLE_BOX),
    slick_area_sqkm: boxAreaSqKm(OW_0009_PARTICLE_BOX),
    perimeter_km: boxPerimeterKm(OW_0009_PARTICLE_BOX),
    detection_timestamp: "2019-04-28T15:38:41Z",
    hindcast_origin: {
      centroid: { lat: 34.62799, lon: 35.16738 },
      uncertainty_radius_km: 26.06,
    },
    slick_polygon: boxToPolygon(OW_0009_PARTICLE_BOX),
  },
];
