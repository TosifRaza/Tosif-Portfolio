import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getCommandResponse } from "@/data/terminalCommands";

export default function Terminal() {
  const { state, dispatch } = useApp();
  const [history, setHistory] = useState([
    { type: "output", text: "FOUNDER OS Terminal v3.0\nType 'help' for available commands.\n" },
  ]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        dispatch({ type: "TOGGLE_TERMINAL" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const executeCommand = (command) => {
    const newHistory = [...history, { type: "input", text: command }];
    const response = getCommandResponse(command);
    setHistory(response === "__CLEAR__" ? [] : [...newHistory, { type: "output", text: response }]);
    setInput("");
  };

  const handleDragStart = (event) => {
    if (event.button !== 0 || !panelRef.current) return;
    const bounds = panelRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };
    setPosition({ left: bounds.left, top: bounds.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDrag = (event) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !panel) return;

    const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
    setPosition({
      left: Math.min(maxLeft, Math.max(8, event.clientX - drag.offsetX)),
      top: Math.min(maxTop, Math.max(8, event.clientY - drag.offsetY)),
    });
  };

  const handleDragEnd = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  if (!state.terminalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        className={`fixed z-[60] flex max-h-[min(65dvh,440px)] flex-col overflow-hidden rounded-xl ${position ? "" : "inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-4 sm:left-4 lg:left-20"}`}
        style={{
          left: position?.left,
          top: position?.top,
          bottom: position ? "auto" : undefined,
          width: "min(500px, calc(100vw - 1.5rem))",
          background: "rgba(6, 6, 12, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="flex touch-none select-none cursor-move items-center justify-between border-b border-border px-4 py-2"
          onPointerDown={handleDragStart}
          onPointerMove={handleDrag}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          onDoubleClick={() => setPosition(null)}
          title="Drag to move; double-click to return to the corner"
        >
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-xs text-text-muted">founder-os:~</span>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => dispatch({ type: "SET_TERMINAL", payload: false })}
            className="rounded p-1 text-text-muted transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close terminal"
            title="Close terminal"
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
          style={{ maxHeight: "min(280px, 38dvh)" }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((item, index) => (
            <div key={index} className={item.type === "input" ? "mb-1 text-green-400" : "mb-2 whitespace-pre-wrap text-text-secondary"}>
              {item.type === "input" ? `> ${item.text}` : item.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-border px-4 py-2">
          <span className="font-mono text-xs text-green-400">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") executeCommand(input); }}
            className="flex-1 bg-transparent font-mono text-xs text-text-primary focus:outline-none"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
