import { cookies } from "next/headers";
import { adminUser, reply, sessionCookie, smallBody, upstream, validOrigin } from "@/lib/admin-server";

export async function GET() {
  try { const user = await adminUser(); return user ? reply({ user }) : reply({ error: "Silakan masuk sebagai pengelola." }, 401); }
  catch { return reply({ error: "Layanan login belum dapat dihubungi." }, 503); }
}
export async function POST(request: Request) {
  if (!validOrigin(request)) return reply({ error: "Permintaan tidak diizinkan." }, 403);
  let body;
  try { body = await smallBody(request); } catch { return reply({ error: "Periksa email dan kata sandi." }, 400); }
  if (typeof body?.email !== "string" || body.email.length > 254 || typeof body.password !== "string" || !body.password || body.password.length > 256) return reply({ error: "Periksa email dan kata sandi." }, 400);
  try {
    const response = await upstream("auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email: body.email.trim(), password: body.password }) });
    if (!response.ok) return reply({ error: response.status === 429 ? "Terlalu banyak percobaan. Coba lagi nanti." : "Email, kata sandi, atau akses pengelola tidak sesuai." }, response.status === 429 ? 429 : 401);
    const session = await response.json();
    if (session.user?.app_metadata?.invitation_role !== "admin") return reply({ error: "Email, kata sandi, atau akses pengelola tidak sesuai." }, 403);
    (await cookies()).set(sessionCookie, session.access_token, { httpOnly: true, secure: new URL(process.env.APP_ORIGIN || request.url).protocol === "https:", sameSite: "strict", path: "/api/admin", maxAge: Math.min(session.expires_in || 3600, 3600) });
    return reply({ user: { id: session.user.id, email: session.user.email } });
  } catch { return reply({ error: "Layanan login belum dapat dihubungi. Coba lagi." }, 503); }
}
export async function DELETE(request: Request) {
  if (!validOrigin(request)) return reply({ error: "Permintaan tidak diizinkan." }, 403);
  const jar = await cookies(); const token = jar.get(sessionCookie)?.value;
  if (token) { try { await upstream("auth/v1/logout", { method: "POST" }, token); } catch { /* Always clear the local session. */ } }
  jar.set(sessionCookie, "", { httpOnly: true, sameSite: "strict", path: "/api/admin", maxAge: 0 });
  return reply({ signedOut: true });
}
