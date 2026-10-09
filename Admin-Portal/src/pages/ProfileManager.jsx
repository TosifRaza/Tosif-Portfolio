import { useEffect, useRef, useState } from 'react';
import { api, apiUrl } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { FaExternalLinkAlt, FaImage, FaSave, FaTrash, FaUpload } from 'react-icons/fa';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

function githubAvatarUrl(url) {
  const username = url?.match(/github\.com\/([^/?#]+)/i)?.[1];
  return username ? `https://github.com/${username}.png?size=384` : '';
}

/** PROFILE — single source of truth for identity across the whole portfolio. */
export default function ProfileManager() {
  const { token } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [failedPreview, setFailedPreview] = useState('');
  const [loadedPreview, setLoadedPreview] = useState('');
  const [msg, setMsg] = useState(null);
  const photoInputRef = useRef(null);

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
      const saved = await api.updateProfile(doc, token);
      setDoc(saved);
      setMsg({ ok: true, text: 'Profile saved. Reload any open portfolio tab to see the update.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    if (!PHOTO_TYPES.has(file.type)) {
      setMsg({ ok: false, text: 'Choose a JPEG, PNG, WebP, AVIF, or GIF image.' });
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setMsg({ ok: false, text: 'The profile photo must be 5 MB or smaller.' });
      return;
    }

    setUploadingPhoto(true);
    setMsg(null);
    try {
      const result = await api.uploadImage(file, token);
      set('avatarUrl', result.url);
      setFailedPreview('');
      setMsg({ ok: true, text: 'Photo uploaded. Save profile to publish it on your portfolio.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message || 'Photo upload failed.' });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  if (loading) return <div className="mono text-sm text-muted-foreground">Loading profile…</div>;
  if (!doc) return <div className="mono text-sm text-neon-red">Failed to load profile.</div>;

  const input = 'input';
  const avatarUrl = doc.avatarUrl?.trim() || '';
  const githubPhoto = githubAvatarUrl(doc.socials?.github);
  const previewUrl = avatarUrl ? apiUrl(avatarUrl) : githubPhoto;
  const previewHasFailed = failedPreview === previewUrl;
  const previewLoaded = Boolean(previewUrl) && loadedPreview === previewUrl;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Identity used by the hero, about, resume, recruiter view and the AI assistant.</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-5 max-w-3xl">
        <section className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5" aria-labelledby="profile-photo-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/50 bg-primary/10 text-2xl font-bold text-primary shadow-glow">
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${previewLoaded ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
                {(doc.name || 'TR').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
              </span>
              {previewUrl && !previewHasFailed && (
                <img
                  key={previewUrl}
                  src={previewUrl}
                  alt={`${doc.name || 'Profile'} photo preview`}
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity ${previewLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => { setLoadedPreview(previewUrl); setFailedPreview(''); }}
                  onError={() => { setLoadedPreview(''); setFailedPreview(previewUrl); }}
                />
              )}
            </div>

            <div
              className={`min-w-0 flex-1 rounded-xl border border-dashed p-4 transition-colors ${photoDragOver ? 'border-primary bg-primary/10' : 'border-border bg-card/40'}`}
              onDragOver={(event) => { event.preventDefault(); setPhotoDragOver(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPhotoDragOver(false); }}
              onDrop={(event) => {
                event.preventDefault();
                setPhotoDragOver(false);
                uploadPhoto(event.dataTransfer.files?.[0]);
              }}
            >
              <h2 id="profile-photo-heading" className="font-semibold">Profile photo</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Used for your portfolio portrait and header avatar. Upload an image or paste a public image URL below.
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                JPEG, PNG, WebP, AVIF, or GIF · up to 5 MB · drag and drop supported
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="hidden"
                  onChange={(event) => uploadPhoto(event.target.files?.[0])}
                  disabled={uploadingPhoto}
                />
                <button type="button" className="btn-primary" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                  <FaUpload size={12} /> {uploadingPhoto ? 'Uploading photo…' : 'Upload photo'}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    if (!githubPhoto) return;
                    set('avatarUrl', githubPhoto);
                    setFailedPreview('');
                    setMsg({ ok: true, text: 'GitHub photo selected. Save profile to publish it.' });
                  }}
                  disabled={!githubPhoto || uploadingPhoto}
                >
                  <FaImage size={12} /> Use GitHub photo
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    className="btn-ghost text-destructive hover:text-destructive"
                    onClick={() => {
                      set('avatarUrl', '');
                      setFailedPreview('');
                      setMsg({ ok: true, text: githubPhoto ? 'Custom photo cleared. The site will use your GitHub photo.' : 'Custom photo cleared. The site will show initials.' });
                    }}
                    disabled={uploadingPhoto}
                  >
                    <FaTrash size={11} /> Clear custom photo
                  </button>
                )}
              </div>
              {previewUrl && previewHasFailed && (
                <p className="mt-3 text-xs text-amber-400" role="status">
                  This image preview could not load. Check that the URL is public and points directly to an image.
                </p>
              )}
              {!previewUrl && (
                <p className="mt-3 text-xs text-muted-foreground">No photo is set yet; the public site will show your initials.</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <F label="Profile photo URL">
              <div className="relative">
                <input
                  className={`${input} pr-10`}
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://example.com/photo.jpg or /uploads/photo.jpg"
                  value={doc.avatarUrl || ''}
                  onChange={(event) => { set('avatarUrl', event.target.value); setFailedPreview(''); }}
                />
                {avatarUrl && /^https?:\/\//i.test(avatarUrl) && (
                  <a href={avatarUrl} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" aria-label="Open profile photo URL">
                    <FaExternalLinkAlt size={12} />
                  </a>
                )}
              </div>
            </F>
            <p className="mt-1 text-[11px] text-muted-foreground">Leave blank to use the GitHub avatar from your GitHub URL, when available.</p>
          </div>
        </section>

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
          <button onClick={save} disabled={saving || uploadingPhoto} className="btn-primary">
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
      <label className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
