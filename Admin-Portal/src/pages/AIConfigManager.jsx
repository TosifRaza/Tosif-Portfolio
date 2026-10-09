import { useEffect, useState } from 'react';
import { apiUrl, request } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { FaSave } from 'react-icons/fa';

/** AI CONFIG — toggles and intro copy for the public + private AI assistants. */
export default function AIConfigManager() {
  const { token } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/api/site'))
      .then((r) => r.json())
      .then((d) => { setDoc(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await request('/site', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ai: doc.ai }),
      });
      setMsg({ ok: true, text: 'AI configuration saved.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mono text-sm text-muted">Loading…</div>;
  if (!doc) return <div className="mono text-sm text-neon-red">Failed to load.</div>;

  const set = (key, value) => setDoc({ ...doc, ai: { ...doc.ai, [key]: value } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">AI Configuration</h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          The assistants are honest by design: public AI answers from your CMS content; private AI computes answers
          from your OS data. No fake AI claims are ever made.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-5 max-w-2xl">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={!!doc.ai?.publicEnabled} onChange={(e) => set('publicEnabled', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
          <span className="text-sm">Enable public AI recruiter assistant</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={!!doc.ai?.privateEnabled} onChange={(e) => set('privateEnabled', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
          <span className="text-sm">Enable private Personal AI (inside TOSIF OS)</span>
        </label>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">Public intro prompt</label>
          <textarea rows={2} className="input resize-none" value={doc.ai?.publicIntro || ''} onChange={(e) => set('publicIntro', e.target.value)} />
        </div>
        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">Private intro prompt</label>
          <textarea rows={2} className="input resize-none" value={doc.ai?.privateIntro || ''} onChange={(e) => set('privateIntro', e.target.value)} />
        </div>

        <div className="p-4 rounded-lg bg-white/[0.02] border border-border mono text-[11px] text-muted leading-relaxed">
          Optional LLM enhancement (server-side): set <span className="text-neon-cyan">AI_BASE_URL</span>,{' '}
          <span className="text-neon-cyan">AI_API_KEY</span> and <span className="text-neon-cyan">AI_MODEL</span> in{' '}
          <span className="text-neon-cyan">Backend/.env</span> to any OpenAI-compatible endpoint. The computed data
          answer is then rephrased by the model — numbers still come from the database, never from the model.
        </div>

        {msg && (
          <div className={`mono text-xs px-3 py-2 rounded-lg ${msg.ok ? 'text-neon-green bg-neon-green/10' : 'text-neon-red bg-neon-red/10'}`}>
            {msg.ok ? '✓ ' : '⚠ '}{msg.text}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="btn-primary">
            <FaSave size={12} /> {saving ? 'Saving…' : 'Save AI config'}
          </button>
        </div>
      </div>
    </div>
  );
}
