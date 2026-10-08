import { useRef, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import { apiUrl } from '@/utils/api';
import { Panel, Spinner, ErrorState, Badge } from '../components/ui.jsx';
import { Bot, Send, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'What did I learn today?',
  'What did I accomplish this week?',
  'Which goal is behind?',
  'Where am I spending most of my time?',
  'What should I focus on tomorrow?',
  'Am I progressing toward my goal?',
  'Which skill am I neglecting?',
];

/**
 * PERSONAL AI — private insight engine.
 * Answers are computed from YOUR database records (goals, activities, time,
 * learning). No fake AI claims: if an LLM key is configured on the server it
 * rephrases the computed answer; the numbers still come from the data.
 */
export default function PersonalAI() {
  const { data: siteData } = useApi(() => fetch(apiUrl('/api/site')).then((r) => r.json()));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  const ask = async (question) => {
    if (!question.trim() || busy) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setBusy(true);
    setError(null);
    try {
      const res = await osApi.insights.ask(question);
      setMessages((m) => [...m, { role: 'ai', text: res.reply, source: res.source, data: res.data }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Personal AI</h1>
        <p className="text-xs text-[#6B6B80] mt-1">
          {siteData?.ai?.privateIntro || 'Ask about your goals, learning, time and progress.'} Every answer is computed from your own records.
        </p>
      </div>

      <Panel className="flex-1 flex flex-col min-h-0" >
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot size={36} className="mx-auto mb-4 text-[#4A4A5E]" />
              <p className="text-sm text-[#C8C8D8] mb-1">Try asking:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3 max-w-lg mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#9B9BAF] hover:text-[#00D4FF] hover:border-[#00D4FF]/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-[#7C6AFF]/25 to-[#00D4FF]/25 border border-[#7C6AFF]/30 text-[#E8E8F0]'
                    : 'bg-white/[0.03] border border-white/[0.06] text-[#C8C8D8]'
                }`}
              >
                {m.text}
                {m.role === 'ai' && m.source && (
                  <div className="mt-2">
                    <Badge color={m.source.includes('llm') ? '#a855f7' : '#00FF88'}>
                      {m.source === 'insights-engine+llm' ? 'LLM + DATA' : 'FROM YOUR DATA'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-2">
                <Sparkles size={13} className="text-[#FF6B9D] animate-pulse" />
                <span className="text-xs text-[#6B6B80] mono">Computing from your data…</span>
              </div>
            </div>
          )}
          {error && <div className="text-xs text-[#FF3366] text-center">{error}</div>}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 pt-4 border-t border-white/[0.06]"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data…"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-sm text-[#E8E8F0] placeholder-[#4A4A5E] focus:outline-none focus:border-[#FF6B9D]/50"
          />
          <button type="submit" disabled={busy || !input.trim()} className="px-4 rounded-lg bg-gradient-to-r from-[#FF6B9D] to-[#7C6AFF] text-white disabled:opacity-40">
            <Send size={15} />
          </button>
        </form>
      </Panel>
    </div>
  );
}
