/** Centralised error handler — must be registered last */
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  console.error(`[error] ${status} — ${err.message}`);
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

/** Wrap an async controller so errors flow to errorHandler */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
