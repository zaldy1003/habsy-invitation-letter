import { adminUser, reply, smallBody, upstream, validOrigin } from "@/lib/admin-server";
export async function GET(request: Request) {
  try {
    if (!await adminUser()) return reply({ error: "Sesi berakhir. Silakan masuk kembali." }, 401);
    const input = new URL(request.url).searchParams;
    const page = Math.max(0, Math.min(100000, Number(input.get("page")) || 0));
    const filter = input.get("filter") || "all";
    const query = new URLSearchParams({ select: "id,name,attendance,message,publish_consent,moderation_status,created_at", order: "created_at.desc,id.desc", limit: "25", offset: String(Math.floor(page) * 25) });
    if (["pending", "approved", "hidden"].includes(filter)) query.set("moderation_status", `eq.${filter}`);
    if (["hadir", "berhalangan"].includes(filter)) query.set("attendance", `eq.${filter}`);
    const search = (input.get("q") || "").trim().slice(0,160).replace(/[%*_]/g, "");
    if (search) query.set("name", `ilike.*${search}*`);
    const count = async (filterQuery: string) => {
      const response = await upstream(`rest/v1/invitation_responses?select=id&limit=0${filterQuery}`, { headers: { Prefer: "count=exact" } });
      if (!response.ok) throw new Error(); return Number(response.headers.get("content-range")?.split("/")[1] || 0);
    };
    const [response, total, hadir, berhalangan, pending] = await Promise.all([
      upstream(`rest/v1/invitation_responses?${query}`, { headers: { Prefer: "count=exact" } }),
      count(""), count("&attendance=eq.hadir"), count("&attendance=eq.berhalangan"), count("&moderation_status=eq.pending&publish_consent=eq.true&message=neq."),
    ]);
    if (!response.ok) throw new Error();
    return reply({ rows: await response.json(), count: Number(response.headers.get("content-range")?.split("/")[1] || 0), stats: { total, hadir, berhalangan, pending } });
  } catch { return reply({ error: "Data belum dapat dimuat. Silakan coba lagi." }, 503); }
}
export async function PATCH(request: Request) {
  if (!validOrigin(request)) return reply({ error: "Permintaan tidak diizinkan." }, 403);
  try {
    const user = await adminUser(); if (!user) return reply({ error: "Sesi berakhir. Silakan masuk kembali." }, 401);
    let body; try { body = await smallBody(request); } catch { return reply({ error: "Data tidak valid." }, 400); }
    if (!body || typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || !["approved", "hidden", "pending"].includes(body.status)) return reply({ error: "Data tidak valid." }, 400);
    const response = await upstream("rest/v1/rpc/moderate_invitation_response", { method: "POST", body: JSON.stringify({ p_id: body.id, p_status: body.status, p_actor: user.id }) });
    if (!response.ok) {
      const failure = await response.json();
      if (failure.message === "consent_required") return reply({ error: "Ucapan tanpa izin publikasi atau tanpa isi tidak boleh ditampilkan." }, 409);
      if (failure.message === "not_found") return reply({ error: "Balasan tidak ditemukan." }, 404);
      throw new Error();
    }
    return reply({ saved: true });
  } catch { return reply({ error: "Perubahan belum tersimpan. Silakan coba lagi." }, 503); }
}
