// Create only a new owner-approved account. No email is sent and existing users are never modified.
import { randomBytes } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
const email=process.env.ADMIN_EMAIL?.trim();
if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set ADMIN_EMAIL to the owner-approved email address.');
if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) throw new Error('Missing server configuration.');
const password=randomBytes(24).toString('base64url');
await writeFile('admin-access.local.txt',`Admin URL: http://127.0.0.1:3000/admin\nEmail: ${email}\nPassword: ${password}\n`,{mode:0o600,flag:'wx'});
try {
 const response=await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`,{method:'POST',headers:{apikey:process.env.SUPABASE_SECRET_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password,email_confirm:true,app_metadata:{invitation_role:'admin'}})});
 if(!response.ok) { await unlink('admin-access.local.txt'); throw new Error(`Account creation failed (${response.status}); existing accounts were not changed.`); }
 console.log('Admin account created. Credentials saved only to admin-access.local.txt (permissions 600). No email sent.');
} catch(error) {
 // Keep credentials on ambiguous network failure: account creation may have succeeded.
 throw error;
}
