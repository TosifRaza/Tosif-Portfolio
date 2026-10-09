import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, StatCard, Spinner, ErrorState, Modal, Field, inputCls, btnPrimary, btnGhost, DeleteButton, fmtMinutes, todayStr, Badge,
} from '../components/ui.jsx';
import { Plus, GraduationCap, Flame, Clock3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/** LEARNING OS — sessions, topics per skill, streak and totals. All dynamic. */
export default function Learning() {
  const [range, setRange] = useState('30');
  const { data: stats, loading, error, refetch } = useApi(() => osApi.learning.stats(`?from=${daysAgoStr(Number(range))}`), [range]);
  const { data: sessions, refetch: refetchSessions } = useApi(() => osApi.learning.list(`?from=${daysAgoStr(Number(range))}`));
  const { data: skills } = useApi(() => osApi.skills.list());
  const { data: goals } = useApi(() => osApi.goals.list());
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const blank = { skillId: '', topicId: '', goalId: '', durationMinutes: '', notes: '', difficulty: 'medium', confidence: 3, resource: '' };
  const [form, setForm] = useState(blank);

  const save = async () => {
    if (!form.skillId) return alert('Pick a skill');
    if (!Number(form.durationMinutes)) return alert('Duration is required');
    setBusy(true);
    try {
      const payload = {
        ...form,
        skillId: form.skillId || null,
        topicId: form.topicId || null,
        goalId: form.goalId || null,
        date: todayStr(),
        durationMinutes: Number(form.durationMinutes),
        confidence: Number(form.confidence),
      };
      if (editing === 'new') await osApi.learning.create(payload);
      else await osApi.learning.update(editing, payload);
      setEditing(null);
      setForm(blank);
      await Promise.all([refetch(), refetchSessions()]);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s) => {
    await osApi.learning.remove(s._id).catch((e) => alert(e.message));
    Promise.all([refetch(), refetchSessions()]);
  };

  const chart = (stats?.byDay || [])
    .filter((d) => d.minutes > 0)
    .map((d) => ({ date: d.date.slice(5), minutes: Math.round(d.minutes * 10) / 10 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>Learning</h1>
        </div>
        <div className="flex items-center gap-2">
          <select className={`${inputCls} w-32`} value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7" className="bg-card">7 days</option>
            <option value="30" className="bg-card">30 days</option>
            <option value="90" className="bg-card">90 days</option>
          </select>
          <button onClick={() => { setForm(blank); setEditing('new'); }} className={btnPrimary}><Plus size={14} /> Log session</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label={`Learning in ${range}d`} value={fmtMinutes(stats?.totalMinutes || 0)} icon={GraduationCap} color="hsl(var(--primary))" />
        <StatCard label="Current streak" value={`${stats?.streakDays || 0} days`} icon={Flame} color="#F59E0B" />
        <StatCard label="Sessions" value={stats?.byDay?.reduce((s, d) => s + d.sessions, 0) || 0} icon={Clock3} color="hsl(var(--primary))" />
        <StatCard label="Avg confidence" value={avgConfidence(sessions)} icon={GraduationCap} color="#10B981" sub="1-5 self-rating" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Learning minutes per day" subtitle="Computed from real sessions">
          {chart.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">Not enough data yet — log your first session.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--card))' }} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [fmtMinutes(v), 'learning']}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#lg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="By skill" subtitle="Where your learning time actually goes">
          {(stats?.bySkill || []).length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">No skill-linked sessions yet.</div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {stats.bySkill.map((s) => {
                const max = stats.bySkill[0].minutes || 1;
                return (
                  <div key={s.skillId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{s.skillName || 'General'}</span>
                      <span className="text-muted-foreground mono">{fmtMinutes(s.minutes)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(s.minutes / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <Panel title={`Sessions — last ${range} days`}>
        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : (sessions || []).length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">No sessions in this range.</div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">
                    {s.skillId?.name || 'General'}
                    {s.topicId ? ` — ${s.topicId.title}` : ''}
                  </div>
                  <div className="text-[10px] text-muted-foreground mono">
                    {s.date} · difficulty {s.difficulty} · confidence {s.confidence}/5
                    {s.goalId ? ` · goal: ${s.goalId.title}` : ''}
                    {s.notes ? ` · ${s.notes}` : ''}
                  </div>
                </div>
                <Badge color={s.difficulty === 'hard' ? '#EF4444' : s.difficulty === 'easy' ? '#10B981' : '#F59E0B'}>{s.difficulty.toUpperCase()}</Badge>
                <span className="text-xs mono text-primary flex-shrink-0">{fmtMinutes(s.durationMinutes)}</span>
                <DeleteButton onConfirm={() => remove(s)} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      {editing && (
        <Modal title="Log learning session" onClose={() => setEditing(null)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Skill *">
              <select className={inputCls} value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value })}>
                <option value="" className="bg-card">— pick a skill —</option>
                {(skills || []).map((s) => <option key={s._id} value={s._id} className="bg-card">{s.name}</option>)}
              </select>
            </Field>
            <Field label="Duration (minutes) *">
              <input type="number" min="1" max="1440" className={inputCls} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} placeholder="95" />
            </Field>
            <Field label="Related goal">
              <select className={inputCls} value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })}>
                <option value="" className="bg-card">— none —</option>
                {(goals || []).filter((g) => g.status === 'active').map((g) => <option key={g._id} value={g._id} className="bg-card">{g.title}</option>)}
              </select>
            </Field>
            <Field label="Resource (course/book/URL)">
              <input className={inputCls} value={form.resource} onChange={(e) => setForm({ ...form, resource: e.target.value })} />
            </Field>
            <Field label="Difficulty">
              <select className={inputCls} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {['easy', 'medium', 'hard'].map((d) => <option key={d} value={d} className="bg-card">{d}</option>)}
              </select>
            </Field>
            <Field label="Confidence after (1-5)">
              <input type="number" min="1" max="5" className={inputCls} value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })} />
            </Field>
            <Field label="Notes" full>
              <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
            <button onClick={save} disabled={busy} className={btnPrimary}>Save session</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function daysAgoStr(n) {
  const d = new Date(Date.now() - n * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function avgConfidence(sessions) {
  if (!sessions || sessions.length === 0) return '—';
  const vals = sessions.filter((s) => s.confidence).map((s) => s.confidence);
  if (!vals.length) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}
