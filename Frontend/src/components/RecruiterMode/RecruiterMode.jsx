import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { recruiter } from "@/data/recruiter";
import { calculateMatch } from "@/utils/helpers";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { Github, Mail, Download, Search } from "lucide-react";

export default function RecruiterMode() {
  const { toggleRecruiterMode } = useApp();  
  const [matchInput, setMatchInput] = useState("");

  const matchScore = useMemo(() => {
    if (!matchInput.trim()) return null;
    return calculateMatch(matchInput, recruiter.matchWeights);
  }, [matchInput]);

  const matchedSkills = useMemo(() => {
    if (!matchInput.trim()) return [];
    const words = matchInput.toLowerCase().split(/[\s,;]+/).filter(Boolean);
    return Object.entries(recruiter.matchWeights)
      .filter(([skill]) => words.some((w) => skill.includes(w) || w.includes(skill)))
      .map(([skill, weight]) => ({ skill, weight }));
  }, [matchInput]);

  return (
    <div className="min-h-full p-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={slideUp} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Search size={16} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-text-primary">Recruiter Mode</h2>
              <p className="text-sm text-text-secondary">Everything optimized for hiring decision</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div variants={staggerItem} className="flex flex-wrap gap-3 mb-6">
          <a href="/resume.pdf" download className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm font-medium">
            <Download size={16} /> Download Resume
          </a>
          <a href={recruiter.socialLinks.github} target="_blank" className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass glass-hover text-text-secondary text-sm">
            <Github size={16} /> GitHub
          </a>
          <a href={`mailto:${recruiter.socialLinks.email}`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass glass-hover text-text-secondary text-sm">
            <Mail size={16} /> Email
          </a>
        </motion.div>

        {/* Candidate Summary */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-5 mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">Candidate Summary</h3>
          <div className="text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Tosif Raza</strong> — Full-Stack Developer & Startup Founder based in Kolkata, India.
            1+ years building production applications with React, Node.js, and MongoDB.
            Founded <strong className="text-purple-400">SkillBridge</strong> — a platform with 120+ real users.
            1200+ GitHub commits. Active daily builder with 14-day streak.
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="text-text-muted">Status: <span className="text-green-400">{recruiter.availability.status}</span></span>
            <span className="text-text-muted">Type: <span className="text-text-secondary">{recruiter.availability.type}</span></span>
            <span className="text-text-muted">Location: <span className="text-text-secondary">{recruiter.availability.location}</span></span>
          </div>
        </motion.div>

        {/* Skill Match */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-5 mb-6">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">Skill Match Engine</h3>
          <p className="text-xs text-text-secondary mb-3">Enter your job requirements to see match percentage</p>
          <input
            type="text"
            value={matchInput}
            onChange={(e) => setMatchInput(e.target.value)}
            placeholder="e.g. React Developer, Node.js, Full-Stack"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_0_2px_rgba(124,106,255,0.15)] transition-all"
          />

          {matchScore !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Overall Match</span>
                <span className={`text-lg font-bold ${matchScore >= 70 ? "text-green-400" : matchScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                  {matchScore}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: matchScore >= 70 ? "#00FF88" : matchScore >= 40 ? "#FFB800" : "#FF3366" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${matchScore}%` }}
                  transition={{ duration: 1 }}
                />
              </div>

              {matchedSkills.length > 0 && (
                <div className="mt-3 space-y-2">
                  {matchedSkills.map(({ skill, weight }) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary capitalize">{skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${weight}%` }} />
                        </div>
                        <span className="text-xs text-text-muted w-8">{weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                matchScore >= 70 ? "bg-green-500/10 text-green-400" : matchScore >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
              }`}>
                {matchScore >= 70 ? "✅ STRONG CANDIDATE — High skill alignment" :
                 matchScore >= 40 ? "⚡ GOOD FIT — Some skills align well" :
                 "🔍 PARTIAL MATCH — May need upskilling in some areas"}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Why Hire */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-5">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-4">Why Hire Tosif?</h3>
          <div className="space-y-3">
            {recruiter.valuePropositions.map((prop) => (
              <div key={prop.number} className="flex gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400 flex-shrink-0">
                  {prop.number}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{prop.title}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{prop.description}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
