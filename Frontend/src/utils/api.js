// TOSIF OS Frontend API client
// In production VITE_API_URL is the backend origin; local development uses Vite's proxy.
// The database is the single source of truth: every section renders API data.

const DEFAULT_PRODUCTION_API_ORIGIN = 'https://tosif-portfolio-1.onrender.com';
const API_ORIGIN = (
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PRODUCTION_API_ORIGIN : '')
).replace(/\/+$/, '');
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
  getGithubContributions: (signal) => request('/github/contributions', { signal, cache: 'no-store' }),

  // Authenticated text editing from the terminal. These writes use the same
  // admin-protected CMS routes as the Admin Portal.
  adminLogin: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getAdminTextContent: (token) => {
    const headers = { Authorization: `Bearer ${token}` };
    return Promise.all([
      request('/profile', { headers }),
      request('/about', { headers }),
      request('/site', { headers }),
      request('/projects?all=1', { headers }),
      request('/products/all', { headers }),
      request('/skills?all=1', { headers }),
      request('/timeline?all=1', { headers }),
      request('/experience/all', { headers }),
      request('/achievements?all=1', { headers }),
    ]).then(([profile, about, site, projects, products, skills, timeline, experience, achievements]) => ({
      profile, about, site, projects, products, skills, timeline, experience, achievements,
    }));
  },
  updateAdminTextContent: (resource, id, content, token) => {
    const singletonPaths = { profile: '/profile', about: '/about', site: '/site' };
    const collectionPaths = {
      projects: '/projects',
      products: '/products',
      skills: '/skills',
      timeline: '/timeline',
      experience: '/experience',
      achievements: '/achievements',
    };
    const path = singletonPaths[resource]
      || (collectionPaths[resource] && id ? `${collectionPaths[resource]}/${encodeURIComponent(id)}` : null);
    if (!path) throw new Error('This content item cannot be edited from the terminal.');
    return request(path, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(content),
    });
  },

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
