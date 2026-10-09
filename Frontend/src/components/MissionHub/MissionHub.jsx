// import { useState, useEffect, } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useApp } from "@/context/AppContext";
// // import { profile } from "@/data/profile";
// import { useApi } from "@/hooks/useApi";
// import { api } from "@/utils/api";
// import { useCountUp } from "@/hooks/useCustomHooks";
// import {
//   Activity, GitCommit, Building2, Flame, Eye, Satellite,
//   MapPin, Star, Clock, Radio, Rocket, GitBranch, Users, BookOpen,
//   Crosshair, Globe, Sparkles, LayoutGrid, Rocket as RocketIcon,
//   Clock as ClockIcon, Target, Trophy, Send, Terminal, Bot,
//  Shield, TrendingUp, HeartPulse, DollarSign,
//   UserPlus, CheckCircle2, Circle, AlertTriangle, ArrowUpRight,
//   Calendar, Flag, BarChart3, Cpu, Globe2,
//   Briefcase, Code2, Server, Palette,
//  Smartphone
// } from "lucide-react";

// // ─── Sidebar Icon Map ───
// const sidebarItems = [
//   { id: "mission", icon: Crosshair, label: "Mission Hub" },
//   { id: "globe", icon: Globe, label: "Global Map" },
//   { id: "skills", icon: Sparkles, label: "Skill Galaxy" },
//   { id: "projects", icon: LayoutGrid, label: "Mission Deck" },
//   { id: "startup", icon: RocketIcon, label: "Launch Control" },
//   { id: "timeline", icon: ClockIcon, label: "Chrono Scroll" },
//   { id: "recruiter", icon: Target, label: "Recruiter Mode" },
//   { id: "achievements", icon: Trophy, label: "Trophy Room" },
//   { id: "contact", icon: Send, label: "Contact Portal" },
// ];

// // ─── Mission Status Data ───
// const missionStatus = {
//   status: "ACTIVE",
//   phase: "MVP Development",
//   sprint: "Sprint 7",
//   daysLeft: 12,
//   completion: 68,
//   lastDeployment: "2h ago",
//   uptime: "99.7%",
// };

// // ─── Q3 Objectives Data ───
// const q3Objectives = [
//   { id: 1, title: "Launch SkillBridge Beta", progress: 68, status: "on-track", icon: Rocket, color: "hsl(var(--primary))" },
//   { id: 2, title: "Reach 500 users milestone", progress: 24, status: "behind", icon: Users, color: "#F59E0B" },
//   { id: 3, title: "Ship payment integration", progress: 35, status: "on-track", icon: DollarSign, color: "#10B981" },
//   { id: 4, title: "Build mobile responsive MVP", progress: 82, status: "ahead", icon: Smartphone, color: "hsl(var(--primary))" },
//   { id: 5, title: "Onboard 50 verified workers", progress: 90, status: "ahead", icon: UserPlus, color: "#F472B6" },
// ];

// // ─── Today's Priorities Data ───
// const todaysPriorities = [
//   { id: 1, task: "Fix auth token refresh bug", priority: "critical", category: "Bug Fix", done: true },
//   { id: 2, task: "Review PR #147 — Payment flow", priority: "high", category: "Code Review", done: true },
//   { id: 3, task: "Write API docs for v2 endpoints", priority: "medium", category: "Documentation", done: false },
//   { id: 4, task: "Design onboarding flow mockups", priority: "high", category: "Design", done: false },
//   { id: 5, task: "Sync with design team on UI updates", priority: "low", category: "Meeting", done: false },
// ];

// // ─── Startup Health Data ───
// const startupHealthList = [
//   { key: "product", score: 82, label: "Product", icon: Code2, color: "hsl(var(--primary))" },
//   { key: "growth", score: 67, label: "Growth", icon: TrendingUp, color: "#10B981" },
//   { key: "team", score: 45, label: "Team", icon: Users, color: "#F59E0B" },
//   { key: "financials", score: 30, label: "Financials", icon: DollarSign, color: "#F472B6" },
//   { key: "tech", score: 88, label: "Tech Stack", icon: Server, color: "hsl(var(--primary))" },
//   { key: "design", score: 75, label: "Design", icon: Palette, color: "hsl(var(--primary))" },
// ];

// // ─── Vision 2030 Data ───
// const vision2030 = [
//   { year: "2025", milestone: "Launch SkillBridge, reach 1K users", status: "current", icon: Rocket },
//   { year: "2026", milestone: "Scale to 10K users, mobile app", status: "upcoming", icon: TrendingUp },
//   { year: "2027", milestone: "Expand to 5+ cities, Series A", status: "upcoming", icon: Globe2 },
//   { year: "2028", milestone: "Enterprise features, 100K users", status: "upcoming", icon: Briefcase },
//   { year: "2030", milestone: "India's #1 skill marketplace", status: "upcoming", icon: Trophy },
// ];

// // ─── Quick Stats Data (pre-computed for hook safety) ───
// const quickStats = [
//   { label: "GitHub Commits", value: profile.stats.commits, suffix: "+", icon: GitCommit, color: "hsl(var(--primary))" },
//   { label: "Startups Founded", value: profile.stats.startups, suffix: "", icon: Building2, color: "#F59E0B" },
//   { label: "Current Streak", value: profile.currentStatus.streak, suffix: "d", icon: Flame, color: "#F472B6" },
//   { label: "Tech Adopted", value: profile.techRadar.adopt.length, suffix: "", icon: Cpu, color: "#10B981" },
// ];

// // ─── Metric Circle Component ───
// function MetricCircle({ value, label, color, suffix }) {
//   const animatedValue = useCountUp(value, 2000);
//   const colorMap = { cyan: "hsl(var(--primary))", green: "#10B981", amber: "#F59E0B", pink: "#F472B6", purple: "hsl(var(--primary))" };
//   const glowMap = { cyan: "rgba(59, 130, 246,0.3)", green: "rgba(16, 185, 129,0.3)", amber: "rgba(245, 158, 11,0.3)", pink: "rgba(255,107,157,0.3)", purple: "rgba(59, 130, 246,0.3)" };
//   const borderColor = colorMap[color] || "hsl(var(--primary))";
//   const glowColor = glowMap[color] || "rgba(59, 130, 246,0.3)";

//   return (
//     <motion.div
//       className="flex flex-col items-center"
//       initial={{ opacity: 0, scale: 0.5 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.6, type: "spring" }}
//       whileHover={{ scale: 1.08 }}
//     >
//       <div
//         className="w-20 h-20 rounded-full flex items-center justify-center mb-2 relative"
//         style={{
//           border: `3px solid ${borderColor}`,
//           boxShadow: `0 0 15px ${glowColor}, inset 0 0 15px ${glowColor}`,
//         }}
//       >
//         <span
//           className="text-2xl font-bold tabular-nums"
//           style={{ color: borderColor, textShadow: `0 0 10px ${glowColor}` }}
//         >
//           {animatedValue}{suffix || ""}
//         </span>
//         <motion.div
//           className="absolute inset-[-4px] rounded-full"
//           style={{ border: `1px dashed ${borderColor}`, opacity: 0.3 }}
//           animate={{ rotate: 360 }}
//           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//         />
//       </div>
//       <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</span>
//     </motion.div>
//   );
// }

// // ─── Tech Radar Bar ───
// function TechRadarBar({ label, percentage, color }) {
//   const animatedValue = useCountUp(percentage, 1500);
//   const colorMap = { purple: "hsl(var(--primary))", blue: "hsl(var(--primary))", cyan: "hsl(var(--primary))", green: "#10B981" };
//   const glowMap = { purple: "rgba(59, 130, 246,0.4)", blue: "rgba(59,130,246,0.4)", cyan: "rgba(59, 130, 246,0.4)", green: "rgba(16, 185, 129,0.4)" };
//   const barColor = colorMap[color] || "hsl(var(--primary))";
//   const glowColor = glowMap[color] || "rgba(59, 130, 246,0.4)";

//   return (
//     <div className="mb-3">
//       <div className="flex justify-between text-xs mb-1.5">
//         <span className="text-gray-400 font-medium uppercase tracking-wider">{label}</span>
//         <span style={{ color: barColor, textShadow: `0 0 8px ${glowColor}` }} className="font-bold tabular-nums">
//           {animatedValue}%
//         </span>
//       </div>
//       <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden" style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}>
//         <motion.div
//           className="h-2 rounded-full"
//           style={{
//             background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
//             boxShadow: `0 0 8px ${glowColor}`,
//           }}
//           initial={{ width: 0 }}
//           animate={{ width: `${animatedValue}%` }}
//           transition={{ duration: 1.5, ease: "easeOut" }}
//         />
//       </div>
//     </div>
//   );
// }

// // ─── Activity Item ───
// function ActivityItem({ icon, text, time, iconBg }) {
//   return (
//     <motion.div
//       className="flex items-center justify-between py-2.5 group cursor-default"
//       initial={{ opacity: 0, x: -20 }}
//       animate={{ opacity: 1, x: 0 }}
//       whileHover={{ x: 4 }}
//       transition={{ duration: 0.2 }}
//     >
//       <div className="flex items-center gap-3">
//         <div
//           className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
//           style={{ backgroundColor: iconBg, boxShadow: `0 0 10px ${iconBg}44` }}
//         >
//           {icon}
//         </div>
//         <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">{text}</span>
//       </div>
//       <span className="text-gray-500 text-xs font-mono flex-shrink-0 ml-3">{time}</span>
//     </motion.div>
//   );
// }

