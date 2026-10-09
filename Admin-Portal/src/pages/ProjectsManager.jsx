import { useCallback, useEffect, useState } from 'react';
import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { FaCheck, FaGithub, FaSyncAlt, FaTimes } from 'react-icons/fa';

const STATUS = ['Active', 'In Progress', 'Completed', 'Archived'];
const DIFFICULTY = ['Low', 'Medium', 'High', 'Extreme'];

const FIELDS = [
  { name: 'missionId', label: 'Mission ID', type: 'text', default: 'MISSION-XXX' },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'tagline', label: 'Tagline', type: 'text', full: true },
  { name: 'image', label: 'Images and thumbnail', type: 'projectMedia', full: true },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'stack', label: 'Tech Stack (comma separated)', type: 'tags', full: true },
  { name: 'status', label: 'Status', type: 'select', options: STATUS },
  { name: 'difficulty', label: 'Difficulty', type: 'select', options: DIFFICULTY },
  { name: 'githubUrl', label: 'GitHub URL', type: 'text', full: true },
  { name: 'liveUrl', label: 'Live URL', type: 'text', full: true },
  { name: 'problem', label: 'Problem', type: 'textarea', full: true },
  { name: 'solution', label: 'Solution', type: 'textarea', full: true },
  { name: 'role', label: 'My Role', type: 'text' },
  { name: 'caseStudy', label: 'Case Study', type: 'textarea', full: true },
  { name: 'category', label: 'Category', type: 'select', options: ['professional', 'personal', 'learning', 'open-source'] },
  { name: 'featured', label: 'Featured', type: 'checkbox', default: false },
  { name: 'publishStatus', label: 'Publish Status', type: 'select', options: ['published', 'draft', 'archived'], default: 'published' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'missionId', label: 'ID', mono: true },
  { key: 'title', label: 'Title' },
  {
    key: 'status',
    label: 'Status',
    render: (i) => (
      <span className={`badge border-border ${i.status === 'Active' ? 'text-neon-green' : 'text-muted-foreground'}`}>
        {i.status}
      </span>
    ),
  },
  { key: 'difficulty', label: 'Difficulty', mono: true },
  {
    key: 'publishStatus',
    label: 'Publish',
    render: (i) => (
      <span className={`badge ${i.publishStatus === 'published' ? 'text-neon-green' : 'text-muted-foreground'}`}>
        {i.publishStatus || 'published'}
      </span>
    ),
  },
  {
    key: 'featured',
    label: 'Featured',
    render: (i) => (i.featured ? <span className="text-neon-cyan">★</span> : <span className="text-muted-foreground">—</span>),
  },
];

