import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { profile } from "@/data/profile";
import {
  Home, Crosshair, Code2, Clock, GitBranch, Bot, Eye, Mail,
  Rocket, FileDown, ChevronDown, Terminal, Volume2, Activity,
  FolderGit2, Cpu, Code, Coffee, Quote, ArrowRight, Zap,
} from "lucide-react";

// ─── Sidebar Navigation Items ───
const sidebarNavItems = [
  { id: "home", icon: Home, label: "Home", shortcut: "⌘1" },
  { id: "mission", icon: Crosshair, label: "Mission Control", shortcut: "⌘2" },
  { id: "skills", icon: Code2, label: "Skills Terminal", shortcut: "⌘3" },
  { id: "timeline", icon: Clock, label: "Life Timeline", shortcut: "⌘4" },
  { id: "projects", icon: GitBranch, label: "GitHub Pulse", shortcut: "⌘5" },
  { id: "recruiter", icon: Bot, label: "AI Recruiter", shortcut: "⌘6" },
  { id: "vision", icon: Eye, label: "Vision Board", shortcut: "⌘7" },
  { id: "contact", icon: Mail, label: "Contact Dock", shortcut: "⌘8" },
];

// ─── Feature Cards Data ───
const featureCards = [
  { icon: Crosshair, title: "MISSION CONTROL", desc: "Explore my projects and products", color: "#00D4FF" },
  { icon: Code2, title: "SKILLS TERMINAL", desc: "Technologies I use to build the future", color: "#7C6AFF" },
  { icon: Clock, title: "LIFE TIMELINE", desc: "My journey from learner to builder", color: "#FFB800" },
  { icon: GitBranch, title: "GITHUB PULSE", desc: "Real-time stats directly from GitHub", color: "#00FF88" },
  { icon: Bot, title: "AI RECRUITER", desc: "Ask anything about me. AI will answer.", color: "#FF6B9D" },
  { icon: Eye, title: "VISION BOARD", desc: "The future I'm building step by step", color: "#a78bfa" },
];

// ─── System Status Metrics ───
const systemMetrics = [
  { icon: FolderGit2, label: "Projects Launched", value: "12+", color: "#00D4FF" },
  { icon: GitBranch, label: "GitHub Contributions", value: "1,250+", color: "#7C6AFF" },
  { icon: Cpu, label: "Technologies Mastered", value: "15+", color: "#00FF88" },
  { icon: Code, label: "Lines of Code", value: "100K+", color: "#FFB800" },
  { icon: Coffee, label: "Cups of Coffee", value: "∞", color: "#FF6B9D" },
];

