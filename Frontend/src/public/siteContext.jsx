import { createContext, useContext } from 'react';

// Site config context — fetched once in PublicShell, shared by all public pages.
const PublicSiteContext = createContext({ site: null, profile: null });

export function PublicSiteProvider({ site, profile, children }) {
  return (
    <PublicSiteContext.Provider value={{ site, profile }}>
      {children}
    </PublicSiteContext.Provider>
  );
}

export function usePublicSite() {
  return useContext(PublicSiteContext);
}

// Section key → route path (single map used by nav, footer and gating)
export const SECTION_PATHS = {
  home: '/',
  about: '/about',
  experience: '/experience',
  skills: '/skills',
  projects: '/projects',
  products: '/products',
  achievements: '/achievements',
  journey: '/journey',
  resume: '/resume',
  contact: '/contact',
  globalreach: '/globalreach',
  engineeringlab: '/engineering-lab',
};

export function sectionEnabled(site, key) {
  if (key === 'home') return true;
  const list = site?.sections || [];
  if (!list.length) return true; // config not loaded yet — don't gate
  const entry = list.find((s) => s.key === key);
  return entry ? entry.enabled !== false : false;
}

export function targetToPath(target) {
  if (!target) return '/';
  if (target.startsWith('/')) return target; // explicit path (e.g. /os)
  return SECTION_PATHS[target] || `/${target}`;
}
