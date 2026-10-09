 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { getCommandResponse } from "@/data/terminalCommands";


export default function Terminal() {
  const { state, dispatch } = useApp();
  const [history, setHistory] = useState([
    { type: "output", text: "FOUNDER OS Terminal v3.0\nType 'help' for available commands.\n" },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    _optionalChain([bottomRef, 'access', _ => _.current, 'optionalAccess', _2 => _2.scrollIntoView, 'call', _3 => _3({ behavior: "smooth" })]);
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_TERMINAL" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const executeCommand = (cmd) => {
    const newHistory = [...history, { type: "input" , text: cmd }];
    const response = getCommandResponse(cmd);

    if (response === "__CLEAR__") {
      setHistory([]);
    } else {
      setHistory([...newHistory, { type: "output", text: response }]);
    }
    setInput("");
  };

  if (!state.terminalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-x-3 bottom-3 w-auto max-h-[min(55dvh,400px)] z-[40] flex flex-col rounded-xl overflow-hidden sm:inset-x-auto sm:bottom-4 sm:left-4 lg:left-20 sm:w-[min(500px,calc(100vw-2rem))] sm:max-h-[400px]"
        style={{
          background: "rgba(6, 6, 12, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch({ type: "SET_TERMINAL", payload: false })} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500" />
            <button className="w-3 h-3 rounded-full bg-amber-500/80" />
            <button className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-text-muted font-mono">founder-os:~</span>
          <div className="w-12" />
        </div>

        {/* Output area */}
        <div
          className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
          style={{ maxHeight: "min(280px, 38dvh)" }}
          onClick={() => _optionalChain([inputRef, 'access', _4 => _4.current, 'optionalAccess', _5 => _5.focus, 'call', _6 => _6()])}
        >
          {history.map((item, i) => (
            <div key={i} className={item.type === "input" ? "text-green-400 mb-1" : "text-text-secondary mb-2 whitespace-pre-wrap"}>
              {item.type === "input" ? `> ${item.text}` : item.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-border">
          <span className="text-green-400 font-mono text-xs">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") executeCommand(input); }}
            className="flex-1 bg-transparent text-text-primary font-mono text-xs focus:outline-none"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
