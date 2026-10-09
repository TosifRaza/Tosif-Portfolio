import { useState } from 'react';
import { request } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { FaKey } from 'react-icons/fa';

/** SETTINGS — admin account password + system notes. */
export default function SettingsManager() {
  const { user, token } = useAuth();
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await request('/auth/change-password', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(pw),
      });
      setMsg({ ok: true, text: 'Password updated.' });
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Settings</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-1 text-sm text-neon-cyan mono uppercase tracking-widest">Admin password</h2>
          <p className="text-xs text-muted-foreground mb-4">Signed in as {user?.email}</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">Current password</label>
              <input type="password" required autoComplete="current-password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            </div>
            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">New password (min 8 chars)</label>
              <input type="password" required minLength={8} autoComplete="new-password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            </div>
            {msg && (
              <div className={`mono text-xs px-3 py-2 rounded-lg ${msg.ok ? 'text-neon-green bg-neon-green/10' : 'text-neon-red bg-neon-red/10'}`}>
                {msg.ok ? '✓ ' : '⚠ '}{msg.text}
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary">
              <FaKey size={12} /> {saving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4 text-sm text-neon-cyan mono uppercase tracking-widest">System</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><span className="text-foreground/80">TOSIF OS v5.0</span> — Personal Operating System + Professional Portfolio.</p>
            <p>• Public website: fully CMS-driven — profile, hero, about, experience, skills, projects, products, achievements, timeline, resume, navigation and section visibility.</p>
            <p>• Private OS: goals → milestones → tasks with automatic progress rollups, daily log, time tracking with timer, learning sessions, analytics, plan vs actual and estimated goal trajectories.</p>
            <p>• Draft/publish: projects, products and experience support draft → published → archived. Drafts never appear publicly.</p>
            <p>• Security: JWT auth, admin-only write routes, rate limiting, CORS whitelist, mass-assignment protection.</p>
            <p>• The leaked MongoDB credentials from the original archive have been removed — configure your own <span className="mono text-neon-cyan">MONGO_URI</span> in <span className="mono">Backend/.env</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
