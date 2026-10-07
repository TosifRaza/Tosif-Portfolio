/** Centralised error handler — must be registered last */
export function errorHandler(err, _req, res, _next) {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500
    ? err.status
    : err.name === 'MulterError' ? 400 : 500;
  if (status >= 500) console.error('[error] Internal server error:', err.message);
  else console.warn(`[request] ${status} — ${err.message}`);
  res.status(status).json({
    message: status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

/** Wrap an async controller so errors flow to errorHandler */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
