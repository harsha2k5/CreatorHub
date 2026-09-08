/**
 * CreatorHub - Root Master Entry Point
 * Spawns and runs the primary PHP 8.2 backend server.
 * Note: The Node backend in /server is DEPRECATED and kept only for rollback safety.
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || '5000';
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 [CreatorHub] Launching Primary PHP Backend on http://${host}:${port}...`);

const runScript = path.join(__dirname, 'server-php', 'run.cjs');
const args = [
  runScript,
  '-S',
  `${host}:${port}`,
  '-t',
  path.join(__dirname, 'server-php'),
  path.join(__dirname, 'server-php', 'router.php')
];

const child = spawn('node', args, {
  stdio: 'inherit',
  env: { ...process.env, PORT: port }
});

child.on('error', (err) => {
  console.error('❌ Failed to start PHP backend process:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