// // ─── Radar Visualization ───
// function RadarVisualization() {
//   return (
//     <div className="w-full h-36 rounded-xl relative overflow-hidden flex items-center justify-center mb-4"
//       style={{ background: "radial-gradient(circle, rgba(59, 130, 246,0.08) 0%, rgba(0,0,0,0) 70%)" }}
//     >
//       <div className="absolute w-28 h-28 border-2 border-cyan-400/20 rounded-full" />
//       <div className="absolute w-20 h-20 border-2 border-cyan-400/25 rounded-full" />
//       <div className="absolute w-12 h-12 border-2 border-cyan-400/30 rounded-full" />
//       <div className="absolute w-4 h-4 border-2 border-cyan-400/40 rounded-full" />
//       <motion.div
//         className="absolute w-full h-[1px] origin-left"
//         style={{ background: "linear-gradient(90deg, transparent, rgba(59, 130, 246,0.4), transparent)" }}
//         animate={{ rotate: 360 }}
//         transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
//       />
//       <span className="absolute top-3 left-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Frontend</span>
//       <span className="absolute top-3 right-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Backend</span>
//       <span className="absolute bottom-3 right-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Tools</span>
//       <span className="absolute bottom-3 left-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Emerging</span>
//       <motion.div
//         className="absolute w-2 h-2 bg-cyan-400 rounded-full"
//         style={{ boxShadow: "0 0 10px rgba(59, 130, 246,0.6)" }}
//         animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
//         transition={{ duration: 2, repeat: Infinity }}
//       />
//     </div>
//   );
// }

// // ─── Glass Card Wrapper ───
// function GlassCard({ children, accentColor, delay, className }) {
//   return (
//     <motion.div
//       className={`rounded-xl p-5 relative overflow-hidden ${className || ""}`}
//       style={{
//         background: "linear-gradient(135deg, rgba(15,15,30,0.9) 0%, rgba(20,15,40,0.9) 100%)",
//         border: `1px solid ${accentColor || "hsl(var(--primary))"}20`,
//         boxShadow: `0 4px 30px rgba(0,0,0,0.3), 0 0 20px ${accentColor || "hsl(var(--primary))"}08`,
//       }}
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, delay: delay || 0 }}
//     >
//       <div className="absolute top-0 left-0 right-0 h-[2px]"
//         style={{ background: `linear-gradient(90deg, transparent, ${accentColor || "hsl(var(--primary))"}, transparent)` }}
//       />
//       {children}
//     </motion.div>
//   );
// }

// // ─── Startup Health Card (separate component for safe hook usage) ───
// function StartupHealthCard({ item, index }) {
//   const scoreAnimated = useCountUp(item.score, 1800);
//   const Icon = item.icon;
//   const getHealthColor = (s) => s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";
//   const getHealthGlow = (s) => s >= 75 ? "rgba(16, 185, 129,0.3)" : s >= 50 ? "rgba(245, 158, 11,0.3)" : "rgba(239, 68, 68,0.3)";

//   return (
//     <motion.div
//       className="rounded-xl p-4 text-center cursor-default"
//       style={{
//         background: "rgba(255,255,255,0.02)",
//         border: `1px solid ${item.color}15`,
//       }}
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.5 + index * 0.08 }}
//       whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${item.color}22` }}
//     >
//       <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
//         style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
//         <Icon size={18} style={{ color: item.color }} />
//       </div>
//       <div className="text-2xl font-bold tabular-nums mb-0.5"
//         style={{ color: getHealthColor(item.score), textShadow: `0 0 10px ${getHealthGlow(item.score)}` }}>
//         {scoreAnimated}
//       </div>
//       <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{item.label}</div>
//       <div className="w-full bg-gray-800/60 rounded-full h-1 mt-2 overflow-hidden">
//         <motion.div
//           className="h-1 rounded-full"
//           style={{ background: `linear-gradient(90deg, ${item.color}88, ${item.color})` }}
//           initial={{ width: 0 }}
//           animate={{ width: `${item.score}%` }}
//           transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 + index * 0.08 }}
//         />
//       </div>
//     </motion.div>
//   );
// }

// // ─── Quick Stat Row (separate component for safe hook usage) ───
// function QuickStatRow({ stat, index }) {
//   const animVal = useCountUp(stat.value, 1500);
//   const Icon = stat.icon;

//   return (
//     <motion.div
//       className="flex items-center justify-between p-2.5 rounded-lg"
//       style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.6 + index * 0.08 }}
//       whileHover={{ background: "rgba(255,255,255,0.04)", x: 3 }}
//     >
//       <div className="flex items-center gap-2.5">
//         <div className="w-7 h-7 rounded-lg flex items-center justify-center"
//           style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>
//           <Icon size={13} style={{ color: stat.color }} />
//         </div>
//         <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
//       </div>
//       <span className="text-sm font-bold tabular-nums" style={{ color: stat.color, textShadow: `0 0 6px ${stat.color}44` }}>
//         {animVal}{stat.suffix}
//       </span>
//     </motion.div>
//   );
// }

// // ─── Top Bar ───
// function MissionTopBar() {
//   const [time, setTime] = useState("");
//   const [date, setDate] = useState("");

//   useEffect(() => {
//     const update = () => {
//       const now = new Date();
//       setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
//       setDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
//     };
//     update();
//     const interval = setInterval(update, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <motion.div
//       className="h-11 flex items-center justify-between px-4 border-b flex-shrink-0"
//       style={{
//         background: "linear-gradient(135deg, rgba(30,27,46,0.95) 0%, rgba(45,27,105,0.95) 100%)",
//         borderColor: "rgba(59, 130, 246,0.15)",
//         boxShadow: "0 2px 20px rgba(59, 130, 246,0.1)",
//       }}
//       initial={{ y: -44 }}
//       animate={{ y: 0 }}
//       transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//     >
//       <div className="flex items-center gap-4">
//         <div className="flex items-center gap-2">
//           <div
//             className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs"
//             style={{
//               background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)))",
//               boxShadow: "0 0 10px rgba(59, 130, 246,0.3)",
//             }}
//           >
//             TR
//           </div>
//           <span className="font-bold text-sm" style={{ color: "hsl(var(--primary))", textShadow: "0 0 10px rgba(59, 130, 246,0.3)" }}>
//             Founder OS
//           </span>
//           <span className="text-gray-500 text-xs font-mono hidden sm:inline">v3.0</span>
//         </div>
//       </div>

//       <div className="flex items-center gap-2">
//         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(16, 185, 129,0.1)", border: "1px solid rgba(16, 185, 129,0.2)" }}>
//           <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
//             <Radio size={10} style={{ color: "#10B981" }} />
//           </motion.div>
//           <span className="text-xs font-bold hidden sm:inline" style={{ color: "#10B981" }}>Mission Hub</span>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         <span className="text-gray-400 text-xs font-mono hidden md:inline">{date}</span>
//         <div className="flex items-center gap-1.5">
//           <Clock size={12} style={{ color: "hsl(var(--primary))" }} />
//           <span className="text-xs font-mono" style={{ color: "hsl(var(--primary))", textShadow: "0 0 8px rgba(59, 130, 246,0.3)" }}>
//             {time}
//           </span>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Left Sidebar ───
// function MissionSidebar() {
//   const { state, setActiveSection, toggleTerminal, toggleAI } = useApp();

