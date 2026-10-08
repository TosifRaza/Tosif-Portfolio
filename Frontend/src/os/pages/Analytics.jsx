import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import { Panel, Spinner, ErrorState, fmtMinutes, NotEnoughData } from '../components/ui.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#00D4FF', '#7C6AFF', '#00FF88', '#FF6B9D', '#FFB800', '#a78bfa', '#4ADE80', '#6B6B80'];
const TABS = ['daily', 'weekly', 'monthly', 'yearly'];

/** ANALYTICS — daily / weekly / monthly / yearly views + Plan vs Actual. Every number is computed from real records. */
export default function Analytics() {
  const [tab, setTab] = useState('weekly');
  const { data, loading, error, refetch } = useApi(() => {
    if (tab === 'daily') return osApi.analytics.daily();
    if (tab === 'weekly') return osApi.analytics.weekly();
    if (tab === 'monthly') return osApi.analytics.monthly();
    return osApi.analytics.yearly();
  }, [tab]);

  const { data: plan } = useApi(() => osApi.analytics.planVsActual());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Analytics</h1>
        <p className="text-xs text-[#6B6B80] mt-1">Every visualization answers a real question from your logged data. If there isn't enough data, we say so.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs capitalize transition-colors ${
              tab === t ? 'bg-[#00D4FF]/15 border border-[#00D4FF]/40 text-[#00D4FF]' : 'bg-white/[0.03] border border-white/[0.07] text-[#9B9BAF]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <>
          {/* Time distribution */}
          <Panel
            title={
              tab === 'daily' ? 'Time distribution — today'
                : tab === 'weekly' ? 'Time per day — this week'
                  : tab === 'monthly' ? 'Time per day — this month'
                    : 'Learning hours per month — this year'
            }
          >
            {tab === 'daily' ? (
              (data.timeByCategory || []).length === 0 ? <NotEnoughData what="daily time" /> : (
                <TimePie rows={data.timeByCategory} />
              )
            ) : tab === 'yearly' ? (
              (data.learningByMonth || []).every((m) => m.minutes === 0) ? <NotEnoughData what="yearly learning" /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(data.learningByMonth || []).map((m) => ({ month: String(m.month), hours: Math.round((m.minutes / 60) * 10) / 10 }))} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <XAxis dataKey="month" tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} tickLine={false} />
                      <YAxis tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tipStyle} formatter={(v) => [`${v}h`, 'learning']} />
                      <Bar dataKey="hours" fill="#7C6AFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            ) : (
              (data.timeByDay || []).every((d) => d.total === 0) ? <NotEnoughData what={`${tab} time`} /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(data.timeByDay || []).map((d) => ({ date: d.date.slice(5), minutes: Math.round(d.total) }))} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <XAxis dataKey="date" tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} tickLine={false} />
                      <YAxis tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tipStyle} formatter={(v) => [fmtMinutes(v), 'time']} />
                      <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                        {(data.timeByDay || []).map((d, i) => <Cell key={i} fill={d.total > 0 ? '#00D4FF' : '#1a1a2e'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            )}
          </Panel>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Learning trend */}
            <Panel title={tab === 'yearly' ? 'Learning by month' : 'Learning minutes per day'}>
              {(data.learningByDay || data.learningByMonth || []).length === 0 ||
                (data.learningByDay || []).every?.((d) => !d.minutes) === true ? (
                <NotEnoughData what="learning" />
              ) : (data.learningByDay || data.learningByMonth || []).every((d) => !d.minutes) ? (
                <NotEnoughData what="learning" />
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(data.learningByDay || data.learningByMonth || []).map((d) => ({
                        label: d.date ? d.date.slice(5) : d.month ? String(d.month) : '',
                        minutes: Math.round(d.minutes || 0),
                      }))}
                      margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                    >
                      <XAxis dataKey="label" tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} tickLine={false} />
                      <YAxis tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tipStyle} formatter={(v) => [fmtMinutes(v), 'learning']} />
                      <Bar dataKey="minutes" fill="#7C6AFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            {/* Goal movement */}
            <Panel title="Goal movement" subtitle="Progress delta over the selected window (from daily snapshots)">
              {(data.goalMovement || []).length === 0 ? (
                <NotEnoughData what="goal history" />
              ) : (
                <div className="space-y-3">
                  {data.goalMovement.map((g) => (
                    <div key={g.goalId}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#C8C8D8] truncate pr-2">{g.title}</span>
                        <span className={`mono ${g.delta > 0 ? 'text-[#00FF88]' : g.delta < 0 ? 'text-[#FF3366]' : 'text-[#6B6B80]'}`}>
                          {g.delta > 0 ? '+' : ''}{g.delta} pts ({g.start}% → {g.end}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#7C6AFF] to-[#00D4FF]" style={{ width: `${g.end}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* Plan vs Actual (weekly) */}
          <Panel
            title="Plan vs Actual"
            subtitle={
              plan?.rows?.some((r) => r.execution !== null)
                ? `Week ${plan.weekStart} → ${plan.weekEnd} — execution = actual / target`
                : 'Set weekly targets in Settings → Weekly Plan'
            }
          >
            {!plan?.rows?.length || plan.rows.every((r) => r.execution === null) ? (
              <NotEnoughData what="plan data" />
            ) : (
              <div className="space-y-3">
                {plan.rows.map((r) => (
                  <div key={r.category}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#C8C8D8] capitalize">{r.category}</span>
                      <span className="text-[#8B8B9F] mono">
                        {fmtMinutes(r.actualMinutes)} / {fmtMinutes(r.targetMinutes)}
                        {r.execution !== null && (
                          <span className={r.execution >= 80 ? 'text-[#00FF88] ml-2' : r.execution >= 40 ? 'text-[#FFB800] ml-2' : 'text-[#FF3366] ml-2'}>
                            {r.execution}%
                          </span>
                        )}
                      </span>
                    </div>
                    {r.execution !== null && (
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, r.execution)}%`,
                            background: r.execution >= 80 ? '#00FF88' : r.execution >= 40 ? '#FFB800' : '#FF3366',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

const tipStyle = { background: '#0a0e17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 };

function TimePie({ rows }) {
  const data = rows.filter((r) => r.minutes > 0).map((r) => ({ name: r.category, value: Math.round(r.minutes) }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tipStyle} formatter={(v) => [fmtMinutes(v), 'time']} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9B9BAF' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
