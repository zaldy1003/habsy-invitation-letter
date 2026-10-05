import { test, expect } from '@playwright/test';
import { makeToken, readToken, tokenHash, tokenValid } from '../../src/lib/guest-token';
import { getCountdown } from '../../src/lib/countdown';
import { eventClock, eventDay, eventDate } from '../../src/lib/event-format';
import { smallBody, validOrigin } from '../../src/lib/admin-server';
import { POST, GET } from '../../src/app/api/guestbook/route';

const origin = 'https://invitation.example';
test.beforeEach(() => { process.env.GUEST_TOKEN_KEY = 'a'.repeat(64); process.env.APP_ORIGIN = origin; });
test('tokens round trip, remain unique and bind to guest identity', () => {
 const a=makeToken('guest-a'), b=makeToken('guest-a');
 const token=readToken('guest-a', a.token_ciphertext);
 expect(tokenValid(token)).toBe(true); expect(tokenHash(token)).toBe(a.token_hash);
 expect(a.token_hash).not.toBe(b.token_hash);
 expect(()=>readToken('guest-b',a.token_ciphertext)).toThrow();
});
test('tampering and wrong encryption key cannot decrypt a token', () => {
 const a=makeToken('a'); const parts=a.token_ciphertext.split(':');
 parts[3]=(parts[3][0]==='a'?'b':'a')+parts[3].slice(1);
 expect(()=>readToken('a',parts.join(':'))).toThrow();
 process.env.GUEST_TOKEN_KEY='b'.repeat(64); expect(()=>readToken('a',a.token_ciphertext)).toThrow();
});
test('missing keys and malformed token encodings fail closed', () => {
 delete process.env.GUEST_TOKEN_KEY; expect(()=>makeToken('a')).toThrow();
 for(const value of [null,1,'','a'.repeat(42),'!'.repeat(43),'a'.repeat(43)]) expect(tokenValid(value)).toBe(false);
});
test('countdown handles second boundaries and never goes negative', () => {
 const start=Date.parse('2026-10-09T11:00:00Z');
 expect(getCountdown(start-90061000)).toEqual([1,1,1,1]);
 expect(getCountdown(start-999)).toEqual([0,0,0,0]);
 expect(getCountdown(start+86400000)).toEqual([0,0,0,0]);
});
test('event is Friday evening in WITA', () => {
 expect(eventDay).toBe('Jumat'); expect(eventDate).toBe('9 Oktober 2026'); expect(eventClock).toBe('19:00');
});
test('origin comparison rejects missing and lookalike origins', () => {
 for(const value of ['',origin+'.evil','http://invitation.example']) expect(validOrigin(new Request(origin,{headers:{origin:value}}))).toBe(false);
 expect(validOrigin(new Request(origin,{headers:{origin}}))).toBe(true);
});
test('body parser enforces streamed size, JSON and content type', async () => {
 const req=(body:string,type='application/json')=>new Request(origin,{method:'POST',headers:{'content-type':type},body});
 expect(await smallBody(req('{"ok":true}'))).toEqual({ok:true});
 await expect(smallBody(req('x'.repeat(4097)))).rejects.toThrow();
 await expect(smallBody(req('{'))).rejects.toThrow();
 await expect(smallBody(req('{}','text/plain'))).rejects.toThrow();
});
test('public submission rejects unsafe inputs before any upstream request', async () => {
 const req=(body:string,headers:Record<string,string>={})=>new Request(origin+'/api/guestbook',{method:'POST',headers:{origin,'content-type':'application/json',...headers},body});
 expect((await POST(req('{}',{origin:'https://other.example'}))).status).toBe(403);
 expect((await POST(req('{}',{'content-type':'text/plain'}))).status).toBe(415);
 expect((await POST(req('x'.repeat(8193)))).status).toBe(413);
 for(const body of ['{','null','[]','{}']) expect((await POST(req(body))).status).toBe(400);
});
test('feed fails with a generic uncached error when server configuration is missing', async () => {
 const previous=process.env.SUPABASE_SECRET_KEY; delete process.env.SUPABASE_SECRET_KEY;
 try { const response=await GET(); expect(response.status).toBe(503); expect(response.headers.get('cache-control')).toBe('no-store'); expect(await response.text()).not.toContain('unconfigured'); }
 finally { if(previous!==undefined)process.env.SUPABASE_SECRET_KEY=previous; }
});
