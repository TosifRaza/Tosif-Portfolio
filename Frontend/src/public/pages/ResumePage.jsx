import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, Award } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api, apiUrl } from '@/utils/api';
import SectionHeader, { EmptyState, LoadingBlock } from '../SectionHeader';
import { usePublicSite } from '../siteContext';

function ResumePreview({ resume, profile, experience, skills }) {
  const name = profile?.name || 'Tosif Raza';
  const role = (profile?.roles && profile.roles[0]) || profile?.title || 'Software Engineer';
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl border border-border bg-card shadow-xl overflow-hidden"
    >
      <div className="bg-primary text-primary-foreground px-6 py-5">
        <h2 className="text-lg font-bold">{name}</h2>
        <p className="text-xs opacity-90 mt-0.5">{role}</p>
        <p className="text-[10px] opacity-75 mt-1">
          {[profile?.email, profile?.location].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="p-6 space-y-5 text-[12px] leading-relaxed">
        {(profile?.longBio || profile?.shortBio) && (
          <section>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1.5">Professional Summary</h3>
            <p className="text-muted-foreground">{profile?.longBio || profile?.shortBio}</p>
          </section>
        )}
        {experience?.length > 0 && (
          <section>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1.5">Experience</h3>
            <ul className="space-y-2">
              {experience.slice(0, 3).map((j) => (
                <li key={j._id}>
                  <span className="font-semibold text-foreground">{j.role}</span>
                  <span className="text-muted-foreground"> · {j.company} · {j.startDate}{j.current ? ' — Present' : ''}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {skills?.length > 0 && (
          <section>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1.5">Top Skills</h3>
            <p className="text-muted-foreground">
              {skills.slice(0, 12).map((s) => s.name).join(' · ')}
            </p>
          </section>
        )}
      </div>
    </motion.div>
  );
}

export default function ResumePage() {
  const { profile } = usePublicSite();
  const { data: resume, loading } = useApi(() => api.getResume());
  const { data: experience } = useApi(() => api.getExperience());
  const { data: skills } = useApi(() => api.getSkills());

  const fileUrl = resume?.fileUrl ? apiUrl(resume.fileUrl) : ''; // /uploads/... (proxied in dev)
  const downloadUrl = fileUrl ? apiUrl('/api/resume/download') : '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
      <SectionHeader
        icon={FileText}
        eyebrow="My Resume"
        title="Resume"
        subtitle={
          profile?.longBio?.slice(0, 160) ||
          profile?.shortBio ||
          'A snapshot of my professional journey — experience, skills and achievements.'
        }
        actions={
          fileUrl ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={downloadUrl || fileUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Download size={13} /> Download Resume
              </a>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground/80 hover:border-primary/40 hover:text-primary transition-colors"
              >
                View Online <ExternalLink size={12} />
              </a>
            </div>
          ) : null
        }
      />

      {loading ? (
        <LoadingBlock label="Loading resume…" />
      ) : !resume?.fileUrl ? (
        <EmptyState message="No resume file has been uploaded yet. (Admin → Resume to upload one — the preview below is generated from live profile data.)" />
      ) : null}

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Live DB-generated snapshot (always available) */}
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            <Award size={12} className="text-primary" /> Live snapshot from the database
          </p>
          <ResumePreview resume={resume} profile={profile} experience={experience} skills={skills} />
        </div>

        {/* Uploaded PDF preview when available */}
        {resume?.fileUrl && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Uploaded resume — {resume.fileName} {resume.version ? `(${resume.version})` : ''}
            </p>
            <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[420px]">
              <iframe
                src={fileUrl}
                title="Resume PDF"
                className="w-full h-[560px] bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
