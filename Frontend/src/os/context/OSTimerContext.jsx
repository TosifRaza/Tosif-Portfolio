import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { osApi } from '../osApi.js';
import { X, Square, AlertCircle, Clock3, Plus } from 'lucide-react';

const OSTimerContext = createContext(null);

export function formatSeconds(totalSeconds) {
  if (totalSeconds == null || Number.isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Pleasant browser audio chime using Web Audio API (zero audio file dependencies)
function playAlarmChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // 3-tone gentle chime sequence: C5, E5, G5
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const start = now + idx * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch (err) {
    console.warn('[OSTimer] Audio chime error:', err);
  }
}

export function OSTimerProvider({ children }) {
  const [runningTimer, setRunningTimer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerBusy, setTimerBusy] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [extraSecondsMap, setExtraSecondsMap] = useState({});

  // Keep track of which timers have already played the alarm
  const alertedIdsRef = useRef(new Set());
  const timerIntervalRef = useRef(null);

  // Fetch running timer from backend
  const refreshRunningTimer = useCallback(async () => {
    try {
      const current = await osApi.time.running();
      setRunningTimer(current);
      if (current?.startedAt) {
        const startMs = new Date(current.startedAt).getTime();
        const diff = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(diff);
      } else {
        setElapsedSeconds(0);
      }
      return current;
    } catch {
      return null;
    }
  }, []);

  // Poll once on mount and when window gains focus
  useEffect(() => {
    refreshRunningTimer();
    const handleFocus = () => refreshRunningTimer();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshRunningTimer]);

  // Real-time ticking interval (every 1 second)
  useEffect(() => {
    if (!runningTimer?.startedAt) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(runningTimer.startedAt).getTime();

    const tick = () => {
      const now = Date.now();
      const totalSecs = Math.max(0, Math.floor((now - startMs) / 1000));
      setElapsedSeconds(totalSecs);

      // Check if target estimate met
      const baseEstimateMins = runningTimer.taskId?.estimateMinutes || runningTimer.estimateMinutes || 0;
      const extraSecs = extraSecondsMap[runningTimer._id] || 0;
      const targetSeconds = baseEstimateMins > 0 ? (baseEstimateMins * 60) + extraSecs : 0;

      if (targetSeconds > 0 && totalSecs >= targetSeconds) {
        if (!alertedIdsRef.current.has(runningTimer._id)) {
          alertedIdsRef.current.add(runningTimer._id);
          playAlarmChime();

          if ('Notification' in window && Notification.permission === 'granted') {
            const taskTitle = runningTimer.taskId?.title || runningTimer.notes || 'Current Task';
            new Notification("⏰ Time's up!", {
              body: `Your allocated ${baseEstimateMins} minutes for "${taskTitle}" has ended!`,
            });
          }

          setAlertModal({
            timerId: runningTimer._id,
            taskId: runningTimer.taskId?._id || runningTimer.taskId,
            taskTitle: runningTimer.taskId?.title || runningTimer.notes || 'Active Task',
            estimateMinutes: baseEstimateMins,
            elapsedSeconds: totalSecs,
          });
        }
      }
    };

    tick();
    timerIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [runningTimer, extraSecondsMap]);

  // Start timer for a task or category
  const startTimer = async ({ category = 'work', taskId = null, task = null, notes = '' } = {}) => {
    setTimerBusy(true);
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }

      const effectiveTaskId = taskId || task?._id || null;
      const effectiveNotes = notes || task?.title || '';
      const payload = {
        category,
        taskId: effectiveTaskId,
        notes: effectiveNotes,
      };

      const res = await osApi.time.start(payload);
      // Attach the task object so estimateMinutes is available immediately
      if (task) {
        res.taskId = {
          _id: task._id,
          title: task.title,
          estimateMinutes: task.estimateMinutes || 0,
        };
      }
      setRunningTimer(res);
      setElapsedSeconds(0);
      return res;
    } finally {
      setTimerBusy(false);
    }
  };

  // Stop running timer
  const stopTimer = async (timerId) => {
    const id = timerId || runningTimer?._id;
    if (!id) return;
    setTimerBusy(true);
    try {
      const res = await osApi.time.stop(id);
      setRunningTimer(null);
      setElapsedSeconds(0);
      setAlertModal(null);
      if (id) alertedIdsRef.current.delete(id);
      return res;
    } finally {
      setTimerBusy(false);
    }
  };

  // Add extra minutes when alert sounds
  const addExtraMinutes = (timerId, minutes = 10) => {
    setExtraSecondsMap((prev) => ({
      ...prev,
      [timerId]: (prev[timerId] || 0) + minutes * 60,
    }));
    // Allow re-alerting when the new extra time expires
    alertedIdsRef.current.delete(timerId);
    setAlertModal(null);
  };

  const isTaskRunning = useCallback(
    (t) => {
      if (!runningTimer) return false;
      const tId = typeof t === 'string' ? t : String(t?._id || '');
      const runTaskId = runningTimer.taskId?._id ? String(runningTimer.taskId._id) : String(runningTimer.taskId || '');
      if (runTaskId && runTaskId === tId) return true;
      if (t?.title && runningTimer.notes === t.title) return true;
      return false;
    },
    [runningTimer]
  );

  const activeTaskEstimateMinutes =
    runningTimer?.taskId?.estimateMinutes || runningTimer?.estimateMinutes || 0;
  const activeExtraSeconds = runningTimer ? (extraSecondsMap[runningTimer._id] || 0) : 0;
  const totalTargetSeconds = activeTaskEstimateMinutes > 0 ? (activeTaskEstimateMinutes * 60) + activeExtraSeconds : 0;
  const isOverdue = totalTargetSeconds > 0 && elapsedSeconds >= totalTargetSeconds;

  const value = {
    runningTimer,
    elapsedSeconds,
    formattedTime: formatSeconds(elapsedSeconds),
    isOverdue,
    timerBusy,
    activeTaskEstimateMinutes,
    startTimer,
    stopTimer,
    refreshRunningTimer,
    isTaskRunning,
    addExtraMinutes,
  };

  return (
    <OSTimerContext.Provider value={value}>
      {children}

      {/* Floating Real-Time Time's Up Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-strong border border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-red-500/20 text-center relative overflow-hidden">
            {/* Pulsing glow background */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-bounce">
              <Clock3 size={32} className="text-red-500" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/40 mb-2">
              Time Target Reached
            </span>

            <h3 className="text-xl font-extrabold text-foreground tracking-tight mb-2">
              Time is Up!
            </h3>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              You allocated <span className="text-foreground font-semibold font-mono">{alertModal.estimateMinutes}m</span> for{' '}
              <span className="text-primary font-semibold">"{alertModal.taskTitle}"</span>. The timer has reached your target!
            </p>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/80 font-mono text-2xl font-bold text-red-500 mb-6 tracking-wider">
              {formatSeconds(elapsedSeconds)}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => stopTimer(alertModal.timerId)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02]"
              >
                <Square size={13} /> Stop & Save
              </button>
              <button
                onClick={() => addExtraMinutes(alertModal.timerId, 10)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Plus size={13} /> +10 Mins
              </button>
            </div>

            <button
              onClick={() => setAlertModal(null)}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Dismiss (keep counting)
            </button>
          </div>
        </div>
      )}
    </OSTimerContext.Provider>
  );
}

export function useOSTimer() {
  const ctx = useContext(OSTimerContext);
  if (!ctx) throw new Error('useOSTimer must be used within an OSTimerProvider');
  return ctx;
}
