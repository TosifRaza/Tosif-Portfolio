// TOSIF OS — private mode auth helpers.
// The JWT lives in localStorage; osFetch adds it and handles 401 globally.

const TOKEN_KEY = 'tosif_os_token';
const USER_KEY = 'tosif_os_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function osFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...opts, headers });
  if (res.status === 401) {
    clearSession();
    window.location.href = '/os/login';
    throw new Error('Session expired — please log in again');
  }
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message || msg;
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json();
}
