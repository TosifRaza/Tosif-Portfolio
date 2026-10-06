import { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, ListChecks, NotebookPen, Clock3, GraduationCap,
  Cpu, BarChart3, History, Rocket, Trophy, Bot, Settings as SettingsIcon, Zap, LogOut, ArrowLeft,
} from 'lucide-react';
import { getToken, getUser, clearSession } from './osAuth.js';
import OSLogin from './pages/OSLogin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Goals from './pages/Goals.jsx';
import GoalDetail from './pages/GoalDetail.jsx';
import Tasks from './pages/Tasks.jsx';
import DailyLog from './pages/DailyLog.jsx';
import TimePage from './pages/TimePage.jsx';
import Learning from './pages/Learning.jsx';
import SkillsOS from './pages/SkillsOS.jsx';
import Analytics from './pages/Analytics.jsx';
import TimelineOS from './pages/TimelineOS.jsx';
import FounderLab from './pages/FounderLab.jsx';
import AchievementsOS from './pages/AchievementsOS.jsx';
import PersonalAI from './pages/PersonalAI.jsx';
import Settings from './pages/Settings.jsx';

const NAV = [
  { to: '/os', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/os/goals', label: 'Goals', icon: Target },
  { to: '/os/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/os/daily-log', label: 'Daily Log', icon: NotebookPen },
  { to: '/os/time', label: 'Time', icon: Clock3 },
  { to: '/os/learning', label: 'Learning', icon: GraduationCap },
  { to: '/os/skills', label: 'Skills', icon: Cpu },
  { to: '/os/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/os/timeline', label: 'Timeline', icon: History },
  { to: '/os/founder-lab', label: 'Founder Lab', icon: Rocket },
  { to: '/os/achievements', label: 'Achievements', icon: Trophy },
  { to: '/os/ai', label: 'Personal AI', icon: Bot },
  { to: '/os/settings', label: 'Settings', icon: SettingsIcon },
];

function OSShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getUser();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate('/os/login');
  };

  return (
    <div className="min-h-screen bg-[#06060C] flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-white/[0.06] bg-[#0a0e17] sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C6AFF] to-[#00D4FF] flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>TOSIF OS</div>
            <div className="text-[9px] text-[#4A4A5E] mono">PRIVATE MODE</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                  isActive
                    ? 'bg-[#7C6AFF]/15 text-[#9D8AFF] border border-[#7C6AFF]/20'
                    : 'text-[#6B6B80] hover:text-[#E8E8F0] hover:bg-white/[0.03] border border-transparent'
                }`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <div className="px-3 text-[10px] text-[#4A4A5E] mono truncate">
            {user?.email || 'logged in'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-[#6B6B80] hover:text-[#00D4FF] transition-colors"
          >
            <ArrowLeft size={14} /> Public Portfolio
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-[#6B6B80] hover:text-[#FF3366] transition-colors"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-40 h-14 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C6AFF] to-[#00D4FF] flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-[#E8E8F0]">TOSIF OS</span>
          </div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-[10px] mono px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-[#9B9BAF]"
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden sticky top-14 z-40 bg-[#0a0e17] border-b border-white/[0.06] p-3 grid grid-cols-2 gap-1.5">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isActive ? 'bg-[#7C6AFF]/15 text-[#9D8AFF]' : 'text-[#9B9BAF]'}`
                }
              >
                <item.icon size={13} /> {item.label}
              </NavLink>
            ))}
            <button onClick={logout} className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#FF3366]/80">
              <LogOut size={13} /> Log out
            </button>
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}

export default function OSApp() {
  // Auth state is reactive: OSLogin calls onLogin after storing the session,
  // so the shell renders in the same React tree without relying on a
  // localStorage re-read racing the router transition.
  const [authed, setAuthed] = useState(() => !!getToken());

  return (
    <Routes>
      <Route
        path="login"
        element={
          authed ? (
            <Navigate to="/os" replace />
          ) : (
            <OSLogin onLogin={() => setAuthed(true)} />
          )
        }
      />
      <Route
        path="*"
        element={
          authed ? (
            <OSShell>
              <OSRoutes />
            </OSShell>
          ) : (
            <Navigate to="login" replace />
          )
        }
      />
    </Routes>
  );
}

function OSRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="goals" element={<Goals />} />
      <Route path="goals/:id" element={<GoalDetail />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="daily-log" element={<DailyLog />} />
      <Route path="time" element={<TimePage />} />
      <Route path="learning" element={<Learning />} />
      <Route path="skills" element={<SkillsOS />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="timeline" element={<TimelineOS />} />
      <Route path="founder-lab" element={<FounderLab />} />
      <Route path="achievements" element={<AchievementsOS />} />
      <Route path="ai" element={<PersonalAI />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/os" replace />} />
    </Routes>
  );
}
