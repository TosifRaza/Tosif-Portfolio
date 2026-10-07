import { useEffect, useState } from 'react';
import { apiUrl, request } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#22d3ee', '#a78bfa', '#4ade80', '#f472b6', '#fbbf24', '#818cf8', '#34d399', '#9ca3af'];
const tipStyle = { background: '#0a0e17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 };

/** ANALYTICS — admin view of time, learning, goals and trajectory. */
export default function AnalyticsAdmin() {
  const { token } = useAuth();
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [trajectories, setTrajectories] = useState([]);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(apiUrl('/api/analytics/weekly'), { headers }).then((r) => r.json()),
      fetch(apiUrl('/api/analytics/monthly'), { headers }).then((r) => r.json()),
      fetch(apiUrl('/api/predictions/trajectory'), { headers }).then((r) => r.json()),
      fetch(apiUrl('/api/analytics/plan-vs-actual'), { headers }).then((r) => r.json()),
    ])
      .then(([w, m, t, p]) => {
        setWeekly(w); setMonthly(m); setTrajectories(Array.isArray(t) ? t : []); setPlan(p);
      })
      .catch(() => {});
  }, [token]);

  const timeByDay = (weekly?.timeByDay || []).map((d) => ({ date: d.date.slice(5), minutes: Math.round(d.total) }));
  const learningByDay = (monthly?.learningByDay || []).filter((d) => d.minutes > 0).map((d) => ({ date: d.date.slice(5), minutes: Math.round(d.minutes) }));
  const timeByCat = (weekly?.planVsActual?.rows || []).filter((r) => r.actualMinutes > 0).map((r) => ({ name: r.category, value: r.actualMinutes }));

  return (
    <div>
      <div className="mb-6">
        <div className="mono text-xs text-neon-cyan uppercase tracking-widest mb-1">// analytics</div>
        <h1 className="text-2xl font-extrabold">Analytics</h1>
        <p className="text-sm text-muted mt-1">Everything computed from real recorded data.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Time per day (this week)">
          {timeByDay.every((d) => d.minutes === 0) ? <Empty label="No time tracked this week yet." /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeByDay} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} formatter={(v) => [`${v} min`, 'time']} />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {timeByDay.map((d, i) => <Cell key={i} fill={d.minutes > 0 ? COLORS[0] : '#1a1a2e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Learning minutes per day (this month)">
          {learningByDay.length === 0 ? <Empty label="No learning sessions this month yet." /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={learningByDay} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} formatter={(v) => [`${v} min`, 'learning']} />
                <Bar dataKey="minutes" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Time by category (this week)">
          {timeByCat.length === 0 ? <Empty label="No data yet." /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={timeByCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="none">
                  {timeByCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Plan vs Actual (this week)">
          {(plan?.rows || []).length === 0 ? <Empty label="No plan configured." /> : (
            <div className="space-y-2.5">
              {plan.rows.map((r) => (
                <div key={r.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{r.category}</span>
                    <span className="mono text-muted">
                      {r.actualMinutes}m / {r.targetMinutes}m {r.execution !== null && <span className={r.execution >= 80 ? 'text-neon-green' : r.execution >= 40 ? 'text-neon-orange' : 'text-neon-red'}>{r.execution}%</span>}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan" style={{ width: `${Math.min(100, r.execution || 0)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Goal trajectories (estimates)" full>
          {trajectories.length === 0 ? <Empty label="No active goals yet." /> : (
            <div className="space-y-2">
              {trajectories.map((t) => (
                <div key={t.goalId} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-sm">{t.title}</span>
                  {t.status === 'estimated' && t.estimate ? (
                    <span className="mono text-xs text-neon-purple">ETA ~{t.estimate.completionAround} ({t.currentProgress}%)</span>
                  ) : (
                    <span className="mono text-xs text-muted">{t.status === 'complete' ? 'complete' : 'not enough data'}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, full = false }) {
  return (
    <div className={`glass rounded-2xl p-5 ${full ? 'lg:col-span-2' : ''}`}>
      <h3 className="mono text-[11px] uppercase tracking-widest text-muted mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ label }) {
  return <div className="text-center py-10 text-xs text-muted">{label}</div>;
}