//   return (
//     <motion.aside
//       className="w-14 flex flex-col items-center py-3 border-r flex-shrink-0 hidden md:flex"
//       style={{
//         background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)",
//         borderColor: "rgba(255,255,255,0.06)",
//       }}
//       initial={{ x: -56 }}
//       animate={{ x: 0 }}
//       transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//     >
//       {sidebarItems.map(function(item) {
//         const isActive = state.activeSection === item.id;
//         const Icon = item.icon;
//         return (
//           <motion.button
//             key={item.id}
//             onClick={function() { setActiveSection(item.id); }}
//             className="relative w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-all group"
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             {isActive && (
//               <motion.div
//                 className="absolute inset-0 rounded-lg"
//                 style={{
//                   background: "linear-gradient(135deg, rgba(59, 130, 246,0.2), rgba(59, 130, 246,0.2))",
//                   boxShadow: "0 0 15px rgba(59, 130, 246,0.2)",
//                 }}
//                 layoutId="missionSidebarActive"
//                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               />
//             )}
//             <Icon size={18} className="relative z-10 transition-colors" style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
//             <div className="absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
//               style={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(59, 130, 246,0.2)", color: "hsl(var(--primary))" }}>
//               {item.label}
//             </div>
//           </motion.button>
//         );
//       })}

//       <div className="mt-auto flex flex-col items-center gap-1">
//         <motion.button onClick={toggleTerminal} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-cyan-400 transition-colors" whileHover={{ scale: 1.1 }}>
//           <Terminal size={16} />
//         </motion.button>
//         <motion.button onClick={toggleAI} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-400 transition-colors" whileHover={{ scale: 1.1 }}>
//           <Bot size={16} />
//         </motion.button>
//       </div>
//     </motion.aside>
//   );
// }

// // ═══════════════════════════════════════════
// // MAIN MISSIONHUB COMPONENT
// // ═══════════════════════════════════════════
// export default function MissionHub() {
//   const { state } = useApp();
//   const { data: profile, loading, error } = useApi(async () => {
//     // Combine multiple API calls into one "profile" object
//     const [projects, skills, achievements] = await Promise.all([
//       api.getProjects(),
//       api.getSkills(),
//       api.getAchievements(),
//     ]);
//     return {
//       name: "TOSIF RAZA",
//       roles: ["Software Engineer", "Startup Founder", "Problem Solver", "System Architect"],
//       bio: "Building the future, one commit at a time. From Kolkata to the world — engineering solutions that matter.",
//       stats: {
//         projects: projects.length,
//         technologies: skills.length,
//         commits: 1200,
//         startups: 1,
//       },
//       currentStatus: {
//         project: projects[0]?.name || "SkillBridge",
//         phase: "MVP Phase",
//         lastCommit: "2 hours ago",
//         streak: 14,
//       },
//       // ... keep the rest of the static profile fields (activityFeed, techRadar, etc.)
//       // They're fine to keep static for now — they're decorative
//     };
//   });

//   if (loading) return <div className="p-10 text-center text-muted-foreground">Loading mission data...</div>;
//   if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
//   if (!profile) return null;
//   const [roleIndex, setRoleIndex] = useState(0);
//   const completionAnimated = useCountUp(missionStatus.completion, 2000);

//   useEffect(function() {
//     const interval = setInterval(function() {
//       setRoleIndex(function(prev) { return (prev + 1) % profile.roles.length; });
//     }, 3000);
//     return function() { clearInterval(interval); };
//   }, []);

//   const activities = [
//     { icon: <Rocket size={14} className="text-white" />, text: "Deployed SkillBridge v2.1 to production", time: "2h ago", iconBg: "#16a34a" },
//     { icon: <GitBranch size={14} className="text-white" />, text: "Merged PR #142 — Auth refactor", time: "5h ago", iconBg: "hsl(var(--primary))" },
//     { icon: <Users size={14} className="text-white" />, text: "Attended React India Meetup", time: "1d ago", iconBg: "hsl(var(--primary))" },
//     { icon: <BookOpen size={14} className="text-white" />, text: 'Published "Scaling Node.js" article', time: "3d ago", iconBg: "#F59E0B" },
//     { icon: <GitBranch size={14} className="text-white" />, text: "Open source contribution to React Aria", time: "5d ago", iconBg: "hsl(var(--primary))" },
//   ];

//   const techRadarData = [
//     { label: "Frontend", percentage: 89, color: "purple" },
//     { label: "Backend", percentage: 83, color: "blue" },
//     { label: "Tools", percentage: 78, color: "cyan" },
//     { label: "Emerging", percentage: 68, color: "green" },
//   ];

//   const priorityConfig = {
//     critical: { color: "#EF4444", bg: "rgba(239, 68, 68,0.15)", border: "rgba(239, 68, 68,0.25)", label: "CRITICAL" },
//     high: { color: "#F59E0B", bg: "rgba(245, 158, 11,0.15)", border: "rgba(245, 158, 11,0.25)", label: "HIGH" },
//     medium: { color: "hsl(var(--primary))", bg: "rgba(59, 130, 246,0.15)", border: "rgba(59, 130, 246,0.25)", label: "MEDIUM" },
//     low: { color: "hsl(var(--primary))", bg: "rgba(59, 130, 246,0.15)", border: "rgba(59, 130, 246,0.25)", label: "LOW" },
//   };

//   const objectiveStatusConfig = {
//     "ahead": { color: "#10B981", label: "Ahead", icon: ArrowUpRight },
//     "on-track": { color: "hsl(var(--primary))", label: "On Track", icon: TrendingUp },
//     "behind": { color: "#F59E0B", label: "Behind", icon: AlertTriangle },
//   };

//   return (
//     <div className="relative w-full h-full flex flex-col overflow-hidden"
//       style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary) / 0.15) 50%, hsl(var(--card)) 100%)" }}
//     >
//       {/* Decorative background orbs */}
//       <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
//         style={{ background: "radial-gradient(circle, rgba(59, 130, 246,0.08) 0%, transparent 70%)" }}
//       />
//       <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full pointer-events-none"
//         style={{ background: "radial-gradient(circle, rgba(59, 130, 246,0.06) 0%, transparent 70%)" }}
//       />

//       {/* Top Navigation Bar */}
//       <MissionTopBar />

//       {/* ═══ BODY: Sidebar + Main + Right ═══ */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Left Sidebar */}
//         <MissionSidebar />

//         {/* ═══ MAIN CONTENT ═══ */}
//         <div className="flex-1 p-4 md:p-6 overflow-y-auto">
//           {/* Section Header */}
//           <motion.div className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
//             <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: "hsl(var(--foreground))", textShadow: "0 0 20px rgba(59, 130, 246,0.2)" }}>
//               Mission Hub
//             </h1>
//             <p className="text-gray-400 text-sm md:text-base">Command center — overview of current status</p>
//           </motion.div>

//           {/* ═══════════════════════════════════
//               MISSION STATUS BANNER
//           ═══════════════════════════════════ */}
//           <GlassCard accentColor="#10B981" delay={0.1} className="mb-5">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               {/* Left: Status + Phase */}
//               <div className="flex items-center gap-4">
//                 <motion.div
//                   className="w-12 h-12 rounded-xl flex items-center justify-center relative"
//                   style={{
//                     background: "linear-gradient(135deg, rgba(16, 185, 129,0.2), rgba(59, 130, 246,0.2))",
//                     border: "1px solid rgba(16, 185, 129,0.3)",
//                     boxShadow: "0 0 20px rgba(16, 185, 129,0.15)",
//                   }}
//                   animate={{ boxShadow: ["0 0 20px rgba(16, 185, 129,0.15)", "0 0 30px rgba(16, 185, 129,0.3)", "0 0 20px rgba(16, 185, 129,0.15)"] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <Shield size={24} style={{ color: "#10B981" }} />
//                 </motion.div>
//                 <div>
//                   <div className="flex items-center gap-2 mb-0.5">
//                     <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16, 185, 129,0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129,0.25)" }}>
//                       {missionStatus.status}
//                     </span>
//                     <span className="text-xs font-mono text-gray-400">{missionStatus.sprint}</span>
//                   </div>
//                   <h2 className="text-lg md:text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{missionStatus.phase}</h2>
//                   <p className="text-xs text-gray-400">Last deployment: {missionStatus.lastDeployment}</p>
//                 </div>
//               </div>

//               {/* Center: Progress */}
//               <div className="flex items-center gap-3">
//                 <div className="relative w-16 h-16">
//                   <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
//                     <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
//                     <motion.circle
//                       cx="32" cy="32" r="28" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round"
//                       strokeDasharray={`${2 * Math.PI * 28}`}
//                       initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
//                       animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - missionStatus.completion / 100) }}
//                       transition={{ duration: 2, ease: "easeOut" }}
//                       style={{ filter: "drop-shadow(0 0 6px rgba(16, 185, 129,0.4))" }}
//                     />
//                   </svg>
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <span className="text-sm font-bold" style={{ color: "#10B981", textShadow: "0 0 8px rgba(16, 185, 129,0.4)" }}>{completionAnimated}%</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Right: Stats */}
//               <div className="flex items-center gap-6">
//                 <div className="text-center">
//                   <div className="text-xl font-bold" style={{ color: "#F59E0B", textShadow: "0 0 8px rgba(245, 158, 11,0.3)" }}>{missionStatus.daysLeft}</div>
//                   <div className="text-[10px] text-gray-400 uppercase tracking-wider">Days Left</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-xl font-bold" style={{ color: "hsl(var(--primary))", textShadow: "0 0 8px rgba(59, 130, 246,0.3)" }}>{missionStatus.uptime}</div>
//                   <div className="text-[10px] text-gray-400 uppercase tracking-wider">Uptime</div>
//                 </div>
//               </div>
//             </div>
//           </GlassCard>

//           {/* ═══════════════════════════════════
//               ACTIVE MISSION CARD (Redesigned)
//           ═══════════════════════════════════ */}
//           <GlassCard accentColor="hsl(var(--primary))" delay={0.2} className="mb-5">
//             <div className="flex items-start justify-between mb-4">
//               {/* Avatar + Name */}
//               <div className="flex items-center gap-4">
//                 <motion.div
//                   className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold relative"
//                   style={{
//                     background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)))",
//                     boxShadow: "0 0 20px rgba(59, 130, 246,0.3), 0 0 40px rgba(59, 130, 246,0.2)",
//                   }}
//                   whileHover={{ scale: 1.05, rotate: 2 }}
//                 >
//                   TR
//                   <motion.div
//                     className="absolute inset-[-3px] rounded-xl"
//                     style={{ border: "1px solid rgba(59, 130, 246,0.3)" }}
//                     animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
//                     transition={{ duration: 3, repeat: Infinity }}
//                   />
//                 </motion.div>
//                 <div>
//                   <h2 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--foreground))", textShadow: "0 0 15px rgba(59, 130, 246,0.15)" }}>
//                     {profile.name}
//                   </h2>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <AnimatePresence mode="wait">
//                       <motion.span
//                         key={roleIndex}
//                         initial={{ y: 10, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         exit={{ y: -10, opacity: 0 }}
//                         transition={{ duration: 0.3 }}
//                         className="text-sm font-medium"
//                         style={{ color: "hsl(var(--primary))" }}
//                       >
//                         {profile.roles[roleIndex]}
//                       </motion.span>
//                     </AnimatePresence>
//                     <span className="text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5"
//                       style={{ background: "rgba(16, 185, 129,0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129,0.25)", boxShadow: "0 0 10px rgba(16, 185, 129,0.1)" }}>
//                       <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
//                       Available
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Date/Time */}
//               <div className="text-right hidden sm:block">
//                 <div className="text-gray-400 text-sm font-medium">
//                   {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
//                 </div>
//                 <div className="flex items-center gap-1 justify-end mt-1">
//                   <Clock size={12} style={{ color: "hsl(var(--primary))" }} />
//                   <span className="text-sm font-mono" style={{ color: "hsl(var(--primary))", textShadow: "0 0 8px rgba(59, 130, 246,0.3)" }}>
//                     {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* System A label + Bio */}
//             <div className="mb-4">
//               <h3 className="text-sm font-bold mb-2 uppercase tracking-widest" style={{ color: "hsl(var(--primary))", textShadow: "0 0 10px rgba(59, 130, 246,0.2)" }}>
//                 System A
//               </h3>
//               <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
//             </div>

