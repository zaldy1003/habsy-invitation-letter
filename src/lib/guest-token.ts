import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
export const tokenValid = (token: unknown): token is string => typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token) && Buffer.from(token, "base64url").toString("base64url") === token;
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
function key() {
  const value = process.env.GUEST_TOKEN_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new Error("Missing guest token key");
  return Buffer.from(value,"hex");
}
export function makeToken(id: string) {
  const token = randomBytes(32).toString("base64url"); const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm",key(),iv); cipher.setAAD(Buffer.from(`guest:v1:${id}`));
  const encrypted = Buffer.concat([cipher.update(token,"utf8"),cipher.final()]);
  return { token_hash: tokenHash(token), token_ciphertext: ["v1",iv.toString("hex"),cipher.getAuthTag().toString("hex"),encrypted.toString("hex")].join(":") };
}
export function readToken(id: string, value: string) {
  const [version,iv,tag,data] = value.split(":"); if (version !== "v1") throw new Error("Unsupported key version");
  const cipher = createDecipheriv("aes-256-gcm",key(),Buffer.from(iv,"hex")); cipher.setAAD(Buffer.from(`guest:v1:${id}`)); cipher.setAuthTag(Buffer.from(tag,"hex"));
  return Buffer.concat([cipher.update(Buffer.from(data,"hex")),cipher.final()]).toString("utf8");
}
