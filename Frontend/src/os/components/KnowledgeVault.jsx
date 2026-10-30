import { useState, useRef, useMemo, useEffect } from 'react';
import { osApi } from '../osApi.js';
import {
  FileText, Link as LinkIcon, Users, Image as ImageIcon, CheckSquare, Plus,
  Trash2, ExternalLink, Mail, Phone, Upload, Eye, Check, X, Loader2, Save,
  Search, MessageSquare, Clock, Sparkles, CornerDownLeft,
} from 'lucide-react';
import { Badge, ProgressBar, fmtMinutes } from './ui.jsx';

const RESOURCE_TYPES = [
  { value: 'link', label: 'General Link', icon: LinkIcon },
  { value: 'doc', label: 'Documentation', icon: FileText },
  { value: 'repo', label: 'Repository / Code', icon: ExternalLink },
  { value: 'design', label: 'Design / Mockup', icon: ImageIcon },
  { value: 'tool', label: 'Tool / Dashboard', icon: LinkIcon },
  { value: 'article', label: 'Article / Guide', icon: FileText },
];

export default function KnowledgeVault({ data = {}, onSave, title = 'Knowledge & Resource Vault' }) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'resources' | 'contacts' | 'attachments' | 'checklist'

  // Initialize multi-note list (support legacy data.notes as first note if present)
  const computeInitialNotes = (src) => {
    if (Array.isArray(src?.notesList) && src.notesList.length > 0) {
      return src.notesList;
    }
    if (typeof src?.notes === 'string' && src.notes.trim()) {
      return [
        {
          _id: 'legacy-note-1',
          title: 'Overview & Strategy',
          content: src.notes,
          updatedAt: new Date(),
        },
      ];
    }
    return [];
  };

  const [notesList, setNotesList] = useState(() => computeInitialNotes(data));
  const [selectedNoteId, setSelectedNoteId] = useState(() => computeInitialNotes(data)[0]?._id || null);
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(() => computeInitialNotes(data).length === 0);
  const [activeTitle, setActiveTitle] = useState(() => computeInitialNotes(data)[0]?.title || '');
  const [activeContent, setActiveContent] = useState(() => computeInitialNotes(data)[0]?.content || '');
  const [noteSearch, setNoteSearch] = useState('');

  const [resources, setResources] = useState(data.resources || []);
  const [contacts, setContacts] = useState(data.contacts || []);
  const [attachments, setAttachments] = useState(data.attachments || []);
  const [checklist, setChecklist] = useState(data.checklist || []);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // New item states
  const [newRes, setNewRes] = useState({ title: '', url: '', type: 'link' });
  const [showAddRes, setShowAddRes] = useState(false);

  const [newContact, setNewContact] = useState({ name: '', role: '', email: '', phone: '', link: '', notes: '' });
  const [showAddContact, setShowAddContact] = useState(false);

  const [newAttachUrl, setNewAttachUrl] = useState('');
  const [newAttachTitle, setNewAttachTitle] = useState('');
  const [showAddAttach, setShowAddAttach] = useState(false);

  const [newCheckItem, setNewCheckItem] = useState('');

  const fileInputRef = useRef(null);
  const lastDataIdRef = useRef(data._id);

  // Sync state if incoming data._id changes (e.g. switching between different goals/tasks)
  useEffect(() => {
    if (data._id && data._id !== lastDataIdRef.current) {
      lastDataIdRef.current = data._id;
      const list = computeInitialNotes(data);
      setNotesList(list);
      if (list.length > 0) {
        setSelectedNoteId(list[0]._id);
        setIsCreatingNewNote(false);
        setActiveTitle(list[0].title || '');
        setActiveContent(list[0].content || '');
      } else {
        setSelectedNoteId(null);
        setIsCreatingNewNote(true);
        setActiveTitle('');
        setActiveContent('');
      }
      setResources(data.resources || []);
      setContacts(data.contacts || []);
      setAttachments(data.attachments || []);
      setChecklist(data.checklist || []);
    }
  }, [data._id]);

  const triggerSave = async (overridePatch = {}) => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const payload = {
        notesList,
        notes: notesList[0]?.content || '',
        resources,
        contacts,
        attachments,
        checklist,
        ...overridePatch,
      };
      if (onSave) {
        await onSave(payload);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Multi-Notes Handlers ──────────────────────────────────────────
  const selectNote = (n) => {
    setSelectedNoteId(n._id);
    setIsCreatingNewNote(false);
    setActiveTitle(n.title || '');
    setActiveContent(n.content || '');
  };

  const startNewNote = () => {
    setIsCreatingNewNote(true);
    setSelectedNoteId(null);
    setActiveTitle('');
    setActiveContent('');
  };

  const cancelNewNote = () => {
    if (notesList.length > 0) {
      selectNote(notesList[0]);
    } else {
      setActiveTitle('');
      setActiveContent('');
    }
  };

  const handleSaveActiveNote = async () => {
    if (!activeTitle.trim() && !activeContent.trim()) return;
    const cleanTitle = activeTitle.trim() || 'Untitled Note';
    let updatedList;
    let targetId;

    if (isCreatingNewNote || !selectedNoteId) {
      const newNote = {
        _id: `note-${Date.now()}`,
        title: cleanTitle,
        content: activeContent,
        updatedAt: new Date(),
      };
      updatedList = [newNote, ...notesList];
      targetId = newNote._id;
      setSelectedNoteId(targetId);
      setIsCreatingNewNote(false);
    } else {
      updatedList = notesList.map((n) =>
        String(n._id) === String(selectedNoteId)
          ? { ...n, title: cleanTitle, content: activeContent, updatedAt: new Date() }
          : n
      );
      targetId = selectedNoteId;
    }

    setNotesList(updatedList);
    await triggerSave({
      notesList: updatedList,
      notes: updatedList[0]?.content || '',
    });
  };

  const handleDeleteNote = async (idToDelete) => {
    const updatedList = notesList.filter((n) => String(n._id) !== String(idToDelete));
    setNotesList(updatedList);
    if (String(selectedNoteId) === String(idToDelete)) {
      if (updatedList.length > 0) {
        selectNote(updatedList[0]);
      } else {
        startNewNote();
      }
    }
    await triggerSave({
      notesList: updatedList,
      notes: updatedList[0]?.content || '',
    });
  };

  const handleKeyDownNote = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveActiveNote();
    }
  };

  const filteredNotes = useMemo(() => {
    if (!noteSearch.trim()) return notesList;
    const q = noteSearch.toLowerCase();
    return notesList.filter((n) =>
      (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
    );
  }, [notesList, noteSearch]);

  const selectedNote = useMemo(() => {
    return notesList.find((n) => String(n._id) === String(selectedNoteId));
  }, [notesList, selectedNoteId]);

  // ── Resources Handlers ────────────────────────────────────────────
  const handleAddResource = async () => {
    if (!newRes.url.trim()) return;
    const formattedUrl = newRes.url.startsWith('http') ? newRes.url.trim() : `https://${newRes.url.trim()}`;
    const item = {
      title: newRes.title.trim() || formattedUrl,
      url: formattedUrl,
      type: newRes.type || 'link',
    };
    const updated = [...resources, item];
    setResources(updated);
    setNewRes({ title: '', url: '', type: 'link' });
    setShowAddRes(false);
    await triggerSave({ resources: updated });
  };

  const handleDeleteResource = async (index) => {
    const updated = resources.filter((_, i) => i !== index);
    setResources(updated);
    await triggerSave({ resources: updated });
  };

  // ── Contacts Handlers ─────────────────────────────────────────────
  const handleAddContact = async () => {
    if (!newContact.name.trim()) return;
    const item = { ...newContact };
    const updated = [...contacts, item];
    setContacts(updated);
    setNewContact({ name: '', role: '', email: '', phone: '', link: '', notes: '' });
    setShowAddContact(false);
    await triggerSave({ contacts: updated });
  };

  const handleDeleteContact = async (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    await triggerSave({ contacts: updated });
  };

  // ── Attachments Handlers ──────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await osApi.uploadImage(file);
      const item = {
        title: file.name,
        url: res.url,
        type: file.type.startsWith('image/') ? 'image' : 'file',
      };
      const updated = [...attachments, item];
      setAttachments(updated);
      await triggerSave({ attachments: updated });
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrlAttachment = async () => {
    if (!newAttachUrl.trim()) return;
    const item = {
      title: newAttachTitle.trim() || 'Attached Image',
      url: newAttachUrl.trim(),
      type: 'image',
    };
    const updated = [...attachments, item];
    setAttachments(updated);
    setNewAttachUrl('');
    setNewAttachTitle('');
    setShowAddAttach(false);
    await triggerSave({ attachments: updated });
  };

  const handleDeleteAttachment = async (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    await triggerSave({ attachments: updated });
  };

  // ── Checklist Handlers ────────────────────────────────────────────
  const handleAddCheckItem = async (e) => {
    if (e && e.key && e.key !== 'Enter') return;
    if (!newCheckItem.trim()) return;
    const updated = [...checklist, { text: newCheckItem.trim(), done: false }];
    setChecklist(updated);
    setNewCheckItem('');
    await triggerSave({ checklist: updated });
  };

  const handleToggleCheckItem = async (index) => {
    const updated = checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c));
    setChecklist(updated);
    await triggerSave({ checklist: updated });
  };

  const handleDeleteCheckItem = async (index) => {
    const updated = checklist.filter((_, i) => i !== index);
    setChecklist(updated);
    await triggerSave({ checklist: updated });
  };

  const checklistDoneCount = checklist.filter((c) => c.done).length;
  const checklistPercent = checklist.length ? Math.round((checklistDoneCount / checklist.length) * 100) : 0;

  return (
    <div className="glass rounded-2xl p-5 border border-border shadow-sm">
      {/* Vault Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>{title}</span>
            {savedSuccess && (
              <span className="text-[10px] text-emerald-500 font-mono font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Check size={10} /> Saved
              </span>
            )}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Save multiple named notes, critical links, image attachments, contacts, and checklists.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/70 text-xs">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'notes' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText size={12} /> Notes ({notesList.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'resources' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon size={12} /> Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'contacts' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={12} /> Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'attachments' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon size={12} /> Images ({attachments.length})
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'checklist' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare size={12} /> Checklist ({checklist.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: MULTI-NOTE VAULT (Split-pane Master-Detail, matching user's Image 1) ── */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Left: Notes List (Recents / Saved Notes — matching ChatGPT sidebar) */}
          <div className="md:col-span-5 lg:col-span-4 rounded-xl border border-border bg-muted/20 p-3 flex flex-col min-h-[380px] max-h-[460px]">
            {/* Header: Recents + Add Note */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/60">
              <span className="text-[11px] font-mono uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <FileText size={12} className="text-primary" /> Recents ({notesList.length})
              </span>
              <button
                onClick={startNewNote}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
                title="Create a new note"
              >
                <Plus size={12} /> New Note
              </button>
            </div>

            {/* Note search if more than 2 notes */}
            {notesList.length > 2 && (
              <div className="mb-2.5 relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search notes…"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full text-xs rounded-lg bg-background border border-border pl-7 pr-2.5 py-1 text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
              </div>
            )}

            {/* List of Note Titles */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {/* If actively drafting a new note, show draft item at top */}
              {isCreatingNewNote && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-primary/15 border border-primary/40 text-primary text-xs font-semibold shadow-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Sparkles size={12} className="shrink-0 text-primary animate-pulse" />
                    <span className="truncate">
                      {activeTitle.trim() ? activeTitle : 'Drafting new note…'}
                    </span>
                  </div>
                  {notesList.length > 0 && (
                    <button
                      onClick={cancelNewNote}
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="Cancel draft"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              )}

              {filteredNotes.length === 0 && !isCreatingNewNote ? (
                <div className="text-center py-12 px-2 text-muted-foreground">
                  <FileText size={22} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No notes saved yet.</p>
                  <button
                    onClick={startNewNote}
                    className="text-xs font-semibold text-primary hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    <Plus size={11} /> Create first note
                  </button>
                </div>
              ) : (
                filteredNotes.map((n) => {
                  const isSelected = !isCreatingNewNote && String(selectedNoteId) === String(n._id);
                  return (
                    <div
                      key={n._id}
                      onClick={() => selectNote(n)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/15 border-primary/40 text-primary font-semibold shadow-xs'
                          : 'bg-muted/30 border-transparent hover:border-border hover:bg-muted/70 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-1.5">
                        <FileText
                          size={12}
                          className={`shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground opacity-70 group-hover:opacity-100'}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium truncate">
                            {n.title || 'Untitled Note'}
                          </div>
                          {n.content && (
                            <div className="text-[10px] text-muted-foreground truncate opacity-70 mt-0.5 font-normal">
                              {n.content}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete note "${n.title || 'Untitled'}"?`)) {
                            handleDeleteNote(n._id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all shrink-0"
                        title="Delete note"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Note Reader & Editor */}
          <div className="md:col-span-7 lg:col-span-8 rounded-xl border border-border bg-muted/20 p-3.5 flex flex-col min-h-[380px] max-h-[460px]">
            {/* Header: Note Title + Shortcut tip + Save Button */}
            <div className="flex items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-border/60">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Note Title (e.g. Amazon Requirements, Wholesaler Contact)..."
                  value={activeTitle}
                  onChange={(e) => setActiveTitle(e.target.value)}
                  onKeyDown={handleKeyDownNote}
                  className="w-full text-sm font-bold text-foreground bg-transparent focus:outline-hidden placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden lg:inline text-[10px] text-muted-foreground mono border border-border/80 px-1.5 py-0.5 rounded bg-muted/40" title="Keyboard shortcut">
                  Ctrl+Enter
                </span>
                {selectedNote?.updatedAt && !isCreatingNewNote && (
                  <span className="text-[10px] text-muted-foreground mono hidden sm:inline">
                    Updated {new Date(selectedNote.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <button
                  onClick={handleSaveActiveNote}
                  disabled={saving || (!activeTitle.trim() && !activeContent.trim())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 shadow-xs"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {isCreatingNewNote ? 'Save Note' : 'Update Note'}
                </button>
              </div>
            </div>

            {/* Note Content Textarea */}
            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                value={activeContent}
                onChange={(e) => setActiveContent(e.target.value)}
                onKeyDown={handleKeyDownNote}
                placeholder="Write your note contents, details, steps, strategy, instructions, calculations or findings here... (Ctrl+Enter to save)"
                className="w-full flex-1 rounded-xl bg-background border border-border/60 p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-primary resize-none font-mono leading-relaxed custom-scrollbar"
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mono pt-2 px-1">
                <div className="flex items-center gap-3">
                  <span>{activeContent.length} chars</span>
                  <span>{activeContent.trim() ? activeContent.trim().split(/\s+/).length : 0} words</span>
                </div>
                {savedSuccess && (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Check size={10} /> Saved to vault
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: RESOURCES & LINKS ── */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Documentation, GitHub repositories, Figma designs, dashboards, and research links:
            </p>
            <button
              onClick={() => setShowAddRes(!showAddRes)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Plus size={12} /> Add Link
            </button>
          </div>

          {showAddRes && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              <div className="grid sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  placeholder="Link Title (e.g., Stripe API Docs)"
                  value={newRes.title}
                  onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="URL (e.g., https://stripe.com/docs)"
                  value={newRes.url}
                  onChange={(e) => setNewRes({ ...newRes, url: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
                <select
                  value={newRes.type}
                  onChange={(e) => setNewRes({ ...newRes, type: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:border-primary"
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-card">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddRes(false)} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
                <button
                  onClick={handleAddResource}
                  disabled={saving || !newRes.url.trim()}
                  className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  Save Resource
                </button>
              </div>
            </div>
          )}

          {resources.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-muted/20 border border-border/50">
              <LinkIcon size={24} className="mx-auto mb-2 text-muted-foreground opacity-60" />
              <p className="text-xs text-muted-foreground">No resources or reference links added yet.</p>
              <button onClick={() => setShowAddRes(true)} className="text-xs font-semibold text-primary hover:underline mt-1.5">
                + Add your first reference link
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {resources.map((r, i) => {
                const typeObj = RESOURCE_TYPES.find((t) => t.value === r.type) || RESOURCE_TYPES[0];
                const IconComponent = typeObj.icon;
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <IconComponent size={14} />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate block flex items-center gap-1"
                        >
                          {r.title || r.url}
                          <ExternalLink size={10} className="inline opacity-60 flex-shrink-0" />
                        </a>
                        <div className="text-[10px] text-muted-foreground truncate">{r.url}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteResource(i)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                      title="Delete link"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CONTACTS ── */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Key contacts, advisors, clients, teammates, or external leads:
            </p>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Plus size={12} /> Add Contact
            </button>
          </div>

          {showAddContact && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Role / Title (e.g., Lead Engineer, Wholesaler)"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="Phone Number / WhatsApp"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Profile Link (LinkedIn, Website, etc.)"
                  value={newContact.link}
                  onChange={(e) => setNewContact({ ...newContact, link: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Short note or context"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddContact(false)} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  disabled={saving || !newContact.name.trim()}
                  className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  Save Contact
                </button>
              </div>
            </div>
          )}

          {contacts.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-muted/20 border border-border/50">
              <Users size={24} className="mx-auto mb-2 text-muted-foreground opacity-60" />
              <p className="text-xs text-muted-foreground">No contacts linked yet.</p>
              <button onClick={() => setShowAddContact(true)} className="text-xs font-semibold text-primary hover:underline mt-1.5">
                + Add first contact
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {contacts.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-foreground">{c.name}</div>
                      {c.role && <div className="text-[10px] text-muted-foreground mono">{c.role}</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteContact(i)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                        <Mail size={11} /> {c.email}
                      </a>
                    )}
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                        <Phone size={11} /> {c.phone}
                      </a>
                    )}
                    {c.link && (
                      <a href={c.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                        <ExternalLink size={11} /> Link
                      </a>
                    )}
                  </div>
                  {c.notes && <p className="text-[11px] text-muted-foreground/80 italic pt-0.5">{c.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: ATTACHMENTS & IMAGES ── */}
      {activeTab === 'attachments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Visual mockups, architecture diagrams, product screenshots, or invoices:
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                Upload Image
              </button>
              <button
                onClick={() => setShowAddAttach(!showAddAttach)}
                className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
              >
                or URL
              </button>
            </div>
          </div>

          {showAddAttach && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Image Title (e.g., Home Dashboard Design)"
                value={newAttachTitle}
                onChange={(e) => setNewAttachTitle(e.target.value)}
                className="flex-1 rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
              />
              <input
                type="text"
                placeholder="Image URL (https://...)"
                value={newAttachUrl}
                onChange={(e) => setNewAttachUrl(e.target.value)}
                className="flex-1 rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
              />
              <button
                onClick={handleAddUrlAttachment}
                disabled={saving || !newAttachUrl.trim()}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                Add URL
              </button>
            </div>
          )}

          {attachments.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-muted/20 border border-border/50">
              <ImageIcon size={24} className="mx-auto mb-2 text-muted-foreground opacity-60" />
              <p className="text-xs text-muted-foreground">No image attachments uploaded yet.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-primary hover:underline mt-1.5"
              >
                + Upload an image or mockup
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {attachments.map((a, i) => (
                <div key={i} className="group relative rounded-xl border border-border overflow-hidden bg-muted/30 hover:border-primary/50 transition-all">
                  <div
                    onClick={() => setLightboxImg(a.url)}
                    className="aspect-video w-full overflow-hidden bg-black/40 cursor-pointer flex items-center justify-center relative"
                  >
                    <img
                      src={a.url}
                      alt={a.title || 'Attachment'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                      <Eye size={14} /> View
                    </div>
                  </div>
                  <div className="p-2 flex items-center justify-between text-[11px]">
                    <span className="truncate font-medium text-foreground">{a.title || 'Image'}</span>
                    <button
                      onClick={() => handleDeleteAttachment(i)}
                      className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors ml-1"
                      title="Delete attachment"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lightbox Modal */}
          {lightboxImg && (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
              onClick={() => setLightboxImg(null)}
            >
              <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20">
                <button
                  onClick={() => setLightboxImg(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                >
                  <X size={16} />
                </button>
                <img src={lightboxImg} alt="Preview" className="max-w-full max-h-[85vh] object-contain" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: CHECKLIST ── */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {checklistDoneCount} of {checklist.length} items completed ({checklistPercent}%)
              </span>
            </div>
          </div>

          <ProgressBar value={checklistPercent} height={5} />

          {/* Add item input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add checklist item and press Enter (e.g. Verify Stripe webhook signature)..."
              value={newCheckItem}
              onChange={(e) => setNewCheckItem(e.target.value)}
              onKeyDown={handleAddCheckItem}
              className="flex-1 rounded-xl bg-background border border-border px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
            />
            <button
              onClick={() => handleAddCheckItem()}
              disabled={saving || !newCheckItem.trim()}
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {/* Items list */}
          {checklist.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-muted/20 border border-border/50">
              <CheckSquare size={24} className="mx-auto mb-2 text-muted-foreground opacity-60" />
              <p className="text-xs text-muted-foreground">No checklist items yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {checklist.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    c.done
                      ? 'bg-muted/15 border-border/40 text-muted-foreground line-through'
                      : 'bg-muted/30 border-border text-foreground hover:bg-muted/50'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={c.done}
                      onChange={() => handleToggleCheckItem(i)}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs truncate select-none">{c.text}</span>
                  </label>
                  <button
                    onClick={() => handleDeleteCheckItem(i)}
                    className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                    title="Delete item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
