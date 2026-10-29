import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, FolderKanban, User, Github, Linkedin, Twitter, Mail,
  MapPin, Download, Rocket, Globe, Folder, FileText, Box, ChevronRight,
  Server, Code2, Database, Wrench,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import { usePublicSite } from '../siteContext';
import ProjectCard, { ProjectModal, TechChip } from '../ProjectCard';
import GitHubContributions from '../GitHubContributions';
import ProfilePhoto, { getProfilePhotoSources } from '../ProfilePhoto';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function LeetCodeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
    </svg>
  );
}

function HeroCodeCard({ profile }) {
  const dev = profile?.name || '';
  const role = (profile?.roles && profile.roles[0]) || profile?.title || '';
  const focus = profile?.roles?.[1] || '';
  const location = profile?.location || '';
  if (!dev && !role && !focus && !location) return null;
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
        <p className="pl-4">availability: <span className="text-emerald-500">'{profile?.availability?.status || ''}'</span>,</p>
        <p>{'};'}</p>
      </div>
    </div>
  );
}

const skillsPreview = [
  {
    title: 'Backend',
    subtitle: 'Node.js, Express, Socket.IO, REST APIs',
    icon: Server,
    bg: 'bg-blue-500/10 border border-blue-500/20',
    color: 'text-blue-500',
  },
  {
    title: 'Frontend',
    subtitle: 'React, JavaScript, Tailwind CSS, Redux',
    icon: Code2,
    bg: 'bg-emerald-500/10 border border-emerald-500/20',
    color: 'text-emerald-500',
  },
  {
    title: 'Database',
    subtitle: 'MongoDB, Mongoose',
    icon: Database,
    bg: 'bg-purple-500/10 border border-purple-500/20',
    color: 'text-purple-500',
  },
  {
    title: 'Tools',
    subtitle: 'Git, GitHub, Vite, Postman',
    icon: Wrench,
    bg: 'bg-amber-500/10 border border-amber-500/20',
    color: 'text-amber-500',
  },
];

