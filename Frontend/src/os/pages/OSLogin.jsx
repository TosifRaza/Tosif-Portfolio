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
    <div className="min-h-screen bg-[#06060C] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C6AFF] to-[#00D4FF] flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              TOSIF OS
            </div>
            <div className="text-[10px] text-[#4A4A5E] mono tracking-widest">PRIVATE MODE · AUTH REQUIRED</div>
          </div>
        </div>

        <div className="h-1 w-full bg-white/[0.05] rounded-full mt-4 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7C6AFF] to-[#00FF88]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2 }}
          />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-[#8B8B9F] mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A5E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-sm text-[#E8E8F0] placeholder-[#4A4A5E] focus:outline-none focus:border-[#00D4FF]/50"
                placeholder="you@yourdomain.com"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-[#8B8B9F] mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A5E]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-sm text-[#E8E8F0] placeholder-[#4A4A5E] focus:outline-none focus:border-[#00D4FF]/50"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-[#FF3366] bg-[#FF3366]/10 border border-[#FF3366]/25 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#7C6AFF] to-[#00D4FF] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING…' : 'ENTER TOSIF OS'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <a href="/" className="text-[11px] text-[#6B6B80] hover:text-[#00D4FF] transition-colors">
            ← Back to public portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
