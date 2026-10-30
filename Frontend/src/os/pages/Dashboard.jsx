import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, StatCard, ProgressBar, EmptyState, Spinner, ErrorState, Badge, fmtMinutes, btnPrimary,
} from '../components/ui.jsx';
import {
  Clock3, GraduationCap, ListChecks, Target, Flame, AlertTriangle, CheckCircle2, Circle, Play, Square, Timer,
  NotebookPen, Sparkles, TrendingUp, RefreshCw,
} from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import TaskDetailModal from '../components/TaskDetailModal.jsx';

const HEALTH_COLORS = { 'on-track': '#10B981', behind: '#EF4444', complete: 'hsl(var(--primary))' };
const PRIORITY_COLORS = { low: 'hsl(var(--muted-foreground))', medium: 'hsl(var(--primary))', high: '#F59E0B', critical: '#EF4444' };

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(() => osApi.dashboard());
  const [timerBusy, setTimerBusy] = useState(false);
  const [taskTab, setTaskTab] = useState('focus'); // 'focus' | 'all' | 'completed'
  const [selectedTask, setSelectedTask] = useState(null);

  const startTimer = useCallback(async () => {
    setTimerBusy(true);
    try {
      await osApi.time.start({ category: 'work' });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setTimerBusy(false);
    }
  }, [refetch]);

  const stopTimer = useCallback(async (timerId) => {
    setTimerBusy(true);
    try {
      const id = timerId || data?.runningTimer?._id;
      if (id) await osApi.time.stop(id);
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setTimerBusy(false);
    }
  }, [data?.runningTimer, refetch]);

  const toggleTask = useCallback(async (task) => {
    const id = task.taskId || task._id;
    try {
      await osApi.tasks.toggle(id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  }, [refetch]);

  const startTaskTimer = useCallback(async (task) => {
    setTimerBusy(true);
    try {
      const id = task.taskId || task._id;
      const gId = task.goalId?._id || task.goalId || null;
      await osApi.time.start({
        category: 'work',
        taskId: id,
        notes: task.title,
        goalId: gId,
      });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setTimerBusy(false);
    }
  }, [refetch]);

  const isTimerForTask = useCallback((task) => {
    if (!data?.runningTimer) return false;
    const tId = String(task.taskId || task._id);
    const runTaskId = data.runningTimer.taskId?._id || data.runningTimer.taskId;
    return (runTaskId && String(runTaskId) === tId) || data.runningTimer.notes === task.title;
  }, [data?.runningTimer]);

  if (loading) return <Spinner label="Booting your operating system…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const t = data.today;
  const goalsOnTrack = data.goals.filter((g) => g.health === 'on-track').length;
  const plannedRows = data.planVsActual?.rows?.filter((r) => r.execution !== null) || [];
  const avgExecution = plannedRows.length
    ? Math.round(plannedRows.reduce((s, r) => s + Math.min(100, r.execution), 0) / plannedRows.length)
    : null;

  const focusTasks = data.focus || [];
  const allOpenTasks = data.openTasks || [];
  const completedTodayTasks = data.completedToday || [];

  const avgGoalProgress = data.goals?.length
    ? Math.round(data.goals.reduce((sum, g) => sum + (g.progress || 0), 0) / data.goals.length)
    : 0;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const currentTasks = taskTab === 'focus'
    ? focusTasks
    : taskTab === 'all'
    ? allOpenTasks
    : completedTodayTasks;

  return (
    <div className="space-y-6 w-full">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ACTIVE
            </span>
            <span className="text-xs text-muted-foreground mono">{todayFormatted}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>
            Good to see you, Tosif.
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allOpenTasks.length} open task{allOpenTasks.length === 1 ? '' : 's'} · {goalsOnTrack} of {data.goals.length} goals on track · {fmtMinutes(t.totalMinutes)} tracked today
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/os/tasks"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground border border-border transition-colors"
          >
            <ListChecks size={13} /> Manage Tasks
          </Link>
          <Link
            to="/os/daily-log"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground border border-border transition-colors"
          >
            <NotebookPen size={13} /> Log Activity
          </Link>

          {/* Timer widget */}
          {data.runningTimer ? (
            <button
              onClick={() => stopTimer(data.runningTimer._id)}
              disabled={timerBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-semibold hover:bg-red-500/25 transition-colors animate-pulse shadow-sm shadow-red-500/20"
            >
              <Square size={13} /> Stop timer ({data.runningTimer.notes ? `${data.runningTimer.notes.slice(0, 18)}…` : data.runningTimer.category})
            </button>
          ) : (
            <button
              onClick={startTimer}
              disabled={timerBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
            >
              <Play size={13} /> Start Timer
            </button>
          )}
        </div>
      </div>

      {/* 5-column metric cards stretching full width */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Time today"
          value={fmtMinutes(t.totalMinutes)}
          icon={Clock3}
          color="hsl(var(--primary))"
          sub={`${t.activities.length} tracked entry(s)`}
        />
        <StatCard
          label="Learning today"
          value={fmtMinutes(t.learningMinutes)}
          icon={GraduationCap}
          color="#38BDF8"
          sub={`${t.learning.length} session(s)`}
        />
        <StatCard
          label="Tasks completed"
          value={`${t.tasksCompleted} / ${t.tasksCompleted + allOpenTasks.length}`}
          icon={ListChecks}
          color="#10B981"
          sub={`${allOpenTasks.length} pending`}
        />
        <StatCard
          label="Learning streak"
          value={`${data.learningStreak}d`}
          icon={Flame}
          color="#F59E0B"
          sub="consecutive active days"
        />
        <StatCard
          label="Goal completion"
          value={`${avgGoalProgress}%`}
          icon={Target}
          color="#8B5CF6"
          sub={`${goalsOnTrack} / ${data.goals.length} on track`}
        />
      </div>

      {/* Executive 2-Column Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column: Tasks & Activities (7 of 12 columns) */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-6">
          {/* What should I do today? */}
          <Panel
            title="What should I do today?"
            subtitle="Rule-based suggestions: due dates → priorities → behind goals"
            right={
              <Link to="/os/tasks" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                All tasks ({allOpenTasks.length}) →
              </Link>
            }
          >
            {/* Tabs for quick filtering */}
            <div className="flex items-center gap-1.5 mb-3 p-1 rounded-xl bg-muted/30 border border-border/60 text-xs">
              <button
                onClick={() => setTaskTab('focus')}
                className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition-colors ${
                  taskTab === 'focus'
                    ? 'bg-background shadow-xs text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Today's Focus ({focusTasks.length})
              </button>
              <button
                onClick={() => setTaskTab('all')}
                className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition-colors ${
                  taskTab === 'all'
                    ? 'bg-background shadow-xs text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Open ({allOpenTasks.length})
              </button>
              <button
                onClick={() => setTaskTab('completed')}
                className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition-colors ${
                  taskTab === 'completed'
                    ? 'bg-background shadow-xs text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Done Today ({completedTodayTasks.length})
              </button>
            </div>

            {currentTasks.length === 0 ? (
              <EmptyState
                icon={Circle}
                title={
                  taskTab === 'focus'
                    ? 'No open focus items'
                    : taskTab === 'all'
                    ? 'No open tasks remaining'
                    : 'No tasks completed yet today'
                }
                hint={
                  taskTab === 'focus'
                    ? 'Add tasks with due dates or high priorities to your goals to see them here.'
                    : taskTab === 'all'
                    ? 'Create tasks inside your goals to track progress.'
                    : 'Check off tasks as you finish them to track your daily output.'
                }
              />
            ) : (
              <ul className="space-y-2.5">
                {currentTasks.map((item) => {
                  const id = item.taskId || item._id;
                  const isDone = item.status === 'done';
                  const isRunning = isTimerForTask(item);
                  const goalTitle = typeof item.goalId === 'object' ? item.goalId?.title : item.goal;
                  const reason = item.reason || (item.dueDate && String(item.dueDate).slice(0, 10) <= data.date ? 'Due today' : `${item.priority || 'normal'} priority`);

                  return (
                    <li
                      key={id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        isRunning
                          ? 'bg-red-500/5 border-red-500/30 ring-1 ring-red-500/20'
                          : isDone
                          ? 'bg-muted/20 border-border/50 opacity-70'
                          : 'bg-muted/30 border-border hover:border-border/80 hover:bg-muted/50'
                      }`}
                    >
                      {/* Toggle Done Button */}
                      <button
                        onClick={() => toggleTask(item)}
                        aria-label="Toggle task status"
                        className="p-1 rounded hover:scale-110 transition-transform text-muted-foreground flex-shrink-0"
                        title={isDone ? 'Mark as to-do' : 'Mark as completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <Circle size={18} className="text-muted-foreground hover:text-emerald-500" />
                        )}
                      </button>

                      {/* Task Title & Meta */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer group/title"
                        onClick={() => setSelectedTask({ ...item, _id: id })}
                      >
                        <div className={`text-sm truncate ${isDone ? 'line-through text-muted-foreground' : 'text-foreground font-semibold group-hover/title:text-primary transition-colors'}`}>
                          {item.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-muted-foreground mono">
                          <span className={reason === 'Overdue' ? 'text-red-500 font-semibold' : reason === 'Due today' ? 'text-amber-500 font-semibold' : ''}>
                            {reason}
                          </span>
                          {goalTitle && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[200px] text-foreground/85 font-medium">{goalTitle}</span>
                            </>
                          )}
                          {item.estimateMinutes ? (
                            <>
                              <span>·</span>
                              <span>~{fmtMinutes(item.estimateMinutes)}</span>
                            </>
                          ) : null}
                          <span className="text-primary font-medium opacity-0 group-hover/title:opacity-100 transition-opacity">
                            · View Vault →
                          </span>
                        </div>
                      </div>

                      {/* Priority badge */}
                      {item.priority && (
                        <Badge color={PRIORITY_COLORS[item.priority]}>
                          {item.priority.toUpperCase()}
                        </Badge>
                      )}

                      {/* Track Time Button */}
                      {!isDone && (
                        isRunning ? (
                          <button
                            onClick={() => stopTimer(data.runningTimer._id)}
                            disabled={timerBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-semibold hover:bg-red-500/25 transition-colors animate-pulse"
                            title="Timer is running on this task. Click to stop."
                          >
                            <Square size={11} /> Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => startTaskTimer(item)}
                            disabled={timerBusy || (data.runningTimer && !isRunning)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border text-muted-foreground text-xs font-medium transition-colors disabled:opacity-40"
                            title={data.runningTimer ? 'Another timer is running' : 'Track time on this task'}
                          >
                            <Play size={11} /> Track
                          </button>
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* What am I doing today? (Daily Activity Stream) */}
          <Panel
            title="What am I doing today?"
            subtitle="Your real-time daily log — activities and learning recorded today"
            right={
              <Link to="/os/daily-log" className="text-xs text-primary font-medium hover:underline">
                Open Daily Log →
              </Link>
            }
          >
            {t.activities.length === 0 ? (
              <EmptyState
                icon={NotebookPen}
                title="Nothing logged today yet"
                hint="Log what you work on as you go — it feeds your analytics, plan adherence and trajectory."
                action={
                  <Link to="/os/daily-log" className={btnPrimary}>
                    <NotebookPen size={13} /> Log an activity
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {t.activities.map((a) => (
                  <div key={a._id} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                    <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground font-medium truncate">{a.title}</div>
                      <div className="text-[11px] text-muted-foreground mono mt-0.5">
                        <span className="capitalize">{a.type}</span>
                        {a.goalId ? ` · ${a.goalId.title}` : ''}
                        {a.skillId ? ` · ${a.skillId.name}` : ''}
                      </div>
                    </div>
                    <span className="text-xs mono font-semibold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                      {fmtMinutes(a.durationMinutes)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column: Intelligence, Goals & Health (5 of 12 columns) */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-6">
          {/* Goal health & progress */}
          <Panel
            title="Which goals are progressing? Which are behind?"
            subtitle="Behind = progress is 10+ points below linear expectation"
            right={
              <Link to="/os/goals" className="text-xs text-primary font-medium hover:underline">
                All goals ({data.goals.length}) →
              </Link>
            }
          >
            {data.goals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No active goals yet"
                hint="Create your first goal — with milestones and tasks, progress becomes measurable."
                action={<Link to="/os/goals" className={btnPrimary}>Create a goal</Link>}
              />
            ) : (
              <div className="space-y-3">
                {data.goals.map((g) => (
                  <Link
                    key={g.id}
                    to={`/os/goals/${g.id}`}
                    className="block p-3.5 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground truncate pr-2">{g.title}</span>
                      <Badge color={HEALTH_COLORS[g.health]}>{g.health.toUpperCase()}</Badge>
                    </div>
                    <ProgressBar value={g.progress} color={HEALTH_COLORS[g.health]} height={8} />
                    <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground mono">
                      <span className="font-semibold text-foreground">{g.progress}% completed</span>
                      {g.expectedByNow !== null && <span>expected ~{g.expectedByNow}%</span>}
                    </div>
                  </Link>
                ))}
                <div className="text-[11px] text-muted-foreground mono pt-1 flex items-center justify-between">
                  <span>{goalsOnTrack} on track</span>
                  <span>{data.behindGoals.length} behind</span>
                </div>
              </div>
            )}
          </Panel>

          {/* Goal completion radial overview */}
          {data.goals.length > 0 && (
            <Panel title="Goal Radial Overview" subtitle="Quick snapshot of overall goal progress meters">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                {data.goals.slice(0, 4).map((g) => (
                  <div key={g.id} className="h-32 flex flex-col items-center justify-center p-2 rounded-xl bg-muted/20 border border-border/50">
                    <div className="w-full h-20 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          innerRadius="65%"
                          outerRadius="100%"
                          data={[{ name: g.title, value: g.progress, fill: HEALTH_COLORS[g.health] }]}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                          <RadialBar background dataKey="value" cornerRadius={8} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: HEALTH_COLORS[g.health] }}>
                        {g.progress}%
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center truncate w-full mt-1 px-1 font-medium">
                      {g.title}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Plan adherence */}
          <Panel
            title="Am I following my plan?"
            subtitle="Weekly targets vs actual tracked time"
            right={
              <Link to="/os/settings" className="text-xs text-primary font-medium hover:underline">
                Edit plan →
              </Link>
            }
          >
            {plannedRows.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl bg-muted/20 border border-border/50">
                <Target size={28} className="mx-auto mb-2 text-muted-foreground" />
                <h4 className="text-xs font-semibold text-foreground mb-1">No weekly targets configured</h4>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto mb-3">
                  Set weekly hour targets per category to visualize execution adherence.
                </p>
                <Link to="/os/settings" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                  Set weekly plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {plannedRows.map((r) => (
                  <div key={r.category}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-foreground capitalize font-medium">{r.category}</span>
                      <span className="text-muted-foreground mono">
                        {fmtMinutes(r.actualMinutes)} / {fmtMinutes(r.targetMinutes)}
                        <span className={r.execution >= 80 ? 'text-emerald-500 ml-2 font-semibold' : r.execution >= 40 ? 'text-amber-500 ml-2 font-semibold' : 'text-red-500 ml-2 font-semibold'}>
                          {r.execution}%
                        </span>
                      </span>
                    </div>
                    <ProgressBar
                      value={Math.min(100, r.execution)}
                      color={r.execution >= 80 ? '#10B981' : r.execution >= 40 ? '#F59E0B' : '#EF4444'}
                      height={6}
                    />
                  </div>
                ))}
                {avgExecution !== null && (
                  <div className="text-[11px] text-muted-foreground mono pt-1 border-t border-border/40">
                    Average execution this week: <span className="font-semibold text-foreground">{avgExecution}%</span>
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* Current Trajectory */}
          <Panel
            title="What is my current trajectory?"
            subtitle="Estimated completion and observed velocity"
            right={
              <Link to="/os/analytics" className="text-xs text-primary font-medium hover:underline">
                Analytics →
              </Link>
            }
          >
            {data.trajectories.length === 0 ? (
              <EmptyState
                icon={Timer}
                title="No trajectories estimated yet"
                hint="Record progress across multiple days to view trajectory projections."
              />
            ) : (
              <div className="space-y-3">
                {data.trajectories.map((tr) => (
                  <div key={tr.goalId} className="p-3 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground truncate pr-2">{tr.title}</span>
                      {tr.status === 'estimated' && tr.estimate && (
                        <Badge color="hsl(var(--primary))">ETA {tr.estimate.completionAround}</Badge>
                      )}
                      {tr.status === 'insufficient_data' && <Badge color="hsl(var(--muted-foreground))">NEED DATA</Badge>}
                      {tr.status === 'complete' && <Badge color="hsl(var(--primary))">DONE</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mono">
                      {tr.status === 'estimated' && tr.estimate
                        ? `${tr.currentProgress}% done · ${tr.observedPacePerWeek} pts/week · range ${tr.estimate.rangeStart} → ${tr.estimate.rangeEnd}`
                        : tr.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

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
