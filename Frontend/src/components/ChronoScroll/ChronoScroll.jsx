import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { api } from "@/utils/api";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Journey category colours — driven by the CMS `category` field.
const CATEGORY_COLORS = {
  career: "#00D4FF",
  learning: "#7C6AFF",
  product: "#FF6B9D",
  achievement: "#FFB800",
  project: "#00FF88",
  personal: "#a78bfa",
};
const CATEGORY_LABELS = {
  career: "Career",
  learning: "Learning",
  product: "Products",
  achievement: "Achievements",
  project: "Projects",
  personal: "Personal",
};

/**
 * JOURNEY (was Chrono Scroll) — horizontal GSAP timeline over the
 * database-driven Timeline collection. Events the admin hides disappear here.
 */
export default function ChronoScroll() {
  const { data: events, loading } = useApi(() => api.getTimeline());
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const timelineEvents = events || [];

  useEffect(() => {
    if (!scrollRef.current || !containerRef.current || timelineEvents.length === 0) return;

    const ctx = gsap.context(() => {
      const scrollWidth = scrollRef.current.scrollWidth - containerRef.current.clientWidth;
      if (scrollWidth <= 0) return;

      gsap.to(scrollRef.current, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [timelineEvents.length]);

  const usedCategories = [...new Set(timelineEvents.map((e) => e.category || "career"))];

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden" id="journey">
      <div className="p-6 pt-16 pb-0">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={slideUp}>
            <div className="mono text-xs text-[#FFB800] tracking-[0.3em] mb-1">// LIFE_TIMELINE</div>
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Journey</h2>
            <p className="text-sm text-text-secondary">Scroll to travel through time</p>
          </motion.div>

          {/* Category Legend */}
          <motion.div variants={staggerItem} className="flex flex-wrap gap-4 mt-4 mb-8">
            {usedCategories.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[key] }} />
                <span className="text-xs text-text-secondary">{CATEGORY_LABELS[key] || key}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {loading && (
        <div className="p-6 text-sm text-text-muted mono">Loading timeline from database…</div>
      )}

      {/* Horizontal scroll area */}
      {timelineEvents.length > 0 && (
        <div ref={scrollRef} className="flex gap-8 px-6 py-8" style={{ width: `${timelineEvents.length * 500}px` }}>
          {timelineEvents.map((event, i) => (
            <motion.div
              key={event._id || event.year}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="w-[400px] flex-shrink-0"
            >
              {/* Year */}
              <div className="text-6xl font-heading font-bold mb-4" style={{ color: CATEGORY_COLORS[event.category] || "#00D4FF", opacity: 0.3 }}>
                {event.year}
              </div>

              {/* Card */}
              <div className="glass rounded-xl p-5 border-l-2" style={{ borderLeftColor: CATEGORY_COLORS[event.category] || "#00D4FF" }}>
                <h3 className="text-lg font-heading font-bold text-text-primary mb-2">{event.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{event.description}</p>

                {event.image && (
                  <img src={event.image} alt={event.title} className="w-full rounded-lg mb-3 border border-white/[0.06]" />
                )}
              </div>

              {/* Connection line to next */}
              {i < timelineEvents.length - 1 && (
                <div className="flex items-center mt-6 ml-4">
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
                  <motion.div
                    className="w-3 h-3 rounded-full border-2 border-purple-500/30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
