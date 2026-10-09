import { useApi } from '@/hooks/useApi';
import { apiUrl } from '@/utils/api';
import { Panel, Spinner, ErrorState, Badge, EmptyState } from '../components/ui.jsx';
import { History } from 'lucide-react';

const CAT_COLORS = {
  career: 'hsl(var(--primary))', learning: 'hsl(var(--primary))', product: '#F472B6',
  achievement: '#F59E0B', project: '#10B981', personal: 'hsl(var(--primary))',
};

/** TIMELINE (private view) — the life & career timeline from the CMS. */
export default function TimelineOS() {
  const { data: events, loading, error, refetch } = useApi(() =>
    fetch(apiUrl('/api/timeline')).then((r) => {
      if (!r.ok) throw new Error('Failed to load timeline');
      return r.json();
    })
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>Timeline</h1>
        <p className="text-xs text-muted-foreground mt-1">Managed from the Admin Control Center → Public Website → Timeline. Future system events (product launches, milestones) can appear here automatically.</p>
      </div>

      {(events || []).length === 0 ? (
        <Panel><EmptyState icon={History} title="No timeline events yet" hint="Add them in the Admin Control Center → Public Website → Timeline." /></Panel>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-muted/80">
          {(events || []).map((e) => (
            <div key={e._id} className="relative">
              <div
                className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background"
                style={{ background: CAT_COLORS[e.category] || 'hsl(var(--primary))' }}
              />
              <div className="glass rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{e.icon || '•'}</span>
                    <span className="text-base font-semibold text-foreground">{e.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={CAT_COLORS[e.category] || 'hsl(var(--primary))'}>{(e.category || 'career').toUpperCase()}</Badge>
                    <span className="text-xs mono text-muted-foreground">{e.year}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
