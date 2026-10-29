// Publish the reviewed GitHub content through the same API used by the admin portal.
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Profile from '../models/Profile.js';
import AboutContent from '../models/AboutContent.js';
import SiteConfig from '../models/SiteConfig.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Timeline from '../models/Timeline.js';

const backendDir = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: path.join(backendDir, '.env') });
const content = JSON.parse(await fs.readFile(new URL('../content/github-portfolio.json', import.meta.url), 'utf8'));
const collections = { skills: content.skills, projects: content.projects, timeline: content.timeline };
for (const [Model, documents] of [[Profile, [content.profile]], [AboutContent, [content.about]], [SiteConfig, [content.site]], [Skill, content.skills], [Project, content.projects], [Timeline, content.timeline]]) {
  for (const document of documents) await new Model(document).validate();
}
if (!process.argv.includes('--apply')) {
  console.log(`Validated ${content.projects.length} projects, ${content.skills.length} skills and ${content.timeline.length} timeline entries. Add --apply to publish.`);
  process.exit(0);
}

const base = `http://127.0.0.1:${process.env.PORT || 5001}`;
let token;
async function request(route, { method = 'GET', body } = {}) {
  const response = await fetch(base + '/api' + route, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${method} ${route}: ${response.status} ${data.message || 'Request failed'}`);
  return data;
}
const session = await request('/auth/login', { method: 'POST', body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
if (session.user?.role !== 'admin' || !session.token) throw new Error('An admin session is required.');
token = session.token;

const backup = {};
for (const route of ['profile', 'about', 'site', 'skills', 'projects', 'timeline', 'resume/all']) {
  backup[route] = await request('/' + route + (route.includes('/') ? '' : '?all=1'));
}
const backupDir = path.resolve(backendDir, '../.local-backups', `github-import-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await fs.mkdir(backupDir, { recursive: true });
await fs.writeFile(path.join(backupDir, 'before.json'), JSON.stringify(backup, null, 2), { flag: 'wx' });
console.log(`CMS backup: ${backupDir}`);

function projectCover(project, index) {
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
  const accent = ['#38bdf8', '#fbbf24', '#a78bfa', '#60a5fa', '#34d399'][index % 5];
  const subtitle = project.repo === 'kings-tutor' ? 'FRONTEND PROTOTYPE' : 'FULL-STACK APPLICATION';
  const stack = project.stack.slice(0, 4).join('  /  ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#101d35"/><stop offset="1" stop-color="#080e1c"/></linearGradient><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" stroke-opacity=".04"/></pattern></defs><rect width="1200" height="675" fill="url(#bg)"/><rect width="1200" height="675" fill="url(#grid)"/><circle cx="1060" cy="110" r="240" fill="${accent}" opacity=".05"/><path d="M72 85 H180" stroke="${accent}" stroke-width="5"/><text x="72" y="145" fill="${accent}" font-size="18" font-family="Arial,sans-serif" letter-spacing="5">${subtitle}</text><text x="72" y="300" fill="#f8fafc" font-size="82" font-weight="700" font-family="Arial,sans-serif">${escape(project.title)}</text><text x="76" y="365" fill="#b8c8df" font-size="25" font-family="Arial,sans-serif">${escape(project.tagline)}</text><path d="M72 470 H1128" stroke="#ffffff" stroke-opacity=".12"/><text x="76" y="525" fill="${accent}" font-size="22" font-family="Arial,sans-serif">${escape(stack)}</text><text x="76" y="605" fill="#94a3b8" font-size="17" font-family="Arial,sans-serif">TOSIF RAZA / SELECTED WORK</text><text x="1125" y="605" fill="#64748b" text-anchor="end" font-size="17" font-family="Arial,sans-serif">${String(index + 1).padStart(2, '0')}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const skillIds = new Map();
for (const skill of collections.skills) {
  const existing = backup.skills.find((item) => item.name.toLowerCase() === skill.name.toLowerCase());
  const saved = await request('/skills' + (existing ? '/' + existing._id : ''), { method: existing ? 'PUT' : 'POST', body: skill });
  skillIds.set(skill.name, saved._id);
}
const projectIds = new Map();
for (const [index, project] of collections.projects.entries()) {
  const { repo, ...payload } = project;
  payload.image = projectCover(project, index);
  payload.relatedSkills = project.stack.map((name) => skillIds.get(name)).filter(Boolean);
  const existing = backup.projects.find((item) => item.missionId === project.missionId || item.githubUrl === project.githubUrl);
  const saved = await request('/projects' + (existing ? '/' + existing._id : ''), { method: existing ? 'PUT' : 'POST', body: payload });
  projectIds.set(project.missionId, saved._id);
}
for (const entry of collections.timeline) {
  const { projectMissionId, ...payload } = entry;
  payload.relatedProjectId = projectIds.get(projectMissionId);
  const existing = backup.timeline.find((item) => item.title === entry.title && item.date === entry.date);
  await request('/timeline' + (existing ? '/' + existing._id : ''), { method: existing ? 'PUT' : 'POST', body: payload });
}
for (const route of ['profile', 'about', 'site']) await request('/' + route, { method: 'PUT', body: content[route] });
const result = { projects: projectIds.size, skills: skillIds.size, timeline: content.timeline.length, completedAt: new Date().toISOString() };
await fs.writeFile(path.join(backupDir, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