//             {/* Tags */}
//             <div className="flex items-center gap-4 text-sm flex-wrap">
//               <div className="flex items-center gap-1.5" style={{ color: "#EF4444" }}>
//                 <MapPin size={14} /><span className="font-medium">India IN</span>
//               </div>
//               <div className="flex items-center gap-1.5" style={{ color: "#F59E0B" }}>
//                 <Star size={14} /><span className="font-medium">Open to opportunities</span>
//               </div>
//               <div className="flex items-center gap-1.5" style={{ color: "#10B981" }}>
//                 <Flame size={14} /><span className="font-medium">{profile.currentStatus.streak}d streak</span>
//               </div>
//             </div>
//           </GlassCard>

//           {/* ═══ 2-Column Grid for Q3 + Priorities ═══ */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

//             {/* ═══════════════════════════════════
//                 Q3 OBJECTIVES
//             ═══════════════════════════════════ */}
//             <GlassCard accentColor="hsl(var(--primary))" delay={0.3}>
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59, 130, 246,0.2)", border: "1px solid rgba(59, 130, 246,0.3)" }}>
//                   <Target size={16} style={{ color: "hsl(var(--primary))" }} />
//                 </div>
//                 <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Q3 Objectives</h3>
//                 <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(59, 130, 246,0.15)", color: "hsl(var(--primary))", border: "1px solid rgba(59, 130, 246,0.2)" }}>
//                   5 OKRs
//                 </span>
//               </div>

//               <div className="space-y-3">
//                 {q3Objectives.map(function(obj, i) {
//                   const statusCfg = objectiveStatusConfig[obj.status] || objectiveStatusConfig["on-track"];
//                   const StatusIcon = statusCfg.icon;
//                   const ObjIcon = obj.icon;
//                   return (
//                     <motion.div
//                       key={obj.id}
//                       className="rounded-lg p-3 group cursor-default"
//                       style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.4 + i * 0.08 }}
//                       whileHover={{ background: "rgba(255,255,255,0.04)", x: 3 }}
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center gap-2">
//                           <ObjIcon size={14} style={{ color: obj.color }} />
//                           <span className="text-sm font-medium text-gray-200">{obj.title}</span>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                           <StatusIcon size={12} style={{ color: statusCfg.color }} />
//                           <span className="text-[10px] font-bold uppercase" style={{ color: statusCfg.color }}>
//                             {statusCfg.label}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="w-full bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
//                         <motion.div
//                           className="h-1.5 rounded-full"
//                           style={{ background: `linear-gradient(90deg, ${obj.color}88, ${obj.color})`, boxShadow: `0 0 6px ${obj.color}44` }}
//                           initial={{ width: 0 }}
//                           animate={{ width: `${obj.progress}%` }}
//                           transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + i * 0.1 }}
//                         />
//                       </div>
//                       <div className="text-right mt-1">
//                         <span className="text-[10px] font-bold tabular-nums" style={{ color: obj.color }}>{obj.progress}%</span>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </GlassCard>

//             {/* ═══════════════════════════════════
//                 TODAY'S PRIORITIES
//             ═══════════════════════════════════ */}
//             <GlassCard accentColor="#F59E0B" delay={0.35}>
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245, 158, 11,0.2)", border: "1px solid rgba(245, 158, 11,0.3)" }}>
//                   <Calendar size={16} style={{ color: "#F59E0B" }} />
//                 </div>
//                 <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Today&apos;s Priorities</h3>
//                 <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(245, 158, 11,0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11,0.2)" }}>
//                   {todaysPriorities.filter(function(p) { return p.done; }).length}/{todaysPriorities.length}
//                 </span>
//               </div>

//               <div className="space-y-2">
//                 {todaysPriorities.map(function(item, i) {
//                   const config = priorityConfig[item.priority] || priorityConfig.medium;
//                   return (
//                     <motion.div
//                       key={item.id}
//                       className="flex items-center gap-3 rounded-lg p-3 group cursor-pointer"
//                       style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.45 + i * 0.08 }}
//                       whileHover={{ background: "rgba(255,255,255,0.04)", x: 3 }}
//                     >
//                       <motion.div whileHover={{ scale: 1.15 }}>
//                         {item.done ? (
//                           <CheckCircle2 size={18} style={{ color: "#10B981", filter: "drop-shadow(0 0 4px rgba(16, 185, 129,0.4))" }} />
//                         ) : (
//                           <Circle size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
//                         )}
//                       </motion.div>

//                       <div className="flex-1 min-w-0">
//                         <span className={`text-sm font-medium ${item.done ? "line-through text-gray-500" : "text-gray-200"}`}>
//                           {item.task}
//                         </span>
//                         <div className="text-[10px] text-gray-500 mt-0.5">{item.category}</div>
//                       </div>

//                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
//                         style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
//                         {config.label}
//                       </span>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </GlassCard>
//           </div>

//           {/* ═══════════════════════════════════
//               STARTUP HEALTH
//           ═══════════════════════════════════ */}
//           <GlassCard accentColor="#F472B6" delay={0.4} className="mb-5">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,107,157,0.2)", border: "1px solid rgba(255,107,157,0.3)" }}>
//                 <HeartPulse size={16} style={{ color: "#F472B6" }} />
//               </div>
//               <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Startup Health — SkillBridge</h3>
//               <motion.div
//                 className="w-2 h-2 rounded-full"
//                 style={{ background: "#10B981", boxShadow: "0 0 8px rgba(16, 185, 129,0.4)" }}
//                 animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               />
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//               {startupHealthList.map(function(item, i) {
//                 return <StartupHealthCard key={item.key} item={item} index={i} />;
//               })}
//             </div>
//           </GlassCard>

//           {/* ═══════════════════════════════════
//               VISION 2030 TRACKER
//           ═══════════════════════════════════ */}
//           <GlassCard accentColor="#F59E0B" delay={0.45} className="mb-5">
//             <div className="flex items-center gap-2 mb-5">
//               <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245, 158, 11,0.2)", border: "1px solid rgba(245, 158, 11,0.3)" }}>
//                 <Flag size={16} style={{ color: "#F59E0B" }} />
//               </div>
//               <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Vision 2030</h3>
//               <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(245, 158, 11,0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11,0.2)" }}>
//                 5-Year Roadmap
//               </span>
//             </div>

//             <div className="relative">
//               {/* Timeline line */}
//               <div className="absolute left-5 top-6 bottom-6 w-[2px]"
//                 style={{ background: "linear-gradient(to bottom, #F59E0B, hsl(var(--primary)), hsl(var(--primary)))" }}
//               />

//               {vision2030.map(function(item, i) {
//                 const isCurrent = item.status === "current";
//                 const isUpcoming = item.status === "upcoming";
//                 const Icon = item.icon;

//                 return (
//                   <motion.div
//                     key={item.year}
//                     className="flex items-start gap-4 relative mb-5 last:mb-0"
//                     initial={{ opacity: 0, x: -30 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.5 + i * 0.12 }}
//                   >
//                     {/* Node */}
//                     <div className="relative z-10 flex-shrink-0">
//                       <motion.div
//                         className="w-10 h-10 rounded-xl flex items-center justify-center"
//                         style={{
//                           background: isCurrent
//                             ? "linear-gradient(135deg, #F59E0B, #F472B6)"
//                             : isUpcoming
//                             ? "rgba(255,255,255,0.04)"
//                             : "rgba(59, 130, 246,0.2)",
//                           border: isCurrent
//                             ? "1px solid rgba(245, 158, 11,0.4)"
//                             : "1px solid rgba(255,255,255,0.08)",
//                           boxShadow: isCurrent
//                             ? "0 0 20px rgba(245, 158, 11,0.3), 0 0 40px rgba(255,107,157,0.15)"
//                             : "none",
//                         }}
//                         animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
//                         transition={{ duration: 3, repeat: Infinity }}
//                       >
//                         <Icon size={16} style={{ color: isCurrent ? "#fff" : isUpcoming ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))" }} />
//                       </motion.div>
//                     </div>

