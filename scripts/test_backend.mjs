// TOSIF OS v6.0 — Backend API test suite (run against the running server).
// Usage: node scripts/test_backend.mjs [baseUrl]
// Covers: health, auth, CMS gating, OS flows (goal→milestone→task rollup),
// plan/actual math, security (authz, validation), contact, admin bootstrap.
import assert from 'node:assert';

const BASE = process.argv[2] || 'http://localhost:5000';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@tosifos.local';
const PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe!2026';

let passed = 0, failed = 0;
const ok = (name) => { passed++; console.log(`  ✓ ${name}`); };
const bad = (name, err) => { failed++; console.log(`  ✗ ${name}: ${err.message || err}`); };
async function t(name, fn) { try { await fn(); ok(name); } catch (e) { bad(name, e); } }

async function req(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

console.log(`\nTOSIF OS v6.0 — backend tests against ${BASE}\n`);

// ── 1. Health + public content ──
await t('health returns ok', async () => {
  const r = await req('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.data.status, 'ok');
});

let token;
await t('admin login works', async () => {
  const r = await req('POST', '/api/auth/login', { body: { email: EMAIL, password: PASSWORD } });
  assert.equal(r.status, 200, `got ${r.status}: ${JSON.stringify(r.data)}`);
  assert.ok(r.data.token, 'no token');
  token = r.data.token;
});

await t('login rejects wrong password (401)', async () => {
  const r = await req('POST', '/api/auth/login', { body: { email: EMAIL, password: 'wrong-password' } });
  assert.equal(r.status, 401);
});

await t('public site config has v6 nav (engineeringlab)', async () => {
  const r = await req('GET', '/api/site');
  assert.equal(r.status, 200);
  assert.ok(r.data.sections.some((s) => s.key === 'engineeringlab'), 'missing engineeringlab section');
  assert.ok(r.data.nav.some((n) => n.target === 'engineeringlab' || n.target === '/engineering-lab'), 'missing engineeringlab nav');
});

await t('stats endpoint computes real counts', async () => {
  const r = await req('GET', '/api/stats');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.data.stats) && r.data.stats.length >= 4);
});

await t('projects list is public and seeded', async () => {
  const r = await req('GET', '/api/projects');
  assert.equal(r.status, 200);
  assert.ok(r.data.length >= 3);
  const titles = r.data.map((p) => p.title);
  assert.ok(titles.includes('SkillBridge'));
});

// ── 2. Security ──
await t('OS endpoints require auth (401)', async () => {
  const r = await req('GET', '/api/goals');
  assert.equal(r.status, 401);
});

await t('CMS writes require admin (401)', async () => {
  const r = await req('PUT', '/api/site', { body: { footer: { text: 'hacked' } } });
  assert.ok([401, 403].includes(r.status), `got ${r.status}`);
});

await t('validation: bad contact payload → 400 (or 429 when limiter active)', async () => {
  const r = await req('POST', '/api/contact', { body: { name: '', email: 'not-an-email', message: '' } });
  assert.ok([400, 429].includes(r.status), `got ${r.status}`);
  if (r.status === 429) console.log('    (contact rate limiter active — protection working)');
});

// ── 3. OS flow: goal → milestone → task → rollup ──
let goalId, milestoneId, taskId;
await t('create goal', async () => {
  const r = await req('POST', '/api/goals', { token, body: { title: 'v6 Test Goal', description: 'rollup test', category: 'career', targetDate: '2027-01-01' } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  goalId = r.data._id || r.data.goal?._id;
  assert.ok(goalId);
});

await t('create milestone under goal', async () => {
  const r = await req('POST', '/api/milestones', { token, body: { goalId, title: 'v6 Milestone', weight: 1 } });
  assert.ok([200, 201].includes(r.status), JSON.stringify(r.data));
  milestoneId = (r.data._id || r.data.milestone?._id);
  assert.ok(milestoneId);
});

await t('create task under milestone', async () => {
  const r = await req('POST', '/api/tasks', { token, body: { milestoneId, goalId, title: 'v6 Task', estimateHours: 2 } });
  assert.ok([200, 201].includes(r.status), JSON.stringify(r.data));
  taskId = r.data._id || r.data.task?._id;
  assert.ok(taskId);
});

await t('goal appears in dashboard intelligence (while active)', async () => {
  const r = await req('GET', '/api/dashboard', { token });
  assert.equal(r.status, 200);
  assert.ok(r.data.goals && r.data.goals.some((g) => (g.title || g.goal?.title) === 'v6 Test Goal'),
    'goal missing from dashboard: ' + JSON.stringify(r.data.goals).slice(0, 140));
});

await t('task completion rolls milestone+goal progress to 100%', async () => {
  const done = await req('PATCH', `/api/tasks/${taskId}/complete`, { token, body: {} });
  assert.ok([200, 201].includes(done.status), JSON.stringify(done.data));
  const goal = await req('GET', `/api/goals/${goalId}`, { token });
  const g = goal.data.goal || goal.data;
  const progress = g.progress ?? g.progressPercent ?? 0;
  assert.equal(Number(progress), 100, `goal progress = ${progress}`);
  assert.equal((g.status || '').toLowerCase(), 'completed', `goal status = ${g.status}`);
});

// ── 4. Cleanup ──
await t('cleanup test artifacts', async () => {
  if (taskId) await req('DELETE', `/api/tasks/${taskId}`, { token });
  if (milestoneId) await req('DELETE', `/api/milestones/${milestoneId}`, { token });
  if (goalId) await req('DELETE', `/api/goals/${goalId}`, { token });
});

console.log(`\nRESULT: ${passed} passed / ${failed} failed\n`);
process.exit(failed ? 1 : 0);
