import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function MessagesManager() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api.messages(token).list();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    try {
      await api.messages(token).markRead(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this message?')) return;
    try {
      await api.messages(token).remove(id);
      if (selected?._id === id) setSelected(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const unread = items.filter((m) => !m.read).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-2">Contact Messages</h1>
      <p className="text-foreground/60 text-sm mb-6">
        {items.length} total · {unread} unread
      </p>

      {error && (
        <div className="mono text-xs text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg px-3 py-2 mb-4">
          ⚠️ {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="glass p-6 text-center mono text-sm text-muted">Loading…</div>
          ) : items.length === 0 ? (
            <div className="glass p-6 text-center mono text-sm text-muted">No messages yet.</div>
          ) : (
            items.map((m, i) => (
              <motion.button
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setSelected(m);
                  if (!m.read) markRead(m._id);
                }}
                className={`glass p-4 rounded-xl text-left w-full hover:border-neon-cyan/30 transition-colors ${
                  selected?._id === m._id ? 'border-neon-cyan/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {!m.read ? (
                      <FaCircle className="text-neon-green" size={6} />
                    ) : (
                      <FaEnvelopeOpen className="text-muted" size={10} />
                    )}
                    <span className="font-semibold text-sm">{m.name}</span>
                  </div>
                  <span className="mono text-[10px] text-muted">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mono text-xs text-muted mb-1">{m.email}</div>
                {m.subject && <div className="text-xs text-foreground/80">{m.subject}</div>}
                <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{m.message}</p>
              </motion.button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="glass p-6 rounded-2xl sticky top-6 h-fit">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-neon-cyan" />
                  <h2 className="font-bold">Message Detail</h2>
                </div>
                <button onClick={() => remove(selected._id)} className="btn-danger">
                  <FaTrash size={10} /> Delete
                </button>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="mono text-[10px] uppercase tracking-widest text-muted">From</dt>
                  <dd className="font-semibold">{selected.name}</dd>
                </div>
                <div>
                  <dt className="mono text-[10px] uppercase tracking-widest text-muted">Email</dt>
                  <dd>
                    <a href={`mailto:${selected.email}`} className="text-neon-cyan hover:underline">
                      {selected.email}
                    </a>
                  </dd>
                </div>
                {selected.subject && (
                  <div>
                    <dt className="mono text-[10px] uppercase tracking-widest text-muted">Subject</dt>
                    <dd>{selected.subject}</dd>
                  </div>
                )}
                <div>
                  <dt className="mono text-[10px] uppercase tracking-widest text-muted">Received</dt>
                  <dd>{new Date(selected.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="mono text-[10px] uppercase tracking-widest text-muted">Message</dt>
                  <dd className="whitespace-pre-wrap bg-white/[0.02] rounded-lg p-4 mt-1">
                    {selected.message}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="text-center py-10 text-muted mono text-sm">
              <FaEnvelope className="mx-auto mb-3 text-neon-cyan/40" size={28} />
              Select a message to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
