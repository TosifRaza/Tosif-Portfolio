import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, ProgressBar, EmptyState, Spinner, ErrorState, Badge, Modal, Field, inputCls, btnPrimary, btnGhost, DeleteButton,
} from '../components/ui.jsx';
import { Plus, Target, Archive } from 'lucide-react';

const CATEGORIES = ['career', 'founder', 'learning', 'financial', 'health', 'personal'];
const CAT_COLORS = {
  career: '#00D4FF', founder: '#FF6B9D', learning: '#7C6AFF',
  financial: '#00FF88', health: '#FFB800', personal: '#a78bfa',
};
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function Goals() {
  const { data: goals, loading, error, refetch } = useApi(() => osApi.goals.list());
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'career', priority: 'medium', targetDate: '', progressMode: 'auto' });
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const save = async () => {
    if (!form.title.trim()) return alert('Goal title is required');
    setSaving(true);
    try {
      await osApi.goals.create({
        ...form,
        targetDate: form.targetDate || null,
      });
      setCreating(false);
      setForm({ title: '', description: '', category: 'career', priority: 'medium', targetDate: '', progressMode: 'auto' });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const archive = async (g) => {
    try {
      await osApi.goals.update(g._id, { ...g, status: 'archived' });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner label="Loading goals…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const active = (goals || []).filter((g) => g.status === 'active' || g.status === 'paused');
  const archived = (goals || []).filter((g) => g.status === 'archived');
  const shown = showArchived ? [...active, ...archived] : active;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Goals & Current Mission</h1>
          <p className="text-xs text-[#6B6B80] mt-1">Goal → Milestone → Task. Progress is computed from real completions, never faked.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowArchived((v) => !v)} className={btnGhost}>
            <Archive size={13} /> {showArchived ? 'Hide archived' : `Archived (${archived.length})`}
          </button>
          <button onClick={() => setCreating(true)} className={btnPrimary}>
            <Plus size={14} /> New goal
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Target}
            title={showArchived ? 'No goals at all yet' : 'No active goals'}
            hint="Create a long-term goal — e.g. “Become a stronger Backend Engineer” — then break it into milestones and tasks."
            action={<button onClick={() => setCreating(true)} className={btnPrimary}>Create your first goal</button>}
          />
        </Panel>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {shown.map((g) => (
            <div key={g._id} className={`glass rounded-xl p-5 transition-colors ${g.status === 'archived' ? 'opacity-50' : 'hover:border-white/[0.15]'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <Link to={`/os/goals/${g._id}`} className="text-base font-semibold text-[#E8E8F0] hover:text-[#00D4FF] transition-colors leading-snug">
                  {g.title}
                </Link>
                <Badge color={CAT_COLORS[g.category] || '#00D4FF'}>{g.category.toUpperCase()}</Badge>
              </div>
              {g.description && <p className="text-xs text-[#8B8B9F] line-clamp-2 mb-3">{g.description}</p>}
              <ProgressBar value={g.progress} color={CAT_COLORS[g.category] || '#00D4FF'} />
              <div className="flex items-center justify-between mt-2 text-[10px] text-[#6B6B80] mono">
                <span>{g.progress}% · {g.priority} priority{g.progressMode === 'manual' ? ' · manual' : ''}</span>
                <span>{g.targetDate ? `by ${new Date(g.targetDate).toLocaleDateString()}` : 'no deadline'}</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                <Link to={`/os/goals/${g._id}`} className="text-[11px] text-[#00D4FF] hover:underline">
                  Milestones & tasks →
                </Link>
                {g.status !== 'archived' && <DeleteButton onConfirm={() => archive(g)} label="Archive" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <Modal title="New goal" onClose={() => setCreating(false)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *" full>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Become a stronger Backend Engineer" />
            </Field>
            <Field label="Description" full>
              <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a0e17]">{c}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0a0e17]">{p}</option>)}
              </select>
            </Field>
            <Field label="Target date">
              <input type="date" className={inputCls} value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </Field>
            <Field label="Progress mode">
              <select className={inputCls} value={form.progressMode} onChange={(e) => setForm({ ...form, progressMode: e.target.value })}>
                <option value="auto" className="bg-[#0a0e17]">auto (from milestones)</option>
                <option value="manual" className="bg-[#0a0e17]">manual</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
            <button onClick={() => setCreating(false)} className={btnGhost}>Cancel</button>
            <button onClick={save} disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Create goal'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
