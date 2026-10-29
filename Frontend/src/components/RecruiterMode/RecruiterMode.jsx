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

  const matchedSkills = useMemo(() => {
    if (!matchInput.trim()) return null;
    const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const terms = matchInput.split(/[,;\n]+/).map(normalize).filter(Boolean);
    return (skills || []).filter((skill) => terms.includes(normalize(skill.name)));
  }, [matchInput, skills]);

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
            <strong className="text-text-primary">{p.name || "Profile not added yet"}</strong>{p.title ? ` — ${p.title}` : ''}
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

        {/* Find technologies in the published project stack without inventing a proficiency score. */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-4 sm:p-5 mb-5 sm:mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">Find Relevant Skills</h3>
          <p className="text-xs text-text-secondary mb-3">
            Enter comma-separated technologies to find examples in my project stack.
          </p>
          <input
            type="text"
            value={matchInput}
            onChange={(event) => setMatchInput(event.target.value)}
            placeholder="React, Node.js, MongoDB"
            className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/50"
          />
          {matchedSkills && (
            <div className="mt-4 space-y-3">
              {matchedSkills.length ? matchedSkills.map((skill) => (
                <div key={skill._id || skill.name}>
                  <p className="text-sm font-medium text-primary">{skill.name}</p>
                  {skill.description && <p className="mt-1 text-xs leading-relaxed text-text-secondary">{skill.description}</p>}
                </div>
              )) : <p className="text-xs text-text-muted">No matching technologies in the published skills yet.</p>}
            </div>
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
