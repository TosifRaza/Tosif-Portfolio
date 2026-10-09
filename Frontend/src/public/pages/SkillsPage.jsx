import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Code2, Server, Database, Cloud, ToolCase, Target } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import SectionHeader, { EmptyState, LoadingBlock } from '../SectionHeader';

const CATEGORY_META = {
  frontend: { icon: Code2 },
  backend: { icon: Server },
  database: { icon: Database },
  devops: { icon: Cloud },
  tools: { icon: ToolCase },
  'engineering focus': { icon: Target },
};
const FALLBACK_ICONS = [Code2, Server, Database, Cloud, ToolCase, Wrench];

export default function SkillsPage() {
  const { data: skills, loading } = useApi(() => api.getSkills());

  const groups = useMemo(() => {
    const map = new Map();
    (skills || []).forEach((s) => {
      const cat = (s.category || 'Other').trim();
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(s);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [skills]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
      <SectionHeader
        icon={Wrench}
        eyebrow="My Skills"
        title="Technical Skills"
        subtitle="Technologies and tools I work with — levels reflect real, self-assessed proficiency."
      />

      {loading ? (
        <LoadingBlock label="Loading skills…" />
      ) : groups.length === 0 ? (
        <EmptyState message="Skills will appear here once they are published." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map(([cat, items], gi) => {
            const meta = CATEGORY_META[cat.toLowerCase()];
            const Icon = meta?.icon || FALLBACK_ICONS[gi % FALLBACK_ICONS.length];
            return (
              <motion.section
                key={cat}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(gi * 0.05, 0.25) }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                    <Icon size={14} />
                  </span>
                  {cat.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </h2>
                <ul className="space-y-3">
                  {items.map((s) => (
                    <li key={s._id || s.name}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-foreground/90">{s.name}</span>
                        {typeof s.level === 'number' && (
                          <span className="text-[10px] font-mono text-muted-foreground">{s.level}%</span>
                        )}
                      </div>
                      {typeof s.level === 'number' && (
                        <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/80"
                            style={{ width: `${Math.max(4, Math.min(100, s.level))}%` }}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
