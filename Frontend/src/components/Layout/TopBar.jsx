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
      className="fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-6 z-50"
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
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-sm tracking-wider text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>
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
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/15 to-primary/15 border border-primary/40 text-primary text-xs font-semibold tracking-wide hover:from-primary/25 hover:to-primary/25 transition-all"
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
                  ? 'bg-muted/60 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono hover:bg-emerald-500/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Recruiter View — the fast path to resume, skills and contact"
        >
          <Bot size={13} />
          HIRE ME
        </motion.button>
        <motion.button
          onClick={toggleTerminal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle terminal"
        >
          <TerminalIcon size={13} />
        </motion.button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted/50"
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
            className="absolute top-14 left-0 right-0 bg-card/98 backdrop-blur-xl border-b border-border p-4 flex flex-col gap-1 lg:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.target)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm ${
                  item.target === '/os'
                    ? 'text-primary font-semibold bg-primary/10'
                    : 'text-foreground hover:bg-muted/50'
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
              className="text-left px-4 py-2.5 rounded-lg text-sm text-emerald-500 bg-emerald-500/10 font-semibold"
            >
              HIRE ME — Recruiter View
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
