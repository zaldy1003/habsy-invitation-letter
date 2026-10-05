const required = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'SUPABASE_SECRET_KEY', 'GUEST_TOKEN_KEY', 'SUPABASE_URL', 'APP_ORIGIN'];
const missing = required.filter(name => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing GitHub Actions configuration: ${missing.join(', ')}`);
if (!/^[a-f0-9]{64}$/i.test(process.env.GUEST_TOKEN_KEY)) throw new Error('GUEST_TOKEN_KEY must contain the existing 64-character hex key from .env.local.');
if (!/^[a-f0-9]{32}$/i.test(process.env.CLOUDFLARE_ACCOUNT_ID)) throw new Error('CLOUDFLARE_ACCOUNT_ID must be the 32-character account ID, not the Worker name.');
for (const name of ['SUPABASE_URL', 'APP_ORIGIN']) {
  const value = process.env[name];
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.origin !== value) throw new Error(`${name} must be an HTTPS origin without a path or trailing slash.`);
}
console.log('Required deployment settings are present. Secret values are not printed.');
