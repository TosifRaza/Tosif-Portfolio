import { useEffect, useState } from 'react';
import { apiUrl, request } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { FaSave, FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * HERO & SITE CONFIG — the master switchboard of the public website:
 * hero content, section visibility + order, navigation, current mission,
 * global reach, stats mode and footer. Saving updates the public site instantly.
 */
export default function SiteManager() {
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

  const set = (path, value) => {
    setDoc((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const saved = await request('/site', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(doc),
      });
      setDoc(saved);
      setMsg({ ok: true, text: 'Site config saved — the public website reflects it immediately.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (idx, dir) => {
    const sections = [...doc.sections].sort((a, b) => a.order - b.order);
    const j = idx + dir;
    if (j < 0 || j >= sections.length) return;
    [sections[idx], sections[j]] = [sections[j], sections[idx]];
    set('sections', sections.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const moveNav = (idx, dir) => {
    const nav = [...doc.nav].sort((a, b) => a.order - b.order);
    const j = idx + dir;
    if (j < 0 || j >= nav.length) return;
    [nav[idx], nav[j]] = [nav[j], nav[idx]];
    set('nav', nav.map((n, i) => ({ ...n, order: i + 1 })));
  };

  if (loading) return <div className="mono text-sm text-muted">Loading site config…</div>;
  if (!doc) return <div className="mono text-sm text-neon-red">Failed to load site config.</div>;

  const sections = [...(doc.sections || [])].sort((a, b) => a.order - b.order);
  const nav = [...(doc.nav || [])].sort((a, b) => a.order - b.order);
  const input = 'input';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Hero & Site Config</h1>
        <p className="text-sm text-muted mt-1">Controls the public homepage content, section visibility/order, navigation and more.</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Hero */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4 text-sm text-neon-cyan mono uppercase tracking-widest">Hero</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="Badge"><input className={input} value={doc.hero?.badge || ''} onChange={(e) => set('hero.badge', e.target.value)} /></F>
            <F label="Heading"><input className={input} value={doc.hero?.heading || ''} onChange={(e) => set('hero.heading', e.target.value)} /></F>
            <F label="Subtitle"><input className={input} value={doc.hero?.subtitle || ''} onChange={(e) => set('hero.subtitle', e.target.value)} /></F>
            <F label="Description" full><textarea rows={2} className={`${input} resize-none`} value={doc.hero?.description || ''} onChange={(e) => set('hero.description', e.target.value)} /></F>
            <F label="Primary CTA — label"><input className={input} value={doc.hero?.primaryCta?.label || ''} onChange={(e) => set('hero.primaryCta.label', e.target.value)} /></F>
            <F label="Primary CTA — section target"><input className={input} value={doc.hero?.primaryCta?.target || ''} onChange={(e) => set('hero.primaryCta.target', e.target.value)} placeholder="projects" /></F>
            <F label="Secondary CTA — label"><input className={input} value={doc.hero?.secondaryCta?.label || ''} onChange={(e) => set('hero.secondaryCta.label', e.target.value)} /></F>
            <F label="Secondary CTA — target"><input className={input} value={doc.hero?.secondaryCta?.target || ''} onChange={(e) => set('hero.secondaryCta.target', e.target.value)} placeholder="contact" /></F>
          </div>
        </div>

        {/* Current mission */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4 text-sm text-neon-cyan mono uppercase tracking-widest">Current mission strip</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="Title" full><input className={input} value={doc.currentMission?.title || ''} onChange={(e) => set('currentMission.title', e.target.value)} /></F>
            <F label="Description" full><input className={input} value={doc.currentMission?.description || ''} onChange={(e) => set('currentMission.description', e.target.value)} /></F>
            <F label="Progress label"><input className={input} value={doc.currentMission?.progressLabel || ''} onChange={(e) => set('currentMission.progressLabel', e.target.value)} /></F>
          </div>
        </div>

        {/* Sections */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-1 text-sm text-neon-cyan mono uppercase tracking-widest">Sections — visibility & order</h2>
          <p className="text-xs text-muted mb-4">Disabled sections disappear from the public website (rendering, not CSS hiding).</p>
          <div className="space-y-2">
            {sections.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <button
                  onClick={() => set('sections', sections.map((x) => (x.key === s.key ? { ...x, enabled: !x.enabled } : x)))}
                  className={`p-1.5 rounded ${s.enabled ? 'text-neon-green' : 'text-muted'}`}
                  title={s.enabled ? 'Disable section' : 'Enable section'}
                >
                  {s.enabled ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
                </button>
                <span className={`text-sm flex-1 ${s.enabled ? '' : 'text-muted line-through'}`}>{s.label}</span>
                <span className="mono text-[10px] text-muted">{s.key}</span>
                <button onClick={() => moveSection(i, -1)} className="p-1.5 text-muted hover:text-white"><FaArrowUp size={11} /></button>
                <button onClick={() => moveSection(i, 1)} className="p-1.5 text-muted hover:text-white"><FaArrowDown size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-1 text-sm text-neon-cyan mono uppercase tracking-widest">Top navigation</h2>
          <p className="text-xs text-muted mb-4">Labels and order for the public top bar. Use target <code>section-key</code> for scroll sections or <code>/os</code> for the OS entry.</p>
          <div className="space-y-2">
            {nav.map((n, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <button onClick={() => set('nav', nav.map((x, xi) => (xi === i ? { ...x, enabled: !x.enabled } : x)))}
                  className={`p-1.5 rounded ${n.enabled ? 'text-neon-green' : 'text-muted'}`}>
                  {n.enabled ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
                </button>
                <input className="input flex-1" value={n.label} onChange={(e) => set('nav', nav.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)))} />
                <input className="input w-32 mono text-xs" value={n.target} onChange={(e) => set('nav', nav.map((x, xi) => (xi === i ? { ...x, target: e.target.value } : x)))} />
                <button onClick={() => moveNav(i, -1)} className="p-1.5 text-muted hover:text-white"><FaArrowUp size={11} /></button>
                <button onClick={() => moveNav(i, 1)} className="p-1.5 text-muted hover:text-white"><FaArrowDown size={11} /></button>
                <button onClick={() => set('nav', nav.filter((_, xi) => xi !== i))} className="p-1.5 text-neon-red"><FaTrash size={11} /></button>
              </div>
            ))}
            <button
              onClick={() => set('nav', [...nav, { label: 'New Item', target: 'about', enabled: true, order: nav.length + 1, scope: 'public' }])}
              className="btn-ghost text-xs"
            >
              <FaPlus size={11} /> Add nav item
            </button>
          </div>
        </div>

        {/* Stats + global reach + footer */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4 text-sm text-neon-cyan mono uppercase tracking-widest">Statistics & Global Reach</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <F label="Stats mode">
              <select className={input} value={doc.statsMode || 'auto'} onChange={(e) => set('statsMode', e.target.value)}>
                <option value="auto" className="bg-bg-card">auto (calculated from database counts)</option>
                <option value="manual" className="bg-bg-card">manual (enter your own)</option>
              </select>
            </F>
            <F label="Footer text" full><input className={input} value={doc.footer?.text || ''} onChange={(e) => set('footer.text', e.target.value)} /></F>
          </div>
          {doc.statsMode === 'manual' && (
            <div className="mb-4">
              <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">Manual stats (label,value per line)</label>
              <textarea
                rows={4}
                className={`${input} resize-none`}
                value={(doc.manualStats || []).map((s) => `${s.label},${s.value}`).join('\n')}
                onChange={(e) => set('manualStats', e.target.value.split('\n').filter(Boolean).map((l) => { const [label, value] = l.split(','); return { label: label.trim(), value: (value || '').trim() }; }))}
              />
            </div>
          )}
          <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">
            Global reach (region,note per line) — only real regions; empty = section shows nothing
          </label>
          <textarea
            rows={3}
            className={`${input} resize-none`}
            value={(doc.globalReach || []).map((g) => `${g.region},${g.note || ''}`).join('\n')}
            onChange={(e) => set('globalReach', e.target.value.split('\n').filter((l) => l.trim()).map((l) => { const [region, note] = l.split(','); return { region: region.trim(), note: (note || '').trim() }; }))}
          />
        </div>

        {msg && (
          <div className={`mono text-xs px-3 py-2 rounded-lg ${msg.ok ? 'text-neon-green bg-neon-green/10' : 'text-neon-red bg-neon-red/10'}`}>
            {msg.ok ? '✓ ' : '⚠ '}{msg.text}
          </div>
        )}

        <div className="flex justify-end sticky bottom-4">
          <button onClick={save} disabled={saving} className="btn-primary shadow-lg">
            <FaSave size={12} /> {saving ? 'Saving…' : 'Save site config'}
          </button>
        </div>
      </div>
    </div>
  );
}

function F({ label, children, full = false }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
