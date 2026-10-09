import { motion } from 'framer-motion';

/** Shared page header — eyebrow label, title, subtitle (reference style). */
export default function SectionHeader({ icon: Icon, eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-xs font-medium text-primary mb-2"
          >
            {Icon && <Icon size={13} />}
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight break-words"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-muted-foreground max-w-2xl"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

/** Empty state — honest "no data yet" message (never fabricate). */
export function EmptyState({ message = 'Not enough data yet — check back soon.' }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2.5" />
      {label}
    </div>
  );
}
