import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { api, apiUrl } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { FileDown, X, Bot, ExternalLink } from "lucide-react";

/**
 * RECRUITER VIEW / HIRE ME — the single-screen recruiter path.
 * Every number comes from the database; nothing is invented.
 */
export default function RecruiterMode() {
  const { toggleRecruiterMode } = useApp();
  const [matchInput, setMatchInput] = useState("");

  const { data: profile } = useApi(() => api.getProfile());
  const { data: about } = useApi(() => api.getAbout());
  const { data: skills } = useApi(() => api.getSkills());
  const { data: resume, error: resumeError } = useApi(() => api.getResume());
  const { data: experience } = useApi(() => api.getExperience());

  const matchWeights = useMemo(() => {
    const w = {};
    for (const s of skills || []) w[s.name.toLowerCase()] = s.level || 60;
    return w;
  }, [skills]);

  const matchScore = useMemo(() => {
    if (!matchInput.trim() || Object.keys(matchWeights).length === 0) return null;
    const tokens = matchInput.toLowerCase().split(/[\s,./+]+/).filter((t) => t.length > 1);
    const matched = tokens
      .filter((t) => Object.keys(matchWeights).some((k) => k.includes(t) || t.includes(k)))
      .map((t) => {
        const key = Object.keys(matchWeights).find((k) => k.includes(t) || t.includes(k));
        return { skill: key, weight: matchWeights[key] };
      });
    if (!tokens.length) return null;
    const score = Math.round(
      matched.reduce((sum, m) => sum + m.weight, 0) / Math.max(1, tokens.length)
    );
    return { score, matched };
  }, [matchInput, matchWeights]);

  const p = profile || {};
  const highlights = (about?.highlights || []).slice(0, 5);

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto px-4 py-5 sm:p-6" id="recruiter">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={slideUp} className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl leading-snug font-heading font-bold text-text-primary mb-1 break-words">Hire Me — Everything in One Screen</h2>
            <p className="text-sm text-text-secondary">All data below is live from my portfolio database.</p>
          </div>
          <button
            onClick={toggleRecruiterMode}
            className="shrink-0 p-2 rounded-lg hover:bg-muted/60 text-text-secondary"
            aria-label="Exit recruiter view"
          >
            <X size={18} />
          </button>
        </motion.div>

        {/* Candidate Summary — CMS-driven, no fabricated metrics */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-4 sm:p-5 mb-5 sm:mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">Candidate Summary</h3>
          <div className="text-sm text-text-secondary leading-relaxed break-words">
            <strong className="text-text-primary">{p.name || "Tosif Raza"}</strong> — {p.title || "Software Engineer & Founder"}
            {p.location ? `, based in ${p.location}.` : "."} {p.shortBio}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs">
            {p.availability?.status && (
              <span className="text-text-muted">Status: <span className="text-green-400">{p.availability.status}</span></span>
            )}
            {p.availability?.type && (
              <span className="text-text-muted">Type: <span className="text-text-secondary">{p.availability.type}</span></span>
            )}
            {p.availability?.notice && (
              <span className="text-text-muted">Notice: <span className="text-text-secondary">{p.availability.notice}</span></span>
            )}
          </div>
          {experience?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border space-y-1.5">
              {experience.slice(0, 3).map((e) => (
                <div key={e._id} className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0 text-text-secondary break-words">
                    <span className="text-primary">{e.role}</span> · {e.company}
                  </span>
                  <span className="text-text-muted mono sm:shrink-0">{e.startDate} — {e.current ? "Present" : e.endDate}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Skill Match — weights = real self-assessed levels from the DB */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-4 sm:p-5 mb-5 sm:mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">Skill Match</h3>
          <p className="text-xs text-text-secondary mb-3">
            Paste your job requirements — the match is computed against my actual self-assessed skill levels.
          </p>
          <input
            type="text"
            value={matchInput}
            onChange={(e) => setMatchInput(e.target.value)}
            placeholder="e.g. React Developer, Node.js, MongoDB"
            className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-purple-500/50 transition-all"
          />

          {matchScore && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Alignment with your requirements</span>
                <span className={`text-lg font-bold ${matchScore.score >= 70 ? "text-green-400" : matchScore.score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                  {matchScore.score}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: matchScore.score >= 70 ? "#10B981" : matchScore.score >= 40 ? "#F59E0B" : "#EF4444" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${matchScore.score}%` }}
                  transition={{ duration: 1 }}
                />
              </div>

              {matchScore.matched.length > 0 && (
                <div className="mt-3 space-y-2">
                  {matchScore.matched.map(({ skill, weight }) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary capitalize">{skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 rounded-full bg-muted/60 overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${weight}%` }} />
                        </div>
                        <span className="text-xs text-text-muted w-8">{weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Why Hire — CMS highlights */}
        {highlights.length > 0 && (
          <motion.div variants={staggerItem} className="glass rounded-xl p-4 sm:p-5 mb-5 sm:mb-6">
            <h3 className="text-xs text-text-muted uppercase tracking-wider mb-4">Why {p.name?.split(" ")[0] || "Tosif"}?</h3>
            <div className="space-y-3">
              {highlights.map((prop, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary break-words">{prop.title}</div>
                    <div className="text-xs text-text-secondary mt-0.5 leading-relaxed break-words">{prop.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Resume + contact row */}
        <motion.div variants={staggerItem} className="flex flex-wrap gap-3">
          <a
            href={resume ? apiUrl('/api/resume/download') : '#'}
            onClick={(e) => {
              if (!resume) {
                e.preventDefault();
                alert(resumeError ? "Resume service unavailable." : "No resume uploaded yet — it can be added in the Admin Control Center.");
              }
            }}
            className={`flex max-w-full items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              resume
                ? "bg-gradient-to-r from-primary to-cyan-400 text-white hover:opacity-90"
                : "bg-muted/50 border border-border text-muted-foreground"
            }`}
          >
            <FileDown size={15} /> Download Resume
          </a>
          {p.socials?.github && (
            <a href={p.socials.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass glass-hover text-text-secondary text-sm">
              <ExternalLink size={14} /> GitHub
            </a>
          )}
          {p.socials?.linkedin && (
            <a href={p.socials.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass glass-hover text-text-secondary text-sm">
              <ExternalLink size={14} /> LinkedIn
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className="flex min-w-0 max-w-full items-center gap-2 break-all px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-medium">
              <Bot size={14} /> {p.email}
            </a>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
