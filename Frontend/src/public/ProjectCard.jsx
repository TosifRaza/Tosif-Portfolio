import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

/** Thumbnail — uses the project's own image when the admin uploaded one;
    otherwise a clean branded placeholder (never a fake screenshot). */
export function ProjectThumb({ project, className = 'h-40' }) {
  const initial = (project.title || 'P').trim().charAt(0).toUpperCase();
  if (project.image) {
    return (
      <div className={`${className} w-full overflow-hidden bg-muted`}>
        <img
          src={project.image.startsWith('/') ? project.image : `/${project.image}`}
          alt={`${project.title} preview`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div className={`${className} w-full relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-card flex items-center justify-center`}>
      <div className="absolute inset-0 grid-backdrop opacity-40" aria-hidden="true" />
      <span className="relative font-mono text-3xl font-bold text-primary/70">{initial}</span>
      <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
        {(project.category || 'project').replace('-', ' ')}
      </span>
    </div>
  );
}

export function TechChip({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-md border border-border bg-muted/50 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

/** Reference-style project card. */
export default function ProjectCard({ project, index = 0, onOpen }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.35 }}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.12)] transition-all flex flex-col"
    >
      <button onClick={() => onOpen?.(project)} className="text-left" aria-label={`Open ${project.title}`}>
        <ProjectThumb project={project} />
      </button>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground">{project.title}</h3>
          {project.status && (
            <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground">
              {project.status}
            </span>
          )}
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-clamp-2 flex-1">
          {project.description || project.tagline}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(project.stack || []).slice(0, 4).map((t) => (
            <TechChip key={t}>{t}</TechChip>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Live Demo <ExternalLink size={11} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <Github size={12} /> GitHub
            </a>
          )}
          <button
            onClick={() => onOpen?.(project)}
            className="ml-auto text-xs text-primary hover:underline"
          >
            Details →
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/** Full-detail modal (problem / solution / role / stack). */
export function ProjectModal({ project, onClose }) {
  if (!project) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
      >
        <ProjectThumb project={project} className="h-48" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
              {project.tagline && <p className="mt-1 text-sm text-primary">{project.tagline}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {project.role && (
            <p className="mt-3 inline-block px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-xs text-primary">
              {project.role}
            </p>
          )}

          {project.description && (
            <p className="mt-4 text-sm leading-relaxed text-foreground/85">{project.description}</p>
          )}

          {(project.problem || project.solution) && (
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {project.problem && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Problem</p>
                  <p className="text-[13px] text-foreground/80 leading-relaxed">{project.problem}</p>
                </div>
              )}
              {project.solution && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1.5">Solution</p>
                  <p className="text-[13px] text-foreground/80 leading-relaxed">{project.solution}</p>
                </div>
              )}
            </div>
          )}

          {project.stack?.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((t) => (
                  <TechChip key={t}>{t}</TechChip>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2.5">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                View Project <ExternalLink size={12} />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground/80 hover:border-primary/40 transition-colors">
                <Github size={12} /> Source Code
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
