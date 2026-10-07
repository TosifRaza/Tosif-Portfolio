import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, CalendarRange } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api, apiUrl } from '@/utils/api';
import { staggerContainer, staggerItem } from '@/utils/animations';

/**
 * EXPERIENCE — professional roles from the Experience collection.
 * Admin controls entries, order and publish status in the Control Center.
 */
export default function ExperienceSection() {
  const { data: items, loading, error } = useApi(() => api.getExperience());

  return (
    <section className="min-h-screen px-4 sm:px-8 lg:px-16 py-12 sm:py-16" id="experience">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
        <motion.div variants={staggerItem} className="mb-10">
          <div className="mono text-xs text-[#00D4FF] tracking-[0.3em] mb-2">// EXPERIENCE.LOG</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            Where I've Worked
          </h2>
        </motion.div>

        {loading && <div className="glass rounded-xl h-48 animate-pulse max-w-3xl" />}
        {error && (
          <div className="glass rounded-xl p-6 text-sm text-[#FF6B9D]">Could not load experience: {error}</div>
        )}

        <div className="space-y-5">
          {(items || []).map((exp) => (
            <motion.div key={exp._id} variants={staggerItem} className="glass glass-hover rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {exp.companyLogo ? (
                    <img src={apiUrl(exp.companyLogo)} alt={exp.company} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7C6AFF]/30 to-[#00D4FF]/30 flex items-center justify-center">
                      <Briefcase size={16} className="text-[#00D4FF]" />
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold text-[#E8E8F0]">{exp.role}</div>
                    <div className="text-sm text-[#00D4FF]">{exp.company}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-[#8B8B9F] mono">
                    <CalendarRange size={12} />
                    {exp.startDate} — {exp.current ? 'Present' : exp.endDate || '—'}
                  </div>
                  {exp.current && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-[10px] mono">
                      CURRENT
                    </span>
                  )}
                </div>
              </div>

              {exp.description && (
                <p className="text-sm text-[#B8B8CC] leading-relaxed mb-3">{exp.description}</p>
              )}

              {exp.responsibilities?.length > 0 && (
                <ul className="space-y-1.5 mb-3">
                  {exp.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[#9B9BAF]">
                      <CheckCircle2 size={13} className="text-[#00FF88] flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}

              {exp.achievements?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {exp.achievements.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-[11px]">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {exp.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9B9BAF] text-[11px] mono">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
