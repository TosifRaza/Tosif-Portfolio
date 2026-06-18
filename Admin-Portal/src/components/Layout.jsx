import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTachometerAlt,
  FaRocket,
  FaTerminal,
  FaStream,
  FaTrophy,
  FaFilePdf,
  FaEnvelope,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: FaTachometerAlt, end: true, color: 'neon-cyan' },
  { to: '/projects', label: 'Projects', icon: FaRocket, color: 'neon-purple' },
  { to: '/skills', label: 'Skills', icon: FaTerminal, color: 'neon-green' },
  { to: '/timeline', label: 'Timeline', icon: FaStream, color: 'neon-orange' },
  { to: '/achievements', label: 'Achievements', icon: FaTrophy, color: 'neon-teal' },
  { to: '/resume', label: 'Resume', icon: FaFilePdf, color: 'neon-red' },
  { to: '/messages', label: 'Messages', icon: FaEnvelope, color: 'neon-cyan' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/[0.06] glass-strong p-4">
        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-neon-purple/60 animate-spin-slow" />
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan" />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold mono">CMS</div>
          </div>
          <div>
            <div className="font-bold text-sm leading-none">
              FOUNDER <span className="text-neon-purple">CMS</span>
            </div>
            <div className="mono text-[10px] text-muted mt-1">Admin Portal</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isActive
                      ? `bg-${item.color}/15 text-${item.color} border-${item.color}/40`
                      : 'border-transparent text-white/70 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={14} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <div className="text-xs text-white/70 mb-3 px-2">
            <div className="font-semibold">{user?.name}</div>
            <div className="mono text-[10px] text-muted">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neon-red hover:bg-neon-red/10 transition-colors"
          >
            <FaSignOutAlt size={12} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
