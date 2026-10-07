// TOSIF OS Frontend API client
// In production VITE_API_URL is the backend origin; local development uses Vite's proxy.
// The database is the single source of truth: every section renders API data.

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE = '/api';

export function apiUrl(path) {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(path, opts = {}) {
  const res = await fetch(apiUrl(`${BASE}${path}`), {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  // ── Public content (CMS-driven) ──────────────────────────
  getSite: () => request('/site'),
  getProfile: () => request('/profile'),
  getAbout: () => request('/about'),
  getStats: () => request('/stats'),
  getProjects: () => request('/projects'),
  getSkills: () => request('/skills'),
  getTimeline: () => request('/timeline'),
  getAchievements: () => request('/achievements'),
  getExperience: () => request('/experience'),
  getProducts: () => request('/products'),
  getResume: () => request('/resume'),
  getGithub: () => request('/github'),

  // AI Recruiter — backend pulls live data from MongoDB
  askRecruiter: (question) =>
    request('/ai-recruiter/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  // Contact form — submission is stored in MongoDB
  submitContact: (data) =>
    request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
