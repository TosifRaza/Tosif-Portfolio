import { motion } from 'framer-motion';
import { Briefcase, MapPin, CalendarDays, Award } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import SectionHeader, { EmptyState, LoadingBlock } from '../SectionHeader';
import { TechChip } from '../ProjectCard';

export default function ExperiencePage() {
  const { data: experience, loading } = useApi(() => api.getExperience());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
      <SectionHeader
        icon={Briefcase}
        eyebrow="Career"
        title="Experience"
        subtitle="Where I've worked, what I've built, and the impact I've made."
      />

      {loading ? (
        <LoadingBlock label="Loading experience…" />
      ) : !experience?.length ? (
        <EmptyState message="Experience entries will appear here once published." />
      ) : (
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
          <div className="space-y-8">
            {experience.map((job, i) => (
              <motion.article
                key={job._id || i}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.07, 0.3) }}
                className="relative pl-8"
              >
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-primary bg-background shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-foreground">{job.role}</h2>
                      <p className="text-sm text-primary mt-0.5">{job.company}</p>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground space-y-1">
                      <p className="flex items-center gap-1.5 justify-end">
                        <CalendarDays size={11} />
                        {job.startDate || '—'} — {job.current ? 'Present' : job.endDate || '—'}
                      </p>
                      {job.location && (
                        <p className="flex items-center gap-1.5 justify-end">
                          <MapPin size={11} /> {job.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{job.description}</p>
                  )}

                  {job.achievements?.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {job.achievements.map((a, ai) => (
                        <li key={ai} className="flex items-start gap-2 text-[13px] text-foreground/80">
                          <Award size={12} className="text-primary mt-0.5 shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}

                  {job.technologies?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.technologies.map((t) => (
                        <TechChip key={t}>{t}</TechChip>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