//                     {/* Content */}
//                     <div className="flex-1 pt-1">
//                       <div className="flex items-center gap-2 mb-0.5">
//                         <span className="text-sm font-bold font-mono" style={{
//                           color: isCurrent ? "#F59E0B" : isUpcoming ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))",
//                           textShadow: isCurrent ? "0 0 10px rgba(245, 158, 11,0.3)" : "none",
//                         }}>
//                           {item.year}
//                         </span>
//                         {isCurrent && (
//                           <motion.span
//                             className="text-[10px] font-bold px-2 py-0.5 rounded-full"
//                             style={{ background: "rgba(245, 158, 11,0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11,0.25)" }}
//                             animate={{ opacity: [1, 0.5, 1] }}
//                             transition={{ duration: 2, repeat: Infinity }}
//                           >
//                             NOW
//                           </motion.span>
//                         )}
//                       </div>
//                       <p className={`text-sm ${isUpcoming ? "text-gray-500" : isCurrent ? "text-gray-200 font-medium" : "text-gray-400"}`}>
//                         {item.milestone}
//                       </p>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </GlassCard>

//           {/* ═══════════════════════════════════
//               RECENT ACTIVITY
//           ═══════════════════════════════════ */}
//           <GlassCard accentColor="hsl(var(--primary))" delay={0.5}>
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59, 130, 246,0.2)", border: "1px solid rgba(59, 130, 246,0.3)" }}>
//                 <Activity size={16} style={{ color: "hsl(var(--primary))" }} />
//               </div>
//               <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Recent Activity</h3>
//               <motion.span
//                 className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
//                 style={{ background: "rgba(16, 185, 129,0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129,0.25)" }}
//                 animate={{ opacity: [1, 0.6, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 <Radio size={8} /> LIVE
//               </motion.span>
//             </div>

//             <div>
//               {activities.map(function(item, i) {
//                 return (
//                   <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
//                     <ActivityItem icon={item.icon} text={item.text} time={item.time} iconBg={item.iconBg} />
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </GlassCard>
//         </div>

//         {/* ═══ RIGHT SIDEBAR ═══ */}
//         <motion.div
//           className="w-72 xl:w-80 p-4 space-y-4 overflow-y-auto border-l hidden lg:block flex-shrink-0"
//           style={{ borderColor: "rgba(255,255,255,0.06)" }}
//           initial={{ opacity: 0, x: 40 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.6, delay: 0.3 }}
//         >
//           {/* Vision Tracker */}
//           <GlassCard accentColor="hsl(var(--primary))" delay={0.2}>
//             <div className="flex items-center gap-2 mb-5">
//               <Eye size={18} style={{ color: "hsl(var(--primary))" }} />
//               <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Vision Tracker</h3>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <MetricCircle value={profile.stats.projects} label="Projects" color="cyan" />
//               <MetricCircle value={profile.stats.technologies} label="Tech" color="cyan" suffix="+" />
//               <MetricCircle value={3} label="Exp (yrs)" color="green" />
//               <MetricCircle value={5} label="Open Src" color="amber" />
//             </div>
//           </GlassCard>

//           {/* Tech Radar */}
//           <GlassCard accentColor="#10B981" delay={0.3}>
//             <div className="flex items-center gap-2 mb-4">
//               <Satellite size={18} style={{ color: "#10B981" }} />
//               <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Tech Radar</h3>
//             </div>

//             <RadarVisualization />

//             {techRadarData.map(function(item, i) {
//               return (
//                 <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}>
//                   <TechRadarBar label={item.label} percentage={item.percentage} color={item.color} />
//                 </motion.div>
//               );
//             })}
//           </GlassCard>

//           {/* Quick Stats */}
//           <GlassCard accentColor="#F472B6" delay={0.4}>
//             <div className="flex items-center gap-2 mb-4">
//               <BarChart3 size={18} style={{ color: "#F472B6" }} />
//               <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Quick Stats</h3>
//             </div>

//             <div className="space-y-3">
//               {quickStats.map(function(stat, i) {
//                 return <QuickStatRow key={stat.label} stat={stat} index={i} />;
//               })}
//             </div>
//           </GlassCard>

//           {/* Currently Building */}
//           <GlassCard accentColor="#10B981" delay={0.5}>
//             <div className="flex items-center gap-2 mb-3">
//               <div className="w-2 h-2 rounded-full" style={{ background: "#10B981", boxShadow: "0 0 8px rgba(16, 185, 129,0.4)" }}>
//                 <motion.div animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }}
//                   className="w-2 h-2 rounded-full bg-green-400" />
//               </div>
//               <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#10B981" }}>Currently Building</h3>
//             </div>

//             <div className="rounded-lg p-3" style={{ background: "rgba(16, 185, 129,0.04)", border: "1px solid rgba(16, 185, 129,0.1)" }}>
//               <div className="text-base font-bold text-white mb-1">{profile.currentStatus.project}</div>
//               <div className="text-xs text-gray-400 mb-2">{profile.currentStatus.phase}</div>
//               <div className="flex items-center justify-between text-[10px] text-gray-500">
//                 <span>Last commit: {profile.currentStatus.lastCommit}</span>
//                 <span className="flex items-center gap-1" style={{ color: "#F59E0B" }}>
//                   <Flame size={10} /> {profile.currentStatus.streak}d
//                 </span>
//               </div>
//             </div>
//           </GlassCard>
//         </motion.div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
// import { profile } from "@/data/profile";
import { useApi } from "@/hooks/useApi";
import { api } from "@/utils/api";
import { useCountUp } from "@/hooks/useCustomHooks";
import {
  Activity, GitCommit, Building2, Flame, Eye, Satellite,
  MapPin, Star, Clock, Radio, Rocket, GitBranch, Users, BookOpen,
  Crosshair, Globe, Sparkles, LayoutGrid, Rocket as RocketIcon,
  Clock as ClockIcon, Target, Trophy, Send, Terminal, Bot,
  Shield, TrendingUp, HeartPulse, DollarSign,
  UserPlus, CheckCircle2, Circle, AlertTriangle, ArrowUpRight,
  Calendar, Flag, BarChart3, Cpu, Globe2,
  Briefcase, Code2, Server, Palette,
  Smartphone
} from "lucide-react";

// ─── Sidebar Icon Map ───
const sidebarItems = [
  { id: "mission", icon: Crosshair, label: "Mission Hub" },
  { id: "globe", icon: Globe, label: "Global Map" },
  { id: "skills", icon: Sparkles, label: "Skill Galaxy" },
  { id: "projects", icon: LayoutGrid, label: "Mission Deck" },
  { id: "startup", icon: RocketIcon, label: "Launch Control" },
  { id: "timeline", icon: ClockIcon, label: "Chrono Scroll" },
  { id: "recruiter", icon: Target, label: "Recruiter Mode" },
  { id: "achievements", icon: Trophy, label: "Trophy Room" },
  { id: "contact", icon: Send, label: "Contact Portal" },
];

// ─── Mission Status Data ───
const missionStatus = {
  status: "ACTIVE",
  phase: "MVP Development",
  sprint: "Sprint 7",
  daysLeft: 12,
  completion: 68,
  lastDeployment: "2h ago",
  uptime: "99.7%",
};

// ─── Q3 Objectives Data ───
const q3Objectives = [
  { id: 1, title: "Launch SkillBridge Beta", progress: 68, status: "on-track", icon: Rocket, color: "hsl(var(--primary))" },
  { id: 2, title: "Reach 500 users milestone", progress: 24, status: "behind", icon: Users, color: "#F59E0B" },
  { id: 3, title: "Ship payment integration", progress: 35, status: "on-track", icon: DollarSign, color: "#10B981" },
  { id: 4, title: "Build mobile responsive MVP", progress: 82, status: "ahead", icon: Smartphone, color: "hsl(var(--primary))" },
  { id: 5, title: "Onboard 50 verified workers", progress: 90, status: "ahead", icon: UserPlus, color: "#F472B6" },
];

// ─── Today's Priorities Data ───
const todaysPriorities = [
  { id: 1, task: "Fix auth token refresh bug", priority: "critical", category: "Bug Fix", done: true },
  { id: 2, task: "Review PR #147 — Payment flow", priority: "high", category: "Code Review", done: true },
  { id: 3, task: "Write API docs for v2 endpoints", priority: "medium", category: "Documentation", done: false },
  { id: 4, task: "Design onboarding flow mockups", priority: "high", category: "Design", done: false },
  { id: 5, task: "Sync with design team on UI updates", priority: "low", category: "Meeting", done: false },
];

