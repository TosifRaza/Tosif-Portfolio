import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { uploadDir } from '../config/uploads.js';

const API_ORIGIN = (process.env.IMAGE_MIGRATION_API_URL || process.env.VITE_API_URL || 'https://tosif-portfolio-1.onrender.com').replace(/\/+$/, '');
const email = process.env.IMAGE_MIGRATION_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const password = process.env.IMAGE_MIGRATION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
const IMAGE_CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};
const PUBLIC_CONTENT_PATHS = [
  '/api/profile', '/api/projects', '/api/products', '/api/experience',
  '/api/achievements', '/api/timeline', '/api/skills', '/api/site', '/api/about',
];

if (!email || !password) {
  throw new Error('Set IMAGE_MIGRATION_ADMIN_EMAIL and IMAGE_MIGRATION_ADMIN_PASSWORD to a production admin account.');
}

async function request(pathname, options = {}) {
  const response = await fetch(`${API_ORIGIN}${pathname}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${pathname} failed (${response.status}): ${body.message || response.statusText}`);
  return body;
}

const session = await request('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
if (!session.token) throw new Error('Production login did not return an admin token.');
const authHeaders = { Authorization: `Bearer ${session.token}` };

// Make sure the backend has the restore route before uploading any files.
const probe = new FormData();
const probeResponse = await fetch(`${API_ORIGIN}/api/upload/restore`, {
  method: 'POST',
  headers: authHeaders,
  body: probe,
});
if (probeResponse.status === 404) {
  throw new Error('The deployed backend lacks image restoration support. Deploy the updated Backend first.');
}
if (probeResponse.status === 401 || probeResponse.status === 403) {
  throw new Error('The configured account is not an authorized production admin.');
}
if (probeResponse.status !== 400) {
  const detail = await probeResponse.text();
  throw new Error(`Image restoration preflight failed (${probeResponse.status}): ${detail.slice(0, 200)}`);
}

const referencedFiles = new Set();
for (const endpoint of PUBLIC_CONTENT_PATHS) {
  const data = await request(endpoint);
  collectReferencedUploads(data, referencedFiles);
}

let restored = 0;
const missing = [];
for (const filename of referencedFiles) {
  const contentType = IMAGE_CONTENT_TYPES[path.extname(filename).toLowerCase()];
  if (!contentType) continue;
  const imagePath = path.resolve(uploadDir, filename);
  const uploadRoot = path.resolve(uploadDir);
  if (!imagePath.startsWith(`${uploadRoot}${path.sep}`)) continue;

  let bytes;
  try {
    bytes = await fs.readFile(imagePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      missing.push(filename);
      continue;
    }
    throw error;
  }

  const form = new FormData();
  form.append('filename', filename);
  form.append('image', new Blob([bytes], { type: contentType }), filename);
  const result = await request('/api/upload/restore', {
    method: 'POST',
    headers: authHeaders,
    body: form,
  });
  if (result.url !== `/uploads/${filename}` || result.restored !== true) {
    throw new Error(`Backend did not preserve the existing URL for ${filename}.`);
  }
  restored += 1;
}

console.log(`Restored ${restored} referenced public image(s) to ${API_ORIGIN}.`);
if (missing.length) {
  console.warn(`${missing.length} referenced image file(s) were not found in ${uploadDir}; those URLs still need their original files.`);
}

function collectReferencedUploads(value, filenames) {
  if (typeof value === 'string') {
    const match = value.match(/^\/uploads\/([a-zA-Z0-9][a-zA-Z0-9._-]{0,200})$/);
    if (match) filenames.add(match[1]);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectReferencedUploads(item, filenames);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectReferencedUploads(item, filenames);
  }
}
