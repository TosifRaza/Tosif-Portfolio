import { useEffect, useState } from 'react';
import { apiUrl, request } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';

/** ABOUT — paragraphs, highlights and values for the public About section. */
export default function AboutManager() {
  const { token } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/api/about'))
      .then((r) => r.json())
      .then((d) => { setDoc(d || { paragraphs: [], highlights: [], values: [], visible: true }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const saved = await request('/about', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(doc),
      });
      setDoc(saved);
      setMsg({ ok: true, text: 'About content saved.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mono text-sm text-muted">Loading…</div>;
  if (!doc) return <div className="mono text-sm text-neon-red">Failed to load about content.</div>;

  const input = 'input';
  const upd = (arr, i, key, val) => {
    const next = [...doc[arr]];
    next[i] = { ...next[i], [key]: val };
    setDoc({ ...doc, [arr]: next });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">About</h1>
      </div>

      <div className="space-y-6 max-w-3xl">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4 text-sm text-neon-cyan mono uppercase tracking-widest">Paragraphs</h2>
          <textarea
            rows={7}
            className={`${input} resize-none`}
            value={(doc.paragraphs || []).join('\n\n')}
            onChange={(e) => setDoc({ ...doc, paragraphs: e.target.value.split(/\n\s*\n/).filter((p) => p.trim()) })}
          />
          <p className="text-[11px] text-muted mt-1.5">Separate paragraphs with a blank line.</p>
        </div>

        {[
          { key: 'highlights', title: 'Highlights' },
          { key: 'values', title: 'Values' },
        ].map((group) => (
          <div key={group.key} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm text-neon-cyan mono uppercase tracking-widest">{group.title}</h2>
              <button
                onClick={() => setDoc({ ...doc, [group.key]: [...(doc[group.key] || []), { title: '', description: '' }] })}
                className="btn-ghost text-xs"
              >
                <FaPlus size={11} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {(doc[group.key] || []).map((item, i) => (
                <div key={i} className="grid sm:grid-cols-3 gap-3 items-start p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <input className={input} placeholder="Title" value={item.title || ''} onChange={(e) => upd(group.key, i, 'title', e.target.value)} />
                  <input className={`${input} sm:col-span-2`} placeholder="Description" value={item.description || ''} onChange={(e) => upd(group.key, i, 'description', e.target.value)} />
                  <div className="sm:col-span-3 flex justify-end">
                    <button onClick={() => setDoc({ ...doc, [group.key]: doc[group.key].filter((_, xi) => xi !== i) })} className="text-neon-red text-xs flex items-center gap-1">
                      <FaTrash size={10} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {msg && (
          <div className={`mono text-xs px-3 py-2 rounded-lg ${msg.ok ? 'text-neon-green bg-neon-green/10' : 'text-neon-red bg-neon-red/10'}`}>
            {msg.ok ? '✓ ' : '⚠ '}{msg.text}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="btn-primary">
            <FaSave size={12} /> {saving ? 'Saving…' : 'Save about'}
          </button>
        </div>
      </div>
    </div>
  );
}