// ─── Startup Health Data ───
const startupHealthList = [
  { key: "product", score: 82, label: "Product", icon: Code2, color: "hsl(var(--primary))" },
  { key: "growth", score: 67, label: "Growth", icon: TrendingUp, color: "#10B981" },
  { key: "team", score: 45, label: "Team", icon: Users, color: "#F59E0B" },
  { key: "financials", score: 30, label: "Financials", icon: DollarSign, color: "#F472B6" },
  { key: "tech", score: 88, label: "Tech Stack", icon: Server, color: "hsl(var(--primary))" },
  { key: "design", score: 75, label: "Design", icon: Palette, color: "hsl(var(--primary))" },
];

// ─── Vision 2030 Data ───
const vision2030 = [
  { year: "2025", milestone: "Launch SkillBridge, reach 1K users", status: "current", icon: Rocket },
  { year: "2026", milestone: "Scale to 10K users, mobile app", status: "upcoming", icon: TrendingUp },
  { year: "2027", milestone: "Expand to 5+ cities, Series A", status: "upcoming", icon: Globe2 },
  { year: "2028", milestone: "Enterprise features, 100K users", status: "upcoming", icon: Briefcase },
  { year: "2030", milestone: "India's #1 skill marketplace", status: "upcoming", icon: Trophy },
];

// ─── Metric Circle Component ───
function MetricCircle({ value, label, color, suffix }) {
  const animatedValue = useCountUp(value, 2000);
  const colorMap = { cyan: "hsl(var(--primary))", green: "#10B981", amber: "#F59E0B", pink: "#F472B6", purple: "hsl(var(--primary))" };
  const glowMap = { cyan: "rgba(59, 130, 246,0.3)", green: "rgba(16, 185, 129,0.3)", amber: "rgba(245, 158, 11,0.3)", pink: "rgba(255,107,157,0.3)", purple: "rgba(59, 130, 246,0.3)" };
  const borderColor = colorMap[color] || "hsl(var(--primary))";
  const glowColor = glowMap[color] || "rgba(59, 130, 246,0.3)";

  return (
    <motion.div className="flex flex-col items-center" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: "spring" }} whileHover={{ scale: 1.08 }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 relative" style={{ border: `3px solid ${borderColor}`, boxShadow: `0 0 15px ${glowColor}, inset 0 0 15px ${glowColor}` }}>
        <span className="text-2xl font-bold tabular-nums" style={{ color: borderColor, textShadow: `0 0 10px ${glowColor}` }}>
          {animatedValue}{suffix || ""}
        </span>
        <motion.div className="absolute inset-[-4px] rounded-full" style={{ border: `1px dashed ${borderColor}`, opacity: 0.3 }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
      </div>
      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</span>
    </motion.div>
  );
}

// ─── Tech Radar Bar ───
function TechRadarBar({ label, percentage, color }) {
  const animatedValue = useCountUp(percentage, 1500);
  const colorMap = { purple: "hsl(var(--primary))", blue: "hsl(var(--primary))", cyan: "hsl(var(--primary))", green: "#10B981" };
  const glowMap = { purple: "rgba(59, 130, 246,0.4)", blue: "rgba(59,130,246,0.4)", cyan: "rgba(59, 130, 246,0.4)", green: "rgba(16, 185, 129,0.4)" };
  const barColor = colorMap[color] || "hsl(var(--primary))";
  const glowColor = glowMap[color] || "rgba(59, 130, 246,0.4)";

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        <span style={{ color: barColor, textShadow: `0 0 8px ${glowColor}` }} className="font-bold tabular-nums">{animatedValue}%</span>
      </div>
      <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden" style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}>
        <motion.div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${barColor}88, ${barColor})`, boxShadow: `0 0 8px ${glowColor}` }} initial={{ width: 0 }} animate={{ width: `${animatedValue}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
      </div>
    </div>
  );
}

// ─── Activity Item ───
function ActivityItem({ icon, text, time, iconBg }) {
  return (
    <motion.div className="flex items-center justify-between py-2.5 group cursor-default" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg, boxShadow: `0 0 10px ${iconBg}44` }}>{icon}</div>
        <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">{text}</span>
      </div>
      <span className="text-gray-500 text-xs font-mono flex-shrink-0 ml-3">{time}</span>
    </motion.div>
  );
}

// ─── Radar Visualization ───
function RadarVisualization() {
  return (
    <div className="w-full h-36 rounded-xl relative overflow-hidden flex items-center justify-center mb-4" style={{ background: "radial-gradient(circle, rgba(59, 130, 246,0.08) 0%, rgba(0,0,0,0) 70%)" }}>
      <div className="absolute w-28 h-28 border-2 border-cyan-400/20 rounded-full" />
      <div className="absolute w-20 h-20 border-2 border-cyan-400/25 rounded-full" />
      <div className="absolute w-12 h-12 border-2 border-cyan-400/30 rounded-full" />
      <div className="absolute w-4 h-4 border-2 border-cyan-400/40 rounded-full" />
      <motion.div className="absolute w-full h-[1px] origin-left" style={{ background: "linear-gradient(90deg, transparent, rgba(59, 130, 246,0.4), transparent)" }} animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
      <span className="absolute top-3 left-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Frontend</span>
      <span className="absolute top-3 right-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Backend</span>
      <span className="absolute bottom-3 right-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Tools</span>
      <span className="absolute bottom-3 left-4 text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Emerging</span>
      <motion.div className="absolute w-2 h-2 bg-cyan-400 rounded-full" style={{ boxShadow: "0 0 10px rgba(59, 130, 246,0.6)" }} animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
    </div>
  );
}

// ─── Glass Card Wrapper ───
function GlassCard({ children, accentColor, delay, className }) {
  return (
    <motion.div className={`rounded-xl p-5 relative overflow-hidden ${className || ""}`} style={{ background: "linear-gradient(135deg, rgba(15,15,30,0.9) 0%, rgba(20,15,40,0.9) 100%)", border: `1px solid ${accentColor || "hsl(var(--primary))"}20`, boxShadow: `0 4px 30px rgba(0,0,0,0.3), 0 0 20px ${accentColor || "hsl(var(--primary))"}08` }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: delay || 0 }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accentColor || "hsl(var(--primary))"}, transparent)` }} />
      {children}
    </motion.div>
  );
}

// ─── Startup Health Card ───
function StartupHealthCard({ item, index }) {
  const scoreAnimated = useCountUp(item.score, 1800);
  const Icon = item.icon;
  const getHealthColor = (s) => s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";
  const getHealthGlow = (s) => s >= 75 ? "rgba(16, 185, 129,0.3)" : s >= 50 ? "rgba(245, 158, 11,0.3)" : "rgba(239, 68, 68,0.3)";

  return (
    <motion.div className="rounded-xl p-4 text-center cursor-default" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}15` }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.08 }} whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${item.color}22` }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
        <Icon size={18} style={{ color: item.color }} />
      </div>
      <div className="text-2xl font-bold tabular-nums mb-0.5" style={{ color: getHealthColor(item.score), textShadow: `0 0 10px ${getHealthGlow(item.score)}` }}>{scoreAnimated}</div>
      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{item.label}</div>
      <div className="w-full bg-gray-800/60 rounded-full h-1 mt-2 overflow-hidden">
        <motion.div className="h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}88, ${item.color})` }} initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 + index * 0.08 }} />
      </div>
    </motion.div>
  );
}

// ─── Quick Stat Row ───
function QuickStatRow({ stat, index }) {
  const animVal = useCountUp(stat.value, 1500);
  const Icon = stat.icon;

  return (
    <motion.div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.08 }} whileHover={{ background: "rgba(255,255,255,0.04)", x: 3 }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>
          <Icon size={13} style={{ color: stat.color }} />
        </div>
        <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: stat.color, textShadow: `0 0 6px ${stat.color}44` }}>{animVal}{stat.suffix}</span>
    </motion.div>
  );
}

// ─── Top Bar ───
function MissionTopBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="h-11 flex items-center justify-between px-4 border-b flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(30,27,46,0.95) 0%, rgba(45,27,105,0.95) 100%)", borderColor: "rgba(59, 130, 246,0.15)", boxShadow: "0 2px 20px rgba(59, 130, 246,0.1)" }} initial={{ y: -44 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)))", boxShadow: "0 0 10px rgba(59, 130, 246,0.3)" }}>TR</div>
          <span className="font-bold text-sm" style={{ color: "hsl(var(--primary))", textShadow: "0 0 10px rgba(59, 130, 246,0.3)" }}>Founder OS</span>
          <span className="text-gray-500 text-xs font-mono hidden sm:inline">v3.0</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(16, 185, 129,0.1)", border: "1px solid rgba(16, 185, 129,0.2)" }}>
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Radio size={10} style={{ color: "#10B981" }} />
          </motion.div>
          <span className="text-xs font-bold hidden sm:inline" style={{ color: "#10B981" }}>Mission Hub</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-xs font-mono hidden md:inline">{date}</span>
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: "hsl(var(--primary))" }} />
          <span className="text-xs font-mono" style={{ color: "hsl(var(--primary))", textShadow: "0 0 8px rgba(59, 130, 246,0.3)" }}>{time}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Left Sidebar ───
