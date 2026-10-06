/**
 * Tiny dependency-free validation helpers.
 * Controllers call these before touching the DB; failures throw an error
 * with `status` set so the central errorHandler returns a clean 400.
 */

export function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

/** Throws 400 unless every field in `names` is present and non-empty. */
export function requireFields(body, names) {
  const missing = names.filter((n) => {
    const v = body?.[n];
    return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
  });
  if (missing.length) {
    throw badRequest(`Missing required field(s): ${missing.join(', ')}`);
  }
}

/** Throws 400 if value is defined but not one of the allowed options. */
export function oneOf(value, options, field = 'value') {
  if (value === undefined || value === null || value === '') return;
  if (!options.includes(value)) {
    throw badRequest(`${field} must be one of: ${options.join(', ')}`);
  }
}

export function isNumberInRange(value, min, max, field = 'value') {
  if (value === undefined || value === null || value === '') return;
  const n = Number(value);
  if (Number.isNaN(n) || n < min || n > max) {
    throw badRequest(`${field} must be a number between ${min} and ${max}`);
  }
}

export function isValidDate(value, field = 'date') {
  if (value === undefined || value === null || value === '') return;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw badRequest(`${field} is not a valid date`);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validates YYYY-MM-DD day strings used by logs / time entries / sessions. */
export function isValidDay(value, field = 'date') {
  if (value === undefined || value === null || value === '') return;
  if (!DATE_RE.test(value) || Number.isNaN(new Date(value).getTime())) {
    throw badRequest(`${field} must be a valid date formatted YYYY-MM-DD`);
  }
}

/** Trims a set of string fields and caps their length. */
export function sanitizeStrings(body, caps = {}) {
  for (const [field, cap] of Object.entries(caps)) {
    if (typeof body?.[field] === 'string') {
      body[field] = body[field].trim().slice(0, cap);
    }
  }
  return body;
}

/** Returns only the keys of `body` that are listed in `allowed`. */
export function pickFields(body, allowed) {
  const out = {};
  for (const key of allowed) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}
