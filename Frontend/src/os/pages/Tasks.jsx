import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import { Panel, Spinner, ErrorState, Badge, fmtMinutes, DeleteButton } from '../components/ui.jsx';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';

const PRIORITY_COLORS = { low: '#6B6B80', medium: '#00D4FF', high: '#FFB800', critical: '#FF3366' };
const FILTERS = ['all', 'todo', 'in-progress', 'done'];

/** All tasks across goals — with filters. */
export default function Tasks() {
  const [filter, setFilter] = useState('all');
  const { data: tasks, loading, error, refetch } = useApi(() => osApi.tasks.list(), [filter]);

  const filtered = (tasks || []).filter((t) => filter === 'all' || t.status === filter);

  const toggle = async (t) => {
    await osApi.tasks.toggle(t._id).catch((e) => alert(e.message));
    refetch();
  };

  const remove = async (t) => {
    await osApi.tasks.remove(t._id).catch((e) => alert(e.message));
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>All Tasks</h1>
        <p className="text-xs text-[#6B6B80] mt-1">Completing a task automatically updates its milestone and goal progress.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              filter === f ? 'bg-[#00D4FF]/15 border border-[#00D4FF]/40 text-[#00D4FF]' : 'bg-white/[0.03] border border-white/[0.07] text-[#9B9BAF]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <Panel>
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <ListChecks size={30} className="mx-auto mb-3 text-[#4A4A5E]" />
              <p className="text-sm text-[#C8C8D8]">No tasks here</p>
              <p className="text-xs text-[#6B6B80] mt-1">Tasks are created inside goals — open a goal to add milestones and tasks.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((t) => (
                <div key={t._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <button onClick={() => toggle(t)} aria-label="Toggle task">
                    {t.status === 'done' ? <CheckCircle2 size={16} className="text-[#00FF88]" /> : <Circle size={16} className="text-[#4A4A5E] hover:text-[#00D4FF]" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${t.status === 'done' ? 'text-[#4A4A5E] line-through' : 'text-[#E8E8F0]'}`}>{t.title}</div>
                    <div className="text-[10px] text-[#6B6B80] mono">
                      {t.goalId ? `${t.goalId.title}` : 'no goal'}
                      {t.milestoneId ? ` → ${t.milestoneId.title}` : ''}
                      {t.estimateMinutes ? ` · ~${fmtMinutes(t.estimateMinutes)}` : ''}
                      {t.dueDate ? ` · due ${new Date(t.dueDate).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <Badge color={PRIORITY_COLORS[t.priority]}>{t.priority.toUpperCase()}</Badge>
                  <DeleteButton onConfirm={() => remove(t)} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
