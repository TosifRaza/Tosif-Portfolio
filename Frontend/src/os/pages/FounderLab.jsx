import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import { apiUrl } from '@/utils/api';
import { Panel, Spinner, ErrorState, Badge, EmptyState, ProgressBar } from '../components/ui.jsx';
import { Rocket, ExternalLink, Github } from 'lucide-react';

const STATUS_STYLES = {
  idea: '#9B9BAF', planning: '#FFB800', development: '#00D4FF', mvp: '#7C6AFF',
  live: '#00FF88', maintenance: '#FF6B9D', archived: '#6B6B80',
};

/** FOUNDER LAB — products, roadmaps and honest milestones from the CMS. */
export default function FounderLab() {
  const { data: products, loading, error, refetch } = useApi(() =>
    fetch(apiUrl('/api/products')).then((r) => {
      if (!r.ok) throw new Error('Failed to load products');
      return r.json();
    })
  );
  const { data: goals } = useApi(() => osApi.goals.list());

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <div className="mono text-[10px] text-[#FF6B9D] tracking-[0.3em]">// FOUNDER_LAB</div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Founder Lab</h1>
        <p className="text-xs text-[#6B6B80] mt-1">Your products and startups — problems, solutions, roadmaps. Metrics only appear if you entered them; nothing is invented.</p>
      </div>

      {(products || []).length === 0 ? (
        <Panel>
          <EmptyState
            icon={Rocket}
            title="No products yet"
            hint="Add your startup or SaaS product in the Admin Control Center → Public Website → Products."
          />
        </Panel>
      ) : (
        <div className="space-y-6">
          {(products || []).map((p) => (
            <div key={p._id} className="glass rounded-xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{p.name}</h2>
                  {p.tagline && <p className="text-xs text-[#8B8B9F] mt-0.5">{p.tagline}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={STATUS_STYLES[p.status] || '#9B9BAF'}>{(p.status || 'idea').toUpperCase()}</Badge>
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-[#00D4FF]"><ExternalLink size={15} /></a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-[#9B9BAF]"><Github size={15} /></a>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5">
                {p.problem && (
                  <div className="p-4 rounded-lg bg-[#FF3366]/[0.04] border border-[#FF3366]/15">
                    <div className="text-[10px] mono uppercase tracking-widest text-[#FF3366] mb-1">Problem</div>
                    <p className="text-xs text-[#B8B8CC] leading-relaxed">{p.problem}</p>
                  </div>
                )}
                {p.solution && (
                  <div className="p-4 rounded-lg bg-[#00FF88]/[0.04] border border-[#00FF88]/15">
                    <div className="text-[10px] mono uppercase tracking-widest text-[#00FF88] mb-1">Solution</div>
                    <p className="text-xs text-[#B8B8CC] leading-relaxed">{p.solution}</p>
                  </div>
                )}
              </div>

              {p.roadmap?.length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] mono uppercase tracking-widest text-[#6B6B80] mb-3">Roadmap</div>
                  <div className="space-y-2.5">
                    {p.roadmap.map((ph, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: ph.status === 'completed' ? '#00FF88' : ph.status === 'current' ? '#00D4FF' : '#2a2a3e' }}
                        />
                        <span className={`text-xs w-24 flex-shrink-0 ${ph.status === 'upcoming' ? 'text-[#6B6B80]' : 'text-[#E8E8F0]'}`}>{ph.phase}</span>
                        {ph.quarter && <span className="text-[10px] mono text-[#4A4A5E] w-16">{ph.quarter}</span>}
                        <span className="text-xs text-[#8B8B9F] truncate">{ph.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {p.milestones?.length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] mono uppercase tracking-widest text-[#6B6B80] mb-2">Milestones</div>
                  <div className="space-y-1.5">
                    {p.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${m.done ? 'bg-[#00FF88]' : 'bg-[#2a2a3e]'}`} />
                        <span className={m.done ? 'text-[#8B8B9F]' : 'text-[#C8C8D8]'}>{m.title}</span>
                        {m.date && <span className="text-[10px] mono text-[#4A4A5E]">{m.date}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {p.metrics?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {p.metrics.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                      <div className="text-base font-bold text-[#00FF88]">{m.value}</div>
                      <div className="text-[9px] text-[#6B6B80] mono uppercase">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {p.caseStudy && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="text-[10px] mono uppercase tracking-widest text-[#a855f7] mb-1.5">Case study / business model</div>
                  <p className="text-xs text-[#9B9BAF] leading-relaxed">{p.caseStudy}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Founder goals */}
      {goals?.some((g) => g.category === 'founder') && (
        <Panel title="Founder goals" subtitle="Active goals in the founder category">
          <div className="space-y-3">
            {goals.filter((g) => g.category === 'founder' && g.status === 'active').map((g) => (
              <div key={g._id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#C8C8D8]">{g.title}</span>
                  <span className="text-[#8B8B9F] mono">{g.progress}%</span>
                </div>
                <ProgressBar value={g.progress} color="#FF6B9D" />
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
