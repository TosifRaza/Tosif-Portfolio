import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, StatCard, ProgressBar, EmptyState, Spinner, ErrorState, Badge, fmtMinutes, btnPrimary,
} from '../components/ui.jsx';
import {
  Clock3, GraduationCap, ListChecks, Target, Flame, AlertTriangle, CheckCircle2, Circle, Play, Square, Timer,
} from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

const HEALTH_COLORS = { 'on-track': '#10B981', behind: '#EF4444', complete: 'hsl(var(--primary))' };

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(() => osApi.dashboard());
  const [timerBusy, setTimerBusy] = useState(false);

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

  const stopTimer = useCallback(async () => {
    setTimerBusy(true);
    try {
      await osApi.time.stop(data.runningTimer._id);
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setTimerBusy(false);
    }
  }, [data, refetch]);

  if (loading) return <Spinner label="Booting your operating system…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const t = data.today;
  const goalsOnTrack = data.goals.filter((g) => g.health === 'on-track').length;
  const plannedRows = data.planVsActual?.rows?.filter((r) => r.execution !== null) || [];
  const avgExecution = plannedRows.length
    ? Math.round(plannedRows.reduce((s, r) => s + Math.min(100, r.execution), 0) / plannedRows.length)
    : null;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>
            Good to see you. Here's your system status.
          </h1>
        </div>
        {/* Timer widget */}
        {data.runningTimer ? (
          <button onClick={stopTimer} disabled={timerBusy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors">
            <Square size={13} /> Stop timer ({data.runningTimer.category})
          </button>
        ) : (
          <button onClick={startTimer} disabled={timerBusy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
            <Play size={13} /> Start timer
          </button>
        )}
      </div>

      {/* Today at a glance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Time today" value={fmtMinutes(t.totalMinutes)} icon={Clock3} color="hsl(var(--primary))" sub="tracked time entries" />
        <StatCard label="Learning today" value={fmtMinutes(t.learningMinutes)} icon={GraduationCap} color="hsl(var(--primary))" sub={`${t.learning.length} session(s)`} />
        <StatCard label="Tasks done" value={t.tasksCompleted} icon={ListChecks} color="#10B981" sub="completed today" />
        <StatCard label="Learning streak" value={`${data.learningStreak}d`} icon={Flame} color="#F59E0B" sub="consecutive days" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* What should I do today? */}
        <Panel
          title="What should I do today?"
          subtitle="Rule-based suggestions: due dates → priorities → behind goals"
          right={<Link to="/os/tasks" className="text-[11px] text-primary hover:underline">All tasks →</Link>}
        >
          {data.focus.length === 0 ? (
            <EmptyState
              icon={Circle}
              title="No open focus items"
              hint="Add tasks to your goals and they will show up here, sorted by due date, priority and goal health."
            />
          ) : (
            <ul className="space-y-2">
              {data.focus.map((f) => (
                <li key={f.taskId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                  <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">{f.title}</div>
                    <div className="text-[10px] text-muted-foreground mono">
                      {f.reason}{f.goal ? ` · ${f.goal}` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Goal health */}
        <Panel
          title="Which goals are progressing? Which are behind?"
          subtitle="Behind = progress is 10+ points below the straight-line expectation"
          right={<Link to="/os/goals" className="text-[11px] text-primary hover:underline">All goals →</Link>}
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
              {data.goals.slice(0, 5).map((g) => (
                <Link key={g.id} to={`/os/goals/${g.id}`} className="block p-3 rounded-lg bg-muted/40 border border-border hover:border-border transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground truncate pr-2">{g.title}</span>
                    <Badge color={HEALTH_COLORS[g.health]}>{g.health.toUpperCase()}</Badge>
                  </div>
                  <ProgressBar value={g.progress} color={HEALTH_COLORS[g.health]} />
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground mono">
                    <span>{g.progress}%</span>
                    {g.expectedByNow !== null && <span>expected ~{g.expectedByNow}%</span>}
                  </div>
                </Link>
              ))}
              <div className="text-[10px] text-muted-foreground mono">
                {goalsOnTrack} on track · {data.behindGoals.length} behind
              </div>
            </div>
          )}
        </Panel>

        {/* Plan adherence */}
        <Panel
          title="Am I following my plan?"
          subtitle="Weekly targets vs actual tracked time (or logged activities when no time entries exist)"
          right={<Link to="/os/settings" className="text-[11px] text-primary hover:underline">Edit plan →</Link>}
        >
          {plannedRows.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No weekly plan set"
              hint="Set weekly hour targets per category in Settings → Weekly Plan, then log time to see execution."
              action={<Link to="/os/settings" className={btnPrimary}>Set weekly plan</Link>}
            />
          ) : (
            <div className="space-y-3">
              {plannedRows.map((r) => (
                <div key={r.category}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-foreground capitalize">{r.category}</span>
                    <span className="text-muted-foreground mono">
                      {fmtMinutes(r.actualMinutes)} / {fmtMinutes(r.targetMinutes)}
                      <span className={r.execution >= 80 ? 'text-emerald-500 ml-2' : r.execution >= 40 ? 'text-amber-500 ml-2' : 'text-red-500 ml-2'}>
                        {r.execution}%
                      </span>
                    </span>
                  </div>
                  <ProgressBar
                    value={Math.min(100, r.execution)}
                    color={r.execution >= 80 ? '#10B981' : r.execution >= 40 ? '#F59E0B' : '#EF4444'}
                  />
                </div>
              ))}
              {avgExecution !== null && (
                <div className="text-[10px] text-muted-foreground mono pt-1">Average execution this week: {avgExecution}%</div>
              )}
            </div>
          )}
        </Panel>

        {/* Trajectory */}
        <Panel
          title="What is my current trajectory?"
          subtitle="Estimated — computed from recorded progress history, not guaranteed"
          right={<Link to="/os/analytics" className="text-[11px] text-primary hover:underline">Analytics →</Link>}
        >
          {data.trajectories.length === 0 ? (
            <EmptyState icon={Timer} title="No trajectories to estimate yet" hint="Create goals and record progress; after two recorded days estimates appear." />
          ) : (
            <div className="space-y-3">
              {data.trajectories.map((tr) => (
                <div key={tr.goalId} className="p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground truncate pr-2">{tr.title}</span>
                    {tr.status === 'estimated' && tr.estimate && (
                      <Badge color="hsl(var(--primary))">ETA {tr.estimate.completionAround}</Badge>
                    )}
                    {tr.status === 'insufficient_data' && <Badge color="hsl(var(--muted-foreground))">NO DATA</Badge>}
                    {tr.status === 'complete' && <Badge color="hsl(var(--primary))">DONE</Badge>}
                  </div>
                  <div className="text-[10px] text-muted-foreground mono">
                    {tr.status === 'estimated' && tr.estimate
                      ? `${tr.currentProgress}% done · pace ${tr.observedPacePerWeek} pts/week · range ${tr.estimate.rangeStart} → ${tr.estimate.rangeEnd}`
                      : tr.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* What did I do today? */}
      <Panel title="What am I doing today?" subtitle="Your daily log — what was worked on, learned, and for how long" right={<Link to="/os/daily-log" className="text-[11px] text-primary hover:underline">Open Daily Log →</Link>}>
        {t.activities.length === 0 ? (
          <EmptyState
            icon={NotebookIcon}
            title="Nothing logged today yet"
            hint="Log what you work on as you go — it feeds your analytics, plan adherence and trajectory."
            action={<Link to="/os/daily-log" className={btnPrimary}>Log an activity</Link>}
          />
        ) : (
          <div className="space-y-2">
            {t.activities.map((a) => (
              <div key={a._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{a.title}</div>
                  <div className="text-[10px] text-muted-foreground mono">
                    {a.type}{a.goalId ? ` · ${a.goalId.title}` : ''}{a.skillId ? ` · ${a.skillId.name}` : ''}
                  </div>
                </div>
                <span className="text-xs mono text-primary">{fmtMinutes(a.durationMinutes)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Goal completion radial (only when data exists) */}
      {data.goals.length > 0 && (
        <Panel title="Goal progress overview">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.goals.slice(0, 6).map((g) => (
              <div key={g.id} className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="65%"
                    outerRadius="100%"
                    data={[{ name: g.title, value: g.progress, fill: HEALTH_COLORS[g.health] }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-[10px] text-muted-foreground text-center truncate -mt-9 px-2">{g.title}</div>
                <div className="text-xs text-center font-bold mt-5" style={{ color: HEALTH_COLORS[g.health] }}>{g.progress}%</div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function NotebookIcon(props) {
  return <ListChecks {...props} />;
}
