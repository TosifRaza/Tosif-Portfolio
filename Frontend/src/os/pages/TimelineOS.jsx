import { useApi } from '@/hooks/useApi';
import { Panel, Spinner, ErrorState, Badge, EmptyState } from '../components/ui.jsx';
import { History } from 'lucide-react';

const CAT_COLORS = {
  career: '#00D4FF', learning: '#7C6AFF', product: '#FF6B9D',
  achievement: '#FFB800', project: '#00FF88', personal: '#a78bfa',
};

/** TIMELINE (private view) — the life & career timeline from the CMS. */
export default function TimelineOS() {
  const { data: events, loading, error, refetch } = useApi(() =>
    fetch('/api/timeline').then((r) => {
      if (!r.ok) throw new Error('Failed to load timeline');
      return r.json();
    })
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <div className="mono text-[10px] text-[#FFB800] tracking-[0.3em]">// LIFE_CAREER_TIMELINE</div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Timeline</h1>
        <p className="text-xs text-[#6B6B80] mt-1">Managed from the Admin Control Center → Public Website → Timeline. Future system events (product launches, milestones) can appear here automatically.</p>
      </div>

      {(events || []).length === 0 ? (
        <Panel><EmptyState icon={History} title="No timeline events yet" hint="Add them in the Admin Control Center → Public Website → Timeline." /></Panel>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
          {(events || []).map((e) => (
            <div key={e._id} className="relative">
              <div
                className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#06060C]"
                style={{ background: CAT_COLORS[e.category] || '#00D4FF' }}
              />
              <div className="glass rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{e.icon || '•'}</span>
                    <span className="text-base font-semibold text-[#E8E8F0]">{e.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={CAT_COLORS[e.category] || '#00D4FF'}>{(e.category || 'career').toUpperCase()}</Badge>
                    <span className="text-xs mono text-[#6B6B80]">{e.year}</span>
                  </div>
                </div>
                <p className="text-sm text-[#9B9BAF] leading-relaxed">{e.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
