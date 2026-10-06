import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import { Panel, Spinner, ErrorState, ProgressBar, fmtMinutes, btnGhost, inputCls } from '../components/ui.jsx';
import { Plus, X, Check } from 'lucide-react';

/**
 * SKILLS (private view) — current level vs target, learning hours, topics.
 * Example from the master prompt: Node.js — Current 6.2/10 → Target 8/10.
 */
export default function SkillsOS() {
  const { data: skills, loading, error, refetch } = useApi(() => osApi.learning.skills());
  const [openSkill, setOpenSkill] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [editLevels, setEditLevels] = useState(null); // {id, level, targetLevel}

  const saveLevels = async () => {
    try {
      await osApi.skills.update(editLevels.id, { level: Number(editLevels.level), targetLevel: Number(editLevels.targetLevel) });
      setEditLevels(null);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const addTopic = async (skillId) => {
    if (!newTopic.trim()) return;
    await osApi.learning.createTopic({ skillId, title: newTopic }).catch((e) => alert(e.message));
    setNewTopic('');
    refetch();
  };

  const toggleTopic = async (topicId) => {
    await osApi.learning.toggleTopic(topicId).catch((e) => alert(e.message));
    refetch();
  };

  const removeTopic = async (topicId) => {
    await osApi.learning.removeTopic(topicId).catch((e) => alert(e.message));
    refetch();
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <div className="mono text-[10px] text-[#7C6AFF] tracking-[0.3em]">// SKILLS_LEARNING_OS</div>
        <h1 className="text-2xl font-bold text-[#E8E8F0]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Skills + Learning OS</h1>
        <p className="text-xs text-[#6B6B80] mt-1">
          Current level → target level, learning hours and topics per skill. Levels are shown on the public site too; targets and hours stay private.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(skills || []).map((s) => {
          const total = Math.round((s.learningMinutes || 0) / 60 * 10) / 10; // hours
          const isOpen = openSkill === s._id;
          return (
            <div key={s._id} className={`glass rounded-xl p-5 ${isOpen ? 'sm:col-span-2' : ''}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <button onClick={() => setOpenSkill(isOpen ? null : s._id)} className="text-left flex-1">
                  <div className="text-base font-semibold text-[#E8E8F0]">{s.name}</div>
                  <div className="text-[10px] text-[#6B6B80] mono uppercase tracking-wider">{s.category}</div>
                </button>
                <button onClick={() => setEditLevels({ id: s._id, level: s.level, targetLevel: s.targetLevel || s.level })} className={btnGhost}>
                  edit
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                <div>
                  <div className="text-lg font-bold text-[#00D4FF]">{(s.level / 10).toFixed(1)}<span className="text-[10px] text-[#6B6B80]">/10</span></div>
                  <div className="text-[9px] text-[#6B6B80] mono uppercase">current</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#FFB800]">{((s.targetLevel || 0) / 10).toFixed(1)}<span className="text-[10px] text-[#6B6B80]">/10</span></div>
                  <div className="text-[9px] text-[#6B6B80] mono uppercase">target</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#7C6AFF]">{total}<span className="text-[10px] text-[#6B6B80]">h</span></div>
                  <div className="text-[9px] text-[#6B6B80] mono uppercase">logged</div>
                </div>
              </div>

              <div className="relative">
                <ProgressBar value={s.level} color="#00D4FF" />
                {s.targetLevel > 0 && (
                  <div
                    className="absolute -top-1 w-0.5 h-3 rounded bg-[#FFB800]"
                    style={{ left: `${s.targetLevel}%` }}
                    title={`target ${(s.targetLevel / 10).toFixed(1)}/10`}
                  />
                )}
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] mono uppercase tracking-widest text-[#6B6B80] mb-2">
                      Completed topics ({(s.completedTopics || []).length})
                    </div>
                    <div className="space-y-1 mb-3">
                      {(s.topics || []).filter((t) => t.status === 'done').map((t) => (
                        <div key={t._id} className="flex items-center gap-2 text-xs text-[#8B8B9F] group">
                          <Check size={11} className="text-[#00FF88]" />
                          <span className="flex-1">{t.title}</span>
                          <button onClick={() => removeTopic(t._id)} className="opacity-0 group-hover:opacity-100 text-[#FF3366] text-[10px]">remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] mono uppercase tracking-widest text-[#6B6B80] mb-2">
                      Remaining ({(s.topics || []).filter((t) => t.status !== 'done').length})
                    </div>
                    <div className="space-y-1">
                      {(s.topics || []).filter((t) => t.status !== 'done').map((t) => (
                        <div key={t._id} className="flex items-center gap-2 text-xs text-[#C8C8D8] group">
                          <button onClick={() => toggleTopic(t._id)} className="w-3 h-3 rounded-full border border-[#4A4A5E] hover:border-[#00FF88]" aria-label="Mark done" />
                          <span className="flex-1">{t.title}</span>
                          <button onClick={() => removeTopic(t._id)} className="opacity-0 group-hover:opacity-100 text-[#FF3366] text-[10px]">remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input
                        className={`${inputCls} text-xs`}
                        value={openSkill === s._id ? newTopic : ''}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTopic(s._id)}
                        placeholder="Add topic (e.g. Streams)"
                      />
                      <button onClick={() => addTopic(s._id)} className={btnGhost}><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="text-xs text-[#8B8B9F] space-y-2">
                    <div className="text-[10px] mono uppercase tracking-widest text-[#6B6B80]">Learning stats</div>
                    <div>Total logged: <span className="text-[#E8E8F0]">{fmtMinutes(s.learningMinutes)}</span> across {s.sessions} session(s)</div>
                    <div>This week: <span className="text-[#E8E8F0]">{fmtMinutes(s.weeklyMinutes)}</span></div>
                    <div className="text-[10px] text-[#4A4A5E] leading-relaxed pt-2">
                      Log sessions in the Learning module with this skill selected — hours and the weekly figure update automatically.
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editLevels && (
        <div className="fixed inset-0 z-[70] bg-black/75 flex items-center justify-center p-4" onClick={() => setEditLevels(null)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#E8E8F0]">Set levels (0-100)</h3>
              <button onClick={() => setEditLevels(null)} className="text-[#9B9BAF]"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mono text-[10px] uppercase tracking-widest text-[#8B8B9F] mb-1.5 block">Current level</label>
                <input type="number" min="0" max="100" className={inputCls} value={editLevels.level} onChange={(e) => setEditLevels({ ...editLevels, level: e.target.value })} />
              </div>
              <div>
                <label className="mono text-[10px] uppercase tracking-widest text-[#8B8B9F] mb-1.5 block">Target level</label>
                <input type="number" min="0" max="100" className={inputCls} value={editLevels.targetLevel} onChange={(e) => setEditLevels({ ...editLevels, targetLevel: e.target.value })} />
              </div>
              <button onClick={saveLevels} className={btnPrimary + ' w-full justify-center'}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
