// Admin API client — talks to the same backend as the public Frontend.
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
    const msg = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(msg.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export { request };

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token) => request('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),

  // Generic CRUD factory
  crud(resource, token) {
    const headers = { Authorization: `Bearer ${token}` };
    return {
      list: () => request(`/${resource}`, { headers }),
      create: (data) => request(`/${resource}`, { method: 'POST', body: JSON.stringify(data), headers }),
      update: (id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data), headers }),
      remove: (id) => request(`/${resource}/${id}`, { method: 'DELETE', headers }),
    };
  },

  // Contact-specific
  messages(token) {
    const headers = { Authorization: `Bearer ${token}` };
    return {
      list: () => request('/contact', { headers }),
      markRead: (id) => request(`/contact/${id}/read`, { method: 'PATCH', headers }),
      remove: (id) => request(`/contact/${id}`, { method: 'DELETE', headers }),
    };
  },

  // Resume
  resume(token) {
    const headers = { Authorization: `Bearer ${token}` };
    return {
      listAll: () => request('/resume/all', { headers }),
      upload: (formData) =>
        fetch(apiUrl('/api/resume'), { method: 'POST', headers, body: formData }).then((r) => r.json()),
      remove: (id) => request(`/resume/${id}`, { method: 'DELETE', headers }),
    };
  },

  // Stats for dashboard
  async stats(token) {
    const headers = { Authorization: `Bearer ${token}` };
    const [projects, skills, timeline, achievements, messages, products, experience, goals] = await Promise.all([
      request('/projects?all=1', { headers }).catch(() => []),
      request('/skills?all=1', { headers }).catch(() => []),
      request('/timeline?all=1', { headers }).catch(() => []),
      request('/achievements?all=1', { headers }).catch(() => []),
      request('/contact', { headers }).catch(() => []),
      request('/products?all=1', { headers }).catch(() => []),
      request('/experience?all=1', { headers }).catch(() => []),
      request('/goals', { headers }).catch(() => []),
    ]);
    return {
      projects: projects.length,
      skills: skills.length,
      timeline: timeline.length,
      achievements: achievements.length,
      messages: messages.length,
      unread: messages.filter((m) => !m.read).length,
      products: products.length,
      experience: experience.length,
      goals: goals.filter((g) => g.status === 'active').length,
    };
  },
};
