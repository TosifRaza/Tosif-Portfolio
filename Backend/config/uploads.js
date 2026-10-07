import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.dirname(fileURLToPath(new URL('../server.js', import.meta.url)));

export const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(backendDir, 'uploads');

export function ensureUploadDir() {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.accessSync(uploadDir, fs.constants.R_OK | fs.constants.W_OK);
  return uploadDir;
}
