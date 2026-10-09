import { motion } from 'framer-motion';
import { MapPin, Sparkles, Globe2, Clock3 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';
import { profile as fallbackProfile } from '@/data/profile';
import { staggerContainer, staggerItem } from '@/utils/animations';

/**
 * ABOUT — professional summary driven by the CMS:
 * Profile singleton (bio) + AboutContent singleton (paragraphs/highlights/values).
 * Global Reach lives here as a secondary block (not a primary nav item).
 */
export default function AboutSection({ site }) {
  const { data: profile } = useApi(() => api.getProfile());
  const { data: about, loading } = useApi(() => api.getAbout());

  const p = profile || fallbackProfile;
  const paragraphs = about?.paragraphs?.length ? about.paragraphs : [p.shortBio];
  const highlights = about?.highlights || [];
  const values = about?.values || [];
  const globalReach = site?.globalReach || [];

  return (
    <section className="min-h-screen px-4 sm:px-8 lg:px-16 py-12 sm:py-16" id="about">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div variants={staggerItem} className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>
            Who I Am
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Bio */}
          <motion.div variants={staggerItem} className="lg:col-span-3 space-y-5">
            {loading ? (
              <div className="glass rounded-xl p-6 animate-pulse h-40" />
            ) : (
              paragraphs.map((text, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
                  {text}
                </p>
              ))
            )}

            {/* Values */}
            {values.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                {values.map((v, i) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="text-sm font-semibold text-primary mb-1">{v.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{v.description}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Side panel */}
          <motion.div variants={staggerItem} className="lg:col-span-2 space-y-4">
            <div className="glass rounded-xl p-6">
              <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>
                {p.name}
              </div>
              <div className="text-sm text-primary mt-1">{p.title || p.roles?.join(' · ')}</div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-primary" />
                  {p.location || 'Earth'}
                </div>
                {p.availability?.status && (
                  <div className="flex items-center gap-2">
                    <Clock3 size={13} className="text-emerald-500" />
                    {p.availability.status} · {p.availability.type}
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            {highlights.slice(0, 5).map((h, i) => (
              <div key={i} className="glass glass-hover rounded-xl p-4 flex gap-3">
                <Sparkles size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">{h.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{h.description}</div>
                </div>
              </div>
            ))}

            {/* Global Reach — demoted secondary block */}
            {globalReach.length > 0 && (
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs mono text-primary tracking-widest mb-3">
                  <Globe2 size={13} /> GLOBAL REACH
                </div>
                <div className="space-y-2">
                  {globalReach.map((g, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      <span className="text-foreground font-medium">{g.region}</span>
                      {g.note ? <span className="text-muted-foreground"> — {g.note}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
