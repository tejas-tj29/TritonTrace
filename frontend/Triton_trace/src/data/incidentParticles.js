/**
 * Real T0 particle detections per incident, from each run's initial_particles.csv
 * (src/data/incidents/<id>/initial_particles.csv). These are the particles a SAR
 * pass actually detected for that spill — rendering them densely is what forms
 * the visible slick shape on the map.
 */
import Papa from "papaparse";
import ow0008ParticlesRaw from "./incidents/ow-0008/initial_particles.csv?raw";
import ow0009ParticlesRaw from "./incidents/ow-0009/initial_particles.csv?raw";

const parseParticles = (raw) =>
  Papa.parse(raw, { header: true, dynamicTyping: true, skipEmptyLines: true })
    .data.filter((p) => p.lat != null && p.lon != null)
    .map((p) => ({
      id: p.particle_id,
      lat: p.lat,
      lon: p.lon,
      mass_kg: p.mass_kg,
      confidence: p.confidence,
    }));

export const incidentParticlesById = {
  "ow-0008": parseParticles(ow0008ParticlesRaw),
  "ow-0009": parseParticles(ow0009ParticlesRaw),
};
