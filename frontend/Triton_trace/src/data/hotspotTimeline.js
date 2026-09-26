/**
 * Real-time regional hotspot proximity, computed directly from the current
 * forward-track step's actual particle positions against each named
 * location's own Watch/Critical geofence polygon (regional_alert_geofences.json)
 * — a hotspot only highlights once the spill's particles have actually
 * entered that zone, rather than trusting a separately precomputed table.
 *
 * (An earlier version drove this off hotspot_status_timeline.csv, but that
 * table classified some hotspots CRITICAL for their entire 72h window even
 * when zero particles ever actually entered the app's own critical-zone
 * polygon — e.g. ow-0008's Beirut Port. Likely a different critical-radius
 * definition than the app's static 15km ring. Computing straight from the
 * particles avoids that mismatch entirely.)
 */
import * as turf from "@turf/turf";
import geofencesData from "../utils/regional_alert_geofences.json";

const geofencesByHotspot = {};
geofencesData.features.forEach((f) => {
  const name = f.properties.name;
  if (!geofencesByHotspot[name]) geofencesByHotspot[name] = {};
  if (f.properties.zone_level === "Critical Strike Zone") {
    geofencesByHotspot[name].critical = f;
  } else if (f.properties.zone_level === "Watch Zone") {
    geofencesByHotspot[name].watch = f;
  }
});

// particles: [{lon, lat}, ...] for the current forward-track step.
export const computeHotspotStatuses = (particles) => {
  const points = particles.map((p) => turf.point([p.lon, p.lat]));
  const statuses = {};

  Object.entries(geofencesByHotspot).forEach(([name, zones]) => {
    const enteredCritical =
      !!zones.critical &&
      points.some((pt) => turf.booleanPointInPolygon(pt, zones.critical));
    const enteredWatch =
      !enteredCritical &&
      !!zones.watch &&
      points.some((pt) => turf.booleanPointInPolygon(pt, zones.watch));
    statuses[name] = enteredCritical ? "CRITICAL" : enteredWatch ? "WATCH" : "CLEAR";
  });

  return statuses;
};
