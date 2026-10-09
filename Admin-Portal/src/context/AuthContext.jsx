import { createContext, useContext, useEffect, useState } from 'react';
import { api, AUTH_EXPIRED_EVENT } from '../utils/api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'founder_os_admin_token';
const USER_KEY = 'founder_os_admin_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate stored token on mount
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.me(token);
        setUser(res.user);
      } catch {
        // Token expired / invalid
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    const expireSession = () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expireSession);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem(STORAGE_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
