import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Zap, Terminal as TerminalIcon, Menu, X, Bot } from 'lucide-react';

/**
 * Professional top navigation — the recruiter path.
 * Labels + order come from the SiteConfig CMS (`site.nav`); system-critical
 * behaviour (ENTER TOSIF OS → /os) stays in code.
 */
export default function TopBar({ site }) {
  const { state, setActiveSection, toggleTerminal, toggleRecruiterMode } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = (site?.nav || [])
    .filter((n) => n.enabled && n.scope !== 'os')
    .sort((a, b) => a.order - b.order);

  const handleNavigate = (target) => {
    setMenuOpen(false);
    if (target === '/os') {
      navigate('/os');
      return;
    }
    if (state.recruiterMode) toggleRecruiterMode();
    setActiveSection(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-14 bg-[#0a0e17]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6 z-50"
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: identity */}
      <button
        onClick={() => handleNavigate('home')}
        className="flex items-center gap-3 group"
        aria-label="Go to home"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C6AFF] to-[#00D4FF] flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-sm tracking-wider text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
          {site?.hero?.heading || 'TOSIF OS'}
        </span>
      </button>

      {/* Center: CMS-driven navigation (desktop) */}
      <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
        {navItems.map((item) =>
          item.target === '/os' ? (
            <button
              key={item.label}
              onClick={() => handleNavigate('/os')}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C6AFF]/15 to-[#00D4FF]/15 border border-[#7C6AFF]/40 text-[#9D8AFF] text-xs font-semibold tracking-wide hover:from-[#7C6AFF]/25 hover:to-[#00D4FF]/25 transition-all"
            >
              <Zap size={12} />
              {item.label}
            </button>
          ) : (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.target)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !state.recruiterMode && state.activeSection === item.target
                  ? 'bg-white/[0.06] text-[#00D4FF]'
                  : 'text-[#9B9BAF] hover:text-[#E8E8F0] hover:bg-white/[0.04]'
              }`}
            >
              {item.label}
            </button>
          )
        )}
      </nav>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={toggleRecruiterMode}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-mono hover:bg-[#00FF88]/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Recruiter View — the fast path to resume, skills and contact"
        >
          <Bot size={13} />
          HIRE ME
        </motion.button>
        <motion.button
          onClick={toggleTerminal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C6AFF]/10 border border-[#7C6AFF]/30 text-[#7C6AFF] text-xs font-mono hover:bg-[#7C6AFF]/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle terminal"
        >
          <TerminalIcon size={13} />
        </motion.button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden p-2 rounded-lg text-[#9B9BAF] hover:bg-white/[0.05]"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 left-0 right-0 bg-[#0a0e17]/98 backdrop-blur-xl border-b border-white/[0.06] p-4 flex flex-col gap-1 lg:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.target)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm ${
                  item.target === '/os'
                    ? 'text-[#9D8AFF] font-semibold bg-[#7C6AFF]/10'
                    : 'text-[#C8C8D8] hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                toggleRecruiterMode();
              }}
              className="text-left px-4 py-2.5 rounded-lg text-sm text-[#00FF88] bg-[#00FF88]/10 font-semibold"
            >
              HIRE ME — Recruiter View
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
