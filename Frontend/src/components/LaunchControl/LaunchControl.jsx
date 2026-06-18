import { motion } from "framer-motion";
import { startup } from "@/data/startup";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { Users, Wrench, Briefcase, TrendingUp, Quote } from "lucide-react";
import { useCountUp } from "@/hooks/useCustomHooks";

function MetricCard({ label, value, growth, icon, isNumber }) {
  const numValue = useCountUp(isNumber ? (value ) : 0);

  return (
    <motion.div variants={staggerItem} className="glass glass-hover rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2 text-text-secondary">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold font-heading text-text-primary tabular-nums">
        {isNumber ? numValue : value}
      </div>
      {growth && (
        <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
          <TrendingUp size={12} /> {growth}
        </div>
      )}
    </motion.div>
  );
}

export default function LaunchControl() {
  const maxUsers = Math.max(...startup.growthData.map((d) => d.users));

  return (
    <div className="min-h-full p-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={slideUp} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-green-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <h2 className="text-2xl font-heading font-bold text-text-primary">{startup.name}</h2>
          </div>
          <p className="text-sm text-text-secondary">{startup.tagline}</p>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Users" value={startup.metrics.users} growth={startup.metrics.growth} icon={<Users size={14} />} isNumber />
          <MetricCard label="Workers" value={startup.metrics.workers} icon={<Wrench size={14} />} isNumber />
          <MetricCard label="Services" value={startup.metrics.services} icon={<Briefcase size={14} />} isNumber />
          <MetricCard label="Revenue" value={startup.metrics.revenue} icon={<TrendingUp size={14} />} isNumber={false} />
        </motion.div>

        {/* Growth Chart */}
        <motion.div variants={slideUp} className="glass rounded-xl p-4 mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-4">Growth Trajectory</h3>
          <div className="h-40 relative">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}
              <motion.path
                d={`M ${startup.growthData.map((d, i) => `${(i / (startup.growthData.length - 1)) * 300} ${100 - (d.users / maxUsers) * 90}`).join(" L ")}`}
                fill="none"
                stroke="#7C6AFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <motion.path
                d={`M 0 100 L ${startup.growthData.map((d, i) => `${(i / (startup.growthData.length - 1)) * 300} ${100 - (d.users / maxUsers) * 90}`).join(" L ")} L 300 100 Z`}
                fill="url(#purpleGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ duration: 1, delay: 1 }}
              />
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C6AFF" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between mt-2">
              {startup.growthData.map((d) => (
                <span key={d.month} className="text-[10px] text-text-muted">{d.month}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div variants={slideUp} className="glass rounded-xl p-4 mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-4">Roadmap</h3>
          <div className="flex items-center gap-0">
            {startup.roadmap.map((phase, i) => (
              <div key={phase.phase} className="flex-1 relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    phase.status === "completed" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                    phase.status === "current" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                    "bg-white/[0.04] text-text-muted border border-white/[0.06]"
                  }`}>
                    {phase.status === "completed" ? "✓" : phase.status === "current" ? "●" : (i + 1)}
                  </div>
                  {i < startup.roadmap.length - 1 && (
                    <div className={`flex-1 h-[2px] ${
                      phase.status === "completed" ? "bg-green-500/30" :
                      phase.status === "current" ? "bg-gradient-to-r from-purple-500/30 to-white/[0.06]" :
                      "bg-white/[0.06]"
                    }`} />
                  )}
                </div>
                <div className={`text-xs font-medium ${
                  phase.status === "current" ? "text-purple-400" : phase.status === "completed" ? "text-green-400" : "text-text-muted"
                }`}>
                  {phase.phase}
                </div>
                <div className="text-[10px] text-text-muted">{phase.quarter}</div>
                {phase.status === "current" && (
                  <motion.div
                    className="absolute -top-1 left-2 text-[9px] text-purple-400 font-mono"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ▲ we are here
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Business Model */}
        <motion.div variants={slideUp} className="glass rounded-xl p-4 mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">Business Model</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(startup.businessModel).map(([key, value]) => (
              <div key={key} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{key}</div>
                <div className="text-xs text-text-secondary">{value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Founder Vision */}
        <motion.div variants={slideUp} className="glass rounded-xl p-5">
          <Quote size={20} className="text-purple-400 mb-3" />
          <p className="text-sm text-text-secondary leading-relaxed italic">{startup.vision}</p>
          <p className="text-xs text-text-muted mt-3">— Tosif Raza</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
