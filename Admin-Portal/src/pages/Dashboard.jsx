import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaRocket, FaTerminal, FaStream, FaTrophy, FaEnvelope,
  FaCubes, FaBriefcase, FaBullseye, FaCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.stats(token);
        setStats(s);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const cards = [
    { label: 'Projects', value: stats?.projects ?? '—', to: '/projects', icon: FaRocket, color: 'neon-purple' },
    { label: 'Products', value: stats?.products ?? '—', to: '/products', icon: FaCubes, color: 'neon-teal' },
    { label: 'Experience', value: stats?.experience ?? '—', to: '/experience', icon: FaBriefcase, color: 'neon-orange' },
    { label: 'Active Goals', value: stats?.goals ?? '—', to: '/goals', icon: FaBullseye, color: 'neon-green' },
    { label: 'Skills', value: stats?.skills ?? '—', to: '/skills', icon: FaTerminal, color: 'neon-green' },
    { label: 'Timeline', value: stats?.timeline ?? '—', to: '/timeline', icon: FaStream, color: 'neon-orange' },
    { label: 'Achievements', value: stats?.achievements ?? '—', to: '/achievements', icon: FaTrophy, color: 'neon-teal' },
    {
      label: 'Messages',
      value: stats?.messages ?? '—',
      to: '/messages',
      icon: FaEnvelope,
      color: 'neon-cyan',
      badge: stats?.unread > 0 ? `${stats.unread} new` : null,
    },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mono text-xs text-neon-purple uppercase tracking-widest mb-2">
          // Dashboard
        </div>
        <h1 className="text-3xl font-extrabold mb-2">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Admin'}</span>
        </h1>
        <p className="text-white/60 text-sm">
          Manage every aspect of the Founder OS portfolio from this control panel.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-10">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={c.to}
                className={`glass p-5 rounded-2xl block hover:border-${c.color}/40 transition-colors relative`}
              >
                {c.badge && (
                  <span className="absolute -top-2 -right-2 badge border-neon-red/40 text-neon-red bg-neon-red/10">
                    {c.badge}
                  </span>
                )}
                <Icon className={`text-${c.color} mb-3`} size={20} />
                <div className="text-3xl font-bold">{c.value}</div>
                <div className="mono text-[10px] text-muted uppercase tracking-widest mt-1">
                  {c.label}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="glass p-6 rounded-2xl mt-8">
        <div className="flex items-center gap-2 mb-4">
          <FaCircle className="text-neon-green animate-pulse" size={10} />
          <h3 className="font-semibold">System Status</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="mono text-[10px] text-muted uppercase mb-1">Backend</div>
            <div className="flex items-center gap-2 text-neon-green">
              <FaCircle size={6} /> Operational
            </div>
          </div>
          <div>
            <div className="mono text-[10px] text-muted uppercase mb-1">MongoDB</div>
            <div className="flex items-center gap-2 text-neon-green">
              <FaCircle size={6} /> Connected
            </div>
          </div>
          <div>
            <div className="mono text-[10px] text-muted uppercase mb-1">JWT Auth</div>
            <div className="flex items-center gap-2 text-neon-green">
              <FaCircle size={6} /> Active
            </div>
          </div>
          <div>
            <div className="mono text-[10px] text-muted uppercase mb-1">User Role</div>
            <div className="mono text-neon-purple uppercase">{user?.role || 'admin'}</div>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl mt-6">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/projects" className="btn-ghost">+ New Project</Link>
          <Link to="/skills" className="btn-ghost">+ New Skill</Link>
          <Link to="/timeline" className="btn-ghost">+ Timeline Entry</Link>
          <Link to="/achievements" className="btn-ghost">+ Achievement</Link>
          <Link to="/resume" className="btn-ghost">↑ Upload Resume</Link>
        </div>
      </div>
    </div>
  );
}
