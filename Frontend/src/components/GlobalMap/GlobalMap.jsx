import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { api } from "@/utils/api";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { Globe2, MapPin } from "lucide-react";

// Coordinates for common regions so the map pins are real when the admin
// publishes a known region. Unknown regions render in the list only.
const REGION_COORDS = {
  kolkata: [22.57, 88.36], calcutta: [22.57, 88.36],
  mumbai: [19.08, 72.88], delhi: [28.61, 77.21], "new delhi": [28.61, 77.21],
  bangalore: [12.97, 77.59], bengaluru: [12.97, 77.59], chennai: [13.08, 80.27],
  hyderabad: [17.39, 78.49], pune: [18.52, 73.86], india: [21.0, 78.0],
  dubai: [25.2, 55.27], uae: [24.0, 54.0], singapore: [1.35, 103.82],
  london: [51.5, -0.13], "united kingdom": [54.0, -2.0], uk: [54.0, -2.0],
  "new york": [40.71, -74.01], usa: [39.0, -98.0], "united states": [39.0, -98.0],
  berlin: [52.52, 13.4], germany: [51.2, 10.4], amsterdam: [52.37, 4.9],
  netherlands: [52.2, 5.6], toronto: [43.65, -79.38], canada: [56.1, -106.3],
  sydney: [-33.87, 151.21], australia: [-25.3, 133.8], remote: null,
};

/**
 * GLOBAL REACH — demoted from primary navigation.
 * Only genuine regions published by the admin appear here. Nothing fabricated.
 */
export default function GlobalMap({ site }) {
  const { data: siteData } = useApi(() => api.getSite());
  const regions = site?.globalReach || siteData?.globalReach || [];

  const points = regions
    .map((r) => {
      const key = Object.keys(REGION_COORDS).find((k) => r.region?.toLowerCase().includes(k));
      const coords = key ? REGION_COORDS[key] : null;
      return { ...r, coords };
    })
    .filter((r) => r.coords);

  return (
    <div className="min-h-screen p-6 pt-16" id="globalreach">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={slideUp} className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Global Reach</h2>
          <p className="text-sm text-text-secondary">Regions connected to real professional activity — as published by me</p>
        </motion.div>

        {regions.length === 0 ? (
          <motion.div variants={staggerItem} className="glass rounded-xl p-12 text-center max-w-lg mx-auto">
            <Globe2 size={36} className="mx-auto mb-4 text-[#4A4A5E]" />
            <h3 className="text-base font-bold text-text-primary mb-2">Nothing published yet</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              I keep this section honest — it will only ever show regions tied to real professional
              activity (clients, collaborations, users). Regions can be published from the Admin
              Control Center when that happens.
            </p>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Map dots */}
            <motion.div variants={staggerItem} className="glass rounded-xl p-6 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(circle at 25% 40%, #7C6AFF 1px, transparent 1.5px), radial-gradient(circle at 70% 30%, #00D4FF 1px, transparent 1.5px), radial-gradient(circle at 50% 70%, #00FF88 1px, transparent 1.5px)",
                  backgroundSize: "48px 48px",
                }}
              />
              <div className="relative w-full" style={{ minHeight: 320 }}>
                {points.map((p, i) => (
                  <motion.div
                    key={p.region + i}
                    className="absolute"
                    style={{
                      left: `${((p.coords[1] + 180) / 360) * 100}%`,
                      top: `${((90 - p.coords[0]) / 180) * 100}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                  >
                    <motion.div
                      className="w-3.5 h-3.5 rounded-full bg-[#00D4FF] border-2 border-white/40"
                      animate={{ boxShadow: ["0 0 0 0 rgba(0,212,255,0.5)", "0 0 0 12px rgba(0,212,255,0)"] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                    />
                  </motion.div>
                ))}
                {points.length === 0 && (
                  <div className="text-xs text-text-muted mono">Published regions don't map to coordinates — shown as list only.</div>
                )}
              </div>
            </motion.div>

            {/* Region list */}
            <motion.div variants={staggerItem} className="space-y-3">
              {regions.map((r, i) => (
                <div key={i} className="glass glass-hover rounded-xl p-4 flex items-start gap-3">
                  <MapPin size={15} className="text-[#00D4FF] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#E8E8F0]">{r.region}</div>
                    {r.note && <div className="text-xs text-[#8B8B9F] leading-relaxed mt-0.5">{r.note}</div>}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
