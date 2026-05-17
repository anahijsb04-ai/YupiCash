import crypto from "crypto";

export function generateOtp6(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function getEncKey() {
  const b64 = process.env.OTP_ENC_KEY_BASE64;
  if (!b64) throw new Error("Falta OTP_ENC_KEY_BASE64");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("OTP_ENC_KEY_BASE64 debe ser 32 bytes (base64)");
  return key;
}

export function encryptOtp(otp: string) {
  const key = getEncKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const enc = Buffer.concat([cipher.update(otp, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    otp_enc: enc.toString("base64"),
    otp_iv: iv.toString("base64"),
    otp_tag: tag.toString("base64"),
  };
}

export function decryptOtp(payload: { otp_enc: string; otp_iv: string; otp_tag: string }) {
  const key = getEncKey();
  const iv = Buffer.from(payload.otp_iv, "base64");
  const tag = Buffer.from(payload.otp_tag, "base64");
  const enc = Buffer.from(payload.otp_enc, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

export function otpTtlMinutes() {
  const n = Number(process.env.OTP_TTL_MINUTES || 10);
  return Number.isFinite(n) && n > 0 ? n : 10;
}
