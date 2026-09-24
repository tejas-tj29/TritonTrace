import { useState } from "react";
import { MapCanvas } from "./MapCanvas";
import { LayerControl } from "./LayerControl";
import { MapLegend } from "./MapLegend";

const INITIAL_LAYERS = [
  {
    id: "sar_slick",
    label: "SAR Slick Polygons",
    active: true,
    color: "bg-cyan-500",
  },
  {
    id: "hindcast",
    label: "Hindcast Particles",
    active: true,
    color: "bg-rose-500",
  },
  {
    id: "ais_tracks",
    label: "AIS Vessel Tracks",
    active: false,
    color: "bg-amber-500",
  },
  {
    id: "geofences",
    label: "Regional Alert Geofences",
    active: true,
    color: "bg-emerald-500",
  },
];

export const MapEngine = ({ onEngineResolved, interactive = true }) => {
  const [layers, setLayers] = useState(INITIAL_LAYERS);

  const toggleLayer = (id) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, active: !layer.active } : layer,
      ),
    );
  };

  return (
    <div className="absolute inset-0 isolate">
      <MapCanvas
        interactive={interactive}
        onEngineResolved={onEngineResolved}
        layers={layers}
      />

      {/* Shared Floating Map UI */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-4">
        <LayerControl layers={layers} toggleLayer={toggleLayer} />
        <MapLegend />
      </div>
    </div>
  );
};

export default MapEngine;

