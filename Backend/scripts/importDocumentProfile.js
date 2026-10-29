// Publish user-supplied credential facts; preserve existing portfolio records.
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
const content = JSON.parse(await fs.readFile(new URL('../content/document-portfolio.json', import.meta.url), 'utf8'));
if (!process.argv.includes('--apply')) {
  console.log('Reviewed document content ready. Use --apply to back up and publish.');
  process.exit(0);
}
const base = `http://127.0.0.1:${process.env.PORT || 5001}/api`;
let token;
async function request(route, method = 'GET', body) {
  const response = await fetch(base + route, {
    method, headers: { Connection: 'close', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${method} ${route}: ${response.status} ${result.message}`);
  return result;
}
const session = await request('/auth/login', 'POST', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
if (session.user?.role !== 'admin') throw new Error('Admin required');
token = session.token;
const before = {};
for (const route of ['experience/all', 'achievements?all=1', 'skills?all=1', 'timeline?all=1', 'profile', 'about', 'resume/all']) before[route.split(/[/?]/)[0]] = await request('/' + route);
const dir = new URL(`../../.local-backups/document-import-${Date.now()}/`, import.meta.url);
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(new URL('before.json', dir), JSON.stringify(before, null, 2));
for (const route of ['experience', 'achievements', 'skills', 'timeline']) {
  for (const item of content[route]) {
    const existing = before[route].find(row => route === 'experience' ? row.company === item.company && row.role === item.role : route === 'skills' ? row.name === item.name : row.title === item.title);
    await request('/' + route + (existing ? '/' + existing._id : ''), existing ? 'PUT' : 'POST', item);
  }
  console.log(`${route}: ${content[route].length} reviewed entries saved`);
}
for (const route of ['profile', 'about']) await request('/' + route, 'PUT', content[route]);
console.log('Document facts published; previous content backed up.');
