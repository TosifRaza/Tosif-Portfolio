import { useApi } from '@/hooks/useApi';
import { apiUrl } from '@/utils/api';
import { Panel, Spinner, ErrorState, Badge, EmptyState } from '../components/ui.jsx';
import { Trophy } from 'lucide-react';

/** ACHIEVEMENTS (private view) — professional vs personal, from the CMS. */
export default function AchievementsOS() {
  const { data: items, loading, error, refetch } = useApi(() =>
    fetch(apiUrl('/api/achievements')).then((r) => {
      if (!r.ok) throw new Error('Failed to load achievements');
      return r.json();
    })
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const professional = (items || []).filter((a) => (a.category || 'professional') === 'professional');
  const personal = (items || []).filter((a) => a.category === 'personal');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Achievements & Milestones</h1>
        <p className="text-xs text-[#6B6B80] mt-1">Managed in the Admin Control Center. Personal milestones (learning streaks, habit streaks) can be added here as they happen — gamification stays subtle.</p>
      </div>

      {(items || []).length === 0 ? (
        <Panel><EmptyState icon={Trophy} title="No achievements recorded yet" hint="Add them in the Admin Control Center → Public Website → Achievements." /></Panel>
      ) : (
        <>
          {[
            { name: 'Professional', color: '#00D4FF', list: professional },
            { name: 'Personal', color: '#FFB800', list: personal },
          ].map((group) => group.list.length > 0 && (
            <Panel key={group.name} title={group.name}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.list.map((a) => (
                  <div key={a._id} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{a.icon || '🏆'}</span>
                      {a.featured && <Badge color="#FFB800">FEATURED</Badge>}
                    </div>
                    <div className="text-sm font-semibold text-[#E8E8F0]">{a.title}</div>
                    {a.description && <p className="text-xs text-[#8B8B9F] mt-1 leading-relaxed">{a.description}</p>}
                    <div className="text-[10px] mono text-[#4A4A5E] mt-2">
                      {a.issuer}{a.issuer && a.date ? ' · ' : ''}{a.date}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </>
      )}
    </div>
  );
}