export default function HomePage() {
  const { site, profile } = usePublicSite();
  const { data: statsRes } = useApi(() => api.getStats());
  const { data: projects } = useApi(() => api.getProjects());
  const { data: skills } = useApi(() => api.getSkills());
  const [selected, setSelected] = useState(null);

  const hero = site?.hero || {};
  const name = profile?.name || hero.heading || 'Portfolio';
  const nameParts = name.split(' ');
  const role = (profile?.roles && profile.roles[0]) || profile?.title || hero.subtitle || '';
  const description = hero.description || profile?.shortBio || '';
  const featured = (projects || []).filter((p) => p.featured).slice(0, 3);
  const featuredList = featured.length ? featured : (projects || []).slice(0, 3);
  const stats = (statsRes?.stats || []).filter((stat) => Number(stat.value) > 0).slice(0, 4);
  const profilePhoto = getProfilePhotoSources(profile);

  const professionalLinks = [
    {
      icon: Github,
      url: profile?.socials?.github || 'https://github.com/TosifRaza',
      label: 'GitHub',
      hoverColor: 'hover:text-foreground hover:border-foreground/40 hover:bg-foreground/5',
    },
    {
      icon: Linkedin,
      url: profile?.socials?.linkedin || 'https://linkedin.com/in/tosifraza',
      label: 'LinkedIn',
      hoverColor: 'hover:text-[#0a66c2] hover:border-[#0a66c2]/40 hover:bg-[#0a66c2]/10',
    },
    {
      icon: LeetCodeIcon,
      url: 'https://leetcode.com/u/TosifRaza',
      label: 'LeetCode',
      hoverColor: 'hover:text-[#ffa116] hover:border-[#ffa116]/40 hover:bg-[#ffa116]/10',
    },
    {
      icon: Twitter,
      url: profile?.socials?.twitter || 'https://twitter.com/tosifraza',
      label: 'Twitter / X',
      hoverColor: 'hover:text-[#1d9bf0] hover:border-[#1d9bf0]/40 hover:bg-[#1d9bf0]/10',
    },
    {
      icon: Mail,
      url: profile?.email ? `mailto:${profile.email}` : 'mailto:razatosif206@gmail.com',
      label: 'Email',
      hoverColor: 'hover:text-[#ea4335] hover:border-[#ea4335]/40 hover:bg-[#ea4335]/10',
    },
    {
      icon: Globe,
      url: profile?.socials?.website || 'https://tosif.site/',
      label: 'Portfolio Website',
      hoverColor: 'hover:text-primary hover:border-primary/40 hover:bg-primary/10',
    },
  ];

  const primaryCta = hero.primaryCta?.label ? hero.primaryCta : { label: 'Explore Projects', target: '/projects' };
  const secondaryCta = hero.secondaryCta?.label ? hero.secondaryCta : { label: 'View Resume', target: '/resume' };

  return (
    <div>
      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-backdrop opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />

        {/* ── Mobile View (< md) matching reference screenshot ──────────────── */}
        <div className="md:hidden max-w-xl mx-auto px-4 py-5">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold tracking-wider mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            {hero.badge || 'FULL-STACK JAVASCRIPT DEVELOPER'}
          </div>

          {/* Top row: Name & bio on left, stylized photo card on right */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {nameParts.slice(0, -1).join(' ')}{' '}
                <span className="text-primary">{nameParts.slice(-1)}</span>
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-4">
                {description}
              </p>
            </div>

            {/* Avatar Photo with subtle blob + </> badge */}
            <div className="relative shrink-0 pr-1">
              <div className="absolute -inset-1.5 bg-primary/15 rounded-3xl -rotate-2" />
              <div className="relative w-28 h-32 rounded-2xl overflow-hidden border-2 border-background shadow-md bg-muted">
                <img
                  src={profilePhoto?.primary}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-card border border-primary/30 rounded-xl px-2 py-0.5 shadow-md text-primary font-mono font-bold text-xs flex items-center justify-center">
                &lt;/&gt;
              </div>
            </div>
          </div>

          {/* Metadata Row: Location + Availability */}
          <div className="flex flex-wrap items-center gap-3.5 text-[11px] text-muted-foreground mt-3">
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-muted-foreground/70" />
                {profile.location}
              </span>
            )}
            {profile?.availability?.status && (
              <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {profile.availability.status}
              </span>
            )}
          </div>

          {/* CTA Buttons: 2 equal columns */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link
              to={primaryCta.target?.startsWith('/') ? primaryCta.target : '/projects'}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all"
            >
              <Folder size={14} />
              {primaryCta.label}
              <ArrowRight size={13} />
            </Link>
            <Link
              to={secondaryCta.target?.startsWith('/') ? secondaryCta.target : '/resume'}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground shadow-sm hover:border-primary/40 transition-all"
            >
              <FileText size={14} />
              {secondaryCta.label}
            </Link>
          </div>

          {/* GitHub Activity */}
          <div className="mt-5">
            <GitHubContributions githubUrl={profile?.socials?.github} />
          </div>
        </div>

        {/* ── Desktop View (>= md) ───────────────────────────────────────── */}
        <div className="hidden md:grid relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-4 md:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
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
                {secondaryCta.label}
              </Link>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-6">
              <GitHubContributions githubUrl={profile?.socials?.github} />
            </motion.div>
          </div>

          {/* Right: avatar + code card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="relative flex min-w-0 flex-col items-center gap-6 md:col-start-2"
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

              {/* Professional Engineer Quick Links */}
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.25 }}
                className="mt-3 flex items-center justify-center gap-2"
                aria-label="Professional profiles and contact"
              >
                {professionalLinks.map(({ icon: Icon, url, label, hoverColor }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    title={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/85 text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${hoverColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── My Skills Section (Shown on mobile & desktop) ─────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full border-t border-border/40">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="flex items-center gap-2 text-base sm:text-xl font-bold text-foreground">
            <Box size={18} className="text-primary" /> My Skills
          </h2>
          <Link to="/skills" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View All Skills <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {skillsPreview.map((skill) => {
            const Icon = skill.icon;
            return (
              <Link
                key={skill.title}
                to="/skills"
                className="group flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border bg-card/70 hover:border-primary/40 hover:bg-card transition-all shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${skill.bg} ${skill.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">{skill.title}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{skill.subtitle}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </Link>
            );
          })}
        </div>
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full border-t border-border/40">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="flex items-center gap-2 text-base sm:text-xl font-bold text-foreground">
            <Folder size={18} className="text-primary" /> Featured Projects
          </h2>
          <Link to="/projects" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View All Projects <ArrowRight size={12} />
          </Link>
        </div>
        {featuredList.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
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
