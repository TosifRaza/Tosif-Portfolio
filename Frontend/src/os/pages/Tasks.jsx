import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import { Panel, Spinner, ErrorState, Badge, fmtMinutes, DeleteButton } from '../components/ui.jsx';
import { CheckCircle2, Circle, ListChecks, Play, Square, FileText } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal.jsx';

const PRIORITY_COLORS = { low: 'hsl(var(--muted-foreground))', medium: 'hsl(var(--primary))', high: '#F59E0B', critical: '#EF4444' };
const FILTERS = ['all', 'todo', 'in-progress', 'done'];

/** All tasks across goals — with filters, time tracking, and Knowledge Vault. */
export default function Tasks() {
  const [filter, setFilter] = useState('all');
  const [timerBusy, setTimerBusy] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { data: tasks, loading, error, refetch } = useApi(() => osApi.tasks.list(), [filter]);
  const { data: runningTimer, refetch: refetchTimer } = useApi(() => osApi.time.running());

  const filtered = (tasks || []).filter((t) => filter === 'all' || t.status === filter);

  const toggle = async (t) => {
    await osApi.tasks.toggle(t._id).catch((e) => alert(e.message));
    refetch();
  };

  const remove = async (t) => {
    await osApi.tasks.remove(t._id).catch((e) => alert(e.message));
    refetch();
  };

  const startTaskTimer = async (t) => {
    setTimerBusy(true);
    try {
      const gId = t.goalId?._id || t.goalId || null;
      await osApi.time.start({
        category: 'work',
        taskId: t._id,
        notes: t.title,
        goalId: gId,
      });
      await refetchTimer();
    } catch (err) {
      alert(err.message);
    } finally {
      setTimerBusy(false);
    }
  };

  const stopTaskTimer = async (timerId) => {
    setTimerBusy(true);
    try {
      await osApi.time.stop(timerId);
      await refetchTimer();
    } catch (err) {
      alert(err.message);
    } finally {
      setTimerBusy(false);
    }
  };

  const isTimerForTask = (t) => {
    if (!runningTimer) return false;
    const runTaskId = runningTimer.taskId?._id || runningTimer.taskId;
    return (runTaskId && String(runTaskId) === String(t._id)) || runningTimer.notes === t.title;
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>All Tasks</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Click any task to open its Knowledge & Resource Vault (notes, links, images, contacts, and checklists).
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              filter === f ? 'bg-primary/15 border border-primary/40 text-primary font-semibold' : 'bg-muted/40 border border-border text-muted-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <Panel>
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <ListChecks size={30} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-foreground font-semibold">No tasks here</p>
              <p className="text-xs text-muted-foreground mt-1">Tasks are created inside goals — open a goal to add milestones and tasks.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((t) => {
                const isRunning = isTimerForTask(t);
                const isDone = t.status === 'done';
                const hasExtras = !!(t.notes || t.resources?.length || t.contacts?.length || t.attachments?.length || t.checklist?.length);

                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTask(t)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isRunning
                        ? 'bg-red-500/5 border-red-500/30 ring-1 ring-red-500/20'
                        : isDone
                        ? 'bg-muted/20 border-border/50 opacity-70'
                        : 'bg-muted/30 border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(t);
                      }}
                      aria-label="Toggle task"
                      className="p-0.5 rounded hover:scale-110 transition-transform"
                    >
                      {isDone ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-muted-foreground group-hover:text-primary" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${isDone ? 'text-muted-foreground line-through' : 'text-foreground font-semibold group-hover:text-primary transition-colors'}`}>
                        {t.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground mono">
                        <span>{t.goalId ? `${t.goalId.title}` : 'no goal'}</span>
                        {t.milestoneId ? <span>→ {t.milestoneId.title}</span> : null}
                        {t.estimateMinutes ? <span>· ~{fmtMinutes(t.estimateMinutes)}</span> : null}
                        {t.dueDate ? <span>· due {new Date(t.dueDate).toLocaleDateString()}</span> : null}
                        {hasExtras && (
                          <span className="text-primary font-semibold flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.2 rounded">
                            Vault & Notes
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge color={PRIORITY_COLORS[t.priority]}>{t.priority.toUpperCase()}</Badge>

                    {/* Track Time Button */}
                    {!isDone && (
                      isRunning ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            stopTaskTimer(runningTimer._id);
                          }}
                          disabled={timerBusy}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/40 text-red-500 text-[11px] font-semibold hover:bg-red-500/25 transition-colors animate-pulse"
                          title="Timer is running. Click to stop."
                        >
                          <Square size={10} /> Stop
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startTaskTimer(t);
                          }}
                          disabled={timerBusy || (runningTimer && !isRunning)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border text-muted-foreground text-[11px] font-medium transition-colors disabled:opacity-40"
                          title={runningTimer ? 'Another timer is already running' : 'Track time on this task'}
                        >
                          <Play size={10} /> Track
                        </button>
                      )
                    )}

                    <div onClick={(e) => e.stopPropagation()}>
                      <DeleteButton onConfirm={() => remove(t)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
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
