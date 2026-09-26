/**
 * Backward-drift "support density" grid per incident, from each run's
 * support_density_grid.csv (src/data/incidents/<id>/support_density_grid.csv,
 * pre-filtered to non-zero cells only — zero cells render nothing anyway).
 * This is the same corridor visualized in AIS_top15_tracks.png: it shows
 * where the backtracked particle swarm most consistently supports a source,
 * independent of any single vessel.
 */
import Papa from "papaparse";
import ow0008Raw from "./incidents/ow-0008/support_density_grid.csv?raw";
import ow0009Raw from "./incidents/ow-0009/support_density_grid.csv?raw";

const parseDensityGrid = (raw) => ({
  type: "FeatureCollection",
  features: Papa.parse(raw, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  }).data.map((row) => ({
    type: "Feature",
    properties: { density: row.support_density_display_normalized },
    geometry: { type: "Point", coordinates: [row.lon, row.lat] },
  })),
});

export const densityGridByIncident = {
  "ow-0008": parseDensityGrid(ow0008Raw),
  "ow-0009": parseDensityGrid(ow0009Raw),
};
