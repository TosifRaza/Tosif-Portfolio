// TOSIF OS Frontend API client
// All requests go through Vite's /api proxy → Backend on :5000
// The database is the single source of truth: every section renders API data.

const BASE = '/api';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
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
