import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSearch } from 'react-icons/fa';

/**
 * Generic resource manager — handles list, create, edit, delete for any
 * Mongoose collection exposed by the backend.
 *
 * Props:
 *  - title:     string (e.g. "Projects")
 *  - resource:  string (e.g. "projects")
 *  - token:     string (JWT)
 *  - fields:    array of field descriptors:
 *      { name, label, type: 'text'|'number'|'textarea'|'select'|'tags', options?, default?, full? }
 *  - columns:   array of column descriptors for the list:
 *      { key, label, render?: (item) => ReactNode, mono?: bool }
 *  - searchKeys: array of keys to match against the search box
 */
export default function ResourceManager({ title, resource, token, fields, columns, searchKeys = [] }) {
  const crud = crudFor(resource, token);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null | {} | existing
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await crud.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    const blank = fields.reduce((acc, f) => {
      acc[f.name] = f.type === 'tags' ? [] : f.default ?? '';
      return acc;
    }, {});
    setEditing(blank);
  }

  function openEdit(item) {
    setEditing({ ...item });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...editing };
      // Strip read-only fields
      delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt;
      if (editing._id) {
        await crud.update(editing._id, payload);
      } else {
        await crud.create(payload);
      }
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item permanently?')) return;
    try {
      await crud.remove(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = search.trim()
    ? items.filter((item) =>
        searchKeys.some((k) =>
          String(item[k] || '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : items;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="mono text-xs text-neon-cyan uppercase tracking-widest mb-1">
            // {resource}
          </div>
          <h1 className="text-2xl font-extrabold">{title}</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FaPlus size={12} /> New {title.replace(/s$/, '')}
        </button>
      </div>

      {error && (
        <div className="mono text-xs text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg px-3 py-2 mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={11} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center mono text-sm text-muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center mono text-sm text-muted">No records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-white/10">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="text-left mono text-[10px] uppercase tracking-widest text-muted px-4 py-3 font-medium"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="text-right mono text-[10px] uppercase tracking-widest text-muted px-4 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <motion.tr
                    key={item._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 ${c.mono ? 'mono text-xs' : ''}`}>
                        {c.render ? c.render(item) : String(item[c.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded hover:bg-neon-cyan/10 text-neon-cyan"
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded hover:bg-neon-red/10 text-neon-red"
                          title="Delete"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {editing._id ? 'Edit' : 'Create'} {title.replace(/s$/, '')}
                </h2>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded hover:bg-white/5">
                  <FaTimes />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                    <label className="mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">
                      {f.label}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        value={editing[f.name] || ''}
                        onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}
                        rows={4}
                        className="input resize-none"
                      />
                    ) : f.type === 'select' ? (
                      <select
                        value={editing[f.name] || ''}
                        onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}
                        className="input"
                      >
                        {f.options.map((o) => (
                          <option key={o} value={o} className="bg-bg-card">
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'tags' ? (
                      <input
                        type="text"
                        value={Array.isArray(editing[f.name]) ? editing[f.name].join(', ') : ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [f.name]: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="comma, separated, values"
                        className="input"
                      />
                    ) : f.type === 'number' ? (
                      <input
                        type="number"
                        value={editing[f.name] ?? ''}
                        onChange={(e) =>
                          setEditing({ ...editing, [f.name]: Number(e.target.value) })
                        }
                        className="input"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editing[f.name] || ''}
                        onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}
                        className="input"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
                <button onClick={() => setEditing(null)} className="btn-ghost">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  <FaSave size={12} /> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper: instantiate a crud helper bound to the resource + token
function crudFor(resource, token) {
  // Reuse the api.crud factory from utils/api.js
  // We require api here lazily to avoid circular imports.
  // (Re-implementing inline keeps this component self-contained.)
  const BASE = '/api';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const req = async (path, opts = {}) => {
    const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
    if (!res.ok) {
      const msg = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(msg.message || `Request failed: ${res.status}`);
    }
    return res.json();
  };
  return {
    list: () => req(`/${resource}`),
    create: (data) => req(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => req(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => req(`/${resource}/${id}`, { method: 'DELETE' }),
  };
}
