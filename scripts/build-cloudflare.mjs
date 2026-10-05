// OpenNext bundles values from Next.js .env files. Keep local credentials out
// of deployment artifacts; production bindings are supplied by GitHub Actions.
import { mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const cwd = process.cwd();
const stash = await mkdtemp(join(tmpdir(), 'habsy-build-env-'));
const moved = [];
let child;
let interrupted = false;
const interrupt = () => { interrupted = true; child?.kill('SIGTERM'); };
process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);
try {
  const files = (await readdir(cwd)).filter(name => /^\.env(?:\.(?:local|production|production\.local|development|development\.local|test|test\.local))?$/.test(name) || /^\.dev\.vars(?:\..+)?$/.test(name));
  for (const name of files) { await rename(join(cwd, name), join(stash, name)); moved.push(name); }
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false', CI: 'true' };
  for (const name of ['SUPABASE_SECRET_KEY','GUEST_TOKEN_KEY','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','APP_ORIGIN','CLOUDFLARE_API_TOKEN','CLOUDFLARE_ACCOUNT_ID']) delete env[name];
  if (interrupted) throw new Error('Build cancelled.');
  const code = await new Promise((resolve, reject) => {
    child = spawn(process.execPath, ['node_modules/@opennextjs/cloudflare/dist/cli/index.js', 'build'], { cwd, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => resolve(code ?? 1));
  });
  process.exitCode = Number(code);
} finally {
  for (const name of moved) await rename(join(stash, name), join(cwd, name));
  await rm(stash, { recursive: true, force: true });
  process.removeListener('SIGINT', interrupt);
  process.removeListener('SIGTERM', interrupt);
}