function GitHubRepoInbox({ token }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSuggestions = useCallback(async () => {
    const items = await api.githubImports(token).list();
    setSuggestions(Array.isArray(items) ? items : []);
  }, [token]);

  const syncNow = useCallback(async (showLoading = true) => {
    if (showLoading) setSyncing(true);
    setError('');
    try {
      const result = await api.githubImports(token).sync();
      setMessage(result.message || 'GitHub check complete.');
      await loadSuggestions();
      window.dispatchEvent(new Event('github-imports-updated'));
    } catch (syncError) {
      setError(syncError.message || 'Unable to check GitHub.');
      try { await loadSuggestions(); } catch { /* keep the sync error visible */ }
    } finally {
      if (showLoading) setSyncing(false);
    }
  }, [loadSuggestions, token]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const result = await api.githubImports(token).sync();
        if (active) setMessage(result.message || 'GitHub check complete.');
        const items = await api.githubImports(token).list();
        if (active) setSuggestions(Array.isArray(items) ? items : []);
        if (active) window.dispatchEvent(new Event('github-imports-updated'));
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load GitHub suggestions.');
          try {
            const items = await api.githubImports(token).list();
            if (active) setSuggestions(Array.isArray(items) ? items : []);
          } catch { /* show the original error */ }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [token]);

  async function handleAction(item, action) {
    setBusyId(item._id);
    setError('');
    setMessage('');
    try {
      if (action === 'approve') {
        await api.githubImports(token).approve(item._id);
        setMessage(`${item.fullName} is published on your portfolio. You can edit its images and details below.`);
      } else {
        await api.githubImports(token).dismiss(item._id);
        setMessage(`${item.fullName} was dismissed.`);
      }
      await loadSuggestions();
      window.dispatchEvent(new Event('github-imports-updated'));
    } catch (actionError) {
      setError(actionError.message || 'Could not update this repository.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <section className="glass rounded-2xl p-5 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-neon-cyan mono text-xs uppercase tracking-widest mb-1">
            <FaGithub size={14} /> GitHub inbox
            <span className="rounded-full bg-neon-cyan/10 px-2 py-0.5 text-[10px]">{suggestions.length} pending</span>
          </div>
          <h2 className="text-lg font-bold">Review new repositories</h2>
          <p className="text-sm text-muted-foreground mt-1">New public repositories are checked every 10 minutes. Approving publishes a project immediately.</p>
        </div>
        <button onClick={() => syncNow()} disabled={syncing} className="btn-secondary">
          <FaSyncAlt className={syncing ? 'animate-spin' : ''} size={12} />
          {syncing ? 'Checking…' : 'Check GitHub now'}
        </button>
      </div>

      {message && <div className="rounded-lg border border-neon-green/25 bg-neon-green/5 text-sm text-neon-green px-3 py-2 mb-3">{message}</div>}
      {error && <div className="rounded-lg border border-neon-red/30 bg-neon-red/10 text-sm text-neon-red px-3 py-2 mb-3">{error}</div>}

      {loading ? (
        <div className="py-6 text-center text-sm text-muted-foreground">Checking your GitHub inbox…</div>
      ) : suggestions.length === 0 ? (
        <div className="rounded-xl border border-border bg-black/10 p-5 text-sm text-muted-foreground">
          No repositories are waiting for review. New public repositories will appear here after GitHub is checked.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {suggestions.map((item) => (
            <article key={item._id} className="rounded-xl border border-border bg-black/10 p-4 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <a className="font-semibold text-neon-cyan hover:underline break-all" href={item.htmlUrl} target="_blank" rel="noreferrer">{item.fullName}</a>
                  <p className="text-sm text-foreground/80 mt-2">{item.description || 'No GitHub description yet.'}</p>
                </div>
                <span className="shrink-0 rounded-full border border-neon-cyan/25 px-2 py-1 text-[10px] mono text-neon-cyan">NEW</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-3">
                {item.language && <span>{item.language}</span>}
                <span>★ {item.stars || 0}</span>
                <span>⑂ {item.forks || 0}</span>
                {item.createdAtGitHub && <span>Created {new Date(item.createdAtGitHub).toLocaleDateString()}</span>}
              </div>
              {item.topics?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{item.topics.slice(0, 8).map((topic) => <span key={topic} className="rounded-md bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground">{topic}</span>)}</div>}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
                <button disabled={busyId === item._id} onClick={() => handleAction(item, 'approve')} className="btn-primary text-xs">
                  <FaCheck size={11} /> {busyId === item._id ? 'Saving…' : 'Approve & publish'}
                </button>
                <button disabled={busyId === item._id} onClick={() => handleAction(item, 'dismiss')} className="btn-secondary text-xs">
                  <FaTimes size={11} /> Dismiss
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProjectsManager() {
  const { token } = useAuth();
  return (
    <>
      <GitHubRepoInbox token={token} />
      <ResourceManager
        title="Projects"
        resource="projects"
        token={token}
        fields={FIELDS}
        initialValues={{ image: '', images: [], galleryAutoplay: false, galleryInterval: 5 }}
        columns={COLUMNS}
        searchKeys={['missionId', 'title', 'tagline']}
      />
    </>
  );
}
