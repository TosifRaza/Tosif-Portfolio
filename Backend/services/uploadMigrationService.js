import fs from 'node:fs/promises';
import path from 'node:path';
import AboutContent from '../models/AboutContent.js';
import Achievement from '../models/Achievement.js';
import Experience from '../models/Experience.js';
import Product from '../models/Product.js';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import SiteConfig from '../models/SiteConfig.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import UploadedImage from '../models/UploadedImage.js';
import { uploadDir } from '../config/uploads.js';

const PUBLIC_CONTENT_MODELS = [AboutContent, Achievement, Experience, Product, Profile, Project, SiteConfig, Skill, Timeline];
const MIME_BY_EXTENSION = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};
const MAX_MIGRATION_SIZE = 15 * 1024 * 1024;

/** Copy referenced legacy local images into MongoDB so every backend instance can serve them. */
export async function migrateReferencedUploadImages() {
  const referenced = new Set();
  for (const model of PUBLIC_CONTENT_MODELS) {
    const documents = await model.find({}).lean();
    for (const document of documents) collectUploadNames(document, referenced);
  }

  let migrated = 0;
  const root = path.resolve(uploadDir);
  for (const filename of referenced) {
    const extension = path.extname(filename).toLowerCase();
    const contentType = MIME_BY_EXTENSION[extension];
    if (!contentType) continue;

    const alreadyStored = await UploadedImage.exists({ filename });
    if (alreadyStored) continue;

    const absPath = path.resolve(root, filename);
    if (!absPath.startsWith(`${root}${path.sep}`)) continue;
    try {
      const stat = await fs.stat(absPath);
      if (!stat.isFile() || stat.size > MAX_MIGRATION_SIZE) continue;
      const data = await fs.readFile(absPath);
      const result = await UploadedImage.updateOne(
        { filename },
        { $setOnInsert: { filename, contentType, size: data.length, data } },
        { upsert: true }
      );
      if (result.upsertedCount) migrated += 1;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return migrated;
}

function collectUploadNames(value, names) {
  if (typeof value === 'string') {
    const match = value.match(/^\/uploads\/([a-zA-Z0-9][a-zA-Z0-9._-]{0,200})$/);
    if (match && MIME_BY_EXTENSION[path.extname(match[1]).toLowerCase()]) names.add(match[1]);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUploadNames(item, names);
    return;
  }
  if (value && typeof value === 'object' && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    for (const item of Object.values(value)) collectUploadNames(item, names);
  }
}
