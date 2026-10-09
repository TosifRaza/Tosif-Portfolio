import { useMemo, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaEdit, FaImage, FaStar, FaTrash, FaUpload } from 'react-icons/fa';
import { api, apiUrl } from '../utils/api.js';

function uniqueImages(images) {
  return [...new Set((Array.isArray(images) ? images : []).filter((item) => typeof item === 'string' && item.trim()))];
}

export default function ProjectMediaEditor({ value, token, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [cropImage, setCropImage] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);

  const images = useMemo(() => {
    const gallery = uniqueImages(value.images);
    if (value.image && !gallery.includes(value.image)) gallery.unshift(value.image);
    return gallery;
  }, [value.image, value.images]);

  const coverImage = value.image || images[0] || '';
  const savedZoom = Math.min(3, Math.max(1, Number(value.thumbnailZoom) || 1));
  const savedX = Number.isFinite(Number(value.thumbnailPositionX)) ? Number(value.thumbnailPositionX) : 50;
  const savedY = Number.isFinite(Number(value.thumbnailPositionY)) ? Number(value.thumbnailPositionY) : 50;

  function saveImages(nextImages, nextCover = coverImage) {
    const clean = uniqueImages(nextImages);
    onChange({ images: clean, image: clean.includes(nextCover) ? nextCover : clean[0] || '' });
  }

  function setThumbnail(url) {
    onChange({
      images,
      image: url,
      thumbnailCropEdited: false,
      thumbnailZoom: 1,
      thumbnailPositionX: 50,
      thumbnailPositionY: 50,
    });
    setCropImage('');
  }

  function editThumbnail(url) {
    const isCurrentThumbnail = url === coverImage;
    if (!isCurrentThumbnail) setThumbnail(url);
    setCropImage(url);
    setCropZoom(isCurrentThumbnail && value.thumbnailCropEdited ? savedZoom : 1);
    setCropX(isCurrentThumbnail && value.thumbnailCropEdited ? savedX : 50);
    setCropY(isCurrentThumbnail && value.thumbnailCropEdited ? savedY : 50);
  }

  function saveThumbnailCrop() {
    onChange({
      image: cropImage,
      thumbnailCropEdited: true,
      thumbnailZoom: cropZoom,
      thumbnailPositionX: cropX,
      thumbnailPositionY: cropY,
    });
    setCropImage('');
  }

  async function uploadFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    const invalid = files.find((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalid) {
      setError(`${invalid.name}: use JPG, PNG, GIF, WebP, or AVIF under 5 MB.`);
      return;
    }

    setError('');
    setUploading(true);
    let nextImages = [...images];
    let nextCover = coverImage;
    try {
      for (const file of files) {
        const result = await api.uploadImage(file, token);
        const url = result.url || result.path;
        if (!url) throw new Error(`The server did not return a URL for ${file.name}.`);
        if (!nextImages.includes(url)) nextImages.push(url);
        if (!nextCover) nextCover = url;
      }
      saveImages(nextImages, nextCover);
    } catch (uploadError) {
      if (nextImages.length !== images.length) saveImages(nextImages, nextCover);
      setError(uploadError.message || 'Could not upload the selected images.');
    } finally {
      setUploading(false);
    }
  }

  function addImageUrl(event) {
    event.preventDefault();
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setError('Enter an https image URL or a site path beginning with /.');
      return;
    }
    setError('');
    saveImages([...images, url], coverImage || url);
    setImageUrl('');
  }

  function moveImage(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    saveImages(next);
  }

  function removeImage(url) {
    const next = images.filter((item) => item !== url);
    const nextCover = coverImage === url ? next[0] || '' : coverImage;
    onChange({
      images: next,
      image: nextCover,
      ...(coverImage === url ? {
        thumbnailCropEdited: false,
        thumbnailZoom: 1,
        thumbnailPositionX: 50,
        thumbnailPositionY: 50,
      } : {}),
    });
    if (cropImage === url) setCropImage('');
  }

  return (
    <div className="sm:col-span-2 rounded-xl border border-border bg-white/[0.02] p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Project images</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Upload one image or a gallery. The selected thumbnail appears on project cards; visitors can browse the full gallery.
          </p>
        </div>
        <label className={`btn-primary shrink-0 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <FaUpload size={12} /> {uploading ? 'Uploading…' : 'Upload images'}
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" multiple className="sr-only" onChange={uploadFiles} disabled={uploading} />
        </label>
      </div>

      {error && <p role="alert" className="rounded-lg border border-neon-red/30 bg-neon-red/10 px-3 py-2 text-xs text-neon-red">{error}</p>}

      <form onSubmit={addImageUrl} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Or add an image URL (https://…)"
          className="input min-w-0 flex-1"
        />
        <button type="submit" className="btn-ghost shrink-0" disabled={!imageUrl.trim()}>Add image URL</button>
      </form>

      {images.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((url, index) => {
            const isCover = url === coverImage;
            return (
              <div key={`${url}-${index}`} className={`overflow-hidden rounded-lg border ${isCover ? 'border-neon-cyan/60' : 'border-border'}`}>
                <div className="relative aspect-video bg-black/20">
                  <img
                    src={apiUrl(url)}
                    alt={`Project gallery image ${index + 1}`}
                    className="h-full w-full object-cover"
                    style={isCover && value.thumbnailCropEdited ? {
                      objectPosition: `${savedX}% ${savedY}%`,
                      transform: `scale(${savedZoom})`,
                      transformOrigin: 'center center',
                    } : undefined}
                    loading="lazy"
                  />
                  {isCover && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[10px] font-semibold text-neon-cyan">
                      <FaStar size={9} /> Thumbnail
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white">{index + 1} / {images.length}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 p-2">
                  {!isCover ? (
                    <button type="button" onClick={() => setThumbnail(url)} className="btn-ghost !px-2 !py-1 text-[10px]">
                      Set as thumbnail
                    </button>
                  ) : (
                    <span className="px-2 py-1 text-[10px] font-medium text-neon-cyan">Thumbnail selected</span>
                  )}
                  <button type="button" onClick={() => editThumbnail(url)} className="btn-ghost !px-2 !py-1 text-[10px]">
                    <FaEdit size={10} /> Edit crop
                  </button>
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded p-2 text-muted-foreground hover:bg-white/5 disabled:opacity-30" aria-label="Move image earlier" title="Move earlier">
                    <FaArrowUp size={10} />
                  </button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="rounded p-2 text-muted-foreground hover:bg-white/5 disabled:opacity-30" aria-label="Move image later" title="Move later">
                    <FaArrowDown size={10} />
                  </button>
                  <button type="button" onClick={() => removeImage(url)} className="ml-auto rounded p-2 text-neon-red hover:bg-neon-red/10" aria-label="Remove image" title="Remove image">
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
          <FaImage className="mb-2 text-lg" />
          No project images yet. The first upload becomes the thumbnail.
        </div>
      )}

      {cropImage && (
        <div className="rounded-xl border border-primary/35 bg-card/70 p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Edit thumbnail crop</h3>
              <p className="mt-1 text-xs text-muted-foreground">Adjust this 16:9 preview. The original image stays unchanged in the gallery.</p>
            </div>
            <button type="button" onClick={() => setCropImage('')} className="btn-ghost !px-2 !py-1">Cancel</button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-[#070b13]">
              <img
                src={apiUrl(cropImage)}
                alt="Thumbnail crop preview"
                className="h-full w-full object-cover"
                style={{
                  objectPosition: `${cropX}% ${cropY}%`,
                  transform: `scale(${cropZoom})`,
                  transformOrigin: 'center center',
                }}
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-medium text-muted-foreground">
                Zoom: {cropZoom.toFixed(1)}×
                <input type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={(event) => setCropZoom(Number(event.target.value))} className="mt-2 block w-full accent-blue-500" />
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Horizontal position: {cropX}%
                <input type="range" min="0" max="100" step="1" value={cropX} onChange={(event) => setCropX(Number(event.target.value))} className="mt-2 block w-full accent-blue-500" />
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Vertical position: {cropY}%
                <input type="range" min="0" max="100" step="1" value={cropY} onChange={(event) => setCropY(Number(event.target.value))} className="mt-2 block w-full accent-blue-500" />
              </label>
              <button type="button" onClick={saveThumbnailCrop} className="btn-primary w-full justify-center">Save thumbnail crop</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2 sm:items-center">
        <label className="flex items-center gap-2 text-xs text-foreground/80">
          <input
            type="checkbox"
            checked={!!value.galleryAutoplay}
            onChange={(event) => onChange({ galleryAutoplay: event.target.checked })}
            className="h-4 w-4 accent-cyan-400"
          />
          Automatically rotate project images
        </label>
        <label className="flex items-center gap-3 text-xs text-muted-foreground">
          Change every
          <input
            type="number"
            min="2"
            max="30"
            value={value.galleryInterval ?? 5}
            onChange={(event) => onChange({ galleryInterval: Math.min(30, Math.max(2, Number(event.target.value) || 2)) })}
            className="input !w-20 !py-2"
            disabled={!value.galleryAutoplay}
          />
          seconds
        </label>
      </div>
    </div>
  );
}
