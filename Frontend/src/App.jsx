import { Suspense, lazy, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import BootSequence from '@/components/BootSequence/BootSequence';
import TopBar from '@/components/Layout/TopBar';
import HomePage from '@/components/HomePage/HomePage';
import SkillConstellation from '@/components/SkillConstellation/SkillConstellation';
import MissionDeck from '@/components/MissionDeck/MissionDeck';
import LaunchControl from '@/components/LaunchControl/LaunchControl';
import ChronoScroll from '@/components/ChronoScroll/ChronoScroll';
import RecruiterMode from '@/components/RecruiterMode/RecruiterMode';
import TrophyRoom from '@/components/TrophyRoom/TrophyRoom';
import ContactPortal from '@/components/ContactPortal/ContactPortal';
import AboutSection from '@/components/AboutSection/AboutSection';
import ExperienceSection from '@/components/ExperienceSection/ExperienceSection';
import ResumeSection from '@/components/ResumeSection/ResumeSection';
import GlobalMap from '@/components/GlobalMap/GlobalMap';
import Terminal from '@/components/Terminal/Terminal';
import FounderAI from '@/components/FounderAI/FounderAI';
import { useKonamiCode } from '@/hooks/useCustomHooks';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import { Zap } from 'lucide-react';

// Private OS bundle — lazy loaded so public visitors never download it.
const OSApp = lazy(() => import('@/os/OSApp.jsx'));

// ─── Section registry (public mode) ──────────────────────────
const SECTION_COMPONENTS = {
  home: HomePage,
  about: AboutSection,
  experience: ExperienceSection,
  skills: SkillConstellation,
  projects: MissionDeck,
  products: LaunchControl,
  achievements: TrophyRoom,
  journey: ChronoScroll,
  resume: ResumeSection,
  contact: ContactPortal,
  globalreach: GlobalMap,
};

function BootPlaceholder() {
  return (
    <div className="min-h-screen bg-[#06060C] flex items-center justify-center">
      <div className="flex items-center gap-3 text-[#00D4FF] font-mono text-sm">
        <Zap size={16} className="animate-pulse" />
        LOADING TOSIF OS…
      </div>
    </div>
  );
}

function PublicApp() {
  const { state, addEasterEgg } = useApp();
  const { data: site } = useApi(() => api.getSite());

  // Konami code easter egg
  const handleKonami = useCallback(() => {
    addEasterEgg('konami');
    alert('🎮 KONAMI CODE DETECTED!\n\nWelcome to the Founder\'s Secret Room!\n\nFun fact: This portfolio was built with pure passion and 3am coding sessions.');
  }, [addEasterEgg]);
  useKonamiCode(handleKonami);

  const renderSection = () => {
    if (state.recruiterMode) return <RecruiterMode />;

    // Render enabled sections in admin-defined order (default: home)
    const enabled = (site?.sections || [])
      .filter((s) => s.enabled && SECTION_COMPONENTS[s.key])
      .sort((a, b) => a.order - b.order);
    const activeKey = enabled.some((s) => s.key === state.activeSection)
      ? state.activeSection
      : enabled[0]?.key || 'home';
    const Section = SECTION_COMPONENTS[activeKey] || HomePage;
    return <Section site={site} />;
  };

  return (
    <div className="min-h-screen bg-[#06060C]">
      <BootSequence />

      <AnimatePresence>
        {state.bootComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Professional top navigation — recruiter-friendly, CMS-driven */}
            <TopBar site={site} />

            <div className="pt-14">
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
      {site?.ai?.publicEnabled !== false && <FounderAI />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/os/*"
              element={
                <Suspense fallback={<BootPlaceholder />}>
                  <OSApp />
                </Suspense>
              }
            />
            <Route path="/*" element={<PublicApp />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
