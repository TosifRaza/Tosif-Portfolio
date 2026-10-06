// TOSIF OS — private OS API client (all routes require auth)
import { osFetch } from './osAuth.js';

export const osApi = {
  // Goals → Milestones → Tasks
  goals: {
    list: () => osFetch('/goals'),
    get: (id) => osFetch(`/goals/${id}`),
    create: (data) => osFetch('/goals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => osFetch(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => osFetch(`/goals/${id}`, { method: 'DELETE' }),
    recalc: (id) => osFetch(`/goals/${id}/progress`, { method: 'PATCH' }),
  },
  milestones: {
    list: (goalId) => osFetch(`/milestones${goalId ? `?goalId=${goalId}` : ''}`),
    create: (data) => osFetch('/milestones', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => osFetch(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => osFetch(`/milestones/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    list: (params = '') => osFetch(`/tasks${params}`),
    create: (data) => osFetch('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => osFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggle: (id) => osFetch(`/tasks/${id}/complete`, { method: 'PATCH' }),
    remove: (id) => osFetch(`/tasks/${id}`, { method: 'DELETE' }),
  },

  // Daily log
  activities: {
    list: (params = '') => osFetch(`/activities${params}`),
    create: (data) => osFetch('/activities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => osFetch(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => osFetch(`/activities/${id}`, { method: 'DELETE' }),
  },

  // Time
  time: {
    list: (params = '') => osFetch(`/time${params}`),
    create: (data) => osFetch('/time', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => osFetch(`/time/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => osFetch(`/time/${id}`, { method: 'DELETE' }),
    start: (data) => osFetch('/time/start', { method: 'POST', body: JSON.stringify(data) }),
    stop: (id) => osFetch(`/time/stop/${id}`, { method: 'POST' }),
    running: () => osFetch('/time/running'),
    summary: (params = '') => osFetch(`/time/summary${params}`),
  },

  // Learning
  learning: {
    list: (params = '') => osFetch(`/learning${params}`),
    create: (data) => osFetch('/learning', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => osFetch(`/learning/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => osFetch(`/learning/${id}`, { method: 'DELETE' }),
    skills: () => osFetch('/learning/skills'),
    stats: (params = '') => osFetch(`/learning/stats${params}`),
    topics: (skillId) => osFetch(`/learning/topics${skillId ? `?skillId=${skillId}` : ''}`),
    createTopic: (data) => osFetch('/learning/topics', { method: 'POST', body: JSON.stringify(data) }),
    toggleTopic: (id) => osFetch(`/learning/topics/${id}/toggle`, { method: 'PATCH' }),
    removeTopic: (id) => osFetch(`/learning/topics/${id}`, { method: 'DELETE' }),
  },

  // Analytics + plan + predictions + dashboard + AI
  analytics: {
    daily: (date) => osFetch(`/analytics/daily${date ? `?date=${date}` : ''}`),
    weekly: (date) => osFetch(`/analytics/weekly${date ? `?date=${date}` : ''}`),
    monthly: (date) => osFetch(`/analytics/monthly${date ? `?date=${date}` : ''}`),
    yearly: (year) => osFetch(`/analytics/yearly${year ? `?year=${year}` : ''}`),
    planVsActual: () => osFetch('/analytics/plan-vs-actual'),
    plan: () => osFetch('/analytics/plan'),
    updatePlan: (category, data) => osFetch(`/analytics/plan/${category}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  predictions: {
    trajectory: (goalId) => osFetch(`/predictions/trajectory/${goalId}`),
    all: () => osFetch('/predictions/trajectory'),
  },
  dashboard: () => osFetch('/dashboard'),
  insights: {
    ask: (question) => osFetch('/insights/ask', { method: 'POST', body: JSON.stringify({ question }) }),
  },

  // Skills (shared with public)
  skills: {
    list: () => osFetch('/skills?all=1'),
    update: (id, data) => osFetch(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Habits / journal
  habits: {
    list: () => osFetch('/habits'),
    create: (data) => osFetch('/habits', { method: 'POST', body: JSON.stringify(data) }),
    toggle: (id, date) => osFetch(`/habits/${id}/toggle?date=${date}`, { method: 'PATCH' }),
    remove: (id) => osFetch(`/habits/${id}`, { method: 'DELETE' }),
  },
  journal: {
    list: () => osFetch('/journal'),
    create: (data) => osFetch('/journal', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => osFetch(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => osFetch(`/journal/${id}`, { method: 'DELETE' }),
  },

  // Auth
  me: () => osFetch('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    osFetch('/auth/change-password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) }),
};
