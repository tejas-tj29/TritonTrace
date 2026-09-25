/**
 * TritonTrace Mock Data Model
 * Extracted from TritonTrace PRD Section 18 & Section 10.3
 */

export const mockIncident = {
  incident_id: "Med-Spill-017",
  aoi_name: "Eastern Mediterranean AOI",
  source_type: "satellite_detected",
  status: "under_investigation",
  coordinates: { lat: 32.5, lon: 33.1 },
  slick_area_sqkm: 14.6,
  perimeter_km: 28.4,
  geometry_elongation_ratio: "1:8.2", // Indicates linear vessel discharge
  estimated_age_hours: 10.5,
  detection_timestamp: "2026-09-22T06:30:00Z",
  target_asset: "oil_spill",
  metocean: {
    wind_speed_ms: 6.2,
    wind_direction_deg: 315,
    current_speed_ms: 0.24,
    current_direction_deg: 120,
    radar_backscatter_db: -22.4,
  },
  hindcast_origin: {
    centroid: { lat: 32.35, lon: 32.92 },
    release_window: "2026-09-22T00:30:00Z to 2026-09-22T01:30:00Z",
    uncertainty_radius_km: 1.8,
  },
  impact_risk: {
    mpa_pelagos: "HIGH",
    coastline_landfall_hrs: 18.5,
    fisheries: "LOW",
  },
};

export const mockAISVessels = [
  {
    mmsi: "419999999",
    vessel_name: "Pacific Horizon",
    vessel_type: "Crude Oil Tanker",
    flag: "Panama",
    distance_to_origin_km: 0.8,
    sog_transit_knots: 13.8,
    sog_at_origin_knots: 1.2,
    cog_degrees: 45.0,
    sog_anomaly_flag: true,
    ais_gap_detected: true, // Dark shipping behavior
    threat_score: 0.942,
    verdict: "HIGH_CORRELATION",
  },
  {
    mmsi: "419000104",
    vessel_name: "MV Pacific Star",
    vessel_type: "Container Ship",
    flag: "Liberia",
    distance_to_origin_km: 14.2,
    sog_transit_knots: 14.1,
    sog_at_origin_knots: 14.1,
    cog_degrees: 52.0,
    sog_anomaly_flag: false,
    ais_gap_detected: false,
    threat_score: 0.31,
    verdict: "LOW_CORRELATION",
  },
];

export const mockHistoricalIncidents = [
  {
    incident_id: "Med-Spill-017",
    aoi_name: "Eastern Mediterranean AOI",
    region: "Eastern Mediterranean AOI",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "under_investigation",
    coordinates: { lat: 32.5, lon: 33.1 },
    slick_area_sqkm: 14.6,
    perimeter_km: 28.4,
    detection_timestamp: "2026-09-22T06:30:00Z",
    severity: "Major",
    slick_polygon: [
      [33.05, 32.52],
      [33.15, 32.51],
      [33.25, 32.48],
      [33.28, 32.45],
      [33.2, 32.47],
      [33.08, 32.5],
      [33.05, 32.52],
    ],
  },
  {
    incident_id: "Med-Spill-016",
    aoi_name: "South of Crete",
    region: "South of Crete",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "closed",
    coordinates: { lat: 34.2, lon: 26.5 },
    slick_area_sqkm: 8.2,
    perimeter_km: 19.1,
    detection_timestamp: "2026-09-18T14:15:00Z",
    severity: "Moderate",
    slick_polygon: [
      [26.48, 34.22],
      [26.52, 34.21],
      [26.54, 34.18],
      [26.49, 34.17],
      [26.48, 34.22],
    ],
  },
  {
    incident_id: "Med-Spill-015",
    aoi_name: "Rhodes Basin",
    region: "Rhodes Basin",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "closed",
    coordinates: { lat: 35.8, lon: 28.4 },
    slick_area_sqkm: 5.4,
    perimeter_km: 12.8,
    detection_timestamp: "2026-09-12T09:45:00Z",
    severity: "Minor",
    slick_polygon: [
      [28.38, 35.82],
      [28.42, 35.81],
      [28.41, 35.78],
      [28.37, 35.79],
      [28.38, 35.82],
    ],
  },
  {
    incident_id: "RPT-20260920-0041",
    aoi_name: "Levantine Basin",
    region: "Levantine Basin",
    source: "Field Observer / Patrol",
    source_type: "citizen_report",
    status: "review",
    coordinates: { lat: 33.8, lon: 34.5 },
    slick_area_sqkm: 3.1,
    perimeter_km: 8.5,
    detection_timestamp: "2026-09-20T17:10:00Z",
    severity: "Minor",
    slick_polygon: [
      [34.48, 33.82],
      [34.52, 33.81],
      [34.51, 33.78],
      [34.47, 33.79],
      [34.48, 33.82],
    ],
  },
];
export const mockForwardTrack = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [33.1, 32.5],
            [33.5, 32.1],
            [34.0, 31.8],
            [33.6, 32.6],
            [33.1, 32.5],
          ],
        ],
      },
    },
  ],
};