// ─── Header Component ───
function Header({ onToggleTerminal }) {
  const [initText, setInitText] = useState("INITIALIZING FOUNDER OS...");
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setInitText("SYSTEM ONLINE — ALL MODULES LOADED"), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-14 bg-[#0a0e17]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 z-50"
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C6AFF] to-[#00D4FF] flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-sm tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
          FOUNDER OS
        </span>
      </div>

      {/* Center: Status */}
      <div className="hidden md:flex items-center gap-2">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#00FF88]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs font-mono text-[#6B6B80]">
          {initText}{".".repeat(dots)}
        </span>
      </div>

      {/* Right: Now Playing + Terminal */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
          <Volume2 size={14} className="text-[#7C6AFF]" />
          <span className="text-xs text-[#6B6B80]">Now Playing:</span>
          <span className="text-xs text-[#E8E8F0]">Focus Mode</span>
          <div className="flex items-end gap-[2px] h-3">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-[2px] bg-[#7C6AFF] rounded-full"
                animate={{ height: ["4px", `${8 + i * 2}px`, "4px"] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
        <motion.button
          onClick={onToggleTerminal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#7C6AFF]/10 border border-[#7C6AFF]/30 text-[#7C6AFF] text-xs font-mono hover:bg-[#7C6AFF]/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Terminal size={14} />
          <span className="hidden sm:inline">Launch Terminal</span>
        </motion.button>
      </div>
    </motion.header>
  );
}

// ─── Sidebar Component ───
function Sidebar({ activeSection, onNavigate }) {
  return (
    <motion.aside
      className="fixed left-0 top-14 bottom-0 w-[200px] bg-[#0a0e17] border-r border-white/[0.06] flex flex-col py-4 z-40 overflow-hidden"
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="flex-1 px-3 space-y-1">
        {sidebarNavItems.map((item, i) => {
          const isActive = activeSection === item.id;
          const IconComp = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${isActive
                ? "bg-[#7C6AFF]/15 text-[#7C6AFF] border border-[#7C6AFF]/20"
                : "text-[#6B6B80] hover:bg-white/[0.03] hover:text-[#E8E8F0] border border-transparent"
                }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComp size={18} className={isActive ? "text-[#7C6AFF]" : "text-[#4A4A5E] group-hover:text-[#E8E8F0]"} />
              <span className="font-medium">{item.label}</span>
              <span className="ml-auto text-[10px] text-[#4A4A5E] opacity-0 group-hover:opacity-100 transition-opacity">
                {item.shortcut}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <div className="px-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#00FF88]" />
          <span className="text-[10px] font-mono text-[#4A4A5E]">v3.0 — BUILD 2025</span>
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Right Sidebar Component ───
function RightSidebar() {
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
          <h3 className="text-xs font-bold tracking-wider text-[#6B6B80]">SYSTEM STATUS</h3>
        </div>
        <div className="space-y-3">
          {systemMetrics.map((metric, i) => {
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
function CentralVisual() {
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
        <span className="text-[10px] tracking-[0.3em] text-[#6B6B80] font-mono mb-1">MISSION</span>
        <span
          className="text-sm font-bold text-center px-4 leading-tight"
          style={{ fontFamily: "'Space Grotesk', system-ui" }}
        >
          BUILD PRODUCTS<br />THAT IMPACT<br />MILLIONS
        </span>
        <div className="flex items-center gap-1.5 mt-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00FF88]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] font-mono text-[#00FF88]">STATUS: ONGOING</span>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Cards Component ───
function FeatureCards({ onNavigate }) {
  const cardNavMap = {
    "MISSION CONTROL": "mission",
    "SKILLS TERMINAL": "skills",
    "LIFE TIMELINE": "timeline",
    "GITHUB PULSE": "projects",
    "AI RECRUITER": "recruiter",
    "VISION BOARD": "vision",
  };

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
            onClick={() => {
              const navId = cardNavMap[card.title];
              if (navId) onNavigate(navId);
            }}
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
function BottomTerminal() {
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
      response = `${profile.name} — ${profile.roles.join(", ")}`;
    } else if (cmd === "skills") {
      response = `Tech Stack: ${profile.techRadar.adopt.join(", ")} | Learning: ${profile.techRadar.trial.join(", ")}`;
    } else if (cmd === "projects") {
      response = `Currently working on: ${profile.currentStatus.project} (${profile.currentStatus.phase})`;
    } else if (cmd === "contact") {
      response = `Email: ${profile.socialLinks.email} | GitHub: github.com/tosifraza`;
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
      className="fixed bottom-0 left-[200px] right-0 xl:right-[240px] z-40"
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
export default function HomePage() {
  const { state, setActiveSection, toggleTerminal, toggleRecruiterMode } = useApp();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (id) => {
    if (id === "recruiter") {
      toggleRecruiterMode();
    } else if (id === "home") {
      setActiveSection("home");
    } else {
      setActiveSection(id);
    }
  };

  const activeSection = state.recruiterMode
    ? "recruiter"
    : state.activeSection === "mission" || state.activeSection === "home"
      ? "home"
      : state.activeSection;

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Header onToggleTerminal={toggleTerminal} />
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
      <RightSidebar />

      <main className="md:ml-[200px] xl:mr-[240px] pt-14 pb-16 min-h-screen flex items-center justify-center px-6">
        <AnimatePresence>
          {showContent && (
            <motion.div
              // className="px-6 md:px-10 py-8 max-w-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Welcome Section */}
              <div className="text-center mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
                  <span className="text-xs tracking-[0.4em] text-[#6B6B80] font-mono">WELCOME TO</span>
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
                  FOUNDER OS
                </motion.h1>

                <motion.div
                  className="font-mono text-sm md:text-base text-[#6B6B80] mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <span className="text-[#7C6AFF]">&lt; </span>
                  Building Products. Solving Problems. Creating Impact.
                  <span className="text-[#7C6AFF]"> &gt;</span>
                </motion.div>

                <motion.p
                  className="text-sm text-[#6B6B80] max-w-md mx-auto mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                >
                  Hello Recruiter,
                </motion.p>
                <motion.p
                  className="text-sm text-[#E8E8F0] max-w-lg mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  I&apos;m <strong className="text-[#00D4FF]">{profile.name}</strong> — {profile.roles.join(", ")}.
                </motion.p>
                <motion.p
                  className="text-sm text-[#6B6B80] max-w-md mx-auto mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.15, duration: 0.6 }}
                >
                  This is not just a portfolio, this is my operating system.
                </motion.p>
              </div>

              {/* Central Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              >
                <CentralVisual />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap items-center justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <motion.button
                  onClick={() => setActiveSection("mission")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C6AFF] to-[#00D4FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(124, 106, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket size={16} />
                  EXPLORE SYSTEM
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[#E8E8F0] font-semibold text-sm hover:bg-white/[0.08] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileDown size={16} />
                  VIEW RESUME
                </motion.button>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                className="flex flex-col items-center mt-8 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
              >
                <span className="text-[10px] text-[#4A4A5E] font-mono mb-2">Scroll to boot system</span>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChevronDown size={16} className="text-[#4A4A5E]" />
                </motion.div>
              </motion.div>

              {/* Feature Cards */}
              <FeatureCards onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomTerminal />
    </div>
  );
}
