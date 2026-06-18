import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope, FaSignInAlt, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@founderos.dev');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.message || 'Login failed. Make sure the backend is running on :5000 with seeded admin user.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-neon-purple/60 animate-spin-slow" />
            <div className="absolute inset-3 rounded-full border-2 border-neon-cyan/40 animate-spin-rev" />
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan animate-pulse-glow" />
          </div>
          <h1 className="text-2xl font-extrabold">
            FOUNDER <span className="text-gradient">OS</span>
          </h1>
          <p className="mono text-xs text-muted mt-2 uppercase tracking-widest">Admin Portal · v4.0</p>
        </div>

        <div className="glass-strong p-8">
          <div className="flex items-center gap-2 mb-6">
            <FaShieldAlt className="text-neon-purple" />
            <h2 className="text-lg font-bold">Secure Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-9"
                  placeholder="admin@founderos.dev"
                />
              </div>
            </div>

            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="mono text-xs text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg px-3 py-2">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <FaSignInAlt size={14} />
              {loading ? 'Authenticating…' : 'Enter Admin Portal'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 mono text-[10px] text-muted text-center">
            <div className="mb-1">Default credentials (for first run):</div>
            <div className="text-white/80">admin@founderos.dev · admin123</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
