import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { BOOT_LINES } from "@/utils/constants";


// ─── Phase 1: Void (black screen + dot) ───
function VoidPhase({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[#06060C]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-purple-500"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1, 1.5, 1],
          opacity: [0, 1, 0.5, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
      />
    </motion.div>
  );
}

// ─── Phase 2: Pulse (heartbeat glow) ───
function PulsePhase({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[#06060C]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Pulse ring */}
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-purple-500"
        animate={{
          scale: [1, 3, 1],
          opacity: [1, 0, 1],
        }}
        transition={{ duration: 1, repeat: 2 }}
      />
      <motion.div
        className="w-3 h-3 rounded-full bg-purple-400"
        animate={{
          scale: [1, 1.4, 1],
          boxShadow: [
            "0 0 10px rgba(124, 106, 255, 0.5)",
            "0 0 40px rgba(124, 106, 255, 0.8), 0 0 80px rgba(124, 106, 255, 0.3)",
            "0 0 10px rgba(124, 106, 255, 0.5)",
          ],
        }}
        transition={{ duration: 1, repeat: 2 }}
      />
    </motion.div>
  );
}

// ─── Phase 3: Scan + data fragments ───
function ScanPhase({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const fragments = ["TOSIF_RAZA.sys", "SKILL_MATRIX.db", "PROJECT_ARCHIVE/", "STARTUP_ENGINE.exe"];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[#06060C] overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scanline */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        initial={{ top: 0 }}
        animate={{ top: "100%" }}
        transition={{ duration: 1.5, ease: "linear" }}
      />

      {/* Data fragments */}
      <div className="relative space-y-2 font-mono text-sm">
        {fragments.map((frag, i) => (
          <motion.div
            key={frag}
            className="text-text-muted"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ delay: i * 0.3, duration: 0.5 }}
            style={{ color: "#6B6B80" }}
          >
            {"> "} {frag}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Phase 4: Text typing ───
function TextPhase({ onComplete }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedLines, setDisplayedLines] = useState([]);

  useEffect(() => {
    if (currentLine >= BOOT_LINES.length) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setDisplayedLines((prev) => [...prev, BOOT_LINES[currentLine]]);
      setCurrentLine((prev) => prev + 1);
    }, currentLine === 0 ? 200 : 150);

    return () => clearTimeout(timer);
  }, [currentLine, onComplete]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[#06060C]"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="font-mono text-sm space-y-1 max-w-lg">
        {displayedLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1 }}
            className={
              line === "ACCESS GRANTED"
                ? "text-green-400 font-bold mt-4"
                : line === ""
                  ? "h-4"
                  : line.startsWith("SYSTEM") || line.startsWith("STATUS")
                    ? "text-cyan-400"
                    : "text-text-secondary"
            }
            style={
              line === "ACCESS GRANTED"
                ? { color: "#00FF88", textShadow: "0 0 20px rgba(0, 255, 136, 0.5)" }
                : line.startsWith("SYSTEM") || line.startsWith("STATUS")
                  ? { color: "#00D4FF" }
                  : { color: "#6B6B80" }
            }
          >
            {line === "ACCESS GRANTED" ? "> " + line : line ? "> " + line : ""}
          </motion.div>
        ))}
        {currentLine < BOOT_LINES.length && (
          <span className="inline-block w-2 h-4 bg-purple-400 animate-blink" />
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Boot Sequence ───
export default function BootSequence() {
  const { state, bootComplete } = useApp();
  const [phase, setPhase] = useState(0);

  const nextPhase = () => setPhase((prev) => prev + 1);

  return (
    <AnimatePresence mode="wait">
      {!state.bootComplete && (
        <motion.div className="fixed inset-0 z-[100] bg-[#06060C]">
          {phase === 0 && <VoidPhase onComplete={nextPhase} />}
          {phase === 1 && <PulsePhase onComplete={nextPhase} />}
          {phase === 2 && <ScanPhase onComplete={nextPhase} />}
          {phase === 3 && <TextPhase onComplete={bootComplete} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
