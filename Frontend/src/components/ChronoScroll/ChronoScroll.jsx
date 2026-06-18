import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { timelineEvents, categoryColors, categoryLabels, } from "@/data/timeline";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ChronoScroll() {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const scrollWidth = scrollRef.current.scrollWidth - containerRef.current.clientWidth;

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
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      <div className="p-6 pb-0">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={slideUp}>
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Chrono Scroll</h2>
            <p className="text-sm text-text-secondary">Scroll to travel through time</p>
          </motion.div>

          {/* Category Legend */}
          <motion.div variants={staggerItem} className="flex gap-4 mt-4 mb-8">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: categoryColors[key ] }} />
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Horizontal scroll area */}
      <div ref={scrollRef} className="flex gap-8 px-6 py-8" style={{ width: `${timelineEvents.length * 500}px` }}>
        {timelineEvents.map((event, i) => (
          <motion.div
            key={event.year}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            className="w-[400px] flex-shrink-0"
          >
            {/* Year */}
            <div className="text-6xl font-heading font-bold mb-4" style={{ color: categoryColors[event.category], opacity: 0.3 }}>
              {event.year}
            </div>

            {/* Card */}
            <div className="glass rounded-xl p-5 border-l-2" style={{ borderLeftColor: categoryColors[event.category] }}>
              <h3 className="text-lg font-heading font-bold text-text-primary mb-2">{event.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{event.description}</p>

              {/* Milestones */}
              <div className="space-y-2">
                {event.milestones.map((milestone, mi) => (
                  <motion.div
                    key={mi}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 + mi * 0.1 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: categoryColors[event.category] }} />
                    {milestone}
                  </motion.div>
                ))}
              </div>

              {/* Skills */}
              {event.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/[0.04]">
                  {event.skills.map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-text-muted">
                      {skill}
                    </span>
                  ))}
                </div>
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
    </div>
  );
}
