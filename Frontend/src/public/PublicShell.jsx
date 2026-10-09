import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import BootSequence from '@/components/BootSequence/BootSequence';
import Terminal from '@/components/Terminal/Terminal';
import FounderAI from '@/components/FounderAI/FounderAI';
import RecruiterMode from '@/components/RecruiterMode/RecruiterMode';
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
  const { state } = useApp();
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
        <BootSequence />
        <ScrollToTop />
        <AnimatePresence>
          {state.bootComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex min-h-screen min-w-0 flex-col"
            >
              <Navbar
                profile={profile}
              />
              <main className="min-w-0 flex-1 pt-14">
                {state.recruiterMode ? (
                  <RecruiterMode />
                ) : (
                  <Suspense fallback={null}>
                    <Outlet />
                  </Suspense>
                )}
              </main>
              <Footer profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* OS extras */}
        <Terminal />
        {site?.ai?.publicEnabled !== false && <FounderAI />}
      </div>
    </PublicSiteProvider>
  );
}
