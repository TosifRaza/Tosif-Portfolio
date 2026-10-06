import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useApi } from "@/hooks/useApi";
import { api } from "@/utils/api";
import { profile as fallbackProfile } from "@/data/profile";
import {
  Code2, GitBranch, Bot, FileDown, ChevronDown, FolderGit2,
  Rocket, ArrowRight, Zap, Trophy, Clock, Package, Activity, Quote,
} from "lucide-react";

// ─── Feature Cards Data (nav targets = new public sections) ───
const featureCards = [
  { icon: GitBranch, title: "PROJECTS", desc: "What I've engineered, end to end", color: "#00D4FF", target: "projects" },
  { icon: Package, title: "PRODUCTS", desc: "Startups and products I'm building", color: "#FF6B9D", target: "products" },
  { icon: Code2, title: "SKILLS", desc: "The stack I use to ship", color: "#7C6AFF", target: "skills" },
  { icon: Clock, title: "JOURNEY", desc: "From learner to founder", color: "#FFB800", target: "journey" },
  { icon: Trophy, title: "ACHIEVEMENTS", desc: "Milestones worth surfacing", color: "#00FF88", target: "achievements" },
  { icon: FileDown, title: "RESUME", desc: "Download the latest CV", color: "#a78bfa", target: "resume" },
];

// ─── Right Sidebar: live system stats (calculated from the database) ───
const statIcons = [FolderGit2, Package, Code2, Activity, Trophy];
const statColors = ["#00D4FF", "#FF6B9D", "#00FF88", "#7C6AFF", "#FFB800"];

