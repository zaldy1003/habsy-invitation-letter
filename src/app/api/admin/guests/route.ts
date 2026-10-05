import { adminUser, reply, smallBody, upstream, validOrigin } from "@/lib/admin-server";
import { makeToken, readToken } from "@/lib/guest-token";
const uuid = (id: unknown): id is string => typeof id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id);
export async function GET(request: Request) {
  try {
    if (!await adminUser()) return reply({error:"Silakan masuk kembali."},401);
    const params=new URL(request.url).searchParams;
    const offset=Math.max(0,Math.min(100000,Math.floor(Number(params.get("page"))||0)))*25;
    const query=new URLSearchParams({select:"id,name,max_party_size,revoked_at,created_at,invitation_responses(attendance,party_size)",order:"created_at.desc,id.desc",limit:"25",offset:String(offset)});
    const search=(params.get("q")||"").trim().slice(0,160).replace(/[%*_]/g,""); if(search) query.set("name",`ilike.*${search}*`);
    const [response,stats]=await Promise.all([upstream(`rest/v1/invitation_guests?${query}`,{headers:{Prefer:"count=exact"}}),upstream("rest/v1/rpc/invitation_guest_stats",{method:"POST",body:"{}"})]);
    if(!response.ok || !stats.ok) throw new Error();
    return reply({rows:await response.json(),count:Number(response.headers.get("content-range")?.split("/")[1]||0),stats:await stats.json()});
  } catch { return reply({error:"Daftar tamu belum dapat dimuat."},503); }
}
export async function POST(request: Request) {
  if(!validOrigin(request)) return reply({error:"Permintaan tidak diizinkan."},403);
  try {
    if(!await adminUser()) return reply({error:"Silakan masuk kembali."},401);
    let body; try { body=await smallBody(request); } catch { return reply({error:"Data tidak valid."},400); }
    if(!body || !uuid(body.id)) return reply({error:"Data tidak valid."},400);
    if(body.action === "create") {
      if(typeof body.name!=="string" || !body.name.trim() || body.name.trim().length>160 || !Number.isInteger(body.quota) || body.quota<1 || body.quota>20) return reply({error:"Isi nama dan jatah 1–20 orang."},400);
      const response=await upstream("rest/v1/invitation_guests?on_conflict=id",{method:"POST",headers:{Prefer:"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify({id:body.id,name:body.name.trim(),max_party_size:body.quota,...makeToken(body.id)})});
      if(!response.ok) throw new Error();
      return reply({saved:true});
    }
    if(body.action === "revoke") {
      const response=await upstream(`rest/v1/invitation_guests?id=eq.${body.id}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({revoked_at:new Date().toISOString()})});
      if(!response.ok) throw new Error(); if(!(await response.json()).length) return reply({error:"Tamu tidak ditemukan."},404);
      return reply({saved:true});
    }
    if(body.action === "link") {
      const response=await upstream(`rest/v1/invitation_guests?id=eq.${body.id}&select=id,token_ciphertext,revoked_at`);
      if(!response.ok) throw new Error(); const [row]=await response.json();
      if(!row || row.revoked_at) return reply({error:"Undangan tidak ditemukan atau telah dicabut."},404);
      const origin=process.env.APP_ORIGIN || new URL(request.url).origin;
      return reply({url:`${origin}/?guest=${readToken(row.id,row.token_ciphertext)}`});
    }
    return reply({error:"Tindakan tidak valid."},400);
  } catch { return reply({error:"Perubahan belum dapat dikonfirmasi. Silakan coba lagi."},503); }
}
