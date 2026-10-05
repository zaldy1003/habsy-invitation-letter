import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { randomBytes,randomUUID } from 'node:crypto';
const origin='http://127.0.0.1:3000';const base=process.env.SUPABASE_URL;const key=process.env.SUPABASE_SECRET_KEY;const ids=[];const users=[];let browser;
const supa=(path,init={},apiKey=key)=>fetch(`${base}/${path}`,{...init,headers:{apikey:apiKey,'Content-Type':'application/json',...init.headers}});
try {
 const accounts=[];
 for(const role of ['admin','guest']) {const email=`guest-flow-${randomUUID()}@example.com`;const password=randomBytes(24).toString('base64url');const r=await supa('auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password,email_confirm:true,app_metadata:role==='admin'?{invitation_role:'admin'}:{}})});assert.equal(r.status,200);users.push((await r.json()).id);accounts.push({email,password});}
 browser=await chromium.launch();const admin=await browser.newContext({viewport:{width:1440,height:1000}});const page=await admin.newPage();
 assert.equal((await admin.request.get(`${origin}/api/admin/guests`)).status(),401);
 assert.equal((await admin.request.post(`${origin}/api/admin/guests`,{headers:{origin},data:{action:'create',id:randomUUID(),name:'Blocked',quota:1}})).status(),401);
 const ordinary=await (await supa('auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify(accounts[1])})).json();
 await admin.addCookies([{name:'habsy-admin-session',value:ordinary.access_token,domain:'127.0.0.1',path:'/api/admin',httpOnly:true,sameSite:'Strict'}]);
 assert.equal((await admin.request.get(`${origin}/api/admin/guests`)).status(),401);await admin.clearCookies();
 assert.equal((await admin.request.post(`${origin}/api/admin/session`,{headers:{origin},data:accounts[0]})).status(),200);
 const action=body=>admin.request.post(`${origin}/api/admin/guests`,{headers:{origin},data:body});
 await page.goto(`${origin}/admin`);
 const guestName=`Uji Keluarga ${randomUUID().slice(0,8)}`;
 page.on('request',r=>{if(r.url().endsWith('/api/admin/guests')&&r.method()==='POST'){const d=r.postDataJSON();if(d.action==='create')ids.push(d.id);}});
 await page.getByLabel('Nama penerima',{exact:true}).fill(guestName);await page.getByLabel('Jatah orang').fill('3');await page.getByRole('button',{name:'Tambah tamu',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Tamu berhasil ditambahkan'}).waitFor();
 const rows=await (await admin.request.get(`${origin}/api/admin/guests?q=${encodeURIComponent(guestName)}`)).json();assert.equal(rows.rows.length,1);const guest=rows.rows[0];assert.equal(guest.max_party_size,3);assert.equal(guest.token_hash,undefined);assert.equal(guest.token_ciphertext,undefined);
 assert.equal((await action({action:'create',id:guest.id,name:guestName,quota:3})).status(),200);
 const link=(await (await action({action:'link',id:guest.id})).json()).url;
 assert.equal((await (await action({action:'link',id:guest.id})).json()).url,link);
 assert.equal((await action({action:'create',id:randomUUID(),name:'Invalid',quota:21})).status(),400);
 assert.equal((await admin.request.post(`${origin}/api/admin/guests`,{headers:{origin:'https://other.example'},data:{action:'revoke',id:guest.id}})).status(),403);
 const visitor=await browser.newContext({viewport:{width:390,height:844}});const invitation=await visitor.newPage();let submission;
 invitation.on('request',r=>{if(r.url().endsWith('/api/invitation')&&r.method()==='POST'){const d=r.postDataJSON();if(d.action==='submit')submission=d;}});
 await invitation.goto(link);await invitation.locator('.cover-recipient').filter({hasText:guestName}).waitFor();await invitation.getByRole('link',{name:'Buka Undangan'}).click();
 const token=new URL(link).searchParams.get('guest');assert.equal(new URL(invitation.url()).searchParams.get('guest'),token);
 await invitation.getByLabel('Nama penerima',{exact:true}).waitFor();assert.equal(await invitation.getByLabel('Nama penerima',{exact:true}).inputValue(),guestName);
 await invitation.getByLabel('Jumlah yang hadir').selectOption('2');await invitation.getByLabel('Untaian doa & ucapan').fill('Semoga berkah selalu.');await invitation.getByRole('button',{name:'Kirim ucapan & konfirmasi'}).click();await invitation.getByRole('button',{name:'Konfirmasi tersimpan'}).waitFor();
 const send=body=>visitor.request.post(`${origin}/api/invitation`,{headers:{origin},data:body});
 assert.equal((await send(submission)).status(),200);
 assert.equal((await send({...submission,requestId:randomUUID(),partySize:4})).status(),400);
 let dbRows=await (await supa(`rest/v1/invitation_responses?guest_id=eq.${guest.id}`)).json();assert.equal(dbRows.length,1);assert.equal(dbRows[0].party_size,2);assert.equal(dbRows[0].name,guestName);
 assert.equal((await admin.request.patch(`${origin}/api/admin/responses`,{headers:{origin},data:{id:dbRows[0].id,status:'approved'}})).status(),200);
 await invitation.reload();await invitation.getByRole('button',{name:'Ubah konfirmasi saya'}).click();await invitation.getByLabel('Konfirmasi kehadiran',{exact:true}).selectOption('berhalangan');await invitation.getByRole('button',{name:'Kirim ucapan & konfirmasi'}).click();await invitation.getByRole('button',{name:'Konfirmasi tersimpan'}).waitFor();
 dbRows=await (await supa(`rest/v1/invitation_responses?guest_id=eq.${guest.id}`)).json();assert.equal(dbRows.length,1);assert.equal(dbRows[0].party_size,0);assert.equal(dbRows[0].moderation_status,'pending');
 await page.getByRole('button',{name:'Muat ulang tamu'}).click();await page.locator('.admin-guest-row').filter({hasText:guestName}).filter({hasText:'Berhalangan'}).waitFor();await page.screenshot({path:'test-results/guests-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/guests-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 page.on('dialog',d=>d.accept());await page.locator('.admin-guest-row').filter({hasText:guestName}).getByRole('button',{name:'Cabut akses'}).click();await page.getByRole('status').filter({hasText:'Akses undangan dicabut'}).waitFor();
 assert.equal((await send({action:'resolve',token})).status(),404);assert.equal((await send({...submission,requestId:randomUUID()})).status(),404);
 assert.equal((await supa('rest/v1/invitation_guests?select=id',{},process.env.SUPABASE_PUBLISHABLE_KEY)).status,401);
 console.log('PASS: admin-only guest create/search/list, quota, stable link, no tokens in list, cover recipient, navigation, linked RSVP, replay/upsert, quota enforcement, moderation reset, revocation and mobile layout.');
}finally{
 if(browser)await browser.close();
 for(const id of new Set(ids)){assert.equal((await supa(`rest/v1/invitation_responses?guest_id=eq.${id}`,{method:'DELETE'})).status,204);assert.equal((await supa(`rest/v1/invitation_guests?id=eq.${id}`,{method:'DELETE'})).status,204);}
 for(const id of users)assert.equal((await supa(`auth/v1/admin/users/${id}`,{method:'DELETE'})).status,200);
 console.log('Only temporary test guests, responses and accounts removed.');
}
