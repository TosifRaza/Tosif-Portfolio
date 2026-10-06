import { useCallback, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, StatCard, Spinner, ErrorState, Modal, Field, inputCls, btnPrimary, btnGhost, DeleteButton, fmtMinutes, todayStr,
} from '../components/ui.jsx';
import { Play, Square, Plus, Clock3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORIES = ['work', 'learning', 'coding', 'exercise', 'reading', 'sleep', 'personal', 'other'];
const COLORS = ['#00D4FF', '#7C6AFF', '#00FF88', '#FF6B9D', '#FFB800', '#a78bfa', '#4ADE80', '#6B6B80'];

/** TIME — start/stop timer + manual entries + daily/weekly totals + category breakdown. */
export default function TimePage() {
  const [date, setDate] = useState(todayStr());
  const { data: entries, loading, error, refetch } = useApi(() => osApi.time.list(`?date=${date}`), [date]);
  const { data: summary, refetch: refetchSummary } = useApi(() => osApi.time.summary('?from=' + weekStartStr()));
  const { data: running, refetch: refetchRunning } = useApi(() => osApi.time.running());
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const blank = { category: 'work', minutes: '', notes: '', goalId: '' };
  const [form, setForm] = useState(blank);

  const refreshAll = useCallback(async () => {
    await Promise.all([refetch(), refetchSummary(), refetchRunning()]);
  }, [refetch, refetchSummary, refetchRunning]);

  const start = async () => {
    setBusy(true);
    try {
      await osApi.time.start({ category: form.category || 'work' });
      await refreshAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await osApi.time.stop(running._id);
      await refreshAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = { date, category: form.category, minutes: Number(form.minutes) || 0, notes: form.notes };
      if (editing === 'new') await osApi.time.create(payload);
      else await osApi.time.update(editing, payload);
      setEditing(null);
      setForm(blank);
      await refreshAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (e) => {
    await osApi.time.remove(e._id).catch((err) => alert(err.message));
    refreshAll();
  };

  const chartData = (summary?.byCategory || []).map((c, i) => ({
    name: c.category,
    minutes: c.minutes,
    fill: COLORS[CATEGORIES.indexOf(c.category) % COLORS.length] || '#00D4FF',
  }));

  const dayTotal = (entries || []).reduce((s, e) => s + (e.minutes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mono text-[10px] text-[#00D4FF] tracking-[0.3em]">// TIME_TRACKING</div>
          <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Time</h1>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} w-40`} />
          {running ? (
            <button onClick={stop} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/40 text-[#FF3366] text-xs font-semibold">
              <Square size={13} /> Stop ({running.category})
            </button>
          ) : (
            <button onClick={start} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/40 text-[#00FF88] text-xs font-semibold">
              <Play size={13} /> Start timer
            </button>
          )}
          <button onClick={() => { setForm(blank); setEditing('new'); }} className={btnPrimary}><Plus size={14} /> Manual entry</button>
        </div>
      </div>

      {/* This week summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Today total" value={fmtMinutes(dayTotal)} icon={Clock3} />
        <StatCard label="This week total" value={fmtMinutes(summary?.totalMinutes || 0)} icon={Clock3} color="#7C6AFF" />
        <StatCard label="Categories used" value={chartData.length} icon={Clock3} color="#00FF88" sub="this week" />
        <StatCard label="Top category" value={chartData[0]?.name ? chartData[0].name : '—'} icon={Clock3} color="#FFB800" sub={chartData[0] ? fmtMinutes(chartData[0].minutes) : ''} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category chart */}
        <Panel title="This week by category" subtitle="Only real tracked minutes — never estimated">
          {chartData.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#6B6B80]">No time tracked this week yet. Start the timer or add a manual entry.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={{ stroke: '#1a1a2e' }} tickLine={false} />
                  <YAxis tick={{ fill: '#6B6B80', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ background: '#0a0e17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [fmtMinutes(v), 'time']}
                  />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* Entries for the day */}
        <Panel title={`Entries — ${date}`} subtitle={`${entries?.length || 0} entr${entries?.length === 1 ? 'y' : 'ies'} · ${fmtMinutes(dayTotal)}`}>
          {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : (entries || []).length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6B6B80]">Nothing tracked on this day.</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {entries.map((e) => (
                <div key={e._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <button onClick={() => { setForm({ category: e.category, minutes: e.minutes, notes: e.notes || '' }); setEditing(e._id); }} className="flex-1 text-left min-w-0">
                    <div className="text-sm text-[#E8E8F0] capitalize">{e.category} <span className="text-[10px] text-[#4A4A5E] mono">({e.source})</span></div>
                    <div className="text-[10px] text-[#6B6B80] mono truncate">
                      {e.startedAt && e.endedAt ? `${new Date(e.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${new Date(e.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                      {e.notes ? ` ${e.notes}` : ''}
                    </div>
                  </button>
                  <span className="text-xs mono text-[#00D4FF]">{fmtMinutes(e.minutes)}</span>
                  <DeleteButton onConfirm={() => remove(e)} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Manual time entry' : 'Edit time entry'} onClose={() => setEditing(null)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a0e17]">{c}</option>)}
              </select>
            </Field>
            <Field label="Minutes">
              <input type="number" min="0" max="1440" className={inputCls} value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} placeholder="90" />
            </Field>
            <Field label="Notes" full>
              <input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
            <button onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
            <button onClick={save} disabled={busy} className={btnPrimary}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function weekStartStr() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
