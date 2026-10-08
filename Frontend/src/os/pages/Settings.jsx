import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import { Panel, Field, inputCls, btnPrimary, btnGhost, fmtMinutes } from '../components/ui.jsx';
import { Save, KeyRound, Target, User, Check } from 'lucide-react';

const PLAN_CATEGORIES = ['work', 'learning', 'coding', 'exercise', 'reading', 'sleep', 'personal', 'other'];

/** SETTINGS — weekly plan targets, admin account password, system info. */
export default function Settings() {
  const { data: plan, loading, refetch: refetchPlan } = useApi(() => osApi.analytics.plan());
  const [planEdits, setPlanEdits] = useState({});
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  const savePlanRow = async (category, minutes) => {
    await osApi.analytics.updatePlan(category, { weeklyTargetMinutes: Number(minutes) || 0 }).catch((e) => alert(e.message));
  };

  const saveAllPlan = async () => {
    setSavingPlan(true);
    try {
      for (const [cat, val] of Object.entries(planEdits)) {
        await savePlanRow(cat, val);
      }
      setPlanEdits({});
      setPlanSaved(true);
      setTimeout(() => setPlanSaved(false), 2500);
      await refetchPlan();
    } finally {
      setSavingPlan(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg(null);
    try {
      await osApi.changePassword(pw.currentPassword, pw.newPassword);
      setPwMsg({ ok: true, text: 'Password updated.' });
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Settings</h1>
      </div>

      {/* Weekly plan */}
      <Panel
        title="Weekly Plan (hours per category)"
        subtitle="Powers Plan vs Actual. 0 = no target for that category."
        right={
          <div className="flex items-center gap-2">
            {planSaved && <span className="text-[11px] text-[#00FF88] flex items-center gap-1"><Check size={12} /> saved</span>}
            <button onClick={saveAllPlan} disabled={savingPlan || Object.keys(planEdits).length === 0} className={btnPrimary}>
              <Save size={13} /> Save plan
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="text-xs text-[#6B6B80] py-4">Loading plan…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(plan || []).filter((p) => PLAN_CATEGORIES.includes(p.category)).map((p) => (
              <Field key={p.category} label={`${p.category} (h/week)`}>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="168"
                    step="0.5"
                    className={inputCls}
                    value={planEdits[p.category] ?? (p.weeklyTargetMinutes ? p.weeklyTargetMinutes / 60 : 0)}
                    onChange={(e) => setPlanEdits({ ...planEdits, [p.category]: Number(e.target.value) * 60 })}
                  />
                </div>
                <div className="text-[10px] text-[#4A4A5E] mono mt-1">
                  = {fmtMinutes(planEdits[p.category] ?? (p.weeklyTargetMinutes || 0))} target
                </div>
              </Field>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Password */}
        <Panel title="Admin password" subtitle="You were created with a bootstrap password — change it here.">
          <form onSubmit={changePassword} className="space-y-4">
            <Field label="Current password">
              <input type="password" className={inputCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" required />
            </Field>
            <Field label="New password (min 8 chars)">
              <input type="password" className={inputCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" minLength={8} required />
            </Field>
            {pwMsg && (
              <div className={`text-xs px-3 py-2 rounded-lg ${pwMsg.ok ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-[#FF3366]/10 text-[#FF3366]'}`}>
                {pwMsg.text}
              </div>
            )}
            <button type="submit" disabled={savingPw} className={btnPrimary}>
              <KeyRound size={13} /> {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </Panel>

        {/* System info */}
        <Panel title="System">
          <div className="space-y-2.5 text-xs text-[#8B8B9F]">
            <div className="flex items-center gap-2"><Target size={13} className="text-[#00D4FF]" /> TOSIF OS v5.0 — Personal Operating System + Portfolio</div>
            <div>• Public site: CMS-driven, section visibility/order controlled from the Admin Control Center</div>
            <div>• Private mode: this OS — goals, tasks, time, learning, analytics, trajectory</div>
            <div>• Data lives in MongoDB; the backend computes all analytics and estimates</div>
            <div>• Goal trajectory = projection from recorded history, clearly labelled as an estimate</div>
            <div className="pt-2 border-t border-white/[0.06] text-[#4A4A5E] mono text-[10px]">
              Optional LLM: set AI_BASE_URL + AI_API_KEY + AI_MODEL in Backend/.env to let the Personal AI
              rephrase computed answers. Numbers always come from your data.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
