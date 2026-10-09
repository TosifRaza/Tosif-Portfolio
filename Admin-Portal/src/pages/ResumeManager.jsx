import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaTrash, FaFilePdf, FaCheckCircle, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { api, apiUrl } from '../utils/api.js';

export default function ResumeManager() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api.resume(token).listAll();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.resume(token).upload(formData);
      await refresh();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function remove(id) {
    if (!confirm('Delete this resume version?')) return;
    try {
      await api.resume(token).remove(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-2">Resume Manager</h1>
      <p className="text-foreground/60 text-sm mb-6">Upload, replace, or remove resume versions.</p>

      {error && (
        <div className="mono text-xs text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg px-3 py-2 mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Upload box */}
      <label className="glass p-8 rounded-2xl border-2 border-dashed border-border hover:border-neon-cyan/40 flex flex-col items-center justify-center cursor-pointer transition-colors mb-6">
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" disabled={uploading} />
        <FaUpload className={`text-neon-cyan mb-3 ${uploading ? 'animate-bounce' : ''}`} size={28} />
        <div className="font-semibold mb-1">
          {uploading ? 'Uploading…' : 'Drop a new resume here or click to browse'}
        </div>
        <div className="mono text-xs text-muted">PDF or DOC · Max 10MB</div>
      </label>

      {/* Versions list */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass p-6 text-center mono text-sm text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="glass p-6 text-center mono text-sm text-muted">No resume uploaded yet.</div>
        ) : (
          items.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-4 rounded-xl flex items-center gap-4"
            >
              <FaFilePdf className="text-neon-orange" size={24} />
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {r.fileName}
                  {r.isActive && (
                    <span className="badge border-neon-green/40 text-neon-green bg-neon-green/10 flex items-center gap-1">
                      <FaStar size={8} /> ACTIVE
                    </span>
                  )}
                </div>
                <div className="mono text-xs text-muted">
                  {r.version} · Uploaded {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
              <a
                href={apiUrl('/api/resume/download')}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                Download
              </a>
              <button onClick={() => remove(r._id)} className="btn-danger">
                <FaTrash size={10} /> Delete
              </button>
            </motion.div>
          ))
        )}
      </div>

      <div className="glass p-4 rounded-xl mt-6 flex items-start gap-3">
        <FaCheckCircle className="text-neon-green mt-0.5 shrink-0" size={14} />
        <p className="text-xs text-foreground/70">
          Uploading a new resume automatically marks it as the active version (shown on the public
          portfolio). Previous versions remain listed here for record-keeping.
        </p>
      </div>
    </div>
  );
}
