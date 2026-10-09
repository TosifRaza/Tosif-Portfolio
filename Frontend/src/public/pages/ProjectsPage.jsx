import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, LayoutGrid } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import SectionHeader, { EmptyState, LoadingBlock } from '../SectionHeader';
import ProjectCard, { ProjectModal } from '../ProjectCard';

export default function ProjectsPage() {
  const { data: projects, loading } = useApi(() => api.getProjects());
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const categories = useMemo(() => {
    const counts = new Map();
    (projects || []).forEach((p) => {
      const c = p.category || 'other';
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const filtered = (projects || []).filter((p) => filter === 'all' || (p.category || 'other') === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
      <SectionHeader
        icon={FolderKanban}
        eyebrow="My Works"
        title="Projects"
        subtitle="Here are some of the projects I've built. Each project helped me learn new technologies and solve real-world problems."
      />

      <div className="grid lg:grid-cols-[210px_1fr] gap-8">
        {/* Filter sidebar */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                filter === 'all' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
              }`}
            >
              <LayoutGrid size={14} /> All Projects
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">{(projects || []).length}</span>
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap capitalize transition-colors ${
                  filter === cat ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {cat.replace(/[-_]/g, ' ')}
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">{count}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Cards */}
        <div>
          {loading ? (
            <LoadingBlock label="Loading projects…" />
          ) : filtered.length ? (
            <div className="grid sm:grid-cols-2 gap-5">
              {filtered.map((p, i) => (
                <ProjectCard key={p._id || i} project={p} index={i} onOpen={setSelected} />
              ))}
            </div>
          ) : (
            <EmptyState message="No projects published in this category yet." />
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
