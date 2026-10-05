import { createHmac } from "node:crypto";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("unconfigured");
  return { url, key };
}
async function database(path: string, init?: RequestInit) {
  const { url, key } = config();
  return fetch(`${url}/rest/v1/${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(10000), headers: { apikey: key, "Content-Type": "application/json", ...init?.headers } });
}
export async function GET() {
  try {
    const response = await database("invitation_responses?select=id,name,message,created_at&moderation_status=eq.approved&publish_consent=eq.true&order=created_at.desc&limit=50");
    if (!response.ok) throw new Error("database");
    return json({ wishes: await response.json() });
  } catch { return json({ error: "Doa belum dapat dimuat. Silakan coba lagi." }, 503); }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = process.env.APP_ORIGIN || new URL(request.url).origin;
  if (!origin || origin !== expectedOrigin) return json({ error: "Asal permintaan tidak diizinkan." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Format permintaan tidak valid." }, 415);
  try {
    // Bound streamed bodies too; Content-Length alone is not trustworthy.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Data belum lengkap." }, 400);
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 8192) { await reader.cancel(); return json({ error: "Data terlalu panjang." }, 413); }
      chunks.push(value);
    }
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return json({ error: "Data tidak valid." }, 400); }
    const allowed = ["requestId", "name", "attendance", "message", "publishConsent", "website"];
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(k => !allowed.includes(k)) ||
      typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 160 ||
      !["hadir", "berhalangan"].includes(body.attendance) || typeof body.message !== "string" || body.message.trim().length > 1000 ||
      typeof body.publishConsent !== "boolean" || typeof body.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId) || body.website !== "") {
      return json({ error: "Periksa kembali nama, kehadiran, dan ucapan Anda." }, 400);
    }
    const { key } = config();
    // Configure a trusted reverse proxy before deployment; the global DB limit
    // still applies if a caller changes the forwarded address.
    const address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const bucket = createHmac("sha256", key).update(address).digest("hex");
    const response = await database("rpc/submit_invitation_response", { method: "POST", body: JSON.stringify({
      p_request_id: body.requestId, p_name: body.name.trim(), p_attendance: body.attendance,
      p_message: body.message.trim(), p_publish_consent: body.publishConsent, p_bucket: bucket,
    }) });
    if (!response.ok) {
      const failure = await response.json();
      if (failure.message === "rate_limited") return json({ error: "Terlalu banyak pengiriman. Silakan coba kembali dalam 10 menit." }, 429);
      if (failure.message === "request_conflict") return json({ error: "Pengiriman ini sudah tersimpan dengan isi berbeda. Muat ulang halaman untuk balasan baru." }, 409);
      throw new Error("database");
    }
    return json({ saved: true });
  } catch { return json({ error: "Balasan belum dapat dikonfirmasi. Coba kirim kembali; pengiriman yang sama tidak akan digandakan." }, 503); }
}
