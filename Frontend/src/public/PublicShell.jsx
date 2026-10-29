import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
const Terminal = lazy(() => import('@/components/Terminal/Terminal'));
const FounderAI = lazy(() => import('@/components/FounderAI/FounderAI'));
const RecruiterMode = lazy(() => import('@/components/RecruiterMode/RecruiterMode'));
import Navbar from './Navbar';
import Footer from './Footer';
import { PublicSiteProvider } from './siteContext';
import { getProfilePhotoSources } from './ProfilePhoto';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

/**
 * Public site shell — boot sequence → navbar + routed pages + footer,
 * with the OS extras layered on top (terminal, AI assistant, recruiter view).
 */
export default function PublicShell() {
  const { state, dispatch } = useApp();
  const [terminalLoaded, setTerminalLoaded] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);
  useEffect(() => {
    if (state.terminalOpen) setTerminalLoaded(true);
    if (state.aiOpen) setAiLoaded(true);
  }, [state.terminalOpen, state.aiOpen]);
  useEffect(() => {
    const shortcut = (event) => {
      if (event.ctrlKey && event.key === '`') {
        event.preventDefault();
        dispatch({ type: 'TOGGLE_TERMINAL' });
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [dispatch]);
  const { data: site } = useApi(() => api.getSite());
  const { data: profile } = useApi(() => api.getProfile());
  const profilePhoto = getProfilePhotoSources(profile);

  useEffect(() => {
    if (!profilePhoto.primary) return;
    const image = new Image();
    image.fetchPriority = 'high';
    image.src = profilePhoto.primary;
  }, [profilePhoto.primary]);

  return (
    <PublicSiteProvider site={site} profile={profile}>
      <div className="min-h-screen w-full min-w-0 bg-background text-foreground flex flex-col overflow-x-clip">
        <ScrollToTop />
        <AnimatePresence>
          {(
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex min-h-screen min-w-0 flex-col"
            >
              <Navbar
                profile={profile}
              />
              <main className="min-w-0 flex-1 pt-14">
                <Suspense fallback={<div className="p-8 text-muted-foreground" role="status">Loading page…</div>}>
                {state.recruiterMode ? (
                  <RecruiterMode />
                ) : (
                    <Outlet />
                )}
                </Suspense>
              </main>
              <Footer profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* OS extras */}
        <Suspense fallback={null}>
          {(terminalLoaded || state.terminalOpen) && <Terminal />}
          {site?.ai?.publicEnabled !== false && (aiLoaded || state.aiOpen) && <FounderAI />}
        </Suspense>
      </div>
    </PublicSiteProvider>
  );
}
