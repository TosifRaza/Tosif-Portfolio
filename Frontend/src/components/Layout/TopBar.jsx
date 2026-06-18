import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { getGreeting } from "@/utils/helpers";


export default function TopBar() {
  const { state } = useApp();
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
      setGreeting(getGreeting());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-[72px] right-0 h-12 bg-[#06060C]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 z-10"
      initial={{ y: -48 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-text-secondary">
          FOUNDER OS v3.0
        </span>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-green-400 font-mono">ONLINE</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {state.recruiterMode && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono"
          >
            RECRUITER MODE
          </motion.span>
        )}
        <span className="text-xs text-text-muted font-mono">{greeting}</span>
        <span className="text-xs text-text-secondary font-mono">{time} IST</span>
      </div>
    </motion.header>
  );
}
