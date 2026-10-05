import { chromium } from 'playwright';
import { randomUUID, randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3000';
const key=process.env.SUPABASE_SECRET_KEY;
const url=process.env.SUPABASE_URL;
const users=[]; const rows=[];
async function supa(path,init={}) { return fetch(`${url}/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...init.headers}}); }
let browser;
try {
 const accounts=[];
 for(const role of ['admin','guest']) {
  const email=`admin-test-${randomUUID()}@example.com`; const password=randomBytes(24).toString('base64url');
  const response=await supa('auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password,email_confirm:true,app_metadata:role==='admin'?{invitation_role:'admin'}:{}})});
  assert.equal(response.status,200); const user=await response.json(); users.push(user.id); accounts.push({email,password});
 }
 for(const consent of [true,false]) {
  const response=await supa('rest/v1/invitation_responses',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({request_id:randomUUID(),name:consent?'Uji Admin — Keluarga':'Uji Admin — Pribadi',attendance:'hadir',message:'Semoga istiqomah mencintai Al-Qur’an.',publish_consent:consent})});
  assert.equal(response.status,201); rows.push((await response.json())[0]);
 }
 browser=await chromium.launch(); const context=await browser.newContext({viewport:{width:1280,height:900}}); const page=await context.newPage();
 assert.equal((await context.request.get(`${origin}/api/admin/responses`)).status(),401);
 const unauthorized=await context.request.post(`${origin}/api/admin/session`,{headers:{origin},data:accounts[1]}); assert.equal(unauthorized.status(),403);
 const guestSessionResponse=await supa('auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify(accounts[1])});
 const guestSession=await guestSessionResponse.json();
 await context.addCookies([{name:'habsy-admin-session',value:guestSession.access_token,domain:'127.0.0.1',path:'/api/admin',httpOnly:true,sameSite:'Strict'}]);
 assert.equal((await context.request.get(`${origin}/api/admin/responses`)).status(),401);
 assert.equal((await context.request.patch(`${origin}/api/admin/responses`,{headers:{origin},data:{id:rows[0].id,status:'approved'}})).status(),401);
 await context.clearCookies();
 await page.goto(`${origin}/admin`); await page.getByLabel('Email pengelola').fill(accounts[0].email); await page.getByLabel('Kata sandi').fill(accounts[0].password); await page.getByRole('button',{name:'Masuk ke panel'}).click();
 await page.getByRole('heading',{name:'Ringkasan acara'}).waitFor();
 await page.getByRole('button',{name:'Ucapan & doa',exact:true}).click();
 await page.getByLabel('Cari nama tamu').fill('Uji Admin'); await page.getByRole('button',{name:'Cari',exact:true}).click();
 await page.getByRole('heading',{name:'Uji Admin — Keluarga',exact:true}).waitFor();
 const article=page.locator('.admin-response').filter({has:page.getByRole('heading',{name:'Uji Admin — Keluarga',exact:true})});
 await article.getByRole('button',{name:'Tampilkan',exact:true}).click();
 await page.getByRole('status').filter({hasText:'ditampilkan'}).waitFor();
 const feed=await (await fetch(`${origin}/api/guestbook`)).json(); assert(feed.wishes.some(w=>w.id===rows[0].id));
 const refused=await context.request.patch(`${origin}/api/admin/responses`,{headers:{origin},data:{id:rows[1].id,status:'approved'}}); assert.equal(refused.status(),409);
 assert.equal((await context.request.patch(`${origin}/api/admin/responses`,{headers:{origin:'https://other.example'},data:{id:rows[0].id,status:'hidden'}})).status(),403);
 await page.screenshot({path:'test-results/admin-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844}); await page.screenshot({path:'test-results/admin-mobile.png',fullPage:true}); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await article.getByRole('button',{name:'Sembunyikan',exact:true}).click(); await page.getByRole('status').filter({hasText:'disembunyikan'}).waitFor();
 const hidden=await (await fetch(`${origin}/api/guestbook`)).json(); assert(!hidden.wishes.some(w=>w.id===rows[0].id));
 const audit=await supa(`rest/v1/invitation_moderation_log?response_id=eq.${rows[0].id}`); assert.equal((await audit.json()).length,2);
 const cookie=(await context.cookies(`${origin}/api/admin/session`)).find(c=>c.name==='habsy-admin-session'); assert(cookie.httpOnly); assert.equal(cookie.sameSite,'Strict');
 await page.getByRole('button',{name:'Keluar',exact:true}).click(); await page.getByRole('button',{name:'Masuk ke panel'}).waitFor();
 assert.equal((await context.request.get(`${origin}/api/admin/responses`)).status(),401);
 await page.screenshot({path:'test-results/admin-login.png',fullPage:true});
 console.log('PASS: login, non-admin denial, authorization, search, publish/hide, consent enforcement, origin check, audit trail, HttpOnly session, logout, mobile layout.');
} finally {
 if(browser) await browser.close();
 for(const row of rows) assert.equal((await supa(`rest/v1/invitation_responses?id=eq.${row.id}`,{method:'DELETE'})).status,204);
 for(const id of users) assert.equal((await supa(`auth/v1/admin/users/${id}`,{method:'DELETE'})).status,200);
 console.log('Temporary accounts and response rows removed.');
}
