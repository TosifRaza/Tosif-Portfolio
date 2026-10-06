import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { api } from "@/utils/api";
import {
  X, ExternalLink, Github, Rocket, Target, Lightbulb, User, BookOpen,
} from "lucide-react";

const STATUS_COLORS = {
  Active: "#00FF88",
  Completed: "#00D4FF",
  "In Progress": "#FFB800",
  Archived: "#6B6B80",
};

const DIFFICULTY_COLORS = {
  Low: "#00FF88",
  Medium: "#FFB800",
  High: "#FF6B9D",
  Extreme: "#a855f7",
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "professional", label: "Professional" },
  { key: "personal", label: "Personal" },
  { key: "learning", label: "Learning" },
  { key: "open-source", label: "Open Source" },
];

function ProjectModal({ project, onClose }) {
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
          <div>
            <div className="mono text-[10px] text-[#00D4FF] tracking-[0.3em] mb-1">{project.missionId}</div>
            <h3 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              {project.title}
            </h3>
            {project.tagline && <p className="text-sm text-[#8B8B9F] mt-1">{project.tagline}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-[#9B9BAF]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {project.image && (
          <img src={project.image} alt={project.title} className="w-full rounded-xl mb-5 border border-white/[0.06]" />
        )}

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs mono tracking-widest text-[#00D4FF] mb-1.5">
              <BookOpen size={12} /> DESCRIPTION
            </div>
            <p className="text-sm text-[#B8B8CC] leading-relaxed">{project.description}</p>
          </div>

          {project.problem && (
            <div>
              <div className="flex items-center gap-2 text-xs mono tracking-widest text-[#FF6B9D] mb-1.5">
                <Target size={12} /> PROBLEM
              </div>
              <p className="text-sm text-[#B8B8CC] leading-relaxed">{project.problem}</p>
            </div>
          )}

          {project.solution && (
            <div>
              <div className="flex items-center gap-2 text-xs mono tracking-widest text-[#00FF88] mb-1.5">
                <Lightbulb size={12} /> SOLUTION
              </div>
              <p className="text-sm text-[#B8B8CC] leading-relaxed">{project.solution}</p>
            </div>
          )}

          {project.role && (
            <div>
              <div className="flex items-center gap-2 text-xs mono tracking-widest text-[#FFB800] mb-1.5">
                <User size={12} /> MY ROLE
              </div>
              <p className="text-sm text-[#B8B8CC]">{project.role}</p>
            </div>
          )}

          {project.caseStudy && (
            <div>
              <div className="flex items-center gap-2 text-xs mono tracking-widest text-[#a855f7] mb-1.5">
                <Rocket size={12} /> CASE STUDY
              </div>
              <p className="text-sm text-[#B8B8CC] leading-relaxed">{project.caseStudy}</p>
            </div>
          )}

          {project.stack?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {project.stack.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9B9BAF] text-[11px] mono">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C6AFF] to-[#00D4FF] text-white text-xs font-semibold hover:opacity-90"
              >
                <ExternalLink size={13} /> Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-[#E8E8F0] text-xs font-semibold hover:bg-white/[0.08]"
              >
                <Github size={13} /> Source Code
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * PROJECTS (was Mission Deck) — fully database-driven.
 * Grouped: professional / personal / learning / open-source.
 */
export default function MissionDeck() {
  const { data: projects, loading, error } = useApi(() => api.getProjects());
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = (projects || []).filter(
    (p) => filter === "all" || p.category === filter || (!p.category && filter === "professional")
  );

  return (
    <section className="min-h-screen px-4 sm:px-8 lg:px-16 py-12 sm:py-16" id="projects">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mono text-xs text-[#00D4FF] tracking-[0.3em] mb-2">// PROJECT_DECK</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            Projects
          </h2>
          <p className="text-sm text-[#6B6B80] mt-2">Live from the database — filter by kind.</p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === c.key
                  ? "bg-[#00D4FF]/15 border border-[#00D4FF]/40 text-[#00D4FF]"
                  : "bg-white/[0.03] border border-white/[0.07] text-[#9B9BAF] hover:text-[#E8E8F0]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        )}
        {error && <div className="glass rounded-xl p-6 text-sm text-[#FF6B9D]">Could not load projects: {error}</div>}

        {!loading && filtered.length === 0 && !error && (
          <div className="glass rounded-xl p-10 text-center text-sm text-[#6B6B80]">
            No projects in this category yet.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <motion.article
              key={project._id}
              className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00D4FF]/30 transition-all cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(project)}
            >
              {project.featured && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#FFB800]/15 border border-[#FFB800]/30 text-[#FFB800] text-[9px] mono tracking-wider">
                  FEATURED
                </span>
              )}
              <div className="mono text-[9px] text-[#4A4A5E] tracking-[0.25em] mb-2">{project.missionId}</div>
              <h3 className="text-base font-bold text-[#E8E8F0] mb-1" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                {project.title}
              </h3>
              {project.tagline && <p className="text-xs text-[#6B6B80] mb-3 line-clamp-2">{project.tagline}</p>}
              <p className="text-xs text-[#8B8B9F] leading-relaxed line-clamp-3 mb-4">{project.description}</p>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] mono border"
                  style={{
                    color: STATUS_COLORS[project.status] || "#9B9BAF",
                    borderColor: `${STATUS_COLORS[project.status] || "#9B9BAF"}40`,
                    background: `${STATUS_COLORS[project.status] || "#9B9BAF"}10`,
                  }}
                >
                  {project.status}
                </span>
                {project.difficulty && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] mono border"
                    style={{
                      color: DIFFICULTY_COLORS[project.difficulty] || "#9B9BAF",
                      borderColor: `${DIFFICULTY_COLORS[project.difficulty] || "#9B9BAF"}40`,
                      background: `${DIFFICULTY_COLORS[project.difficulty] || "#9B9BAF"}10`,
                    }}
                  >
                    {project.difficulty}
                  </span>
                )}
              </div>

              {project.stack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.slice(0, 4).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-white/[0.04] text-[#8B8B9F] text-[10px] mono">
                      {t}
                    </span>
                  ))}
                  {project.stack.length > 4 && (
                    <span className="px-2 py-0.5 text-[#4A4A5E] text-[10px] mono">+{project.stack.length - 4}</span>
                  )}
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