function MissionSidebar() {
  const { state, setActiveSection, toggleTerminal, toggleAI } = useApp();

  return (
    <motion.aside className="w-14 flex flex-col items-center py-3 border-r flex-shrink-0 hidden md:flex" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)", borderColor: "rgba(255,255,255,0.06)" }} initial={{ x: -56 }} animate={{ x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
      {sidebarItems.map(function(item) {
        const isActive = state.activeSection === item.id;
        const Icon = item.icon;
        return (
          <motion.button key={item.id} onClick={function() { setActiveSection(item.id); }} className="relative w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-all group" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            {isActive && (
              <motion.div className="absolute inset-0 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(59, 130, 246,0.2), rgba(59, 130, 246,0.2))", boxShadow: "0 0 15px rgba(59, 130, 246,0.2)" }} layoutId="missionSidebarActive" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            )}
            <Icon size={18} className="relative z-10 transition-colors" style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
            <div className="absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50" style={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(59, 130, 246,0.2)", color: "hsl(var(--primary))" }}>{item.label}</div>
          </motion.button>
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-1">
        <motion.button onClick={toggleTerminal} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-cyan-400 transition-colors" whileHover={{ scale: 1.1 }}><Terminal size={16} /></motion.button>
        <motion.button onClick={toggleAI} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-400 transition-colors" whileHover={{ scale: 1.1 }}><Bot size={16} /></motion.button>
      </div>
    </motion.aside>
  );
}

// ═══════════════════════════════════════════
// MAIN MISSIONHUB COMPONENT
// ═══════════════════════════════════════════
export default function MissionHub() {
  const { state } = useApp();

  const { data: profile, loading, error } = useApi(async () => {
    const [projects, skills, achievements] = await Promise.all([
      api.getProjects(),
      api.getSkills(),
      api.getAchievements(),
    ]);

    return {
      name: "TOSIF RAZA",
      roles: ["Software Engineer", "Startup Founder", "Problem Solver", "System Architect"],
      bio: "Building the future, one commit at a time. From Kolkata to the world — engineering solutions that matter.",
      stats: {
        projects: projects.length,
        technologies: skills.length,
        commits: 1200,
        startups: 1,
      },
      currentStatus: {
        project: projects[0]?.name || "SkillBridge",
        phase: "MVP Phase",
        lastCommit: "2 hours ago",
        streak: 14,
      },
    };
  });

  // Hooks must always run before conditional returns.
  const [roleIndex, setRoleIndex] = useState(0);
  const completionAnimated = useCountUp(missionStatus.completion, 2000);

  useEffect(function() {
    if (!profile?.roles?.length) return;

    const interval = setInterval(function() {
      setRoleIndex(function(prev) {
        return (prev + 1) % profile.roles.length;
      });
    }, 3000);

    return function() {
      clearInterval(interval);
    };
  }, [profile?.roles?.length]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading mission data...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!profile) return null;

  // ─── Quick Stats Data ───
  // This must be inside MissionHub because profile is created by useApi.
  const quickStats = [
    { label: "GitHub Commits", value: profile.stats.commits, suffix: "+", icon: GitCommit, color: "hsl(var(--primary))" },
    { label: "Startups Founded", value: profile.stats.startups, suffix: "", icon: Building2, color: "#F59E0B" },
    { label: "Current Streak", value: profile.currentStatus.streak, suffix: "d", icon: Flame, color: "#F472B6" },
    { label: "Tech Adopted", value: profile.stats.technologies, suffix: "", icon: Cpu, color: "#10B981" },
  ];

  const activities = [
    { icon: <Rocket size={14} className="text-white" />, text: "Deployed SkillBridge v2.1 to production", time: "2h ago", iconBg: "#16a34a" },
    { icon: <GitBranch size={14} className="text-white" />, text: "Merged PR #142 — Auth refactor", time: "5h ago", iconBg: "hsl(var(--primary))" },
    { icon: <Users size={14} className="text-white" />, text: "Attended React India Meetup", time: "1d ago", iconBg: "hsl(var(--primary))" },
    { icon: <BookOpen size={14} className="text-white" />, text: 'Published "Scaling Node.js" article', time: "3d ago", iconBg: "#F59E0B" },
    { icon: <GitBranch size={14} className="text-white" />, text: "Open source contribution to React Aria", time: "5d ago", iconBg: "hsl(var(--primary))" },
  ];

  const techRadarData = [
    { label: "Frontend", percentage: 89, color: "purple" },
    { label: "Backend", percentage: 83, color: "blue" },
    { label: "Tools", percentage: 78, color: "cyan" },
    { label: "Emerging", percentage: 68, color: "green" },
  ];

  const priorityConfig = {
    critical: { color: "#EF4444", bg: "rgba(239, 68, 68,0.15)", border: "rgba(239, 68, 68,0.25)", label: "CRITICAL" },
    high: { color: "#F59E0B", bg: "rgba(245, 158, 11,0.15)", border: "rgba(245, 158, 11,0.25)", label: "HIGH" },
    medium: { color: "hsl(var(--primary))", bg: "rgba(59, 130, 246,0.15)", border: "rgba(59, 130, 246,0.25)", label: "MEDIUM" },
    low: { color: "hsl(var(--primary))", bg: "rgba(59, 130, 246,0.15)", border: "rgba(59, 130, 246,0.25)", label: "LOW" },
  };

  const objectiveStatusConfig = {
    ahead: { color: "#10B981", label: "Ahead", icon: ArrowUpRight },
    "on-track": { color: "hsl(var(--primary))", label: "On Track", icon: TrendingUp },
    behind: { color: "#F59E0B", label: "Behind", icon: AlertTriangle },
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary) / 0.15) 50%, hsl(var(--card)) 100%)" }}>
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59, 130, 246,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59, 130, 246,0.06) 0%, transparent 70%)" }} />

      <MissionTopBar />

      <div className="flex flex-1 overflow-hidden">
        <MissionSidebar />

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <motion.div className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: "hsl(var(--foreground))", textShadow: "0 0 20px rgba(59, 130, 246,0.2)" }}>Mission Hub</h1>
            <p className="text-gray-400 text-sm md:text-base">Command center — overview of current status</p>
          </motion.div>

          <GlassCard accentColor="#10B981" delay={0.1} className="mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129,0.2), rgba(59, 130, 246,0.2))", border: "1px solid rgba(16, 185, 129,0.3)", boxShadow: "0 0 20px rgba(16, 185, 129,0.15)" }} animate={{ boxShadow: ["0 0 20px rgba(16, 185, 129,0.15)", "0 0 30px rgba(16, 185, 129,0.3)", "0 0 20px rgba(16, 185, 129,0.15)"] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Shield size={24} style={{ color: "#10B981" }} />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16, 185, 129,0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129,0.25)" }}>{missionStatus.status}</span>
                    <span className="text-xs font-mono text-gray-400">{missionStatus.sprint}</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{missionStatus.phase}</h2>
                  <p className="text-xs text-gray-400">Last deployment: {missionStatus.lastDeployment}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <motion.circle cx="32" cy="32" r="28" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 28}`} initial={{ strokeDashoffset: 2 * Math.PI * 28 }} animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - missionStatus.completion / 100) }} transition={{ duration: 2, ease: "easeOut" }} style={{ filter: "drop-shadow(0 0 6px rgba(16, 185, 129,0.4))" }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold" style={{ color: "#10B981", textShadow: "0 0 8px rgba(16, 185, 129,0.4)" }}>{completionAnimated}%</span></div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center"><div className="text-xl font-bold" style={{ color: "#F59E0B", textShadow: "0 0 8px rgba(245, 158, 11,0.3)" }}>{missionStatus.daysLeft}</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">Days Left</div></div>
                <div className="text-center"><div className="text-xl font-bold" style={{ color: "hsl(var(--primary))", textShadow: "0 0 8px rgba(59, 130, 246,0.3)" }}>{missionStatus.uptime}</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">Uptime</div></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard accentColor="hsl(var(--primary))" delay={0.2} className="mb-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold relative" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)))", boxShadow: "0 0 20px rgba(59, 130, 246,0.3), 0 0 40px rgba(59, 130, 246,0.2)" }} whileHover={{ scale: 1.05, rotate: 2 }}>
                  TR
                  <motion.div className="absolute inset-[-3px] rounded-xl" style={{ border: "1px solid rgba(59, 130, 246,0.3)" }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--foreground))", textShadow: "0 0 15px rgba(59, 130, 246,0.15)" }}>{profile.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AnimatePresence mode="wait">
                      <motion.span key={roleIndex} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.3 }} className="text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>{profile.roles[roleIndex]}</motion.span>
                    </AnimatePresence>
                    <span className="text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5" style={{ background: "rgba(16, 185, 129,0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129,0.25)", boxShadow: "0 0 10px rgba(16, 185, 129,0.1)" }}>
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />Available
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-gray-400 text-sm font-medium">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
                <div className="flex items-center gap-1 justify-end mt-1"><Clock size={12} style={{ color: "hsl(var(--primary))" }} /><span className="text-sm font-mono" style={{ color: "hsl(var(--primary))", textShadow: "0 0 8px rgba(59, 130, 246,0.3)" }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}</span></div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2 uppercase tracking-widest" style={{ color: "hsl(var(--primary))", textShadow: "0 0 10px rgba(59, 130, 246,0.2)" }}>System A</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>

            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-1.5" style={{ color: "#EF4444" }}><MapPin size={14} /><span className="font-medium">India IN</span></div>
              <div className="flex items-center gap-1.5" style={{ color: "#F59E0B" }}><Star size={14} /><span className="font-medium">Open to opportunities</span></div>
              <div className="flex items-center gap-1.5" style={{ color: "#10B981" }}><Flame size={14} /><span className="font-medium">{profile.currentStatus.streak}d streak</span></div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <GlassCard accentColor="hsl(var(--primary))" delay={0.3}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59, 130, 246,0.2)", border: "1px solid rgba(59, 130, 246,0.3)" }}><Target size={16} style={{ color: "hsl(var(--primary))" }} /></div>
                <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Q3 Objectives</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(59, 130, 246,0.15)", color: "hsl(var(--primary))", border: "1px solid rgba(59, 130, 246,0.2)" }}>5 OKRs</span>
              </div>

              <div className="space-y-3">
                {q3Objectives.map(function(obj, i) {
                  const statusCfg = objectiveStatusConfig[obj.status] || objectiveStatusConfig["on-track"];
                  const StatusIcon = statusCfg.icon;
                  const ObjIcon = obj.icon;
                  return (
                    <motion.div key={obj.id} className="rounded-lg p-3 group cursor-default" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }} whileHover={{ background: "rgba(255,255,255,0.04)", x: 3 }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><ObjIcon size={14} style={{ color: obj.color }} /><span className="text-sm font-medium text-gray-200">{obj.title}</span></div>
                        <div className="flex items-center gap-1.5"><StatusIcon size={12} style={{ color: statusCfg.color }} /><span className="text-[10px] font-bold uppercase" style={{ color: statusCfg.color }}>{statusCfg.label}</span></div>
                      </div>
                      <div className="w-full bg-gray-800/60 rounded-full h-1.5 overflow-hidden"><motion.div className="h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${obj.color}88, ${obj.color})`, boxShadow: `0 0 6px ${obj.color}44` }} initial={{ width: 0 }} animate={{ width: `${obj.progress}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + i * 0.1 }} /></div>
                      <div className="text-right mt-1"><span className="text-[10px] font-bold tabular-nums" style={{ color: obj.color }}>{obj.progress}%</span></div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard accentColor="#F59E0B" delay={0.35}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245, 158, 11,0.2)", border: "1px solid rgba(245, 158, 11,0.3)" }}><Calendar size={16} style={{ color: "#F59E0B" }} /></div>
                <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Today's Priorities</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(245, 158, 11,0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11,0.2)" }}>{todaysPriorities.filter(function(p) { return p.done; }).length}/{todaysPriorities.length}</span>
              </div>

              <div className="space-y-2">
                {todaysPriorities.map(function(item, i) {
                  const config = priorityConfig[item.priority] || priorityConfig.medium;
                  return (
                    <motion.div key={item.id} className="flex items-center gap-3 rounded-lg p-3 group cursor-pointer" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }} whileHover={{ background: "rgba(255,255,255,0.04)", x: 3 }}>
                      <motion.div whileHover={{ scale: 1.15 }}>{item.done ? <CheckCircle2 size={18} style={{ color: "#10B981", filter: "drop-shadow(0 0 4px rgba(16, 185, 129,0.4))" }} /> : <Circle size={18} style={{ color: "hsl(var(--muted-foreground))" }} />}</motion.div>
                      <div className="flex-1 min-w-0"><span className={`text-sm font-medium ${item.done ? "line-through text-gray-500" : "text-gray-200"}`}>{item.task}</span><div className="text-[10px] text-gray-500 mt-0.5">{item.category}</div></div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>{config.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          <GlassCard accentColor="#F472B6" delay={0.4} className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,107,157,0.2)", border: "1px solid rgba(255,107,157,0.3)" }}><HeartPulse size={16} style={{ color: "#F472B6" }} /></div>
              <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Startup Health — SkillBridge</h3>
              <motion.div className="w-2 h-2 rounded-full" style={{ background: "#10B981", boxShadow: "0 0 8px rgba(16, 185, 129,0.4)" }} animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{startupHealthList.map(function(item, i) { return <StartupHealthCard key={item.key} item={item} index={i} />; })}</div>
          </GlassCard>

          <GlassCard accentColor="#F59E0B" delay={0.45} className="mb-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245, 158, 11,0.2)", border: "1px solid rgba(245, 158, 11,0.3)" }}><Flag size={16} style={{ color: "#F59E0B" }} /></div>
              <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Vision 2030</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(245, 158, 11,0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11,0.2)" }}>5-Year Roadmap</span>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-6 bottom-6 w-[2px]" style={{ background: "linear-gradient(to bottom, #F59E0B, hsl(var(--primary)), hsl(var(--primary)))" }} />
              {vision2030.map(function(item, i) {
                const isCurrent = item.status === "current";
                const isUpcoming = item.status === "upcoming";
                const Icon = item.icon;
                return (
                  <motion.div key={item.year} className="flex items-start gap-4 relative mb-5 last:mb-0" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.12 }}>
                    <div className="relative z-10 flex-shrink-0">
                      <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isCurrent ? "linear-gradient(135deg, #F59E0B, #F472B6)" : isUpcoming ? "rgba(255,255,255,0.04)" : "rgba(59, 130, 246,0.2)", border: isCurrent ? "1px solid rgba(245, 158, 11,0.4)" : "1px solid rgba(255,255,255,0.08)", boxShadow: isCurrent ? "0 0 20px rgba(245, 158, 11,0.3), 0 0 40px rgba(255,107,157,0.15)" : "none" }} animate={isCurrent ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 3, repeat: Infinity }}>
                        <Icon size={16} style={{ color: isCurrent ? "#fff" : isUpcoming ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))" }} />
                      </motion.div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold font-mono" style={{ color: isCurrent ? "#F59E0B" : isUpcoming ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))", textShadow: isCurrent ? "0 0 10px rgba(245, 158, 11,0.3)" : "none" }}>{item.year}</span>
                        {isCurrent && <motion.span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245, 158, 11,0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11,0.25)" }} animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>NOW</motion.span>}
                      </div>
                      <p className={`text-sm ${isUpcoming ? "text-gray-500" : isCurrent ? "text-gray-200 font-medium" : "text-gray-400"}`}>{item.milestone}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard accentColor="hsl(var(--primary))" delay={0.5}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59, 130, 246,0.2)", border: "1px solid rgba(59, 130, 246,0.3)" }}><Activity size={16} style={{ color: "hsl(var(--primary))" }} /></div>
              <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Recent Activity</h3>
              <motion.span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(16, 185, 129,0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129,0.25)" }} animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}><Radio size={8} /> LIVE</motion.span>
            </div>

            <div>
              {activities.map(function(item, i) {
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
                    <ActivityItem icon={item.icon} text={item.text} time={item.time} iconBg={item.iconBg} />
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <motion.div className="w-72 xl:w-80 p-4 space-y-4 overflow-y-auto border-l hidden lg:block flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <GlassCard accentColor="hsl(var(--primary))" delay={0.2}>
            <div className="flex items-center gap-2 mb-5"><Eye size={18} style={{ color: "hsl(var(--primary))" }} /><h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Vision Tracker</h3></div>
            <div className="grid grid-cols-2 gap-4">
              <MetricCircle value={profile.stats.projects} label="Projects" color="cyan" />
              <MetricCircle value={profile.stats.technologies} label="Tech" color="cyan" suffix="+" />
              <MetricCircle value={3} label="Exp (yrs)" color="green" />
              <MetricCircle value={5} label="Open Src" color="amber" />
            </div>
          </GlassCard>

          <GlassCard accentColor="#10B981" delay={0.3}>
            <div className="flex items-center gap-2 mb-4"><Satellite size={18} style={{ color: "#10B981" }} /><h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Tech Radar</h3></div>
            <RadarVisualization />
            {techRadarData.map(function(item, i) {
              return <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}><TechRadarBar label={item.label} percentage={item.percentage} color={item.color} /></motion.div>;
            })}
          </GlassCard>

          <GlassCard accentColor="#F472B6" delay={0.4}>
            <div className="flex items-center gap-2 mb-4"><BarChart3 size={18} style={{ color: "#F472B6" }} /><h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Quick Stats</h3></div>
            <div className="space-y-3">{quickStats.map(function(stat, i) { return <QuickStatRow key={stat.label} stat={stat} index={i} />; })}</div>
          </GlassCard>

          <GlassCard accentColor="#10B981" delay={0.5}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: "#10B981", boxShadow: "0 0 8px rgba(16, 185, 129,0.4)" }}>
                <motion.div animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#10B981" }}>Currently Building</h3>
            </div>

            <div className="rounded-lg p-3" style={{ background: "rgba(16, 185, 129,0.04)", border: "1px solid rgba(16, 185, 129,0.1)" }}>
              <div className="text-base font-bold text-white mb-1">{profile.currentStatus.project}</div>
              <div className="text-xs text-gray-400 mb-2">{profile.currentStatus.phase}</div>
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Last commit: {profile.currentStatus.lastCommit}</span>
                <span className="flex items-center gap-1" style={{ color: "#F59E0B" }}><Flame size={10} /> {profile.currentStatus.streak}d</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
