import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { api, apiUrl } from "@/utils/api";
import {
  X, ExternalLink, Github, TrendingUp, Map, CheckCircle2, Circle, Loader, Package,
} from "lucide-react";

const STATUS_STYLES = {
  idea: { color: "#9B9BAF", label: "IDEA" },
  planning: { color: "#FFB800", label: "PLANNING" },
  development: { color: "#00D4FF", label: "DEVELOPMENT" },
  mvp: { color: "#7C6AFF", label: "MVP" },
  live: { color: "#00FF88", label: "LIVE" },
  maintenance: { color: "#FF6B9D", label: "MAINTENANCE" },
  archived: { color: "#6B6B80", label: "ARCHIVED" },
};

const ROADMAP_ICONS = { completed: CheckCircle2, current: Loader, upcoming: Circle };

function ProductModal({ product, onClose }) {
  const st = STATUS_STYLES[product.status] || STATUS_STYLES.idea;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-7"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            {product.logoUrl ? (
              <img src={apiUrl(product.logoUrl)} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B9D]/30 to-[#7C6AFF]/30 flex items-center justify-center">
                <Package size={20} className="text-[#FF6B9D]" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                {product.name}
              </h3>
              {product.tagline && <p className="text-sm text-[#8B8B9F]">{product.tagline}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-[#9B9BAF]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <span
          className="inline-block px-2.5 py-1 rounded-full text-[10px] mono border mb-5"
          style={{ color: st.color, borderColor: `${st.color}40`, background: `${st.color}10` }}
        >
          {st.label}
        </span>

        <div className="space-y-4">
          <p className="text-sm text-[#B8B8CC] leading-relaxed">{product.description}</p>
          {product.problem && (
            <div>
              <div className="text-xs mono tracking-widest text-[#FF6B9D] mb-1.5">THE PROBLEM</div>
              <p className="text-sm text-[#B8B8CC] leading-relaxed">{product.problem}</p>
            </div>
          )}
          {product.solution && (
            <div>
              <div className="text-xs mono tracking-widest text-[#00FF88] mb-1.5">THE SOLUTION</div>
              <p className="text-sm text-[#B8B8CC] leading-relaxed">{product.solution}</p>
            </div>
          )}
          {product.founderRole && (
            <div>
              <div className="text-xs mono tracking-widest text-[#FFB800] mb-1.5">FOUNDER ROLE</div>
              <p className="text-sm text-[#B8B8CC]">{product.founderRole}</p>
            </div>
          )}
          {product.caseStudy && (
            <div>
              <div className="text-xs mono tracking-widest text-[#a855f7] mb-1.5">CASE STUDY</div>
              <p className="text-sm text-[#B8B8CC] leading-relaxed">{product.caseStudy}</p>
            </div>
          )}

          {/* Roadmap */}
          {product.roadmap?.length > 0 && (
            <div>
              <div className="text-xs mono tracking-widest text-[#00D4FF] mb-3 flex items-center gap-2">
                <Map size={12} /> ROADMAP
              </div>
              <div className="space-y-3">
                {product.roadmap.map((phase, i) => {
                  const Icon = ROADMAP_ICONS[phase.status] || Circle;
                  const color = phase.status === "completed" ? "#00FF88" : phase.status === "current" ? "#00D4FF" : "#6B6B80";
                  return (
                    <div key={i} className="flex gap-3">
                      <Icon size={15} className={`mt-0.5 flex-shrink-0 ${phase.status === "current" ? "animate-pulse" : ""}`} style={{ color }} />
                      <div>
                        <div className="text-sm text-[#E8E8F0] font-medium">
                          {phase.phase} {phase.quarter && <span className="text-[10px] text-[#6B6B80] mono ml-1">{phase.quarter}</span>}
                        </div>
                        {phase.description && <div className="text-xs text-[#8B8B9F]">{phase.description}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metrics — only shown if the admin entered them */}
          {product.metrics?.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {product.metrics.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-lg font-bold text-[#00FF88]">{m.value}</div>
                  <div className="text-[10px] text-[#6B6B80] mono uppercase tracking-wider">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {product.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {product.technologies.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9B9BAF] text-[11px] mono">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {product.url && (
              <a href={product.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6B9D] to-[#7C6AFF] text-white text-xs font-semibold hover:opacity-90">
                <ExternalLink size={13} /> Visit Product
              </a>
            )}
            {product.githubUrl && (
              <a href={product.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-[#E8E8F0] text-xs font-semibold hover:bg-white/[0.08]">
                <Github size={13} /> Source
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * PRODUCTS / STARTUPS (was Launch Control) — database-driven Founder Lab view.
 * No invented metrics: only what the admin has entered.
 */
export default function LaunchControl() {
  const { data: products, loading, error } = useApi(() => api.getProducts());
  const [selected, setSelected] = useState(null);

  return (
    <section className="min-h-screen px-4 sm:px-8 lg:px-16 py-12 sm:py-16" id="products">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            Products & Startups
          </h2>
          <p className="text-sm text-[#6B6B80] mt-2">What I'm building as a founder — problems, solutions and honest progress.</p>
        </motion.div>

        {loading && (
          <div className="grid sm:grid-cols-2 gap-5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        )}
        {error && <div className="glass rounded-xl p-6 text-sm text-[#FF6B9D]">Could not load products: {error}</div>}
        {!loading && !error && products?.length === 0 && (
          <div className="glass rounded-xl p-10 text-center text-sm text-[#6B6B80]">
            No products published yet. The Founder Lab is warming up.
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          {(products || []).map((product, i) => {
            const st = STATUS_STYLES[product.status] || STATUS_STYLES.idea;
            return (
              <motion.div
                key={product._id}
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#FF6B9D]/30 transition-all cursor-pointer"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(product)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {product.logoUrl ? (
                      <img src={apiUrl(product.logoUrl)} alt={product.name} className="w-11 h-11 rounded-xl object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B9D]/25 to-[#7C6AFF]/25 flex items-center justify-center">
                        <Package size={18} className="text-[#FF6B9D]" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                        {product.name}
                      </h3>
                      {product.tagline && <p className="text-xs text-[#6B6B80]">{product.tagline}</p>}
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[9px] mono border"
                    style={{ color: st.color, borderColor: `${st.color}40`, background: `${st.color}10` }}
                  >
                    {st.label}
                  </span>
                </div>

                <p className="text-sm text-[#9B9BAF] leading-relaxed line-clamp-3 mb-4">{product.description}</p>

                {/* metrics only when present */}
                {product.metrics?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {product.metrics.slice(0, 3).map((m, mi) => (
                      <div key={mi} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                        <div className="text-sm font-bold text-[#00FF88]">{m.value}</div>
                        <div className="text-[9px] text-[#6B6B80] mono uppercase">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* roadmap progress */}
                {product.roadmap?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {product.roadmap.map((phase, pi) => (
                      <div key={pi} className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "100%",
                            background: phase.status === "completed" ? "#00FF88" : phase.status === "current" ? "#00D4FF" : "transparent",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#4A4A5E] mono">
                  <TrendingUp size={11} />
                  Click for full product brief
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>{selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
}
