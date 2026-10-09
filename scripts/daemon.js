// Double-fork daemonizer: keeps long-running dev servers alive between tool calls.
// Usage: node daemon.js <name> <command...>
// Logs: /tmp/daemon-<name>.log   PID file: /tmp/daemon-<name>.pid
import { spawn, fork } from 'node:child_process';
import fs from 'node:fs';

const [name, ...cmd] = process.argv.slice(2);
if (!name || cmd.length === 0) {
  console.error('usage: node daemon.js <name> <cmd...>');
  process.exit(1);
}

const logFile = `/tmp/daemon-${name}.log`;
const pidFile = `/tmp/daemon-${name}.pid`;

// Already running?
try {
  const oldPid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
  process.kill(oldPid, 0);
  console.log(`[daemon] ${name} already running (pid ${oldPid})`);
  process.exit(0);
} catch { /* not running — continue */ }

const out = fs.openSync(logFile, 'a');
fs.writeSync(out, `\n──── [${new Date().toISOString()}] start: ${cmd.join(' ')}\n`);

const child = spawn(cmd[0], cmd.slice(1), {
  detached: true,
  stdio: ['ignore', out, out],
  env: process.env,
  cwd: process.cwd(),
});

fs.writeFileSync(pidFile, String(child.pid));
child.unref();

console.log(`[daemon] ${name} started (pid ${child.pid}) — log: ${logFile}`);
process.exit(0);
