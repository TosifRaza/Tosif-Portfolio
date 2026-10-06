import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FaTachometerAlt, FaRocket, FaTerminal, FaStream, FaTrophy, FaFilePdf, FaEnvelope,
  FaSignOutAlt, FaUser, FaPalette, FaInfoCircle, FaBriefcase, FaCubes, FaBullseye,
  FaTasks, FaClipboardList, FaClock, FaGraduationCap, FaChartBar, FaRobot, FaCog,
  FaGlobe,
} from 'react-icons/fa';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: FaTachometerAlt, end: true }],
  },
  {
    label: 'Public Website',
    items: [
      { to: '/profile', label: 'Profile', icon: FaUser },
      { to: '/site', label: 'Hero & Site Config', icon: FaPalette },
      { to: '/about', label: 'About', icon: FaInfoCircle },
      { to: '/experience', label: 'Experience', icon: FaBriefcase },
      { to: '/skills', label: 'Skills', icon: FaTerminal },
      { to: '/projects', label: 'Projects', icon: FaRocket },
      { to: '/products', label: 'Products', icon: FaCubes },
      { to: '/achievements', label: 'Achievements', icon: FaTrophy },
      { to: '/timeline', label: 'Timeline', icon: FaStream },
      { to: '/resume', label: 'Resume', icon: FaFilePdf },
      { to: '/messages', label: 'Messages', icon: FaEnvelope },
    ],
  },
  {
    label: 'Personal OS',
    items: [
      { to: '/goals', label: 'Goals', icon: FaBullseye },
      { to: '/tasks', label: 'Tasks', icon: FaTasks },
      { to: '/activities', label: 'Activities', icon: FaClipboardList },
      { to: '/time', label: 'Time Entries', icon: FaClock },
      { to: '/learning', label: 'Learning', icon: FaGraduationCap },
    ],
  },
  {
    label: 'Analytics',
    items: [{ to: '/analytics', label: 'Analytics', icon: FaChartBar }],
  },
  {
    label: 'AI & Settings',
    items: [
      { to: '/ai', label: 'AI Configuration', icon: FaRobot },
      { to: '/settings', label: 'Settings', icon: FaCog },
    ],
  },
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
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/[0.06] glass-strong p-4 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-neon-purple/60 animate-spin-slow" />
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan" />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold mono">OS</div>
          </div>
          <div>
            <div className="font-bold text-sm leading-none">
              TOSIF OS <span className="text-neon-purple">CONTROL</span>
            </div>
            <div className="mono text-[10px] text-muted mt-1">Admin Control Center</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <div className="mono text-[9px] uppercase tracking-widest text-muted px-3 py-1.5">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                        isActive
                          ? 'bg-neon-purple/15 text-neon-purple border-neon-purple/40'
                          : 'border-transparent text-white/70 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={13} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
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
