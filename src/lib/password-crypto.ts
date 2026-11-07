import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Reversible (AES-256-GCM) copy of a student's password, so the administrator can look it up.
 * Login still uses the bcrypt hash; this copy is only for display in the admin panel.
 *
 * The key comes from PASSWORD_ENC_KEY, or from JWT_SECRET when that is not set.
 * If the key changes, previously stored passwords can no longer be read (they must be reset).
 */
function getKey(): Buffer {
  const secret = process.env.PASSWORD_ENC_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error("PASSWORD_ENC_KEY or JWT_SECRET must be defined");
  return createHash("sha256").update(secret).digest();
}

export function encryptPassword(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, data].map((b) => b.toString("base64")).join(".");
}

/** Returns null when the value is damaged or was encrypted with another key. */
export function decryptPassword(payload: string): string | null {
  try {
    const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64"));
    const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
