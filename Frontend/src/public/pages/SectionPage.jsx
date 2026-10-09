import { Navigate, useParams } from 'react-router-dom';
import { usePublicSite, sectionEnabled } from '../siteContext';
import AboutSection from '@/components/AboutSection/AboutSection';
import TrophyRoom from '@/components/TrophyRoom/TrophyRoom';
import ChronoScroll from '@/components/ChronoScroll/ChronoScroll';
import LaunchControl from '@/components/LaunchControl/LaunchControl';
import GlobalMap from '@/components/GlobalMap/GlobalMap';

// Legacy single-page sections rendered as standalone pages. They keep
// working (now theme-aware after the token migration) and remain fully
// CMS-gated: disable the section in Admin and this route redirects home.
// Each component brings its own header/layout, so no extra header here.
const LEGACY = {
  about: AboutSection,
  products: LaunchControl,
  achievements: TrophyRoom,
  journey: ChronoScroll,
  globalreach: GlobalMap,
};

export default function SectionPage({ sectionKey }) {
  const { site } = usePublicSite();
  const params = useParams();

  const key = sectionKey || params.key || '';
  const Component = LEGACY[key];

  if (!Component) return <Navigate to="/" replace />;
  if (site && !sectionEnabled(site, key)) return <Navigate to="/" replace />;

  return (
    <div className="w-full">
      <Component site={site} />
    </div>
  );
}
