import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import PublicShell from '@/public/PublicShell';
import HomePage from '@/public/pages/HomePage';
import ProjectsPage from '@/public/pages/ProjectsPage';
import SkillsPage from '@/public/pages/SkillsPage';
import ExperiencePage from '@/public/pages/ExperiencePage';
import EngineeringLabPage from '@/public/pages/EngineeringLabPage';
import ResumePage from '@/public/pages/ResumePage';
import ContactPage from '@/public/pages/ContactPage';
import SectionPage from '@/public/pages/SectionPage';

// Private OS bundle — lazy loaded so public visitors never download it.
const OSApp = lazy(() => import('@/os/OSApp.jsx'));

function BootPlaceholder() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-3 text-primary font-mono text-sm">
        <Zap size={16} className="animate-pulse" />
        LOADING TOSIF OS…
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center w-full">
      <p className="font-mono text-6xl font-bold text-primary/40">404</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist or is not published.</p>
      <a href="/" className="mt-6 inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Back to Home
      </a>
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
            <Route path="/" element={<PublicShell />}>
              <Route index element={<HomePage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="experience" element={<ExperiencePage />} />
              <Route path="engineering-lab" element={<EngineeringLabPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="contact" element={<ContactPage />} />
              {/* CMS-gated legacy sections */}
              <Route path="about" element={<SectionPage sectionKey="about" />} />
              <Route path="products" element={<SectionPage sectionKey="products" />} />
              <Route path="achievements" element={<SectionPage sectionKey="achievements" />} />
              <Route path="journey" element={<SectionPage sectionKey="journey" />} />
              <Route path="globalreach" element={<SectionPage sectionKey="globalreach" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
