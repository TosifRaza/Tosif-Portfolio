import { motion } from 'framer-motion';
import { FileDown, FileText, Bot, ExternalLink } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import { useApp } from '@/context/AppContext';
import { staggerContainer, staggerItem } from '@/utils/animations';

/**
 * RESUME — the recruiter fast path: active resume download from the CMS,
 * live skill summary and shortcuts. Replaces the old dead VIEW RESUME button.
 */
export default function ResumeSection() {
  const { toggleRecruiterMode } = useApp();
  const { data: resume, loading, error } = useApi(() => api.getResume());
  const { data: skills } = useApi(() => api.getSkills());
  const { data: profile } = useApi(() => api.getProfile());

  const grouped = (skills || []).reduce((acc, s) => {
    (acc[s.category] ||= []).push(s.name);
    return acc;
  }, {});

  return (
    <section className="min-h-screen px-4 sm:px-8 lg:px-16 py-12 sm:py-16" id="resume">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
        <motion.div variants={staggerItem} className="mb-10">
          <div className="mono text-xs text-[#00D4FF] tracking-[0.3em] mb-2">// RESUME.PDF</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            Resume
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Download card */}
          <motion.div variants={staggerItem} className="glass rounded-2xl p-8 flex flex-col items-start justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C6AFF]/30 to-[#00D4FF]/30 flex items-center justify-center mb-4">
                <FileText size={24} className="text-[#00D4FF]" />
              </div>
              <div className="text-xl font-bold text-[#E8E8F0] mb-1">
                {profile?.name || 'Tosif Raza'} — Resume
              </div>
              <div className="text-sm text-[#8B8B9F] mb-6">
                {loading
                  ? 'Checking for the latest version…'
                  : error
                    ? 'Resume service unavailable right now.'
                    : resume
                      ? `Version ${resume.version || 'current'} · uploaded ${new Date(resume.createdAt).toLocaleDateString()}`
                      : 'No resume file uploaded yet — the owner can add one in the Admin Control Center.'}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/resume/download"
                onClick={(e) => {
                  if (!resume) {
                    e.preventDefault();
                    alert('No resume has been uploaded yet. It can be uploaded from the Admin Control Center.');
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  resume
                    ? 'bg-gradient-to-r from-[#7C6AFF] to-[#00D4FF] text-white hover:opacity-90'
                    : 'bg-white/[0.05] border border-white/10 text-[#8B8B9F]'
                }`}
              >
                <FileDown size={15} />
                Download Resume
              </a>
              <button
                onClick={toggleRecruiterMode}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-sm font-semibold hover:bg-[#00FF88]/20 transition-colors"
              >
                <Bot size={15} />
                Recruiter View
              </button>
            </div>
          </motion.div>

          {/* Live skills summary */}
          <motion.div variants={staggerItem} className="glass rounded-2xl p-8">
            <div className="mono text-[10px] text-[#8B8B9F] tracking-widest mb-4">// LIVE SKILLS SUMMARY (FROM DATABASE)</div>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([cat, names]) => (
                <div key={cat}>
                  <div className="text-xs font-semibold text-[#00D4FF] mono uppercase tracking-widest mb-2">{cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {names.map((n) => (
                      <span key={n} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#B8B8CC] text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {!skills?.length && <div className="text-xs text-[#8B8B9F]">No skills configured yet.</div>}
            </div>
            {profile?.socials?.github && (
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-xs text-[#9D8AFF] hover:text-[#00D4FF] transition-colors"
              >
                <ExternalLink size={12} /> View GitHub profile
              </a>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
