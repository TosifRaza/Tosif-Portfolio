import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, LayoutGrid } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import SectionHeader, { EmptyState, LoadingBlock } from '../SectionHeader';
import ProjectCard, { ProjectModal } from '../ProjectCard';

// Engineering Lab = learning artifacts & open-source experiments.
// Rule: projects whose category is 'learning' or 'open-source' (or any
// category the admin names with a "lab:" prefix). No fabricated content.
const LAB_CATEGORIES = ['learning', 'open-source'];
const isLab = (p) => LAB_CATEGORIES.includes(p.category) || (p.category || '').startsWith('lab:');

export default function EngineeringLabPage() {
  const { data: projects, loading } = useApi(() => api.getProjects());
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const labProjects = useMemo(() => (projects || []).filter(isLab), [projects]);

  const categories = useMemo(() => {
    const counts = new Map();
    labProjects.forEach((p) => {
      const c = (p.category || 'other').replace(/^lab:/, '');
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return [...counts.entries()];
  }, [labProjects]);

  const filtered = labProjects.filter(
    (p) => filter === 'all' || (p.category || 'other').replace(/^lab:/, '') === filter
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
      <SectionHeader
        icon={FlaskConical}
        eyebrow="Learn · Build · Improve"
        title="Engineering Lab"
        subtitle="A collection of technical experiments, open-source work and learning artifacts — real builds, real breakdowns."
      />

      <div className="grid lg:grid-cols-[230px_1fr] gap-8">
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                filter === 'all' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
              }`}
            >
              <LayoutGrid size={14} /> All Experiments
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">{labProjects.length}</span>
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

        <div>
          {loading ? (
            <LoadingBlock label="Loading lab…" />
          ) : filtered.length ? (
            <div className="grid sm:grid-cols-2 gap-5">
              {filtered.map((p, i) => (
                <ProjectCard key={p._id || i} project={p} index={i} onOpen={setSelected} />
              ))}
            </div>
          ) : (
            <EmptyState message="No lab experiments published yet — they will appear here as they are documented." />
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
