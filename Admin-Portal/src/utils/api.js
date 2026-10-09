// Admin API client — talks to the same backend as the public Frontend.
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE = '/api';
export const AUTH_EXPIRED_EVENT = 'founder-os-admin-auth-expired';

export function apiUrl(path) {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

function notifyUnauthorized(response, headers = {}) {
  const authorization = headers.Authorization || headers.authorization;
  if (response.status === 401 && authorization && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

async function responseError(response, fallback) {
  const data = await response.json().catch(() => ({ message: response.statusText }));
  const error = new Error(data.message || fallback || `Request failed: ${response.status}`);
  error.status = response.status;
  return error;
}

async function request(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const res = await fetch(apiUrl(`${BASE}${path}`), {
    ...opts,
    headers,
  });
  if (!res.ok) {
    notifyUnauthorized(res, headers);
    throw await responseError(res);
  }
  return res.json();
}

export { request };

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token) => request('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  updateProfile: (profile, token) => request('/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(profile),
  }),

  uploadImage: async (file, token) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(apiUrl('/api/upload'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      notifyUnauthorized(response, { Authorization: `Bearer ${token}` });
      throw await responseError(response, `Image upload failed (${response.status})`);
    }
    return response.json();
  },

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

  githubImports(token) {
    const headers = { Authorization: `Bearer ${token}` };
    return {
      list: () => request('/github/imports', { headers }),
      count: () => request('/github/imports/count', { headers }),
      sync: () => request('/github/imports/sync', { method: 'POST', headers }),
      approve: (id) => request(`/github/imports/${id}/approve`, { method: 'POST', headers }),
      dismiss: (id) => request(`/github/imports/${id}/dismiss`, { method: 'POST', headers }),
    };
  },

  // Resume
  resume(token) {
    const headers = { Authorization: `Bearer ${token}` };
    return {
      listAll: () => request('/resume/all', { headers }),
      upload: async (formData) => {
        const response = await fetch(apiUrl('/api/resume'), { method: 'POST', headers, body: formData });
        if (!response.ok) {
          notifyUnauthorized(response, headers);
          throw await responseError(response, `Resume upload failed (${response.status})`);
        }
        return response.json();
      },
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
