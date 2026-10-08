import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, Spinner, ErrorState, Modal, Field, inputCls, btnPrimary, btnGhost, DeleteButton, fmtMinutes, todayStr,
} from '../components/ui.jsx';
import { Plus, NotebookPen } from 'lucide-react';

const TYPES = ['work', 'learning', 'coding', 'exercise', 'reading', 'sleep', 'personal', 'other'];
const TYPE_COLORS = {
  work: '#00D4FF', learning: '#7C6AFF', coding: '#00FF88', exercise: '#FF6B9D',
  reading: '#FFB800', sleep: '#a78bfa', personal: '#4ADE80', other: '#6B6B80',
};

/** DAILY LOG — what I worked on, what I learned, how long, tied to goals/skills. */
export default function DailyLog() {
  const [date, setDate] = useState(todayStr());
  const { data: activities, loading, error, refetch } = useApi(() => osApi.activities.list(`?date=${date}`), [date]);
  const { data: goals } = useApi(() => osApi.goals.list());
  const { data: skills } = useApi(() => osApi.skills.list());
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = { title: '', type: 'work', durationMinutes: '', goalId: '', skillId: '', notes: '' };
  const [form, setForm] = useState(blank);

  const openCreate = () => {
    setForm({ ...blank });
    setEditing('new');
  };
  const openEdit = (a) => {
    setForm({
      title: a.title,
      type: a.type,
      durationMinutes: a.durationMinutes,
      goalId: a.goalId?._id || '',
      skillId: a.skillId?._id || '',
      notes: a.notes || '',
    });
    setEditing(a._id);
  };

  const save = async () => {
    if (!form.title.trim()) return alert('Activity title is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        date,
        durationMinutes: Number(form.durationMinutes) || 0,
        goalId: form.goalId || null,
        skillId: form.skillId || null,
      };
      if (editing === 'new') await osApi.activities.create(payload);
      else await osApi.activities.update(editing, payload);
      setEditing(null);
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    await osApi.activities.remove(a._id).catch((e) => alert(e.message));
    refetch();
  };

  const totalMin = (activities || []).reduce((s, a) => s + (a.durationMinutes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Daily Log</h1>
          <p className="text-xs text-[#6B6B80] mt-1">Track what you plan → track what you actually do. Everything feeds analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} w-40`} />
          <button onClick={openCreate} className={btnPrimary}><Plus size={14} /> Log activity</button>
        </div>
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <Panel
          title={new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          subtitle={`${activities.length} entr${activities.length === 1 ? 'y' : 'ies'} · ${fmtMinutes(totalMin)} total`}
        >
          {activities.length === 0 ? (
            <div className="text-center py-10">
              <NotebookPen size={30} className="mx-auto mb-3 text-[#4A4A5E]" />
              <p className="text-sm text-[#C8C8D8]">Nothing logged for this day</p>
              <p className="text-xs text-[#6B6B80] mt-1 max-w-sm mx-auto">
                Example: "MySQL indexing practice — 1h 30m — related goal: Backend Engineering — related skill: MySQL".
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[a.type] || '#6B6B80' }} />
                  <button onClick={() => openEdit(a)} className="flex-1 min-w-0 text-left">
                    <div className="text-sm text-[#E8E8F0] truncate">{a.title}</div>
                    <div className="text-[10px] text-[#6B6B80] mono">
                      {a.type}
                      {a.goalId ? ` · goal: ${a.goalId.title}` : ''}
                      {a.skillId ? ` · skill: ${a.skillId.name}` : ''}
                      {a.notes ? ` · ${a.notes}` : ''}
                    </div>
                  </button>
                  <span className="text-xs mono text-[#00D4FF] flex-shrink-0">{fmtMinutes(a.durationMinutes)}</span>
                  <DeleteButton onConfirm={() => remove(a)} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Log activity' : 'Edit activity'} onClose={() => setEditing(null)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="What did you work on? *" full>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="MySQL indexing practice" />
            </Field>
            <Field label="Type">
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t} className="bg-[#0a0e17]">{t}</option>)}
              </select>
            </Field>
            <Field label="Duration (minutes)">
              <input type="number" min="0" max="1440" className={inputCls} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} placeholder="90" />
            </Field>
            <Field label="Related goal">
              <select className={inputCls} value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })}>
                <option value="" className="bg-[#0a0e17]">— none —</option>
                {(goals || []).map((g) => <option key={g._id} value={g._id} className="bg-[#0a0e17]">{g.title}</option>)}
              </select>
            </Field>
            <Field label="Related skill">
              <select className={inputCls} value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value })}>
                <option value="" className="bg-[#0a0e17]">— none —</option>
                {(skills || []).map((s) => <option key={s._id} value={s._id} className="bg-[#0a0e17]">{s.name}</option>)}
              </select>
            </Field>
            <Field label="Notes" full>
              <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Practiced indexes and query optimization" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
            <button onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
            <button onClick={save} disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
