import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import { Bot, Send, X, Loader2 } from "lucide-react";

// Default suggestions shown when the chat opens or after certain responses
const defaultSuggestions = [
  "Why hire Tosif?",
  "Show projects",
  "Show skills",
  "Show experience",
];

export default function FounderAI() {
  const { state, toggleAI } = useApp();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hey! I'm Founder AI — your guide to Tosif's portfolio. Ask me anything about his skills, projects, or startup journey.",
      followUp: defaultSuggestions,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call the backend AI recruiter endpoint
      // The backend pulls live data from MongoDB (projects, skills, timeline, achievements)
      // and returns a structured response based on the question's intent
      const res = await api.askRecruiter(text);

      // Build follow-up suggestions based on the intent
      const followUpMap = {
        why_hire: ["Show projects", "Show skills", "Show experience"],
        projects: ["Show skills", "Show experience", "Why hire Tosif?"],
        skills: ["Show projects", "Show experience", "Show achievements"],
        experience: ["Show projects", "Show skills", "Show achievements"],
        achievements: ["Show projects", "Show experience", "Contact info"],
        contact: ["Show projects", "Show skills", "Why hire Tosif?"],
        unknown: defaultSuggestions,
      };

      const aiMsg = {
        role: "ai",
        text: res.reply,
        followUp: res.suggestions || followUpMap[res.intent] || defaultSuggestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("[FounderAI] API error:", err);
      const aiMsg = {
        role: "ai",
        text:
          "⚠️ I'm having trouble connecting to the server right now. " +
          "Please make sure the backend is running on port 5000 and MongoDB Atlas is connected. " +
          "You can also explore the portfolio directly using the sidebar.",
        followUp: defaultSuggestions,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions =
    messages.length > 0 && messages[messages.length - 1].followUp
      ? messages[messages.length - 1].followUp
      : defaultSuggestions;

  if (!state.aiOpen) return null;

  return (
    <motion.div
      className="fixed bottom-4 right-4 w-[360px] max-h-[500px] z-[45] flex flex-col glass-strong rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-purple-400" />
          <span className="text-sm font-medium text-text-primary">Founder AI</span>
          <span className="text-[10px] text-text-muted ml-1">· Live</span>
        </div>
        <button onClick={toggleAI} className="p-1 rounded hover:bg-white/[0.06] text-text-secondary">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/20"
                  : "bg-white/[0.04] text-text-secondary border border-white/[0.06]"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm bg-white/[0.04] text-text-secondary border border-white/[0.06] flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-purple-400" />
              <span className="text-xs">Searching database…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 py-2 border-t border-white/[0.04]">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestions.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="text-[10px] px-2 py-1 rounded-full bg-white/[0.04] text-text-secondary hover:bg-white/[0.08] whitespace-nowrap border border-white/[0.04] disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills, projects..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-30"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
