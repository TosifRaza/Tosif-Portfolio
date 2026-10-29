// Usage: npm run reset:content -- --execute
// Back up and reset portfolio/personal OS content; preserve user accounts.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: path.join(backendDir, '.env') });
if (!process.argv.includes('--execute')) {
  console.log('Run with --execute to back up and reset all content in the configured database. User accounts are preserved.');
  process.exit(0);
}
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required for an explicit database reset.');

const { uploadDir } = await import('../config/uploads.js');
const { default: Profile } = await import('../models/Profile.js');
const { default: AboutContent } = await import('../models/AboutContent.js');
const { default: SiteConfig, DEFAULT_SECTIONS, DEFAULT_NAV } = await import('../models/SiteConfig.js');
for (const filename of await fs.readdir(path.join(backendDir, 'models'))) {
  if (filename.endsWith('.js')) await import(new URL(`../models/${filename}`, import.meta.url));
}
const models = Object.values(mongoose.models).filter((model) => model.modelName !== 'User');
const backupRoot = path.resolve(backendDir, '../.local-backups');
const backupDir = path.join(backupRoot, `content-reset-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await fs.mkdir(backupRoot, { recursive: true });
await fs.mkdir(backupDir);

try {
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: false, autoCreate: false });
  const snapshots = [];
  for (const model of models) {
    const documents = await model.collection.find({}).toArray();
    snapshots.push({ model, documents });
    await fs.writeFile(path.join(backupDir, `${model.collection.name}.json`),
      mongoose.mongo.BSON.EJSON.stringify(documents, { relaxed: false }), { flag: 'wx' });
  }

  // Resolve and validate every path before archiving the configured uploads.
  const uploadRoot = path.resolve(uploadDir);
  if (uploadRoot === path.parse(uploadRoot).root || uploadRoot === path.resolve(backendDir)) {
    throw new Error('Refusing to reset an unsafe uploads directory.');
  }
  if (backupDir === uploadRoot || backupDir.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new Error('Backup must be outside the uploads directory.');
  }
  const entries = await fs.readdir(uploadRoot, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const uploads = entries.filter((entry) => entry.name !== '.gitkeep').map((entry) => {
    const source = path.resolve(uploadRoot, entry.name);
    const destination = path.resolve(backupDir, 'uploads', entry.name);
    if (!source.startsWith(`${uploadRoot}${path.sep}`)
      || !destination.startsWith(`${backupDir}${path.sep}`) || entry.isSymbolicLink()) {
      throw new Error('Unexpected path in uploads directory.');
    }
    return { source, destination };
  });
  for (const { source, destination } of uploads) {
    await fs.cp(source, destination, { recursive: true, errorOnExist: true, force: false });
  }
  const manifest = {
    createdAt: new Date().toISOString(),
    database: mongoose.connection.name,
    collections: Object.fromEntries(snapshots.map(({ model, documents }) => [model.collection.name, documents.length])),
    usersPreserved: await mongoose.connection.db.collection('users').countDocuments(),
    uploads: uploads.map(({ source }) => path.basename(source)),
  };
  await fs.writeFile(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  console.log(`Backup completed: ${backupDir}`);

  const singletons = new Map([
    [Profile.modelName, {}],
    [AboutContent.modelName, {}],
    [SiteConfig.modelName, { sections: DEFAULT_SECTIONS, nav: DEFAULT_NAV }],
  ]);
  for (const { model, documents } of snapshots) {
    const ids = documents.map((document) => document._id);
    if (singletons.has(model.modelName)) {
      const clean = new model(singletons.get(model.modelName));
      await clean.validate();
      const replacement = clean.toObject();
      replacement.createdAt = new Date();
      replacement.updatedAt = new Date();
      if (ids.length) {
        replacement._id = ids[0];
        await model.collection.replaceOne({ _id: ids[0] }, replacement);
        if (ids.length > 1) await model.collection.deleteMany({ _id: { $in: ids.slice(1) } });
      } else {
        await model.collection.insertOne(replacement);
      }
    } else if (ids.length) {
      // Only delete records included in the completed backup.
      await model.collection.deleteMany({ _id: { $in: ids } });
    }
    console.log(`${model.collection.name}: reset ${documents.length} records`);
  }
  // All paths were resolved and checked above, and each file was copied first.
  for (const { source } of uploads) await fs.rm(source, { recursive: true });
  await fs.writeFile(path.join(backupDir, 'completed.json'), JSON.stringify({ completedAt: new Date().toISOString() }));
  console.log('Content reset complete. User accounts were preserved.');
} finally {
  await mongoose.disconnect();
}
