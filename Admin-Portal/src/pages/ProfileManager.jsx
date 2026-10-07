import { useEffect, useState } from 'react';
import { api, apiUrl } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { FaSave } from 'react-icons/fa';

/** PROFILE — single source of truth for identity across the whole portfolio. */
export default function ProfileManager() {
  const { token } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/api/profile'))
      .then((r) => r.json())
      .then((d) => { setDoc(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (path, value) => {
    setDoc((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur[keys[i]] = { ...cur[keys[i]] };
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const saved = await api.request(`/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(doc),
      });
      setDoc(saved);
      setMsg({ ok: true, text: 'Profile saved — the public site updates immediately.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mono text-sm text-muted">Loading profile…</div>;
  if (!doc) return <div className="mono text-sm text-neon-red">Failed to load profile.</div>;

  const input = 'input';

  return (
    <div>
      <div className="mb-6">
        <div className="mono text-xs text-neon-cyan uppercase tracking-widest mb-1">// profile (singleton)</div>
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="text-sm text-muted mt-1">Identity used by the hero, about, resume, recruiter view and the AI assistant.</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-5 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Name"><input className={input} value={doc.name || ''} onChange={(e) => set('name', e.target.value)} /></F>
          <F label="Title"><input className={input} value={doc.title || ''} onChange={(e) => set('title', e.target.value)} /></F>
          <F label="Roles (comma separated)" full>
            <input className={input} value={(doc.roles || []).join(', ')} onChange={(e) => set('roles', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
          </F>
          <F label="Tagline" full><input className={input} value={doc.tagline || ''} onChange={(e) => set('tagline', e.target.value)} /></F>
          <F label="Short bio" full><textarea rows={2} className={`${input} resize-none`} value={doc.shortBio || ''} onChange={(e) => set('shortBio', e.target.value)} /></F>
          <F label="Long bio (About page supports paragraphs separated by blank lines)" full>
            <textarea rows={5} className={`${input} resize-none`} value={doc.longBio || ''} onChange={(e) => set('longBio', e.target.value)} />
          </F>
          <F label="Location"><input className={input} value={doc.location || ''} onChange={(e) => set('location', e.target.value)} /></F>
          <F label="Email"><input className={input} value={doc.email || ''} onChange={(e) => set('email', e.target.value)} /></F>
          <F label="Phone"><input className={input} value={doc.phone || ''} onChange={(e) => set('phone', e.target.value)} /></F>
          <F label="Avatar URL"><input className={input} value={doc.avatarUrl || ''} onChange={(e) => set('avatarUrl', e.target.value)} /></F>
          <F label="Cover image URL"><input className={input} value={doc.coverUrl || ''} onChange={(e) => set('coverUrl', e.target.value)} /></F>
          <F label="Availability — status"><input className={input} value={doc.availability?.status || ''} onChange={(e) => set('availability.status', e.target.value)} /></F>
          <F label="Availability — type"><input className={input} value={doc.availability?.type || ''} onChange={(e) => set('availability.type', e.target.value)} /></F>
          <F label="Availability — location"><input className={input} value={doc.availability?.location || ''} onChange={(e) => set('availability.location', e.target.value)} /></F>
          <F label="Availability — notice"><input className={input} value={doc.availability?.notice || ''} onChange={(e) => set('availability.notice', e.target.value)} /></F>
          <F label="GitHub URL"><input className={input} value={doc.socials?.github || ''} onChange={(e) => set('socials.github', e.target.value)} /></F>
          <F label="LinkedIn URL"><input className={input} value={doc.socials?.linkedin || ''} onChange={(e) => set('socials.linkedin', e.target.value)} /></F>
          <F label="Twitter URL"><input className={input} value={doc.socials?.twitter || ''} onChange={(e) => set('socials.twitter', e.target.value)} /></F>
          <F label="Website"><input className={input} value={doc.socials?.website || ''} onChange={(e) => set('socials.website', e.target.value)} /></F>
          <F label={'AI "why hire" pitch'} full>
            <textarea rows={4} className={`${input} resize-none`} value={doc.pitch || ''} onChange={(e) => set('pitch', e.target.value)} />
          </F>
        </div>

        {msg && (
          <div className={`mono text-xs px-3 py-2 rounded-lg ${msg.ok ? 'text-neon-green bg-neon-green/10' : 'text-neon-red bg-neon-red/10'}`}>
            {msg.ok ? '✓ ' : '⚠ '}{msg.text}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="btn-primary">
            <FaSave size={12} /> {saving ? 'Saving…' : 'Save profile'}
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
