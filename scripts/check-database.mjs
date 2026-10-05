// Explicit integration check: creates uniquely identified test rows, then removes only those rows.
import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const origin = 'http://127.0.0.1:3000';
const ids = [];
const address = `integration-${randomUUID()}`;
const bucket = createHmac('sha256',key).update(address).digest('hex');
async function db(path, init={}, apiKey=key) {
  return fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: apiKey, 'Content-Type':'application/json', ...init.headers } });
}
const sample = () => ({ requestId:randomUUID(), name:'UJI INTEGRASI — akan dihapus', attendance:'hadir', message:'Ucapan uji integrasi', publishConsent:true, website:'' });
async function send(body) {
 ids.push(body.requestId);
 return fetch(`${origin}/api/guestbook`,{method:'POST',headers:{'Content-Type':'application/json',origin,'x-forwarded-for':address},body:JSON.stringify(body)});
}
try {
 const body=sample();
 assert.equal((await send(body)).status,200);
 assert.equal((await send(body)).status,200);
 const rowResponse=await db(`invitation_responses?request_id=eq.${body.requestId}`);
 assert.equal(rowResponse.status,200);
 const rows=await rowResponse.json(); assert.equal(rows.length,1); assert.equal(rows[0].moderation_status,'pending');
 assert.equal((await send({...body,name:'Different'})).status,409);
 let feed=await (await fetch(`${origin}/api/guestbook`)).json(); assert(!feed.wishes.some(x=>x.id===rows[0].id));
 assert.equal((await db(`invitation_responses?request_id=eq.${body.requestId}`,{method:'PATCH',body:JSON.stringify({moderation_status:'approved'})})).status,204);
 feed=await (await fetch(`${origin}/api/guestbook`)).json();
 const published=feed.wishes.find(x=>x.id===rows[0].id); assert(published); assert.equal(published.attendance,undefined); assert.equal(published.request_id,undefined);
 for(let i=0;i<4;i++) assert.equal((await send(sample())).status,200);
 assert.equal((await send(sample())).status,429);
 assert.equal((await db('invitation_responses?select=id',{},publicKey)).status,401);
 const anonInsert=await db('invitation_responses',{method:'POST',body:JSON.stringify({request_id:randomUUID(),name:'Blocked',attendance:'hadir'})},publicKey);
 assert.equal(anonInsert.status,401);
 const anonRpc=await db('rpc/submit_invitation_response',{method:'POST',body:JSON.stringify({p_request_id:randomUUID(),p_name:'Blocked',p_attendance:'hadir',p_message:'',p_publish_consent:false,p_bucket:bucket})},publicKey);
 assert.equal(anonRpc.status,401);
 console.log('PASS: real save, idempotency, conflict, pending visibility, approved feed, private RSVP, rate limit, anonymous read/write/RPC denial.');
} finally {
 const cleanup=await db(`invitation_responses?request_id=in.(${[...new Set(ids)].join(',')})`,{method:'DELETE'});
 assert.equal(cleanup.status,204);
 console.log('Test response rows removed. Rate-limit test bucket expires after 10 minutes.');
}
