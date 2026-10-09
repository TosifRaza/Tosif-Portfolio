// Shared UI primitives for the private OS — OS-styled, dark, responsive.
import { useState } from 'react';
import { X } from 'lucide-react';

export const fmtMinutes = (min) => {
  const m = Math.round(min || 0);
  const h = Math.floor(m / 60);
  return h && m % 60 ? `${h}h ${m % 60}m` : h ? `${h}h` : `${m}m`;
};

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function Panel({ title, subtitle, right, children, className = '' }) {
  return (
    <div className={`glass rounded-xl p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, color = 'hsl(var(--primary))', icon: Icon }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon size={13} style={{ color }} />
          </div>
        )}
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mono">{label}</div>
      </div>
      <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ value, color = 'hsl(var(--primary))', height = 6 }) {
  return (
    <div className="w-full rounded-full bg-muted/60 overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="text-center py-10 px-6">
      {Icon && <Icon size={34} className="mx-auto mb-3 text-muted-foreground" />}
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      {hint && <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function NotEnoughData({ what = 'analytics' }) {
  return (
    <div className="glass rounded-xl p-8 text-center">
      <div className="text-2xl mb-2">📉</div>
      <div className="text-sm text-foreground font-semibold">Not enough data yet</div>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
        Once you log activities, time and learning sessions, your {what} will appear here — calculated from real data, never invented.
      </p>
    </div>
  );
}

export function Badge({ children, color = 'hsl(var(--primary))' }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[9px] mono border tracking-wider"
      style={{ color, borderColor: `${color}40`, background: `${color}10` }}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-12 text-xs mono text-muted-foreground gap-2">
      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="text-sm text-pink-400 mb-2">⚠ {message}</div>
      {onRetry && (
        <button onClick={onRetry} className={btnGhost}>Try again</button>
      )}
    </div>
  );
}

/** Simple modal with a form — used by CRUD pages. */
export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`glass-strong rounded-2xl p-6 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Labelled form field wrapper */
export function Field({ label, children, full = false }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

export const inputCls =
  'w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors';

export const btnPrimary =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-cyan-400 text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50';
export const btnGhost =
  'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-xs hover:bg-muted/80 transition-colors';

/** Tiny confirm-then-delete button */
export function DeleteButton({ onConfirm, label = 'Delete' }) {
  const [arming, setArming] = useState(false);
  return (
    <button
      onClick={() => (arming ? onConfirm() : setArming(true))}
      onBlur={() => setArming(false)}
      className={`text-[11px] px-2 py-1 rounded transition-colors ${arming ? 'bg-red-500/20 text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
    >
      {arming ? 'Confirm?' : label}
    </button>
  );
}
