import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Zap, Heart } from 'lucide-react';
import { usePublicSite, targetToPath } from './siteContext';

export default function Footer({ profile }) {
  const { site } = usePublicSite();
  const year = new Date().getFullYear();
  const name = profile?.name || site?.hero?.heading || 'Tosif Raza';

  const navItems = (site?.nav || [])
    .filter((n) => n.enabled && n.scope !== 'os' && n.target !== '/os')
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  const socials = [
    { icon: Github, url: profile?.socials?.github, label: 'GitHub' },
    { icon: Linkedin, url: profile?.socials?.linkedin, label: 'LinkedIn' },
    { icon: Twitter, url: profile?.socials?.twitter, label: 'Twitter' },
    { icon: Mail, url: profile?.email ? `mailto:${profile.email}` : '', label: 'Email' },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-sm text-muted-foreground">
              © {year} {name}. Built with <Heart size={11} className="inline text-red-500 fill-red-500 -mt-0.5" /> and code.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={targetToPath(item.target)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        {site?.footer?.text && (
          <p className="mt-6 text-center text-[11px] text-muted-foreground/70">{site.footer.text}</p>
        )}
      </div>
    </footer>
  );
}
