import { cookies } from "next/headers";

export const sessionCookie = "habsy-admin-session";
export const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export function validOrigin(request: Request) {
  return request.headers.get("origin") === (process.env.APP_ORIGIN || new URL(request.url).origin);
}
export async function upstream(path: string, init?: RequestInit, token?: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("unconfigured");
  return fetch(`${url}/${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(10000), headers: { apikey: key, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } });
}
export async function adminUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  const response = await upstream("auth/v1/user", {}, token);
  if (!response.ok) return null;
  const user = await response.json();
  return user.app_metadata?.invitation_role === "admin" ? { id: user.id as string, email: user.email as string } : null;
}
export async function smallBody(request: Request, maxBytes = 4096) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("invalid");
  const reader = request.body?.getReader(); if (!reader) throw new Error("invalid");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new Error("invalid"); } chunks.push(value); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
