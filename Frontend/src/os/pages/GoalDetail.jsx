import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { osApi } from '../osApi.js';
import {
  Panel, ProgressBar, Spinner, ErrorState, Badge, Modal, Field, inputCls, btnPrimary, btnGhost, DeleteButton, fmtMinutes,
} from '../components/ui.jsx';
import {
  ArrowLeft, Plus, CheckCircle2, Circle, FileText, Link as LinkIcon, Link2, Users, CheckSquare,
  MoreVertical, Calendar, Phone, Mail, ChevronRight, Check, Trash2, Edit3, ExternalLink, Percent, Sparkles, X,
} from 'lucide-react';
import KnowledgeVault from '../components/KnowledgeVault.jsx';
import TaskDetailModal from '../components/TaskDetailModal.jsx';
import TaskTimerWidget from '../components/TaskTimerWidget.jsx';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = ['founder', 'career', 'learning', 'financial', 'health', 'personal'];

/** Goal detail: responsive mobile view matching TOSIF OS mobile design + full desktop workspace. */
export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: goal, loading, error, refetch } = useApi(() => osApi.goals.get(id));

  // Common modals & states
  const [msModal, setMsModal] = useState(false);
  const [taskFor, setTaskFor] = useState(null); // milestoneId | 'orphan'
  const [selectedTask, setSelectedTask] = useState(null);
  const [msForm, setMsForm] = useState({ title: '', description: '', dueDate: '' });
  const [taskForm, setTaskForm] = useState({ title: '', estimateMinutes: '', priority: 'medium', dueDate: '' });
  const [busy, setBusy] = useState(false);

  // Mobile-specific UI states
  const [activeVaultTab, setActiveVaultTab] = useState('contacts'); // 'notes' | 'resources' | 'contacts' | 'checklist'
  const [goalMenuOpen, setGoalMenuOpen] = useState(false);
  const [editGoalModal, setEditGoalModal] = useState(false);
  const [editGoalForm, setEditGoalForm] = useState({
    title: '', description: '', category: 'founder', priority: 'high', targetDate: '', status: 'active',
  });

  // Vault modals (mobile)
  const [contactModal, setContactModal] = useState({
    open: false, mode: 'add', index: null,
    data: { name: '', role: '', phone: '', email: '', link: '', notes: '' },
  });
  const [resourceModal, setResourceModal] = useState({
    open: false,
    data: { title: '', url: '', type: 'link' },
  });
  const [noteModal, setNoteModal] = useState({
    open: false, mode: 'add', index: null,
    data: { title: '', content: '' },
  });
  const [checklistModal, setChecklistModal] = useState({ open: false, text: '' });

  // Normalization for notes
  const notesList = useMemo(() => {
    if (!goal) return [];
    if (Array.isArray(goal.notesList) && goal.notesList.length > 0) return goal.notesList;
    if (typeof goal.notes === 'string' && goal.notes.trim()) {
      return [{ title: 'Overview & Strategy', content: goal.notes, updatedAt: new Date() }];
    }
    return [];
  }, [goal]);

  const notesCount = notesList.length;
  const resourcesCount = goal?.resources?.length || 0;
  const contactsCount = goal?.contacts?.length || 0;
  const checklistCount = goal?.checklist?.length || 0;

  // Standalone tasks & milestone tasks
  const orphanTasks = goal?.tasksWithoutMilestone || [];
  const milestones = goal?.milestones || [];
  const allTasks = useMemo(() => {
    if (!goal) return [];
    const msTasks = milestones.flatMap((m) => m.tasks || []);
    return [...orphanTasks, ...msTasks];
  }, [goal, orphanTasks, milestones]);

  if (loading) return <Spinner label="Loading goal…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // ── Milestone Handlers ──
  const addMilestone = async () => {
    if (!msForm.title.trim()) return;
    setBusy(true);
    try {
      await osApi.milestones.create({ goalId: id, title: msForm.title, description: msForm.description, dueDate: msForm.dueDate || null });
      setMsModal(false);
      setMsForm({ title: '', description: '', dueDate: '' });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleMilestone = async (m) => {
    try {
      await osApi.milestones.update(m._id, { status: m.status === 'done' ? 'in-progress' : 'done' });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteMilestone = async (m) => {
    if (!confirm(`Delete milestone "${m.title}"?`)) return;
    try {
      await osApi.milestones.remove(m._id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Task Handlers ──
  const addTask = async () => {
    if (!taskForm.title.trim()) return;
    setBusy(true);
    try {
      await osApi.tasks.create({
        goalId: id,
        milestoneId: taskFor === 'orphan' ? null : taskFor,
        title: taskForm.title,
        estimateMinutes: Number(taskForm.estimateMinutes) || 0,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
      });
      setTaskFor(null);
      setTaskForm({ title: '', estimateMinutes: '', priority: 'medium', dueDate: '' });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleTask = async (t) => {
    try {
      await osApi.tasks.toggle(t._id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTask = async (t) => {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    try {
      await osApi.tasks.remove(t._id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Goal Edit Handlers ──
  const openEditGoal = () => {
    setEditGoalForm({
      title: goal.title || '',
      description: goal.description || '',
      category: goal.category || 'founder',
      priority: goal.priority || 'high',
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
      status: goal.status || 'active',
    });
    setGoalMenuOpen(false);
    setEditGoalModal(true);
  };

  const saveGoalEdits = async () => {
    if (!editGoalForm.title.trim()) return;
    setBusy(true);
    try {
      await osApi.goals.update(id, {
        ...goal,
        ...editGoalForm,
        targetDate: editGoalForm.targetDate || null,
      });
      setEditGoalModal(false);
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ── Vault Handlers (Mobile) ──
  const saveContact = async () => {
    if (!contactModal.data.name.trim()) return;
    setBusy(true);
    try {
      const current = [...(goal.contacts || [])];
      if (contactModal.mode === 'edit' && contactModal.index !== null) {
        current[contactModal.index] = { ...current[contactModal.index], ...contactModal.data };
      } else {
        current.push(contactModal.data);
      }
      await osApi.goals.update(id, { ...goal, contacts: current });
      setContactModal({ open: false, mode: 'add', index: null, data: { name: '', role: '', phone: '', email: '', link: '', notes: '' } });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteContact = async (index) => {
    if (!confirm('Delete this contact?')) return;
    try {
      const current = (goal.contacts || []).filter((_, i) => i !== index);
      await osApi.goals.update(id, { ...goal, contacts: current });
      setContactModal({ open: false, mode: 'add', index: null, data: { name: '', role: '', phone: '', email: '', link: '', notes: '' } });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const saveResource = async () => {
    if (!resourceModal.data.title.trim() || !resourceModal.data.url.trim()) return;
    setBusy(true);
    try {
      const current = [...(goal.resources || []), resourceModal.data];
      await osApi.goals.update(id, { ...goal, resources: current });
      setResourceModal({ open: false, data: { title: '', url: '', type: 'link' } });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteResource = async (index) => {
    if (!confirm('Delete this resource?')) return;
    try {
      const current = (goal.resources || []).filter((_, i) => i !== index);
      await osApi.goals.update(id, { ...goal, resources: current });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const saveNote = async () => {
    if (!noteModal.data.title.trim()) return;
    setBusy(true);
    try {
      const current = [...notesList];
      if (noteModal.mode === 'edit' && noteModal.index !== null) {
        current[noteModal.index] = { ...current[noteModal.index], ...noteModal.data, updatedAt: new Date() };
      } else {
        current.unshift({ ...noteModal.data, _id: 'note-' + Date.now(), updatedAt: new Date() });
      }
      await osApi.goals.update(id, { ...goal, notesList: current, notes: current[0]?.content || '' });
      setNoteModal({ open: false, mode: 'add', index: null, data: { title: '', content: '' } });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteNote = async (index) => {
    if (!confirm('Delete this note?')) return;
    try {
      const current = notesList.filter((_, i) => i !== index);
      await osApi.goals.update(id, { ...goal, notesList: current, notes: current[0]?.content || '' });
      setNoteModal({ open: false, mode: 'add', index: null, data: { title: '', content: '' } });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const addChecklistItem = async () => {
    if (!checklistModal.text.trim()) return;
    setBusy(true);
    try {
      const current = [...(goal.checklist || []), { text: checklistModal.text.trim(), done: false }];
      await osApi.goals.update(id, { ...goal, checklist: current });
      setChecklistModal({ open: false, text: '' });
      await refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleChecklistItem = async (index) => {
    try {
      const current = (goal.checklist || []).map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      );
      await osApi.goals.update(id, { ...goal, checklist: current });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteChecklistItem = async (index) => {
    try {
      const current = (goal.checklist || []).filter((_, i) => i !== index);
      await osApi.goals.update(id, { ...goal, checklist: current });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open add dialog for active vault tab
  const openAddVault = () => {
    if (activeVaultTab === 'contacts') {
      setContactModal({ open: true, mode: 'add', index: null, data: { name: '', role: '', phone: '', email: '', link: '', notes: '' } });
    } else if (activeVaultTab === 'resources') {
      setResourceModal({ open: true, data: { title: '', url: '', type: 'link' } });
    } else if (activeVaultTab === 'notes') {
      setNoteModal({ open: true, mode: 'add', index: null, data: { title: '', content: '' } });
    } else if (activeVaultTab === 'checklist') {
      setChecklistModal({ open: true, text: '' });
    }
  };

  // Helper Desktop TaskRow
  const DesktopTaskRow = ({ t }) => {
    const hasExtras = !!(t.notes || t.resources?.length || t.contacts?.length || t.attachments?.length || t.checklist?.length);

    return (
      <div
        onClick={() => setSelectedTask(t)}
        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 cursor-pointer transition-all group"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(t);
          }}
          className="flex-shrink-0"
          aria-label="Toggle task"
        >
          {t.status === 'done' ? (
            <CheckCircle2 size={15} className="text-emerald-500" />
          ) : (
            <Circle size={15} className="text-muted-foreground group-hover:text-primary" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] truncate font-medium ${t.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {t.title}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-muted-foreground mono mt-0.5">
            <span>{t.priority}</span>
            {t.estimateMinutes ? <span>· ~{fmtMinutes(t.estimateMinutes)}</span> : null}
            {t.dueDate ? <span>· due {new Date(t.dueDate).toLocaleDateString()}</span> : null}
            {hasExtras && (
              <span className="text-primary font-semibold flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.2 rounded">
                Notes & Vault
              </span>
            )}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
          {!t.completedAt && t.status !== 'done' && (
            <TaskTimerWidget task={t} onTimerToggled={refetch} />
          )}
          <DeleteButton onConfirm={() => deleteTask(t)} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* ═══════════════════════════════════════════════════════════
          MOBILE VIEW (Exact visual layout matching reference screenshot)
          ═══════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden space-y-4 pb-8 max-w-md mx-auto">
        {/* 1. HERO GOAL CARD */}
        <div className="bg-card rounded-3xl p-5 border border-border/80 shadow-2xs space-y-3.5">
          {/* Title + Status + Three dots menu */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[22px] font-black text-foreground tracking-tight leading-snug" style={{ fontFamily: 'Inter, system-ui' }}>
              {goal.title}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {goal.status === 'completed' ? 'Completed' : goal.status === 'paused' ? 'Paused' : 'Active'}
              </span>
              <div className="relative">
                <button
                  onClick={() => setGoalMenuOpen((v) => !v)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Goal options"
                >
                  <MoreVertical size={18} />
                </button>
                {goalMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-card border border-border shadow-xl py-1.5 z-50">
                    <button
                      onClick={openEditGoal}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                    >
                      <Edit3 size={14} /> Edit Goal
                    </button>
                    <button
                      onClick={async () => {
                        setGoalMenuOpen(false);
                        const v = prompt('Set progress (0-100):', String(goal.progress || 0));
                        if (v === null) return;
                        await osApi.goals.update(id, { ...goal, progress: Number(v), progressMode: 'manual' });
                        refetch();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                    >
                      <Percent size={14} /> Set Progress
                    </button>
                    <button
                      onClick={async () => {
                        setGoalMenuOpen(false);
                        const next = goal.progressMode === 'manual' ? 'auto' : 'manual';
                        await osApi.goals.update(id, { ...goal, progressMode: next });
                        refetch();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={14} /> Mode: {goal.progressMode === 'manual' ? 'Auto' : 'Manual'}
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={async () => {
                        setGoalMenuOpen(false);
                        if (confirm(`Delete goal "${goal.title}"?`)) {
                          await osApi.goals.remove(id);
                          navigate('/os/goals');
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete Goal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags row: Category, Priority, Target Date */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 capitalize">
              {goal.category || 'Founder'}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 capitalize">
              {goal.priority || 'High'}
            </span>
            {goal.targetDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <Calendar size={13} className="text-slate-500 dark:text-slate-400" />
                {new Date(goal.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Goal description */}
          {goal.description && (
            <p className="text-sm text-muted-foreground leading-relaxed font-normal">
              {goal.description}
            </p>
          )}

          {/* Progress row & bar */}
          <div className="pt-1 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight" style={{ fontFamily: 'Inter, system-ui' }}>
                {goal.progress || 0}%
              </span>
              <button
                onClick={async () => {
                  if (goal.progressMode === 'manual') {
                    const v = prompt('Set progress (0-100):', String(goal.progress || 0));
                    if (v === null) return;
                    await osApi.goals.update(id, { ...goal, progress: Number(v) });
                    refetch();
                  }
                }}
                className="text-xs font-medium text-muted-foreground capitalize hover:text-primary transition-colors"
              >
                {goal.progressMode || 'Manual'}
              </button>
            </div>
            <div className="w-full h-2.5 bg-blue-100/80 dark:bg-blue-950/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, goal.progress || 0))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. QUICK VAULT 4-GRID NAVIGATION */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Notes */}
          <button
            type="button"
            onClick={() => setActiveVaultTab('notes')}
            className={`p-3 rounded-2xl bg-card border text-center flex flex-col items-center justify-center transition-all ${
              activeVaultTab === 'notes' ? 'border-blue-500 shadow-xs ring-2 ring-blue-500/20' : 'border-border/70 hover:border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5">
              <FileText size={19} strokeWidth={2.2} />
            </div>
            <span className="text-xs font-semibold text-foreground">Notes</span>
            <span className="text-xs text-muted-foreground mt-0.5">{notesCount}</span>
          </button>

          {/* Resources */}
          <button
            type="button"
            onClick={() => setActiveVaultTab('resources')}
            className={`p-3 rounded-2xl bg-card border text-center flex flex-col items-center justify-center transition-all ${
              activeVaultTab === 'resources' ? 'border-blue-500 shadow-xs ring-2 ring-blue-500/20' : 'border-border/70 hover:border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
              <Link2 size={19} strokeWidth={2.2} />
            </div>
            <span className="text-xs font-semibold text-foreground">Resources</span>
            <span className="text-xs text-muted-foreground mt-0.5">{resourcesCount}</span>
          </button>

          {/* Contacts */}
          <button
            type="button"
            onClick={() => setActiveVaultTab('contacts')}
            className={`p-3 rounded-2xl bg-card border text-center flex flex-col items-center justify-center transition-all ${
              activeVaultTab === 'contacts' ? 'border-blue-500 shadow-xs ring-2 ring-blue-500/20' : 'border-border/70 hover:border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-1.5">
              <Users size={19} strokeWidth={2.2} />
            </div>
            <span className="text-xs font-semibold text-foreground">Contacts</span>
            <span className="text-xs text-muted-foreground mt-0.5">{contactsCount}</span>
          </button>

          {/* Checklist */}
          <button
            type="button"
            onClick={() => setActiveVaultTab('checklist')}
            className={`p-3 rounded-2xl bg-card border text-center flex flex-col items-center justify-center transition-all ${
              activeVaultTab === 'checklist' ? 'border-blue-500 shadow-xs ring-2 ring-blue-500/20' : 'border-border/70 hover:border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
              <CheckSquare size={19} strokeWidth={2.2} />
            </div>
            <span className="text-xs font-semibold text-foreground">Checklist</span>
            <span className="text-xs text-muted-foreground mt-0.5">{checklistCount}</span>
          </button>
        </div>

        {/* 3. ACTIVE VAULT CARD (Contacts / Notes / Resources / Checklist) */}
        <div className="bg-card rounded-3xl p-5 border border-border/80 shadow-2xs space-y-3.5">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              {activeVaultTab === 'contacts' && <Users size={18} />}
              {activeVaultTab === 'resources' && <Link2 size={18} />}
              {activeVaultTab === 'notes' && <FileText size={18} />}
              {activeVaultTab === 'checklist' && <CheckSquare size={18} />}
              <span>
                {activeVaultTab === 'contacts' && `Contacts (${contactsCount})`}
                {activeVaultTab === 'resources' && `Resources (${resourcesCount})`}
                {activeVaultTab === 'notes' && `Notes (${notesCount})`}
                {activeVaultTab === 'checklist' && `Checklist (${checklistCount})`}
              </span>
            </div>
            <button
              onClick={openAddVault}
              className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              <Plus size={15} /> Add
            </button>
          </div>

          {/* Tab Content */}
          {activeVaultTab === 'contacts' && (
            contactsCount === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No contacts yet. Tap "+ Add" above to save key advisors, suppliers, or leads.
              </div>
            ) : (
              <div className="space-y-2.5">
                {goal.contacts.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => setContactModal({ open: true, mode: 'edit', index: idx, data: c })}
                    className="p-3.5 rounded-2xl border border-border/60 bg-slate-50/50 dark:bg-muted/20 hover:border-border cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-foreground truncate">{c.name}</div>
                      {c.role && <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.role}</div>}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                          <Phone size={13} className="text-muted-foreground/70 flex-shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Mail size={13} className="text-muted-foreground/70 flex-shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground/40 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )
          )}

          {activeVaultTab === 'notes' && (
            notesCount === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No notes yet. Tap "+ Add" above to write strategies, meeting notes, or ideas.
              </div>
            ) : (
              <div className="space-y-2.5">
                {notesList.map((n, idx) => (
                  <div
                    key={n._id || idx}
                    onClick={() => setNoteModal({ open: true, mode: 'edit', index: idx, data: n })}
                    className="p-3.5 rounded-2xl border border-border/60 bg-slate-50/50 dark:bg-muted/20 hover:border-border cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-foreground truncate">{n.title || 'Untitled Note'}</div>
                      {n.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {n.content}
                        </p>
                      )}
                      {n.updatedAt && (
                        <div className="text-[10px] text-muted-foreground/70 mt-1">
                          {new Date(n.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground/40 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )
          )}

          {activeVaultTab === 'resources' && (
            resourcesCount === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No resources yet. Tap "+ Add" above to link documents, designs, or links.
              </div>
            ) : (
              <div className="space-y-2.5">
                {goal.resources.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-border/60 bg-slate-50/50 dark:bg-muted/20 hover:border-border transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-foreground truncate">{res.title}</div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 truncate max-w-full"
                      >
                        <span className="truncate">{res.url}</span>
                        <ExternalLink size={12} className="flex-shrink-0" />
                      </a>
                    </div>
                    <button
                      onClick={() => deleteResource(idx)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                      aria-label="Delete resource"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {activeVaultTab === 'checklist' && (
            checklistCount === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Checklist is empty. Tap "+ Add" to add quick checklist action items.
              </div>
            ) : (
              <div className="space-y-2">
                {goal.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-border/60 bg-slate-50/50 dark:bg-muted/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleChecklistItem(idx)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                          item.done
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                        }`}
                        aria-label="Toggle checklist item"
                      >
                        {item.done && <Check size={13} strokeWidth={3} />}
                      </button>
                      <span className={`text-sm truncate ${item.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                        {item.text}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteChecklistItem(idx)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                      aria-label="Delete checklist item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* 4. TASKS SECTION */}
        <div className="bg-card rounded-3xl p-5 border border-border/80 shadow-2xs space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              <CheckSquare size={18} />
              <span>Tasks ({allTasks.length})</span>
            </div>
            <button
              onClick={() => setTaskFor('orphan')}
              className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              <Plus size={15} /> Add Task
            </button>
          </div>

          {/* If Milestones exist, show Milestones and their tasks */}
          {milestones.length > 0 && (
            <div className="space-y-3 pb-2">
              {milestones.map((m) => (
                <div key={m._id} className="rounded-2xl border border-border/70 bg-slate-50/40 dark:bg-muted/20 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleMilestone(m)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                          m.status === 'done'
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                        }`}
                        aria-label="Toggle milestone"
                      >
                        {m.status === 'done' && <Check size={13} strokeWidth={3} />}
                      </button>
                      <div className="min-w-0">
                        <div className={`text-sm font-bold truncate ${m.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {m.title}
                        </div>
                        {m.dueDate && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            due {new Date(m.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2">{m.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                  {m.tasks?.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {m.tasks.map((t) => (
                        <div
                          key={t._id}
                          onClick={() => setSelectedTask(t)}
                          className="p-3 rounded-xl border border-border/60 bg-card hover:border-border cursor-pointer transition-all flex items-center gap-3"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(t);
                            }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                              t.status === 'done'
                                ? 'bg-blue-600 text-white'
                                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                            }`}
                            aria-label="Toggle task"
                          >
                            {t.status === 'done' && <Check size={13} strokeWidth={3} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-bold truncate ${t.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {t.title}
                            </div>
                            {t.dueDate && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Calendar size={12} className="text-muted-foreground/70 flex-shrink-0" />
                                <span>{new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                          {t.priority && (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${
                              t.priority === 'critical' || t.priority === 'high'
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                                : t.priority === 'medium'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                            }`}>
                              {t.priority}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setTaskFor(m._id)}
                    className="w-full text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline py-1"
                  >
                    + Add task to {m.title}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Standalone Tasks (or all tasks if no milestones) */}
          {(milestones.length === 0 ? allTasks : orphanTasks).length === 0 && milestones.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No tasks added yet. Tap "+ Add Task" to get started.
            </div>
          ) : (
            <div className="space-y-2.5">
              {(milestones.length === 0 ? allTasks : orphanTasks).map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTask(t)}
                  className="p-3.5 rounded-2xl border border-border/60 bg-slate-50/50 dark:bg-muted/20 hover:border-border cursor-pointer transition-all flex items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(t);
                    }}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                      t.status === 'done'
                        ? 'bg-blue-600 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                    }`}
                    aria-label="Toggle task"
                  >
                    {t.status === 'done' && <Check size={13} strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${t.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {t.title}
                    </div>
                    {t.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Calendar size={13} className="text-muted-foreground/70 flex-shrink-0" />
                        <span>{new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                  {t.priority && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${
                      t.priority === 'critical' || t.priority === 'high'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : t.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}>
                      {t.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. STICKY / BOTTOM PRIMARY BUTTON */}
        <div className="pt-2">
          <button
            onClick={() => setMsModal(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-base shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP VIEW (Preserves original desktop layout & tools)
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block space-y-6 w-full">
        {/* Top Breadcrumb & Summary */}
        <div>
          <Link to="/os/goals" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mb-3">
            <ArrowLeft size={12} /> All goals
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: 'Inter, system-ui' }}>
                {goal.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                <Badge>{goal.category?.toUpperCase()}</Badge>
                <Badge color="#F59E0B">{goal.priority?.toUpperCase()}</Badge>
                <Badge color="hsl(var(--muted-foreground))">{goal.status?.toUpperCase()}</Badge>
                {goal.targetDate && <span>target {new Date(goal.targetDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="text-right min-w-[160px]">
              <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'Inter, system-ui' }}>{goal.progress}%</div>
              <div className="text-[10px] text-muted-foreground mono">progress ({goal.progressMode})</div>
              {goal.progressMode === 'manual' && (
                <button
                  onClick={async () => {
                    const v = prompt('Set progress (0-100):', String(goal.progress));
                    if (v === null) return;
                    await osApi.goals.update(id, { ...goal, progress: Number(v) });
                    refetch();
                  }}
                  className="text-[10px] text-primary hover:underline mt-1"
                >
                  set manually
                </button>
              )}
            </div>
          </div>
          {goal.description && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{goal.description}</p>}
          <div className="mt-4">
            <ProgressBar value={goal.progress} height={8} />
          </div>
        </div>

        {/* Goal Knowledge & Resource Vault (Desktop) */}
        <KnowledgeVault
          data={goal}
          onSave={async (patch) => {
            await osApi.goals.update(id, { ...goal, ...patch });
            await refetch();
          }}
          title="Goal Knowledge & Resource Vault"
        />

        {/* Milestones & Tasks Section (Desktop) */}
        <Panel
          title="Milestones & Action Tasks"
          subtitle="Each milestone's progress comes from its tasks; goal progress is the milestone average"
          right={
            <button onClick={() => setMsModal(true)} className={btnPrimary}>
              <Plus size={13} /> Milestone
            </button>
          }
        >
          {goal.milestones.length === 0 && goal.tasksWithoutMilestone.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground mb-4">Break this goal into 2-5 concrete milestones, then add tasks under each.</p>
              <button onClick={() => setMsModal(true)} className={btnPrimary}>Add first milestone</button>
            </div>
          ) : (
            <div className="space-y-4">
              {goal.milestones.map((m) => (
                <div key={m._id} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => toggleMilestone(m)} aria-label="Toggle milestone">
                      {m.status === 'done' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-muted-foreground hover:text-primary" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${m.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {m.title}
                      </div>
                      {m.dueDate && <div className="text-[10px] text-muted-foreground mono">due {new Date(m.dueDate).toLocaleDateString()}</div>}
                    </div>
                    <span className="text-xs mono font-bold text-primary">{m.progress}%</span>
                    <DeleteButton onConfirm={() => deleteMilestone(m)} />
                  </div>
                  <ProgressBar value={m.progress} color={m.progress === 100 ? '#10B981' : 'hsl(var(--primary))'} height={5} />
                  <div className="mt-3 space-y-1.5">
                    {m.tasks.map((t) => <DesktopTaskRow key={t._id} t={t} />)}
                    <button
                      onClick={() => setTaskFor(m._id)}
                      className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/50"
                    >
                      + Add task to {m.title}
                    </button>
                  </div>
                </div>
              ))}

              {goal.tasksWithoutMilestone.length > 0 && (
                <div className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="text-xs mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
                    Tasks without a milestone
                  </div>
                  <div className="space-y-1.5">
                    {goal.tasksWithoutMilestone.map((t) => <DesktopTaskRow key={t._id} t={t} />)}
                    <button
                      onClick={() => setTaskFor('orphan')}
                      className="text-xs font-semibold text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-muted/50"
                    >
                      + Add standalone task
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════════════ */}

      {/* Create Milestone Modal */}
      {msModal && (
        <Modal title="New milestone" onClose={() => setMsModal(false)}>
          <div className="space-y-4">
            <Field label="Title *" full>
              <input className={inputCls} value={msForm.title} onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} placeholder="e.g. Phase 1: MVP Architecture" />
            </Field>
            <Field label="Description" full>
              <textarea className={`${inputCls} resize-none`} rows={2} value={msForm.description} onChange={(e) => setMsForm({ ...msForm, description: e.target.value })} />
            </Field>
            <Field label="Due date">
              <input type="date" className={inputCls} value={msForm.dueDate} onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setMsModal(false)} className={btnGhost}>Cancel</button>
            <button onClick={addMilestone} disabled={busy} className={btnPrimary}>Add</button>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      {taskFor && (
        <Modal title="New task" onClose={() => setTaskFor(null)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *" full>
              <input
                className={inputCls}
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Setup database schemas and indexes"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
            </Field>
            <Field label="Estimate (minutes)">
              <input type="number" min="0" className={inputCls} value={taskForm.estimateMinutes} onChange={(e) => setTaskForm({ ...taskForm, estimateMinutes: e.target.value })} />
            </Field>
            <Field label="Priority">
              <select className={inputCls} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="bg-card">{p}</option>)}
              </select>
            </Field>
            <Field label="Due date" full>
              <input type="date" className={inputCls} value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setTaskFor(null)} className={btnGhost}>Cancel</button>
            <button onClick={addTask} disabled={busy} className={btnPrimary}>Add task</button>
          </div>
        </Modal>
      )}

      {/* Edit Goal Modal */}
      {editGoalModal && (
        <Modal title="Edit Goal" onClose={() => setEditGoalModal(false)}>
          <div className="space-y-4">
            <Field label="Title *" full>
              <input
                className={inputCls}
                value={editGoalForm.title}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, title: e.target.value })}
              />
            </Field>
            <Field label="Description" full>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={editGoalForm.description}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, description: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  className={inputCls}
                  value={editGoalForm.category}
                  onChange={(e) => setEditGoalForm({ ...editGoalForm, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-card capitalize">{cat}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  className={inputCls}
                  value={editGoalForm.priority}
                  onChange={(e) => setEditGoalForm({ ...editGoalForm, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p} className="bg-card capitalize">{p}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target Date">
                <input
                  type="date"
                  className={inputCls}
                  value={editGoalForm.targetDate}
                  onChange={(e) => setEditGoalForm({ ...editGoalForm, targetDate: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <select
                  className={inputCls}
                  value={editGoalForm.status}
                  onChange={(e) => setEditGoalForm({ ...editGoalForm, status: e.target.value })}
                >
                  <option value="active" className="bg-card">Active</option>
                  <option value="paused" className="bg-card">Paused</option>
                  <option value="completed" className="bg-card">Completed</option>
                  <option value="archived" className="bg-card">Archived</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setEditGoalModal(false)} className={btnGhost}>Cancel</button>
            <button onClick={saveGoalEdits} disabled={busy} className={btnPrimary}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Contact Modal (Mobile Add/Edit) */}
      {contactModal.open && (
        <Modal
          title={contactModal.mode === 'edit' ? 'Contact Details' : 'Add Contact'}
          onClose={() => setContactModal({ ...contactModal, open: false })}
        >
          <div className="space-y-3.5">
            <Field label="Name *" full>
              <input
                className={inputCls}
                value={contactModal.data.name}
                onChange={(e) => setContactModal({ ...contactModal, data: { ...contactModal.data, name: e.target.value } })}
                placeholder="e.g. Ahmad Khan"
              />
            </Field>
            <Field label="Role / Company" full>
              <input
                className={inputCls}
                value={contactModal.data.role}
                onChange={(e) => setContactModal({ ...contactModal, data: { ...contactModal.data, role: e.target.value } })}
                placeholder="e.g. Electronics Distributor"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input
                  className={inputCls}
                  value={contactModal.data.phone}
                  onChange={(e) => setContactModal({ ...contactModal, data: { ...contactModal.data, phone: e.target.value } })}
                  placeholder="+91 98765 43210"
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputCls}
                  value={contactModal.data.email}
                  onChange={(e) => setContactModal({ ...contactModal, data: { ...contactModal.data, email: e.target.value } })}
                  placeholder="contact@example.com"
                />
              </Field>
            </div>
            <Field label="Notes / Link" full>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                value={contactModal.data.notes}
                onChange={(e) => setContactModal({ ...contactModal, data: { ...contactModal.data, notes: e.target.value } })}
                placeholder="Supplier for wholesale gadgets..."
              />
            </Field>
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
            {contactModal.mode === 'edit' && contactModal.index !== null ? (
              <button
                type="button"
                onClick={() => deleteContact(contactModal.index)}
                className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button onClick={() => setContactModal({ ...contactModal, open: false })} className={btnGhost}>Cancel</button>
              <button onClick={saveContact} disabled={busy} className={btnPrimary}>
                {contactModal.mode === 'edit' ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Resource Modal (Mobile) */}
      {resourceModal.open && (
        <Modal title="Add Resource" onClose={() => setResourceModal({ ...resourceModal, open: false })}>
          <div className="space-y-3.5">
            <Field label="Title *" full>
              <input
                className={inputCls}
                value={resourceModal.data.title}
                onChange={(e) => setResourceModal({ ...resourceModal, data: { ...resourceModal.data, title: e.target.value } })}
                placeholder="e.g. Competitor Analysis Spreadsheet"
              />
            </Field>
            <Field label="URL *" full>
              <input
                className={inputCls}
                value={resourceModal.data.url}
                onChange={(e) => setResourceModal({ ...resourceModal, data: { ...resourceModal.data, url: e.target.value } })}
                placeholder="https://docs.google.com/..."
              />
            </Field>
            <Field label="Type">
              <select
                className={inputCls}
                value={resourceModal.data.type}
                onChange={(e) => setResourceModal({ ...resourceModal, data: { ...resourceModal.data, type: e.target.value } })}
              >
                <option value="link" className="bg-card">General Link</option>
                <option value="doc" className="bg-card">Documentation</option>
                <option value="repo" className="bg-card">Repository / Code</option>
                <option value="design" className="bg-card">Design / Mockup</option>
                <option value="tool" className="bg-card">Tool / Dashboard</option>
                <option value="article" className="bg-card">Article / Guide</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setResourceModal({ ...resourceModal, open: false })} className={btnGhost}>Cancel</button>
            <button onClick={saveResource} disabled={busy} className={btnPrimary}>Add</button>
          </div>
        </Modal>
      )}

      {/* Note Modal (Mobile) */}
      {noteModal.open && (
        <Modal
          title={noteModal.mode === 'edit' ? 'Edit Note' : 'New Note'}
          onClose={() => setNoteModal({ ...noteModal, open: false })}
        >
          <div className="space-y-3.5">
            <Field label="Title *" full>
              <input
                className={inputCls}
                value={noteModal.data.title}
                onChange={(e) => setNoteModal({ ...noteModal, data: { ...noteModal.data, title: e.target.value } })}
                placeholder="e.g. Growth Strategy 2026"
              />
            </Field>
            <Field label="Content" full>
              <textarea
                className={`${inputCls} resize-none`}
                rows={5}
                value={noteModal.data.content}
                onChange={(e) => setNoteModal({ ...noteModal, data: { ...noteModal.data, content: e.target.value } })}
                placeholder="Detailed plans, notes, key takeaways..."
              />
            </Field>
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
            {noteModal.mode === 'edit' && noteModal.index !== null ? (
              <button
                type="button"
                onClick={() => deleteNote(noteModal.index)}
                className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button onClick={() => setNoteModal({ ...noteModal, open: false })} className={btnGhost}>Cancel</button>
              <button onClick={saveNote} disabled={busy} className={btnPrimary}>
                {noteModal.mode === 'edit' ? 'Save' : 'Add Note'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Checklist Item Modal (Mobile) */}
      {checklistModal.open && (
        <Modal title="Add Checklist Item" onClose={() => setChecklistModal({ open: false, text: '' })}>
          <div className="space-y-3.5">
            <Field label="Item Description *" full>
              <input
                className={inputCls}
                value={checklistModal.text}
                onChange={(e) => setChecklistModal({ ...checklistModal, text: e.target.value })}
                placeholder="e.g. Verify manufacturer GST number"
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                autoFocus
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button onClick={() => setChecklistModal({ open: false, text: '' })} className={btnGhost}>Cancel</button>
            <button onClick={addChecklistItem} disabled={busy} className={btnPrimary}>Add Item</button>
          </div>
        </Modal>
      )}

      {/* Task Detail & Knowledge Vault Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => refetch()}
        />
      )}
    </div>
  );
}
