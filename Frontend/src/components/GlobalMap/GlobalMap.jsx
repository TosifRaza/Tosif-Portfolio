import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mapLayers, locations } from "@/data/mapData";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { MapPin, X } from "lucide-react";

export default function GlobalMap() {
  const [activeLayer, setActiveLayer] = useState("journey");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const filteredLocations = locations.filter((loc) => loc.layer === activeLayer);
  const selected = selectedLocation ? locations.find((l) => l.name === selectedLocation) : null;

  const layerColors = {
    journey: "#7C6AFF",
    reach: "#00D4FF",
    expansion: "#FFB800",
  };

  return (
    <div className="min-h-full p-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={slideUp} className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Global Impact Map</h2>
          <p className="text-sm text-text-secondary">Explore the journey, reach, and expansion of the mission</p>
        </motion.div>

        {/* Layer Toggle */}
        <motion.div variants={staggerItem} className="flex gap-2 mb-6">
          {mapLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => { setActiveLayer(layer.id); setSelectedLocation(null); }}
              className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                activeLayer === layer.id ? "border-opacity-60" : "bg-white/[0.03] text-text-secondary border-white/[0.06] hover:border-white/[0.12]"
              }`}
              style={activeLayer === layer.id ? {
                background: `${layer.color}20`,
                color: layer.color,
                borderColor: `${layer.color}60`,
              } : {}}
            >
              {layer.label}
            </button>
          ))}
        </motion.div>

        {/* Map area */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-6 min-h-[400px] relative">
          {/* Simple SVG India map outline */}
          <svg viewBox="0 0 400 450" className="w-full max-w-md mx-auto opacity-20">
            {/* Simplified India outline */}
            <path
              d="M200 30 L240 60 L260 100 L280 120 L270 160 L250 180 L260 220 L240 260 L220 300 L200 340 L180 360 L160 340 L140 300 L120 260 L130 220 L140 180 L130 140 L150 100 L170 60 Z"
              fill="rgba(124, 106, 255, 0.1)"
              stroke="rgba(124, 106, 255, 0.3)"
              strokeWidth="1"
            />
          </svg>

          {/* Location dots */}
          {locations.map((loc) => {
            const isActive = filteredLocations.some((fl) => fl.name === loc.name);
            if (!isActive && loc.layer !== activeLayer) return null;

            // Convert lat/lng to approximate SVG positions
            const x = ((loc.lng - 68) / (97 - 68)) * 350 + 25;
            const y = ((loc.lat - 8) / (37 - 8)) * 400 + 25;

            return (
              <motion.button
                key={loc.name}
                className="absolute group"
                style={{ left: `${(x / 400) * 100}%`, top: `${(y / 450) * 100}%`, transform: "translate(-50%, -50%)" }}
                onClick={() => setSelectedLocation(loc.name === selectedLocation ? null : loc.name)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: layerColors[loc.layer ] || "#7C6AFF",
                    boxShadow: `0 0 10px ${layerColors[loc.layer ] || "#7C6AFF"}60`,
                  }}
                  animate={selectedLocation === loc.name ? { scale: [1, 1.5, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[10px] text-text-secondary whitespace-nowrap font-mono">
                  {loc.name}
                </div>
              </motion.button>
            );
          })}

          {/* Location story card */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-4 w-64 glass-strong rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: layerColors[selected.layer ] }} />
                    <span className="text-sm font-medium text-text-primary">{selected.name}</span>
                  </div>
                  <button onClick={() => setSelectedLocation(null)} className="text-text-muted hover:text-text-secondary">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-2">{selected.story}</p>
                {selected.year && (
                  <div className="text-[10px] text-text-muted">Year: {selected.year}</div>
                )}
                {selected.population && (
                  <div className="text-[10px] text-text-muted">Users: {selected.population}+</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