function RightSidebar({ stats }) {
  const rows = (stats || []).slice(0, 5).map((s, i) => ({
    icon: statIcons[i % statIcons.length],
    color: statColors[i % statColors.length],
    label: s.label,
    value: `${s.value}`,
  }));

  return (
    <motion.aside
      className="hidden xl:flex fixed right-0 top-14 bottom-0 w-[240px] bg-[#0a0e17] border-l border-white/[0.06] flex-col p-5 z-40 overflow-y-auto"
      initial={{ x: 240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-[#00D4FF]" />
          <h3 className="text-xs font-bold tracking-wider text-[#6B6B80]">LIVE DATABASE STATS</h3>
        </div>
        <div className="space-y-3">
          {rows.map((metric, i) => {
            const IconComp = metric.icon;
            return (
              <motion.div
                key={metric.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08 }}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${metric.color}15`, border: `1px solid ${metric.color}25` }}
                >
                  <IconComp size={14} style={{ color: metric.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[#6B6B80] truncate">{metric.label}</div>
                  <div className="text-sm font-bold" style={{ color: metric.color }}>{metric.value}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="p-4 rounded-xl bg-gradient-to-br from-[#7C6AFF]/10 to-[#00D4FF]/5 border border-[#7C6AFF]/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <Quote size={16} className="text-[#7C6AFF]/50 mb-2" />
        <p className="text-xs leading-relaxed text-[#E8E8F0]/80 italic">
          &quot;Most developers build websites. I build products, businesses, and systems.&quot;
        </p>
        <div className="mt-3 text-[10px] text-[#7C6AFF] font-mono">— TOSIF RAZA</div>
      </motion.div>
    </motion.aside>
  );
}

// ─── Central Visual Element ───
function CentralVisual({ mission }) {
  return (
    <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #7C6AFF, #00D4FF, #00FF88, #FFB800, #FF6B9D, #7C6AFF)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[3px] rounded-full bg-[#0a0e17] flex flex-col items-center justify-center">
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,106,255,0.15) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <span className="text-[10px] tracking-[0.3em] text-[#6B6B80] font-mono mb-1">CURRENT MISSION</span>
        <span
          className="text-sm font-bold text-center px-4 leading-tight"
          style={{ fontFamily: "'Space Grotesk', system-ui" }}
        >
          {mission?.title || "BUILDING WHAT MATTERS"}
        </span>
        <div className="flex items-center gap-1.5 mt-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00FF88]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] font-mono text-[#00FF88]">{mission?.progressLabel || "STATUS: ONGOING"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Cards Component ───
function FeatureCards({ onNavigate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
      {featureCards.map((card, i) => {
        const IconComp = card.icon;
        return (
          <motion.div
            key={card.title}
            className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 + i * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => onNavigate(card.target)}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
              style={{ background: `radial-gradient(ellipse at center, ${card.color}08, transparent 70%)` }}
            />
            <div className="relative z-10">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}
              >
                <IconComp size={20} style={{ color: card.color }} />
              </div>
              <h4
                className="text-sm font-bold tracking-wider mb-1"
                style={{ fontFamily: "'Space Grotesk', system-ui" }}
              >
                {card.title}
              </h4>
              <p className="text-xs text-[#6B6B80]">{card.desc}</p>
              <div
                className="flex items-center gap-1 mt-3 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: card.color }}
              >
                <span>Explore</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Bottom Terminal Component ───
function BottomTerminal({ profile, site }) {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExecute = () => {
    if (!command.trim()) return;
    const cmd = command.trim().toLowerCase();
    let response = "";
    if (cmd === "help") {
      response = "Available commands: help, about, skills, projects, contact, clear";
    } else if (cmd === "about") {
      response = `${profile.name} — ${profile.roles?.join(", ") || profile.title}`;
    } else if (cmd === "skills") {
      response = `MERN + Tailwind + Framer Motion. Full list in the SKILLS section.`;
    } else if (cmd === "projects") {
      response = `Currently working on: ${site?.currentMission?.title || "new things"}`;
    } else if (cmd === "contact") {
      response = `Email: ${profile.email || "via the contact section"} | GitHub: ${profile.socials?.github || "see contact section"}`;
    } else if (cmd === "clear") {
      setOutput([]);
      setCommand("");
      return;
    } else {
      response = `Command not found: ${command}. Type 'help' for available commands.`;
    }
    setOutput((prev) => [...prev, `> ${command}`, response]);
    setCommand("");
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 xl:right-[240px] z-40"
      initial={{ y: 80 }}
      animate={{ y: isExpanded ? 0 : 56 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#0a0e17] border-t border-white/[0.06]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-[#00FF88]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono text-[#00FF88]">SYSTEM ONLINE</span>
          </div>
          <ChevronDown
            size={14}
            className={`text-[#6B6B80] transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-4 pb-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-h-32 overflow-y-auto mb-2 space-y-1">
                {output.map((line, i) => (
                  <div
                    key={i}
                    className={`text-xs font-mono ${line.startsWith("> ") ? "text-[#7C6AFF]" : "text-[#6B6B80]"}`}
                  >
                    {line}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#7C6AFF] text-xs font-mono">&#10095;</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExecute()}
                  placeholder="Type 'help' to see available commands..."
                  className="flex-1 bg-transparent text-xs font-mono text-[#E8E8F0] placeholder-[#4A4A5E] outline-none"
                  autoFocus
                />
                <motion.button
                  onClick={handleExecute}
                  className="px-3 py-1 rounded bg-[#7C6AFF]/20 text-[#7C6AFF] text-xs font-mono hover:bg-[#7C6AFF]/30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  EXECUTE
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main HomePage Component ───
export default function HomePage({ site }) {
  const { setActiveSection, toggleRecruiterMode } = useApp();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const { data: profile } = useApi(() => api.getProfile());
  const { data: stats } = useApi(() => api.getStats());
  const { data: resume } = useApi(() => api.getResume());

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const p = profile || fallbackProfile;
  const hero = site?.hero || {};
  const handleNavigate = (id) => {
    if (id === "/os") {
      navigate("/os");
    } else {
      setActiveSection(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <RightSidebar stats={stats?.stats || []} />

      <main className="xl:mr-[240px] pt-20 pb-24 min-h-screen flex items-center justify-center px-6">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Welcome Section */}
              <div className="text-center mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
                  <span className="text-xs tracking-[0.4em] text-[#6B6B80] font-mono">{hero.badge || "SYSTEM ONLINE"}</span>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-7xl font-black mt-2 mb-4"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui",
                    background: "linear-gradient(135deg, #7C6AFF, #00D4FF, #00FF88)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {hero.heading || p.name}
                </motion.h1>

                <motion.div
                  className="font-mono text-sm md:text-base text-[#6B6B80] mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <span className="text-[#7C6AFF]">&lt; </span>
                  {hero.subtitle || p.title || "Software Engineer & Founder"}
                  <span className="text-[#7C6AFF]"> &gt;</span>
                </motion.div>

                <motion.p
                  className="text-sm text-[#6B6B80] max-w-md mx-auto mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                >
                  Hello, visitor —
                </motion.p>
                <motion.p
                  className="text-sm text-[#E8E8F0] max-w-lg mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  I&apos;m <strong className="text-[#00D4FF]">{p.name}</strong> — {(p.roles || [p.title]).slice(0, 3).join(", ")}.
                </motion.p>
                <motion.p
                  className="text-sm text-[#6B6B80] max-w-md mx-auto mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.15, duration: 0.6 }}
                >
                  {hero.description || "This is not just a portfolio, this is my operating system."}
                </motion.p>
              </div>

              {/* Central Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              >
                <CentralVisual mission={site?.currentMission} />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap items-center justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <motion.button
                  onClick={() => handleNavigate(hero.primaryCta?.target || "projects")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C6AFF] to-[#00D4FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(124, 106, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket size={16} />
                  {hero.primaryCta?.label || "VIEW PROJECTS"}
                </motion.button>
                <motion.button
                  onClick={() => handleNavigate("resume")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[#E8E8F0] font-semibold text-sm hover:bg-white/[0.08] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileDown size={16} />
                  VIEW RESUME {resume ? "" : ""}
                </motion.button>
                <motion.button
                  onClick={() => handleNavigate("/os")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] font-semibold text-sm hover:bg-[#00FF88]/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap size={16} />
                  ENTER TOSIF OS
                </motion.button>
              </motion.div>

              {/* Feature Cards */}
              <FeatureCards onNavigate={handleNavigate} />

              {/* Recruiter shortcut */}
              <motion.div
                className="flex justify-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9 }}
              >
                <button
                  onClick={toggleRecruiterMode}
                  className="flex items-center gap-2 text-xs text-[#6B6B80] hover:text-[#00FF88] transition-colors font-mono"
                >
                  <Bot size={13} />
                  Recruiter? Activate Recruiter View — everything you need in one screen
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomTerminal profile={p} site={site} />
    </div>
  );
}
