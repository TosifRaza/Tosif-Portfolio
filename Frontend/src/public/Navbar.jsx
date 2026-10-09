import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal as TerminalIcon, Bot, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePublicSite, sectionEnabled, targetToPath } from './siteContext';
import ThemeToggle from './ThemeToggle';
import ProfilePhoto from './ProfilePhoto';

function Logo({ name, profile }) {
  return (
    <>
      <ProfilePhoto profile={profile} name={name} className="w-8 h-8 rounded-lg shadow-[0_0_16px_hsl(var(--primary)/0.4)] text-[10px]" />
      <span className="min-w-0 max-w-[38vw] truncate font-semibold text-[15px] text-foreground sm:max-w-none">{name || 'Tosif Raza'}</span>
    </>
  );
}

/**
 * Professional navbar — reference-style: logo + CMS-driven links + theme
 * toggle + subtle OS extras (HIRE ME recruiter view, terminal easter egg,
 * ENTER TOSIF OS gateway). Labels/order come from SiteConfig.nav.
 */
export default function Navbar({ profile }) {
  const { site } = usePublicSite();
  const { state, toggleTerminal, toggleRecruiterMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navItems = (site?.nav || [])
    .filter((n) => n.enabled && n.scope !== 'os')
    .filter((n) => String(n.label || '').trim().toLowerCase() !== 'about')
    .filter((n) => targetToPath(n.target).toLowerCase() !== '/about')
    .filter((n) => String(n.label || '').trim().toLowerCase() !== 'home')
    .filter((n) => targetToPath(n.target) !== '/')
    .filter((n) => n.target === '/os' || sectionEnabled(site, n.target))
    .sort((a, b) => a.order - b.order);

  const isAchievements = (item) =>
    targetToPath(item.target).toLowerCase() === '/achievements' ||
    String(item.label || '').trim().toLowerCase() === 'achievements';
  const isEngineeringLab = (item) =>
    targetToPath(item.target).toLowerCase() === '/engineering-lab' ||
    String(item.label || '').trim().toLowerCase() === 'engineering lab';
  const labIndex = navItems.findIndex(isEngineeringLab);
  const achievementsIndex = navItems.findIndex(isAchievements);
  if (labIndex !== -1 && achievementsIndex !== -1 && labIndex !== achievementsIndex + 1) {
    const [engineeringLab] = navItems.splice(labIndex, 1);
    navItems.splice(navItems.findIndex(isAchievements) + 1, 0, engineeringLab);
  }

  const linkCls = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
      isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  const handleNavigation = () => {
    if (state.recruiterMode) toggleRecruiterMode();
  };

  return (
    <motion.header
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 sm:px-6 border-b transition-colors duration-300 ${
        scrolled ? 'bg-background/85 backdrop-blur-xl border-border' : 'bg-background/60 backdrop-blur-md border-transparent'
      }`}
    >
      {/* Left: identity */}
      <Link to="/" onClick={handleNavigation} className="flex min-w-0 items-center gap-2.5" aria-label="Home">
        <Logo name={profile?.name || site?.hero?.heading || 'Tosif Raza'} profile={profile} />
      </Link>

      {/* Center: CMS-driven links (desktop) */}
      <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
        {navItems.map((item) =>
          item.target === '/os' ? (
            <button
              key={item.label}
              onClick={() => { handleNavigation(); navigate('/os'); }}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/40 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
            >
              <Zap size={12} />
              {item.label || 'Enter TOSIF OS'}
            </button>
          ) : (
            <NavLink key={item.label} to={targetToPath(item.target)} end={targetToPath(item.target) === '/'} onClick={handleNavigation} className={linkCls}>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleRecruiterMode}
          className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          aria-label="Recruiter view"
          title="Recruiter View — the fast path to resume, skills and contact"
        >
          <Bot size={16} />
        </button>
        <button
          onClick={toggleTerminal}
          className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          aria-label="Toggle terminal"
          title="Terminal"
        >
          <TerminalIcon size={16} />
        </button>
        <ThemeToggle />
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
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
            transition={{ duration: 0.18 }}
            className="absolute top-14 left-0 right-0 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain bg-background/98 backdrop-blur-xl border-b border-border p-4 flex flex-col gap-1 lg:hidden shadow-xl"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) =>
              item.target === '/os' ? (
                <button
                  key={item.label}
                  onClick={() => { setMenuOpen(false); handleNavigation(); navigate('/os'); }}
                  className="text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-primary bg-primary/10 flex items-center gap-2"
                >
                  <Zap size={13} /> {item.label || 'Enter TOSIF OS'}
                </button>
              ) : (
                <NavLink
                  key={item.label}
                  to={targetToPath(item.target)}
                  end={targetToPath(item.target) === '/'}
                  onClick={() => { setMenuOpen(false); handleNavigation(); }}
                  className={({ isActive }) =>
                    `text-left px-4 py-2.5 rounded-lg text-sm ${
                      isActive ? 'text-primary bg-primary/10 font-medium' : 'text-foreground/80 hover:bg-muted'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
