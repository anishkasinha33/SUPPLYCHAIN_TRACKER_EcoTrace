// `npm run dev`: runs server/index.js and restarts it when a file in server/ changes.
// (node --watch also reacts to Vite's cache files in node_modules and restarts in a loop.)
// Frontend changes are handled by Vite's hot reload inside that process, not by a restart.
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
let child;
let timer;

function start() {
  child = spawn(process.execPath, [...process.execArgv, fileURLToPath(new URL('./index.js', import.meta.url))], { stdio: 'inherit' });
}

function restart() {
  if (!child || child.exitCode !== null) return start();
  child.once('exit', start);
  child.kill();
}

watch(dir, { recursive: true }, (event, file) => {
  if (!file?.endsWith('.js')) return;
  clearTimeout(timer);
  timer = setTimeout(() => { console.log(`\n${file} changed, restarting...`); restart(); }, 150);
});

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { child?.kill(); process.exit(0); });
start();
