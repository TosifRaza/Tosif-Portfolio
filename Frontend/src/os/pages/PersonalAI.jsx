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
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>Personal AI</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {siteData?.ai?.privateIntro || 'Ask about your goals, learning, time and progress.'} Every answer is computed from your own records.
        </p>
      </div>

      <Panel className="flex-1 flex flex-col min-h-0" >
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot size={36} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-foreground mb-1">Try asking:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3 max-w-lg mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-muted/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
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
                    ? 'bg-gradient-to-r from-primary/25 to-primary/25 border border-primary/30 text-foreground'
                    : 'bg-muted/40 border border-border text-foreground'
                }`}
              >
                {m.text}
                {m.role === 'ai' && m.source && (
                  <div className="mt-2">
                    <Badge color={m.source.includes('llm') ? 'hsl(var(--primary))' : '#10B981'}>
                      {m.source === 'insights-engine+llm' ? 'LLM + DATA' : 'FROM YOUR DATA'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 flex items-center gap-2">
                <Sparkles size={13} className="text-pink-400 animate-pulse" />
                <span className="text-xs text-muted-foreground mono">Computing from your data…</span>
              </div>
            </div>
          )}
          {error && <div className="text-xs text-red-500 text-center">{error}</div>}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 pt-4 border-t border-border"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data…"
            className="flex-1 px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-pink-400/50"
          />
          <button type="submit" disabled={busy || !input.trim()} className="px-4 rounded-lg bg-gradient-to-r from-pink-400 to-primary text-white disabled:opacity-40">
            <Send size={15} />
          </button>
        </form>
      </Panel>
    </div>
  );
}
