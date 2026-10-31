import { useOSTimer, formatSeconds } from '../context/OSTimerContext.jsx';
import { Play, Square, AlertCircle, Clock } from 'lucide-react';

export default function TaskTimerWidget({ task, compact = false, onTimerToggled }) {
  const {
    runningTimer,
    isTaskRunning,
    formattedTime,
    elapsedSeconds,
    isOverdue,
    timerBusy,
    startTimer,
    stopTimer,
  } = useOSTimer();

  if (!task || task.status === 'done') return null;

  const isRunning = isTaskRunning(task);
  const estimateMinutes = Number(task.estimateMinutes) || 0;
  const estimateSeconds = estimateMinutes * 60;
  const taskProgress = estimateSeconds > 0 ? Math.min(100, Math.round((elapsedSeconds / estimateSeconds) * 100)) : null;

  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isRunning) {
      await stopTimer(runningTimer?._id);
      if (onTimerToggled) onTimerToggled();
    } else {
      await startTimer({ category: 'work', task });
      if (onTimerToggled) onTimerToggled();
    }
  };

  if (isRunning) {
    return (
      <div className="inline-flex flex-col items-end gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={timerBusy}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-sm ${
            isOverdue
              ? 'bg-amber-500/20 border border-amber-500/60 text-amber-400 animate-pulse shadow-amber-500/20'
              : 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 shadow-red-500/20'
          }`}
          title={isOverdue ? "Allocated time exceeded! Click to stop." : "Timer is running on this task. Click to stop."}
        >
          {isOverdue ? <AlertCircle size={12} className="text-amber-400 animate-spin-slow" /> : <Square size={11} className="fill-current" />}
          <span>{formattedTime}</span>
          {estimateMinutes > 0 && <span className="opacity-70 text-[10px]">/ {estimateMinutes}m</span>}
        </button>

        {/* Progress bar towards estimate */}
        {estimateMinutes > 0 && !compact && (
          <div className="w-20 h-1 bg-muted/60 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isOverdue ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Not running: show start/track button
  const anotherIsRunning = Boolean(runningTimer && !isRunning);

  return (
    <div className="inline-flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={timerBusy || anotherIsRunning}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
          anotherIsRunning
            ? 'opacity-40 bg-muted/40 border-border text-muted-foreground cursor-not-allowed'
            : 'bg-muted/60 hover:bg-primary/15 hover:border-primary/40 text-muted-foreground hover:text-primary border-border cursor-pointer'
        }`}
        title={anotherIsRunning ? 'Another timer is already running' : `Start timer for this task (${estimateMinutes ? `${estimateMinutes}m estimate` : 'untracked'})`}
      >
        <Play size={10} className="fill-current" />
        <span className="text-[11px]">Track</span>
        {estimateMinutes > 0 && (
          <span className="text-[10px] font-mono text-muted-foreground/80">~{estimateMinutes}m</span>
        )}
      </button>
    </div>
  );
}
