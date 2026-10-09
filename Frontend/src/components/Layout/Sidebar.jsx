import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { SECTION_IDS } from "@/utils/constants";
import {
  Crosshair, Globe, Sparkles, LayoutGrid, Rocket, Clock,
  Target, Trophy, Send, Terminal, Bot
} from "lucide-react";

const iconMap = {
  crosshair: <Crosshair size={20} />,
  globe: <Globe size={20} />,
  sparkles: <Sparkles size={20} />,
  "layout-grid": <LayoutGrid size={20} />,
  rocket: <Rocket size={20} />,
  clock: <Clock size={20} />,
  target: <Target size={20} />,
  trophy: <Trophy size={20} />,
  send: <Send size={20} />,
};

export default function Sidebar() {
  const { state, setActiveSection, toggleTerminal, toggleAI, toggleRecruiterMode } = useApp();

  return (
    <motion.aside
      className="fixed left-0 top-0 bottom-0 w-[72px] bg-background border-r border-border flex flex-col items-center py-4 z-10"
      initial={{ x: -72 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <motion.div
        className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-6 cursor-pointer"
        whileHover={{ scale: 1.1, borderColor: "rgba(59, 130, 246, 0.6)" }}
        onClick={() => setActiveSection("mission")}
      >
        <span className="text-purple-400 font-bold font-mono text-sm">OS</span>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {SECTION_IDS.map((section) => {
          const isActive = state.activeSection === section.id;
          const isRecruiter = section.id === "recruiter";

          return (
            <motion.button
              key={section.id}
              onClick={() => {
                if (isRecruiter) {
                  toggleRecruiterMode();
                } else {
                  setActiveSection(section.id);
                }
              }}
              className="relative w-11 h-11 rounded-lg flex items-center justify-center transition-colors group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-purple-500"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Glow bg on active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-purple-500/10"
                  layoutId="activeBg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <span className={`relative z-10 ${isActive ? "text-purple-400" : "text-text-secondary group-hover:text-text-primary"}`}>
                {iconMap[section.icon]}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 px-2 py-1 rounded bg-muted/70 backdrop-blur-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border">
                {section.label}
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        {/* Terminal button */}
        <motion.button
          onClick={toggleTerminal}
          className="w-11 h-11 rounded-lg flex items-center justify-center text-text-secondary hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Terminal (Ctrl+`)"
        >
          <Terminal size={18} />
        </motion.button>

        {/* AI button */}
        <motion.button
          onClick={toggleAI}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
            state.aiOpen ? "text-purple-400 bg-purple-500/10" : "text-text-secondary hover:text-purple-400 hover:bg-purple-500/10"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Founder AI"
        >
          <Bot size={18} />
        </motion.button>
      </div>
    </motion.aside>
  );
}
