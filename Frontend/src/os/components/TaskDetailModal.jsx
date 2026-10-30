import { useState } from 'react';
import { osApi } from '../osApi.js';
import {
  Modal, Badge, fmtMinutes,
} from './ui.jsx';
import KnowledgeVault from './KnowledgeVault.jsx';
import {
  CheckCircle2, Circle, Calendar, Clock, AlertCircle, Trash2, X, Save,
} from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['todo', 'in-progress', 'done'];

export default function TaskDetailModal({ task, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: task.title || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    estimateMinutes: task.estimateMinutes || 0,
    dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const [currentTask, setCurrentTask] = useState(task);

  const handleSaveMeta = async () => {
    setSaving(true);
    try {
      const payload = {
        ...currentTask,
        title: form.title,
        status: form.status,
        priority: form.priority,
        estimateMinutes: Number(form.estimateMinutes) || 0,
        dueDate: form.dueDate || null,
      };
      const updated = await osApi.tasks.update(currentTask._id, payload);
      setCurrentTask(updated);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVault = async (patch) => {
    const payload = {
      ...currentTask,
      ...patch,
      estimateMinutes: Number(form.estimateMinutes) || 0,
      dueDate: form.dueDate || null,
    };
    const updated = await osApi.tasks.update(currentTask._id, payload);
    setCurrentTask(updated);
    if (onUpdated) onUpdated(updated);
  };

  const handleToggle = async () => {
    try {
      const updated = await osApi.tasks.toggle(currentTask._id);
      setCurrentTask(updated);
      setForm((prev) => ({ ...prev, status: updated.status }));
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      alert(err.message || 'Toggle failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await osApi.tasks.remove(currentTask._id);
      if (onUpdated) onUpdated(null, currentTask._id);
      onClose();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const isDone = currentTask.status === 'done';
  const goalTitle = typeof currentTask.goalId === 'object' ? currentTask.goalId?.title : currentTask.goal;
  const milestoneTitle = typeof currentTask.milestoneId === 'object' ? currentTask.milestoneId?.title : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-border shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={handleToggle}
              className="mt-1 p-0.5 rounded text-muted-foreground hover:scale-110 transition-transform flex-shrink-0"
              title={isDone ? 'Mark as todo' : 'Mark as done'}
            >
              {isDone ? (
                <CheckCircle2 size={22} className="text-emerald-500" />
              ) : (
                <Circle size={22} className="text-muted-foreground hover:text-emerald-500" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full text-lg sm:text-xl font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-hidden px-1 py-0.5 transition-colors"
                placeholder="Task title..."
              />
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground mono px-1">
                {goalTitle && (
                  <span className="font-medium text-foreground/80">Goal: {goalTitle}</span>
                )}
                {milestoneTitle && (
                  <>
                    <span>·</span>
                    <span>Milestone: {milestoneTitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Meta Controls (Quick Edit) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
          <div>
            <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full text-xs rounded-lg bg-background border border-border px-2.5 py-1.5 text-foreground focus:border-primary focus:outline-hidden"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-card">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full text-xs rounded-lg bg-background border border-border px-2.5 py-1.5 text-foreground focus:border-primary focus:outline-hidden"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="bg-card">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Estimate (Mins)</label>
            <input
              type="number"
              min="0"
              value={form.estimateMinutes}
              onChange={(e) => setForm({ ...form, estimateMinutes: e.target.value })}
              className="w-full text-xs rounded-lg bg-background border border-border px-2.5 py-1.5 text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full text-xs rounded-lg bg-background border border-border px-2.5 py-1.5 text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        {/* Save meta row if changed */}
        <div className="flex justify-end gap-2 -mt-2">
          <button
            onClick={handleSaveMeta}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <Save size={12} /> Save Details
          </button>
        </div>

        {/* Embedded Knowledge & Resource Vault */}
        <KnowledgeVault
          data={currentTask}
          onSave={handleSaveVault}
          title="Task Knowledge & Resources"
        />

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-400 font-medium px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} /> Delete Task
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

