import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Mail } from 'lucide-react';
import { apiUrl } from '@/utils/api';

/**
 * OS LOGIN — the gate to private mode.
 * No credentials are prefilled or printed anywhere (security fix).
 */
export default function OSLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Login failed');
      localStorage.setItem('tosif_os_token', body.token);
      localStorage.setItem('tosif_os_user', JSON.stringify(body.user));
      if (onLogin) onLogin(); // flips auth state in the same React tree
      else navigate('/os');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>
              TOSIF OS
            </div>
            <div className="text-[10px] text-muted-foreground mono tracking-widest">PRIVATE MODE · AUTH REQUIRED</div>
          </div>
        </div>

        <div className="h-1 w-full bg-muted/50 rounded-full mt-4 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-emerald-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2 }}
          />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="you@yourdomain.com"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-cyan-400 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING…' : 'ENTER TOSIF OS'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <a href="/" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
            ← Back to public portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
