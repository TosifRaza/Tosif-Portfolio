import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, FolderKanban, User, Github, Linkedin, Twitter, Mail,
  MapPin, Download, Rocket,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import { usePublicSite } from '../siteContext';
import ProjectCard, { ProjectModal, TechChip } from '../ProjectCard';
import GitHubContributions from '../GitHubContributions';
import ProfilePhoto from '../ProfilePhoto';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function HeroCodeCard({ profile }) {
  const dev = profile?.name || 'Tosif Raza';
  const role = (profile?.roles && profile.roles[0]) || profile?.title || 'Software Engineer';
  const focus = profile?.roles?.[1] || 'Full-Stack Developer';
  const location = profile?.location || 'India';
  return (
    <div className="rounded-xl border border-border bg-card/90 backdrop-blur font-mono text-[11px] leading-relaxed shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-border bg-muted/40">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 text-[10px] text-muted-foreground">developer.js</span>
      </div>
      <div className="p-4 text-muted-foreground break-words">
        <p><span className="text-primary">const</span> <span className="text-foreground">developer</span> = {'{'}</p>
        <p className="pl-4">name: <span className="text-emerald-500">'{dev}'</span>,</p>
        <p className="pl-4">role: <span className="text-emerald-500">'{role}'</span>,</p>
        <p className="pl-4">focus: <span className="text-emerald-500">'{focus}'</span>,</p>
        <p className="pl-4">location: <span className="text-emerald-500">'{location}'</span>,</p>
        <p className="pl-4">openToWork: <span className="text-primary">true</span>,</p>
        <p>{'};'}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { site, profile } = usePublicSite();
  const { data: statsRes } = useApi(() => api.getStats());
  const { data: projects } = useApi(() => api.getProjects());
  const { data: skills } = useApi(() => api.getSkills());
  const [selected, setSelected] = useState(null);

  const hero = site?.hero || {};
  const name = profile?.name || hero.heading || 'Tosif Raza';
  const nameParts = name.split(' ');
  const role = (profile?.roles && profile.roles[0]) || hero.subtitle || 'Software Engineer';
  const description = hero.description || profile?.shortBio || '';
  const featured = (projects || []).filter((p) => p.featured).slice(0, 3);
  const featuredList = featured.length ? featured : (projects || []).slice(0, 3);
  const techChips = (skills || []).slice(0, 6);
  const stats = (statsRes?.stats || []).slice(0, 4);

  const socials = [
    { icon: Github, url: profile?.socials?.github, label: 'GitHub' },
    { icon: Linkedin, url: profile?.socials?.linkedin, label: 'LinkedIn' },
    { icon: Twitter, url: profile?.socials?.twitter, label: 'Twitter' },
    { icon: Mail, url: profile?.email ? `mailto:${profile.email}` : '', label: 'Email' },
  ].filter((s) => s.url);

  const primaryCta = hero.primaryCta?.label ? hero.primaryCta : { label: 'View Projects', target: '/projects' };
  const secondaryCta = hero.secondaryCta?.label ? hero.secondaryCta : { label: 'Download Resume', target: '/resume' };

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-backdrop opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid md:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
          <div className="min-w-0 md:col-start-1 md:row-start-1">
            <motion.p {...fadeUp} className="text-sm text-muted-foreground mb-3">
              {hero.badge || "Hello, I'm"}
            </motion.p>
            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-foreground leading-[1.08] break-words"
            >
              {nameParts.slice(0, -1).join(' ')}{' '}
              <span className="text-primary">{nameParts.slice(-1)}</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="mt-3 text-xl sm:text-2xl font-semibold text-foreground/90">
              {role}
            </motion.p>
            {description && (
              <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                {description}
              </motion.p>
            )}

            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={primaryCta.target?.startsWith('/') ? primaryCta.target : '/projects'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-[0_4px_24px_hsl(var(--primary)/0.35)] hover:bg-primary/90 transition-all"
              >
                {primaryCta.label} <ArrowRight size={15} />
              </Link>
              <Link
                to={secondaryCta.target?.startsWith('/') ? secondaryCta.target : '/resume'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all"
              >
                <Download size={14} /> {secondaryCta.label}
              </Link>
            </motion.div>

            {socials.length > 0 && (
              <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-6 flex items-center gap-4">
                {socials.map(({ icon: Icon, url, label }) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer noopener" aria-label={label}
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <Icon size={18} />
                  </a>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right: avatar + code card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="relative flex min-w-0 flex-col items-center gap-6 md:col-start-2 md:row-start-1 md:row-span-2"
          >
            <div className="flex flex-col items-center gap-4">
              <ProfilePhoto
                profile={profile}
                name={name}
                alt={`${name} profile photo`}
                className="h-56 w-56 rounded-full border-4 border-primary/60 text-4xl shadow-[0_0_56px_hsl(var(--primary)/0.32)] sm:h-64 sm:w-64"
              />
              {profile?.availability?.status && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 shadow-sm shadow-emerald-500/5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-wide text-emerald-500">
                    {profile.availability.status}
                  </span>
                </div>
              )}
            </div>
            <div className="w-full max-w-sm">
              <HeroCodeCard profile={profile} />
            </div>
          </motion.div>

          <div className="min-w-0 md:col-start-1 md:row-start-2">
            <GitHubContributions githubUrl={profile?.socials?.github} />
          </div>
        </div>

        {/* Tech chips strip */}
        {techChips.length > 0 && (
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-10">
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2.5">
              {techChips.map((s) => (
                <span key={s._id || s.name} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground/85">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {s.name}
                </span>
              ))}
            </motion.div>
          </div>
        )}
      </section>

      {/* ── Current mission (CMS-controlled) ─────────────── */}
      {site?.currentMission?.title && hero.showCurrentMission !== false && (
        <section className="border-b border-border bg-primary/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary shrink-0">
              <Rocket size={12} /> Current Mission
            </span>
            <p className="text-sm text-foreground/90 flex-1">
              <span className="font-semibold">{site.currentMission.title}</span>
              {site.currentMission.description && (
                <span className="text-muted-foreground"> — {site.currentMission.description}</span>
              )}
            </p>
            {site.currentMission.progressLabel && (
              <span className="shrink-0 px-2.5 py-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono">
                {site.currentMission.progressLabel}
              </span>
            )}
          </div>
        </section>
      )}

      {/* ── Featured Projects ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16 w-full">
        <div className="flex flex-col items-start gap-3 mb-7 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-foreground">
            <FolderKanban size={20} className="text-primary" /> Featured Projects
          </h2>
          <Link to="/projects" className="flex shrink-0 items-center gap-1 text-sm text-primary hover:gap-2 transition-all">
            View All Projects <ArrowUpRight size={14} />
          </Link>
        </div>
        {featuredList.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredList.map((p, i) => (
              <ProjectCard key={p._id || i} project={p} index={i} onOpen={setSelected} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Projects coming soon.
          </div>
        )}
      </section>

      {/* ── About strip + stats ──────────────────────────── */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground mb-3">
              <User size={18} className="text-primary" /> About Me
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
              {profile?.longBio || profile?.shortBio || description || 'Passionate software engineer focused on building scalable products and learning continuously.'}
            </p>
            <Link to="/about" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2.5 transition-all">
              Learn more about me <ArrowRight size={14} />
            </Link>
          </div>
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
