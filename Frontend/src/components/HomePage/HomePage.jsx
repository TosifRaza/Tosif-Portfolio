import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, Code2, ExternalLink, Github, Linkedin, Mail,
  MapPin, Sparkles, Zap,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { api, apiUrl } from '@/utils/api';

function TechChip({ label, index }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-[#b3c5da]">
      <span className={`h-2 w-2 rounded-full ${index % 2 ? 'bg-[#35b7ff]' : 'bg-[#32d4bb]'}`} />
      {label}
    </div>
  );
}

function ProjectCard({ project, onOpen, index }) {
  const title = project.title || project.name || '';
  const preview = project.image || project.images?.[0];
  const image = preview ? apiUrl(preview) : null;
  const stack = Array.isArray(project.stack) ? project.stack.slice(0, 4) : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="group overflow-hidden rounded-xl border border-card bg-[#071426] transition-colors hover:border-[#2278d1]/70"
    >
      <button onClick={onOpen} className="block w-full text-left" aria-label={`View ${title}`}>
        <div className="relative aspect-[16/8] overflow-hidden border-b border-card bg-[#081a30] sm:aspect-[16/7]">
          {image ? (
            <img src={image} alt={`${title} preview`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#07182b] text-3xl font-semibold text-[#31577e]" aria-label="Project image not set">
              {title.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-3.5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-muted-foreground">
            {project.tagline || project.description || ''}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {stack.map((technology) => (
              <span key={technology} className="rounded bg-[#0c2038] px-1.5 py-1 text-[9px] text-muted-foreground">{technology}</span>
            ))}
          </div>
        </div>
      </button>
      <div className="flex items-center gap-3 border-t border-card px-3.5 py-2.5">
        <button onClick={onOpen} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#3d9dff] hover:text-[#81c2ff]">
          View details <ArrowRight size={12} />
        </button>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-white">
            Live demo <ExternalLink size={11} />
          </a>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-white">
            <Github size={12} /> Code
          </a>
        )}
      </div>
    </motion.article>
  );
}

export default function HomePage({ site }) {
  const { setActiveSection } = useApp();
  const navigate = useNavigate();
  const [photoFailed, setPhotoFailed] = useState(false);
  const { data: profile } = useApi(() => api.getProfile());
  const { data: aboutData } = useApi(() => api.getAbout());
  const { data: skillData } = useApi(() => api.getSkills());
  const { data: statsData } = useApi(() => api.getStats());
  const { data: projectData } = useApi(() => api.getProjects());

  useEffect(() => {
    setPhotoFailed(false);
  }, [profile?.avatarUrl, profile?.avatar, profile?.photo, profile?.image]);

  const person = profile || {};
  const socials = person.socials || person.socialLinks || {};
  const githubUrl = socials.github || '';
  const githubUsername = githubUrl.match(/github\.com\/([^/?#]+)/i)?.[1];
  const photo = person.avatarUrl || person.avatar || person.photo || person.image || (githubUsername ? `https://github.com/${githubUsername}.png` : '');
  const photoSrc = photo ? apiUrl(photo) : '';
  const hero = site?.hero || {};
  const projects = Array.isArray(projectData) ? projectData : projectData?.projects || [];
  const featuredProjects = projects.filter((project) => project.featured);
  const shownProjects = (featuredProjects.length ? featuredProjects : projects).slice(0, 3);
  const stats = (hero.showStats === false ? [] : statsData?.stats) || [];
  const skills = Array.isArray(skillData) ? skillData : skillData?.skills || [];
  const technologies = skills.map((skill) => typeof skill === 'string' ? skill : skill.name).filter(Boolean).slice(0, 8);
  const bio = aboutData?.paragraphs?.filter(Boolean).length
    ? aboutData.paragraphs.filter(Boolean)
    : [person.shortBio || person.longBio || person.tagline || hero.description].filter(Boolean);
  const title = person.title || person.roles?.[0] || hero.subtitle || '';
  const currentMission = site?.currentMission || {};
  const currentTitle = currentMission.title || person.availability?.status || '';
  const currentDescription = currentMission.description || person.pitch || person.availability?.type || aboutData?.highlights?.[0]?.description || '';
  const hasCurrentInfo = hero.showCurrentMission !== false && Boolean(currentTitle || currentDescription || person.location || person.email || socials.email);
  const enabledOsEntry = site?.nav?.find((item) => item.target === '/os' && item.enabled && item.scope !== 'os');
  const primaryCta = hero.primaryCta || {};
  const secondaryCta = hero.secondaryCta || {};
  const codeSkills = skills.slice(0, 4).map((skill) => typeof skill === 'string' ? skill : skill.name).filter(Boolean);
  const codeFocus = (aboutData?.highlights || []).map((item) => item.title).filter(Boolean).slice(0, 3);

  const handleNavigate = (section) => {
    if (section === '/os') {
      navigate('/os');
      return;
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProjects = () => handleNavigate('projects');
  return (
    <div className="min-h-screen w-full min-w-0 bg-[#030b17] text-foreground">
      <main className="mx-0 w-full min-w-0 max-w-none px-3 pb-12 pt-5 sm:px-5 md:px-7 lg:px-[4vw] xl:px-[4.5vw] 2xl:px-[5vw] lg:pt-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full min-w-0"
        >
          <div className="grid w-full min-w-0 items-center gap-6 border-b border-card py-7 sm:gap-8 sm:py-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(220px,0.8fr)_minmax(0,1.25fr)] lg:gap-6 lg:py-10 2xl:gap-10 2xl:py-12">
            <div className="min-w-0">
              <p className="mb-1 text-sm font-medium text-[#d4dfed]">{hero.badge || (person.name ? `Hi, I’m ${person.name}` : '')}</p>
              <h1 className="text-4xl font-bold tracking-tight text-[#f0f6ff] sm:text-5xl" style={{ fontFamily: 'Inter, system-ui' }}>
                {(hero.heading || person.name || '').trim().split(/\s+/).slice(0, -1).join(' ')}{' '}
                <span className="text-[#4388ff]">{(hero.heading || person.name || '').trim().split(/\s+/).slice(-1)[0]}</span>
              </h1>
              {title && <p className="mt-1 text-xl font-semibold text-[#e0eaf6] sm:text-2xl">{title}</p>}
              {bio.map((paragraph, index) => <p key={index} className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{paragraph}</p>)}

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button onClick={() => handleNavigate(primaryCta.target || 'projects')} className="inline-flex items-center gap-2 rounded-md bg-[#1478ee] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#328dff]">
                  {primaryCta.label || 'View projects'} <ArrowRight size={14} />
                </button>
                {secondaryCta.label && <button onClick={() => handleNavigate(secondaryCta.target || 'contact')} className="inline-flex items-center gap-2 rounded-md border border-[#284362] px-4 py-2.5 text-xs font-medium text-[#d4e2f1] transition-colors hover:border-[#4a76a3] hover:bg-muted/40">
                  {secondaryCta.label}
                </button>}
                {enabledOsEntry && <button onClick={() => handleNavigate('/os')} className="inline-flex items-center gap-2 rounded-md border border-[#26553f] bg-[#0b281f] px-4 py-2.5 text-xs font-medium text-[#6ee7b7] transition-colors hover:border-[#2e9467] hover:bg-[#103829]">
                  <Zap size={14} /> {enabledOsEntry.label}
                </button>}
              </div>

              <div className="mt-4 flex items-center gap-2.5">
                {[
                  { href: githubUrl, label: 'GitHub', icon: Github },
                  { href: socials?.linkedin, label: 'LinkedIn', icon: Linkedin },
                  { href: socials?.email || person.email ? `mailto:${socials?.email || person.email}` : '', label: 'Email', icon: Mail },
                ].filter((item) => item.href).map(({ href, label, icon: Icon }) => (
                  <a key={label} href={href} target={label === 'Email' ? undefined : '_blank'} rel="noreferrer" aria-label={label} title={label} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a9c1da] transition-colors hover:bg-[#0e2742] hover:text-white">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] sm:gap-4 lg:col-span-2">
              <div className="relative aspect-[4/3] min-h-[210px] min-w-0 overflow-hidden rounded-lg border border-[#1c3d61] bg-[#0b1e33] sm:aspect-auto sm:min-h-[260px] 2xl:min-h-[320px]">
                {!photoFailed && photoSrc ? (
                  <img src={photoSrc} alt={person.name || ''} onError={() => setPhotoFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#1a4a79,#07172a_70%)] text-5xl font-bold text-[#78bfff]" style={{ fontFamily: 'Inter, system-ui' }}>
                    {(person.name || '').split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </div>
                )}
                {person.location && <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-[#030b17]/80 px-2 py-1 text-[9px] text-[#c6d5e8]">
                  <MapPin size={10} className="text-[#48a8ff]" /> {person.location}
                </div>}
              </div>
              <div className="min-h-[210px] min-w-0 rounded-lg border border-[#183655] bg-[#050d18] p-3 sm:min-h-[260px] sm:p-4 2xl:min-h-[320px] 2xl:p-6">
                <div className="mb-3 flex items-center gap-1.5 border-b border-[#18304a] pb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff657a]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffc45c]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#37d7a0]" />
                  <span className="ml-auto text-[8px] text-[#607b98]">&lt;/&gt; {title}</span>
                </div>
                <code className="block whitespace-normal break-words text-[9px] leading-[1.65] text-muted-foreground sm:text-[10px] 2xl:text-xs">
                  <span className="text-[#579eff]">const</span> developer = {'{'}<br />
                  {[
                    ['name', person.name],
                    ['role', title],
                    ['focus', codeFocus.length ? codeFocus : person.pitch ? [person.pitch] : []],
                    ['tech', codeSkills],
                    ['location', person.location],
                  ].filter(([, value]) => value && (!Array.isArray(value) || value.length)).map(([key, value]) => (
                    <span key={key}>&nbsp; {key}: <span className="text-[#58d8a8]">{JSON.stringify(value)}</span>,<br /></span>
                  ))}
                  {'}'};<br /><br />
                </code>
              </div>
            </div>
          </div>
        </motion.section>

        {technologies.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card py-3.5">
          <div className="text-[10px] font-medium text-muted-foreground">Tech I work with</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {technologies.map((technology, index) => <TechChip key={technology} label={technology} index={index} />)}
          </div>
        </div>}

        {shownProjects.length > 0 && <section className="mt-6 sm:mt-7">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
                <Sparkles size={13} /> Selected work
              </div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: 'Inter, system-ui' }}>Featured projects</h2>
            </div>
            <button onClick={openProjects} className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary">
              All projects <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shownProjects.map((project, index) => (
              <ProjectCard key={project._id || project.slug || project.title || project.name} project={project} index={index} onOpen={openProjects} />
            ))}
          </div>
        </section>}

        {(bio.length > 0 || stats.length > 0 || hasCurrentInfo) && <section className="mt-5 flex flex-col gap-4 border-y border-card py-5 sm:gap-5 lg:flex-row lg:items-center">
          {bio.length > 0 && <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              <Sparkles size={13} /> About me
            </div>
            {bio.slice(0, 2).map((paragraph, index) => <p key={index} className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{paragraph}</p>)}
            <button onClick={() => handleNavigate('about')} className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary">
              More about me <ArrowRight size={12} />
            </button>
          </div>}
          {stats.length > 0 && <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-[#dce8f5]">
              <BarChart3 size={13} className="text-[#428fff]" /> Quick stats
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(68px,1fr))] border-y border-card py-2">
              {stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className={`px-2 py-1 text-center ${index > 0 ? 'border-l border-card' : ''}`}>
                  <div className="text-lg font-bold text-[#e7f0fb]">{stat.value}</div>
                  <div className="mt-0.5 text-[9px] text-[#91a8c0]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>}
          {hasCurrentInfo && <div className="min-w-0 flex-1 lg:border-l lg:border-card lg:pl-5">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4a9eff]">
              <Code2 size={13} /> Currently
            </div>
            {currentTitle && <div className="text-sm font-semibold text-[#e2ebf7]">{currentTitle}</div>}
            {currentDescription && <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{currentDescription}</p>}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              {person.location && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {person.location}</span>}
              {(socials?.email || person.email) && <a href={`mailto:${socials?.email || person.email}`} className="inline-flex items-center gap-1 hover:text-white"><Mail size={11} /> {socials?.email || person.email}</a>}
            </div>
          </div>}
        </section>}

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-card px-1 pt-3 text-[10px] text-[#7188a1]">
          <span>{site?.footer?.text || (person.name ? `© ${new Date().getFullYear()} ${person.name}` : "")}</span>
          <div className="flex items-center gap-4">
            {[
              { label: 'GitHub', href: githubUrl },
              { label: 'LinkedIn', href: socials?.linkedin },
              { label: 'Email', href: socials?.email ? `mailto:${socials.email}` : person.email ? `mailto:${person.email}` : '' },
            ].filter((item) => item.href).map((item) => (
              <a key={item.label} href={item.href} target={item.label === 'Email' ? undefined : '_blank'} rel="noreferrer" className="hover:text-[#cbd9e8]">{item.label}</a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
