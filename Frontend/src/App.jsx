import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import BootSequence from '@/components/BootSequence/BootSequence';
import HomePage from '@/components/HomePage/HomePage';
import MissionHub from '@/components/MissionHub/MissionHub';
import SkillConstellation from '@/components/SkillConstellation/SkillConstellation';
import MissionDeck from '@/components/MissionDeck/MissionDeck';
import LaunchControl from '@/components/LaunchControl/LaunchControl';
import ChronoScroll from '@/components/ChronoScroll/ChronoScroll';
import RecruiterMode from '@/components/RecruiterMode/RecruiterMode';
import FounderAI from '@/components/FounderAI/FounderAI';
import TrophyRoom from '@/components/TrophyRoom/TrophyRoom';
import ContactPortal from '@/components/ContactPortal/ContactPortal';
import Terminal from '@/components/Terminal/Terminal';
import GlobalMap from '@/components/GlobalMap/GlobalMap';
import Sidebar from '@/components/Layout/Sidebar';
import { useKonamiCode } from '@/hooks/useCustomHooks';

function DashboardContent() {
  const { state, addEasterEgg } = useApp();

  // Konami code easter egg
  const handleKonami = useCallback(() => {
    addEasterEgg('konami');
    alert('🎮 KONAMI CODE DETECTED!\n\nWelcome to the Founder\'s Secret Room!\n\nFun fact: This portfolio was built with pure passion and 3am coding sessions.');
  }, [addEasterEgg]);
  useKonamiCode(handleKonami);

  const renderSection = () => {
    if (state.recruiterMode) return <RecruiterMode />;

    switch (state.activeSection) {
      case 'home':
        return <HomePage />;
      case 'mission':
        return <MissionHub />;
      case 'globe':
        return <GlobalMap />;
      case 'skills':
        return <SkillConstellation />;
      case 'projects':
        return <MissionDeck />;
      case 'startup':
        return <LaunchControl />;
      case 'timeline':
        return <ChronoScroll />;
      case 'achievements':
        return <TrophyRoom />;
      case 'contact':
        return <ContactPortal />;
      default:
        return <HomePage />;
    }
  };

  // HomePage and MissionHub render their own inline sidebars (richer with labels + shortcuts).
  // On every other section we show the shared global Sidebar so navigation never breaks.
  const sectionsWithOwnSidebar = new Set(['home', 'mission']);
  const showGlobalSidebar =
    state.bootComplete &&
    // !state.recruiterMode &&
    !sectionsWithOwnSidebar.has(state.activeSection);

  return (
    <div className="min-h-screen bg-[#06060C]">
      {/* Boot Sequence */}
      <BootSequence />

      {/* Main Dashboard */}
      <AnimatePresence>
        {state.bootComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Global icon-rail sidebar — shown on every section that doesn't
                ship its own inline sidebar. Ensures navigation never breaks. */}
            {showGlobalSidebar && <Sidebar />}

            {/* Main content — pad-left on sections that rely on the global sidebar */}
            <div className={showGlobalSidebar ? 'pl-[72px]' : ''}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.recruiterMode ? 'recruiter' : state.activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Components */}
      <Terminal />
      <FounderAI />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <DashboardContent />
      </AppProvider>
    </ThemeProvider>
  );
}
