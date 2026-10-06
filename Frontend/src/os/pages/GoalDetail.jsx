import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, ProgressBar, Spinner, ErrorState, Badge, Modal, Field, inputCls, btnPrimary, btnGhost, DeleteButton, fmtMinutes,
} from '../components/ui.jsx';
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

/** Goal detail: milestones with nested tasks — completing a task rolls up progress automatically. */
export default function GoalDetail() {
  const { id } = useParams();
  const { data: goal, loading, error, refetch } = useApi(() => osApi.goals.get(id));
  const [msModal, setMsModal] = useState(false);
  const [taskFor, setTaskFor] = useState(null); // milestoneId | 'orphan'
  const [msForm, setMsForm] = useState({ title: '', description: '', dueDate: '' });
  const [taskForm, setTaskForm] = useState({ title: '', estimateMinutes: '', priority: 'medium', dueDate: '' });
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner label="Loading goal…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const addMilestone = async () => {
    if (!msForm.title.trim()) return;
    setBusy(true);
    try {
      await osApi.milestones.create({ goalId: id, title: msForm.title, description: msForm.description, dueDate: msForm.dueDate || null });
      setMsModal(false);
      setMsForm({ title: '', description: '', dueDate: '' });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addTask = async () => {
    if (!taskForm.title.trim()) return;
    setBusy(true);
    try {
      await osApi.tasks.create({
        goalId: id,
        milestoneId: taskFor === 'orphan' ? null : taskFor,
        title: taskForm.title,
        estimateMinutes: Number(taskForm.estimateMinutes) || 0,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
      });
      setTaskFor(null);
      setTaskForm({ title: '', estimateMinutes: '', priority: 'medium', dueDate: '' });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleTask = async (t) => {
    try {
      await osApi.tasks.toggle(t._id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTask = async (t) => {
    try {
      await osApi.tasks.remove(t._id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleMilestone = async (m) => {
    try {
      await osApi.milestones.update(m._id, { status: m.status === 'done' ? 'in-progress' : 'done' });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteMilestone = async (m) => {
    try {
      await osApi.milestones.remove(m._id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const TaskRow = ({ t }) => (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <button onClick={() => toggleTask(t)} className="flex-shrink-0" aria-label="Toggle task">
        {t.status === 'done' ? <CheckCircle2 size={15} className="text-[#00FF88]" /> : <Circle size={15} className="text-[#4A4A5E] hover:text-[#00D4FF]" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] truncate ${t.status === 'done' ? 'text-[#4A4A5E] line-through' : 'text-[#E8E8F0]'}`}>{t.title}</div>
        <div className="text-[9px] text-[#4A4A5E] mono">
          {t.priority}{t.estimateMinutes ? ` · ~${fmtMinutes(t.estimateMinutes)}` : ''}{t.dueDate ? ` · due ${new Date(t.dueDate).toLocaleDateString()}` : ''}
        </div>
      </div>
      <DeleteButton onConfirm={() => deleteTask(t)} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Link to="/os/goals" className="inline-flex items-center gap-1.5 text-[11px] text-[#6B6B80] hover:text-[#00D4FF] transition-colors mb-3">
          <ArrowLeft size={12} /> All goals
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{goal.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#8B8B9F]">
              <Badge>{goal.category?.toUpperCase()}</Badge>
              <Badge color="#FFB800">{goal.priority?.toUpperCase()}</Badge>
              <Badge color="#6B6B80">{goal.status?.toUpperCase()}</Badge>
              {goal.targetDate && <span>target {new Date(goal.targetDate).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="text-right min-w-[160px]">
            <div className="text-3xl font-bold text-[#00D4FF]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{goal.progress}%</div>
            <div className="text-[10px] text-[#6B6B80] mono">progress ({goal.progressMode})</div>
            {goal.progressMode === 'manual' && (
              <button
                onClick={async () => {
                  const v = prompt('Set progress (0-100):', String(goal.progress));
                  if (v === null) return;
                  await osApi.goals.update(id, { ...goal, progress: Number(v) });
                  refetch();
                }}
                className="text-[10px] text-[#00D4FF] hover:underline mt-1"
              >
                set manually
              </button>
            )}
          </div>
        </div>
        {goal.description && <p className="text-sm text-[#9B9BAF] mt-3 leading-relaxed">{goal.description}</p>}
        <div className="mt-4">
          <ProgressBar value={goal.progress} height={8} />
        </div>
      </div>

      {/* Milestones */}
      <Panel
        title="Milestones"
        subtitle="Each milestone's progress comes from its tasks; goal progress is the milestone average"
        right={<button onClick={() => setMsModal(true)} className={btnPrimary}><Plus size={13} /> Milestone</button>}
      >
        {goal.milestones.length === 0 && goal.tasksWithoutMilestone.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-[#6B6B80] mb-4">Break this goal into 2-5 concrete milestones, then add tasks under each.</p>
            <button onClick={() => setMsModal(true)} className={btnPrimary}>Add first milestone</button>
          </div>
        ) : (
          <div className="space-y-4">
            {goal.milestones.map((m) => (
              <div key={m._id} className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.015]">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => toggleMilestone(m)} aria-label="Toggle milestone">
                    {m.status === 'done' ? <CheckCircle2 size={16} className="text-[#00FF88]" /> : <Circle size={16} className="text-[#4A4A5E] hover:text-[#00D4FF]" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${m.status === 'done' ? 'text-[#6B6B80] line-through' : 'text-[#E8E8F0]'}`}>{m.title}</div>
                    {m.dueDate && <div className="text-[9px] text-[#4A4A5E] mono">due {new Date(m.dueDate).toLocaleDateString()}</div>}
                  </div>
                  <span className="text-xs mono text-[#00D4FF]">{m.progress}%</span>
                  <DeleteButton onConfirm={() => deleteMilestone(m)} />
                </div>
                <ProgressBar value={m.progress} color={m.progress === 100 ? '#00FF88' : '#00D4FF'} height={4} />
                <div className="mt-3 space-y-1.5">
                  {m.tasks.map((t) => <TaskRow key={t._id} t={t} />)}
                  <button onClick={() => setTaskFor(m._id)} className="text-[11px] text-[#6B6B80] hover:text-[#00D4FF] transition-colors px-2.5 py-1.5">
                    + add task
                  </button>
                </div>
              </div>
            ))}

            {goal.tasksWithoutMilestone.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.015]">
                <div className="text-xs mono text-[#8B8B9F] uppercase tracking-widest mb-2">Tasks without a milestone</div>
                <div className="space-y-1.5">
                  {goal.tasksWithoutMilestone.map((t) => <TaskRow key={t._id} t={t} />)}
                  <button onClick={() => setTaskFor('orphan')} className="text-[11px] text-[#6B6B80] hover:text-[#00D4FF] px-2.5 py-1.5">
                    + add task
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>

      {msModal && (
        <Modal title="New milestone" onClose={() => setMsModal(false)}>
          <div className="space-y-4">
            <Field label="Title *" full>
              <input className={inputCls} value={msForm.title} onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} placeholder="Advanced Node.js" />
            </Field>
            <Field label="Description" full>
              <textarea className={`${inputCls} resize-none`} rows={2} value={msForm.description} onChange={(e) => setMsForm({ ...msForm, description: e.target.value })} />
            </Field>
            <Field label="Due date">
              <input type="date" className={inputCls} value={msForm.dueDate} onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
            <button onClick={() => setMsModal(false)} className={btnGhost}>Cancel</button>
            <button onClick={addMilestone} disabled={busy} className={btnPrimary}>Add</button>
          </div>
        </Modal>
      )}

      {taskFor && (
        <Modal title="New task" onClose={() => setTaskFor(null)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *" full>
              <input
                className={inputCls}
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Complete a 2-hour lesson on streams"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
            </Field>
            <Field label="Estimate (minutes)">
              <input type="number" min="0" className={inputCls} value={taskForm.estimateMinutes} onChange={(e) => setTaskForm({ ...taskForm, estimateMinutes: e.target.value })} />
            </Field>
            <Field label="Priority">
              <select className={inputCls} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0a0e17]">{p}</option>)}
              </select>
            </Field>
            <Field label="Due date" full>
              <input type="date" className={inputCls} value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
            <button onClick={() => setTaskFor(null)} className={btnGhost}>Cancel</button>
            <button onClick={addTask} disabled={busy} className={btnPrimary}>Add task</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
