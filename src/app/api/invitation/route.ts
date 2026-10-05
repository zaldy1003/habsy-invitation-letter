import { reply, smallBody, upstream, validOrigin } from "@/lib/admin-server";
import { tokenHash, tokenValid } from "@/lib/guest-token";
export async function POST(request: Request) {
  if(!validOrigin(request)) return reply({error:"Permintaan tidak diizinkan."},403);
  let body; try { body=await smallBody(request,8192); } catch { return reply({error:"Data tidak valid."},400); }
  if(!body || !tokenValid(body.token)) return reply({error:"Tautan undangan tidak valid atau telah dicabut."},404);
  try {
    const hash=tokenHash(body.token);
    if(body.action === "resolve") {
      const response=await upstream(`rest/v1/invitation_guests?token_hash=eq.${hash}&revoked_at=is.null&select=name,max_party_size,invitation_responses(attendance,party_size,message,publish_consent)`);
      if(!response.ok) throw new Error(); const [guest]=await response.json();
      if(!guest) return reply({error:"Tautan undangan tidak valid atau telah dicabut."},404);
      return reply({guest});
    }
    if(body.action !== "submit" || !["hadir","berhalangan"].includes(body.attendance) || !Number.isInteger(body.partySize) || typeof body.message!=="string" || body.message.length>1000 || typeof body.publishConsent!=="boolean" || body.website!=="" || typeof body.requestId!=="string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.requestId)) return reply({error:"Periksa kembali isian kehadiran dan ucapan."},400);
    const response=await upstream("rest/v1/rpc/submit_guest_response",{method:"POST",body:JSON.stringify({p_hash:hash,p_request_id:body.requestId,p_attendance:body.attendance,p_party_size:body.partySize,p_message:body.message.trim(),p_consent:body.publishConsent})});
    if(!response.ok) {
      const failure=await response.json();
      if(failure.message==="invalid_invitation") return reply({error:"Tautan undangan tidak valid atau telah dicabut."},404);
      if(failure.message==="invalid_party") return reply({error:"Jumlah hadir harus sesuai jatah undangan."},400);
      if(failure.message==="rate_limited") return reply({error:"Terlalu banyak perubahan. Coba lagi dalam 10 menit."},429);
      if(failure.message==="request_conflict") return reply({error:"Pengiriman sudah tersimpan dengan data berbeda. Muat ulang sebelum mengubah balasan."},409);
      throw new Error();
    }
    return reply({saved:true});
  } catch { return reply({error:"Layanan belum dapat dihubungi. Silakan coba lagi."},503); }
}
