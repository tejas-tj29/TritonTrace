/**
 * TritonTrace Mock Data Model
 * Extracted from TritonTrace PRD Section 18 & Section 10.3
 */

export const mockIncident = {
  incident_id: "Med-Spill-017",
  aoi_name: "Mediterranean Sea AOI",
  source_type: "satellite_detected",
  status: "under_investigation",
  coordinates: { lat: 35.8989, lon: 14.5146 },
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
    radar_backscatter_db: -22.4
  },
  hindcast_origin: {
    centroid: { lat: 35.7410, lon: 14.3280 },
    release_window: "2026-09-22T00:30:00Z to 2026-09-22T01:30:00Z",
    uncertainty_radius_km: 1.8
  },
  impact_risk: { mpa_pelagos: "HIGH", coastline_landfall_hrs: 18.5, fisheries: "LOW" }
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
    verdict: "HIGH_CORRELATION"
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
    threat_score: 0.310,
    verdict: "LOW_CORRELATION"
  }
];

export const mockHistoricalIncidents = [
  {
    incident_id: "Med-Spill-017",
    aoi_name: "Mediterranean Sea AOI",
    region: "Mediterranean Sea AOI",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "under_investigation",
    coordinates: { lat: 35.8989, lon: 14.5146 },
    slick_area_sqkm: 14.6,
    perimeter_km: 28.4,
    detection_timestamp: "2026-09-22T06:30:00Z",
    severity: "Major",
    slick_polygon: [
      [14.4820, 35.9120],
      [14.5050, 35.9080],
      [14.5380, 35.8920],
      [14.5460, 35.8850],
      [14.5240, 35.8890],
      [14.4910, 35.9010],
      [14.4820, 35.9120]
    ]
  },
  {
    incident_id: "Med-Spill-016",
    aoi_name: "Strait of Sicily",
    region: "Strait of Sicily",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "closed",
    coordinates: { lat: 36.4120, lon: 13.1250 },
    slick_area_sqkm: 8.2,
    perimeter_km: 19.1,
    detection_timestamp: "2026-09-18T14:15:00Z",
    severity: "Moderate",
    slick_polygon: [
      [13.1050, 36.4250],
      [13.1350, 36.4200],
      [13.1480, 36.4050],
      [13.1200, 36.4020],
      [13.1050, 36.4250]
    ]
  },
  {
    incident_id: "Med-Spill-015",
    aoi_name: "Ligurian Sea",
    region: "Ligurian Sea",
    source: "Sentinel-1 SAR",
    source_type: "satellite_detected",
    status: "closed",
    coordinates: { lat: 43.5200, lon: 9.2400 },
    slick_area_sqkm: 5.4,
    perimeter_km: 12.8,
    detection_timestamp: "2026-09-12T09:45:00Z",
    severity: "Minor",
    slick_polygon: [
      [9.2250, 43.5300],
      [9.2550, 43.5250],
      [9.2500, 43.5120],
      [9.2200, 43.5180],
      [9.2250, 43.5300]
    ]
  },
  {
    incident_id: "RPT-20260920-0041",
    aoi_name: "Ionian Sea",
    region: "Ionian Sea",
    source: "Field Observer / Patrol",
    source_type: "citizen_report",
    status: "review",
    coordinates: { lat: 37.8900, lon: 16.4200 },
    slick_area_sqkm: 3.1,
    perimeter_km: 8.5,
    detection_timestamp: "2026-09-20T17:10:00Z",
    severity: "Minor",
    slick_polygon: [
      [16.4050, 37.8980],
      [16.4350, 37.8920],
      [16.4280, 37.8820],
      [16.4020, 37.8890],
      [16.4050, 37.8980]
    ]
  }
];
