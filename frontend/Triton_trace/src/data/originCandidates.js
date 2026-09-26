/**
 * Backtracked source-origin candidates matched to each incident's top-15 AIS
 * vessels, from each run's possible_source_origins.csv (filtered down to just
 * the rows whose candidate_id is referenced by AIS_top15_vessels.csv's
 * matched_candidate_id — src/data/incidents/<id>/matched_origin_candidates.csv).
 * Joined with topVesselsByIncident so each candidate carries the rank/name/
 * color of the vessel(s) it was matched against.
 */
import Papa from "papaparse";
import ow0008Raw from "./incidents/ow-0008/matched_origin_candidates.csv?raw";
import ow0009Raw from "./incidents/ow-0009/matched_origin_candidates.csv?raw";
import { topVesselsByIncident, colorForRank } from "./aisTopVessels";

const parseCandidates = (raw, incidentId) => {
  const vesselsByCandidateId = new Map();
  (topVesselsByIncident[incidentId] || []).forEach((v) => {
    if (!vesselsByCandidateId.has(v.matchedCandidateId)) {
      vesselsByCandidateId.set(v.matchedCandidateId, []);
    }
    vesselsByCandidateId.get(v.matchedCandidateId).push(v);
  });

  return Papa.parse(raw, { header: true, dynamicTyping: true, skipEmptyLines: true })
    .data.map((row) => {
      const vessels = vesselsByCandidateId.get(row.candidate_id) || [];
      return {
        candidateId: row.candidate_id,
        candidateTimestamp: row.candidate_timestamp,
        backtrackHours: row.backtrack_hours,
        lat: row.latitude,
        lon: row.longitude,
        supportScore: row.support_score,
        normalizedSupport: row.normalized_support,
        sourceScore: row.source_score,
        aisEvidence: row.ais_evidence,
        aisAvailable: row.ais_available,
        clusterId: row.cluster_id,
        clusterUncertaintyRadiusKm: row.cluster_uncertainty_radius_km,
        clusterTemporalUncertaintyHours: row.cluster_temporal_uncertainty_hours,
        clusterCandidateStabilityPercent: row.cluster_candidate_stability_percent,
        rankAtTimestamp: row.rank_at_timestamp,
        vessels: vessels.map((v) => ({
          rank: v.rank,
          name: v.name,
          mmsi: v.mmsi,
          color: colorForRank(v.rank),
        })),
      };
    })
    .sort((a, b) => a.backtrackHours - b.backtrackHours);
};

export const originCandidatesByIncident = {
  "ow-0008": parseCandidates(ow0008Raw, "ow-0008"),
  "ow-0009": parseCandidates(ow0009Raw, "ow-0009"),
};
