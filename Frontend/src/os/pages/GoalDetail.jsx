import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, ProgressBar, Spinner, ErrorState, Badge, Modal, Field, inputCls, btnPrimary, btnGhost, DeleteButton, fmtMinutes,
} from '../components/ui.jsx';
import { ArrowLeft, Plus, CheckCircle2, Circle, FileText, Link as LinkIcon, Users, ImageIcon } from 'lucide-react';
import KnowledgeVault from '../components/KnowledgeVault.jsx';
import TaskDetailModal from '../components/TaskDetailModal.jsx';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

/** Goal detail: milestones with nested tasks and Knowledge & Resource Vault. */
export default function GoalDetail() {
  const { id } = useParams();
  const { data: goal, loading, error, refetch } = useApi(() => osApi.goals.get(id));
  const [msModal, setMsModal] = useState(false);
  const [taskFor, setTaskFor] = useState(null); // milestoneId | 'orphan'
  const [selectedTask, setSelectedTask] = useState(null);
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

  const TaskRow = ({ t }) => {
    const hasExtras = !!(t.notes || t.resources?.length || t.contacts?.length || t.attachments?.length || t.checklist?.length);

    return (
      <div
        onClick={() => setSelectedTask(t)}
        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 cursor-pointer transition-all group"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(t);
          }}
          className="flex-shrink-0"
          aria-label="Toggle task"
        >
          {t.status === 'done' ? (
            <CheckCircle2 size={15} className="text-emerald-500" />
          ) : (
            <Circle size={15} className="text-muted-foreground group-hover:text-primary" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] truncate font-medium ${t.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {t.title}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-muted-foreground mono mt-0.5">
            <span>{t.priority}</span>
            {t.estimateMinutes ? <span>· ~{fmtMinutes(t.estimateMinutes)}</span> : null}
            {t.dueDate ? <span>· due {new Date(t.dueDate).toLocaleDateString()}</span> : null}
            {hasExtras && (
              <span className="text-primary font-semibold flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.2 rounded">
                Notes & Vault
              </span>
            )}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteButton onConfirm={() => deleteTask(t)} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb & Summary */}
      <div>
        <Link to="/os/goals" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mb-3">
          <ArrowLeft size={12} /> All goals
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: 'Inter, system-ui' }}>
              {goal.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
              <Badge>{goal.category?.toUpperCase()}</Badge>
              <Badge color="#F59E0B">{goal.priority?.toUpperCase()}</Badge>
              <Badge color="hsl(var(--muted-foreground))">{goal.status?.toUpperCase()}</Badge>
              {goal.targetDate && <span>target {new Date(goal.targetDate).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="text-right min-w-[160px]">
            <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'Inter, system-ui' }}>{goal.progress}%</div>
            <div className="text-[10px] text-muted-foreground mono">progress ({goal.progressMode})</div>
            {goal.progressMode === 'manual' && (
              <button
                onClick={async () => {
                  const v = prompt('Set progress (0-100):', String(goal.progress));
                  if (v === null) return;
                  await osApi.goals.update(id, { ...goal, progress: Number(v) });
                  refetch();
                }}
                className="text-[10px] text-primary hover:underline mt-1"
              >
                set manually
              </button>
            )}
          </div>
        </div>
        {goal.description && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{goal.description}</p>}
        <div className="mt-4">
          <ProgressBar value={goal.progress} height={8} />
        </div>
      </div>

      {/* Goal Knowledge & Resource Vault */}
      <KnowledgeVault
        data={goal}
        onSave={async (patch) => {
          await osApi.goals.update(id, { ...goal, ...patch });
          await refetch();
        }}
        title="Goal Knowledge & Resource Vault"
      />

      {/* Milestones & Tasks Section */}
      <Panel
        title="Milestones & Action Tasks"
        subtitle="Each milestone's progress comes from its tasks; goal progress is the milestone average"
        right={
          <button onClick={() => setMsModal(true)} className={btnPrimary}>
            <Plus size={13} /> Milestone
          </button>
        }
      >
        {goal.milestones.length === 0 && goal.tasksWithoutMilestone.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground mb-4">Break this goal into 2-5 concrete milestones, then add tasks under each.</p>
            <button onClick={() => setMsModal(true)} className={btnPrimary}>Add first milestone</button>
          </div>
        ) : (
          <div className="space-y-4">
            {goal.milestones.map((m) => (
              <div key={m._id} className="rounded-xl border border-border p-4 bg-muted/20">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => toggleMilestone(m)} aria-label="Toggle milestone">
                    {m.status === 'done' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-muted-foreground hover:text-primary" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${m.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {m.title}
                    </div>
                    {m.dueDate && <div className="text-[10px] text-muted-foreground mono">due {new Date(m.dueDate).toLocaleDateString()}</div>}
                  </div>
                  <span className="text-xs mono font-bold text-primary">{m.progress}%</span>
                  <DeleteButton onConfirm={() => deleteMilestone(m)} />
                </div>
                <ProgressBar value={m.progress} color={m.progress === 100 ? '#10B981' : 'hsl(var(--primary))'} height={5} />
                <div className="mt-3 space-y-1.5">
                  {m.tasks.map((t) => <TaskRow key={t._id} t={t} />)}
                  <button
                    onClick={() => setTaskFor(m._id)}
                    className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/50"
                  >
                    + Add task to {m.title}
                  </button>
                </div>
              </div>
            ))}

            {goal.tasksWithoutMilestone.length > 0 && (
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <div className="text-xs mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
                  Tasks without a milestone
                </div>
                <div className="space-y-1.5">
                  {goal.tasksWithoutMilestone.map((t) => <TaskRow key={t._id} t={t} />)}
                  <button
                    onClick={() => setTaskFor('orphan')}
                    className="text-xs font-semibold text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-muted/50"
                  >
                    + Add standalone task
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* Create Milestone Modal */}
      {msModal && (
        <Modal title="New milestone" onClose={() => setMsModal(false)}>
          <div className="space-y-4">
            <Field label="Title *" full>
              <input className={inputCls} value={msForm.title} onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} placeholder="e.g. Phase 1: MVP Architecture" />
            </Field>
            <Field label="Description" full>
              <textarea className={`${inputCls} resize-none`} rows={2} value={msForm.description} onChange={(e) => setMsForm({ ...msForm, description: e.target.value })} />
            </Field>
            <Field label="Due date">
              <input type="date" className={inputCls} value={msForm.dueDate} onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setMsModal(false)} className={btnGhost}>Cancel</button>
            <button onClick={addMilestone} disabled={busy} className={btnPrimary}>Add</button>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      {taskFor && (
        <Modal title="New task" onClose={() => setTaskFor(null)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *" full>
              <input
                className={inputCls}
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Setup database schemas and indexes"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
            </Field>
            <Field label="Estimate (minutes)">
              <input type="number" min="0" className={inputCls} value={taskForm.estimateMinutes} onChange={(e) => setTaskForm({ ...taskForm, estimateMinutes: e.target.value })} />
            </Field>
            <Field label="Priority">
              <select className={inputCls} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="bg-card">{p}</option>)}
              </select>
            </Field>
            <Field label="Due date" full>
              <input type="date" className={inputCls} value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setTaskFor(null)} className={btnGhost}>Cancel</button>
            <button onClick={addTask} disabled={busy} className={btnPrimary}>Add task</button>
          </div>
        </Modal>
      )}

      {/* Task Detail & Knowledge Vault Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => refetch()}
        />
      )}
    </div>
  );
}
