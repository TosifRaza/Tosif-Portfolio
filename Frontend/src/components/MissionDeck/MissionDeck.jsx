import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, } from "@/data/projects";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { X, ArrowRight, AlertTriangle, Lightbulb } from "lucide-react";

function StatusBadge({ status }) {
  const config = {
    live: { color: "#00FF88", label: "LIVE" },
    building: { color: "#FFB800", label: "BUILDING" },
    completed: { color: "#00D4FF", label: "COMPLETED" },
    archived: { color: "#6B6B80", label: "ARCHIVED" },
  };
  const { color, label } = config[status] || config.archived;

  return (
    <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color }}>
      {status === "live" && <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />}
      {label}
    </span>
  );
}

function MissionCard({ project, onDeepDive }) {
  return (
    <motion.div
      variants={staggerItem}
      className="glass glass-hover rounded-xl p-5 cursor-pointer group"
      whileHover={{ y: -4 }}
      onClick={onDeepDive}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-heading font-bold text-text-primary group-hover:text-purple-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{project.description}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(project.techStack).map(([key, value]) => (
          <span key={key} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-text-secondary">
            {value}
          </span>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-xs text-text-muted">Commits</div>
          <div className="text-sm font-bold text-text-primary tabular-nums">{project.metrics.commits}</div>
        </div>
        <div>
          <div className="text-xs text-text-muted">Files</div>
          <div className="text-sm font-bold text-text-primary tabular-nums">{project.metrics.files}</div>
        </div>
        <div>
          <div className="text-xs text-text-muted">Users</div>
          <div className="text-sm font-bold text-text-primary tabular-nums">{project.metrics.users}+</div>
        </div>
      </div>

      {/* Completion bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-muted">Completion</span>
          <span className="text-text-secondary">{project.completion}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${project.completion}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Architecture mini */}
      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <div className="text-xs text-text-muted font-mono truncate">{project.architecture.flow}</div>
      </div>
    </motion.div>
  );
}

function DeepDiveModal({ project, onClose }) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Problem Discovery", content: project.deepDive.problem },
    { title: "Research & Validation", content: project.deepDive.research },
    { title: "System Architecture", content: project.deepDive.architecture },
    { title: "Database Design", content: project.deepDive.database },
    { title: "Implementation", content: project.deepDive.implementation },
    { title: "Challenges & Solutions", content: null, challenges: project.deepDive.challenges },
    { title: "Results & Learnings", content: project.deepDive.results },
    { title: "Future Roadmap", content: null, future: project.deepDive.future },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass rounded-2xl p-6"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text-primary">{project.name}</h2>
            <p className="text-xs text-text-secondary mt-1">Mission Briefing — Step {step + 1} of {steps.length}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-text-secondary">
            <X size={20} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-purple-500" : i < step ? "w-4 bg-purple-500/50" : "w-4 bg-white/[0.06]"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-heading font-bold text-text-primary mb-3">
              {steps[step].title}
            </h3>

            {steps[step].content && (
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{steps[step].content}</p>
            )}

            {/* Challenges */}
            {steps[step].challenges && (
              <div className="space-y-3">
                {steps[step].challenges.map((challenge, i) => (
                  <div key={i} className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">Challenge {i + 1}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{challenge.problem}</p>
                    <div className="text-xs text-cyan-400 mb-1">Solution:</div>
                    <p className="text-sm text-text-secondary mb-2">{challenge.solution}</p>
                    <div className="text-xs text-text-muted">Trade-off: {challenge.tradeoff}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ADR Decisions */}
            {step === 2 && project.decisions.length > 0 && (
              <div className="space-y-3 mt-4">
                {project.decisions.map((decision, i) => (
                  <div key={i} className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} className="text-amber-400" />
                      <span className="text-sm font-medium text-text-primary">{decision.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        decision.status === "accepted" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {decision.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-1"><strong>Context:</strong> {decision.context}</p>
                    <p className="text-xs text-text-muted"><strong>Consequence:</strong> {decision.consequence}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Future Roadmap */}
            {steps[step].future && (
              <div className="space-y-2">
                {steps[step].future.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                    <ArrowRight size={14} className="text-purple-400" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-xs px-4 py-2 rounded-lg bg-white/[0.04] text-text-secondary hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
            className="text-xs px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next Step →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MissionDeck() {
  const [deepDive, setDeepDive] = useState(null);

  return (
    <div className="min-h-full p-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={slideUp} className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Mission Deck</h2>
          <p className="text-sm text-text-secondary">Click any project for full mission briefing with engineering decisions</p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <MissionCard key={project.slug} project={project} onDeepDive={() => setDeepDive(project)} />
          ))}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {deepDive && <DeepDiveModal project={deepDive} onClose={() => setDeepDive(null)} />}
      </AnimatePresence>
    </div>
  );
}
