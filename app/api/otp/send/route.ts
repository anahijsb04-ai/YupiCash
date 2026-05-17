export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import {
  generateOtp6,
  hashOtp,
  encryptOtp,
  decryptOtp,
  otpTtlMinutes,
} from "@/lib/otp";
import {
  getAlanEmail,
  getFabricioEmail,
  isAlanUser,
  normalizeUser,
} from "@/lib/admin-rules";
import { verifyToken } from "@/lib/auth";

type PreTokenPayload = {
  username: string;
  role: string;
  otpVerified?: boolean;
};

function isPreTokenPayload(v: unknown): v is PreTokenPayload {
  return !!(
    v &&
    typeof v === "object" &&
    "username" in v &&
    "role" in v &&
    typeof (v as PreTokenPayload).username === "string" &&
    typeof (v as PreTokenPayload).role === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const usernameBody = normalizeUser(String(body?.username ?? ""));
    const loginTimeISO = String(body?.loginTimeISO ?? "").trim();

    if (!usernameBody) {
      return NextResponse.json({ error: "Falta username" }, { status: 400 });
    }

    const preToken = req.cookies.get("pre_token")?.value;
    if (!preToken) {
      return NextResponse.json(
        { error: "Sesión OTP no iniciada" },
        { status: 401 }
      );
    }

    let payload: PreTokenPayload;
    try {
      const decoded = verifyToken(preToken);
      if (!isPreTokenPayload(decoded)) {
        return NextResponse.json(
          { error: "pre_token inválido o expirado" },
          { status: 401 }
        );
      }
      payload = decoded;
    } catch {
      return NextResponse.json(
        { error: "pre_token inválido o expirado" },
        { status: 401 }
      );
    }

    const usernameToken = normalizeUser(payload.username || "");
    const role = String(payload.role || "").toLowerCase();

    if (usernameToken !== usernameBody) {
      return NextResponse.json(
        { error: "Usuario no coincide con sesión OTP" },
        { status: 403 }
      );
    }

    if (role !== "admin") {
      return NextResponse.json(
        { error: "OTP no aplica para este usuario" },
        { status: 403 }
      );
    }

    const otp = generateOtp6();
    const otpHash = hashOtp(otp);
    const enc = encryptOtp(otp);
    const ttl = otpTtlMinutes();

    await query(
      `
      UPDATE otp_tokens
      SET used_at = NOW()
      WHERE username = $1
        AND used_at IS NULL
      `,
      [usernameBody]
    );

    const inserted = await query<{
      id: number;
      username: string;
      created_at: Date;
      expires_at: Date;
      used_at: Date | null;
    }>(
      `
      INSERT INTO otp_tokens (
        username,
        otp_hash,
        otp_enc,
        otp_iv,
        otp_tag,
        expires_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        NOW() + ($6 || ' minutes')::interval
      )
      RETURNING id, username, created_at, expires_at, used_at
      `,
      [
        usernameBody,
        otpHash,
        enc.otp_enc,
        enc.otp_iv,
        enc.otp_tag,
        String(ttl),
      ]
    );

    const insertedRow = inserted.rows[0];
    console.log("OTP INSERTADO:", insertedRow);

    const ownRows = await query<{
      username: string;
      created_at: Date;
      expires_at: Date;
      used_at: Date | null;
    }>(
      `
      SELECT username, created_at, expires_at, used_at
      FROM otp_tokens
      WHERE username = $1
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [usernameBody]
    );

    console.log("OTP DEL USUARIO:", ownRows.rows);

    const activeRows = await query<{
      username: string;
      otp_enc: string;
      otp_iv: string;
      otp_tag: string;
      created_at: Date;
      expires_at: Date;
    }>(
      `
      SELECT username, otp_enc, otp_iv, otp_tag, created_at, expires_at
      FROM otp_tokens
      WHERE used_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 25
      `
    );

    const activeList = activeRows.rows.map((r) => {
      let otpPlain = "******";
      try {
        otpPlain = decryptOtp({
          otp_enc: r.otp_enc,
          otp_iv: r.otp_iv,
          otp_tag: r.otp_tag,
        });
      } catch {}

      return {
        username: String(r.username),
        otp: otpPlain,
        created_at: new Date(r.created_at).toISOString(),
        expires_at: new Date(r.expires_at).toISOString(),
      };
    });

    const alanEmail = getAlanEmail();
    const fabricioEmail = getFabricioEmail();
    const brandonEmail = process.env.BRANDON_EMAIL || "";
    const alanRecipients = [alanEmail, brandonEmail].filter(Boolean);

    const expiresAtISO = new Date(insertedRow.expires_at).toISOString();
    const nowServerISO = new Date().toISOString();

    const textToAlan =
      `OTP ADMIN\n\n` +
      `Usuario: ${usernameBody}\n` +
      `Hora inicio sesión (front): ${loginTimeISO || "(no enviada)"}\n` +
      `Hora inicio sesión (server): ${nowServerISO}\n` +
      `OTP: ${otp}\n` +
      `Expira: ${expiresAtISO}\n\n` +
      `OTP activos:\n` +
      activeList
        .map(
          (x) =>
            `- ${x.username}: ${x.otp} (creado ${x.created_at}, expira ${x.expires_at})`
        )
        .join("\n");

    if (isAlanUser(usernameBody)) {
      await sendMail({
        to: alanRecipients.join(","),
        subject: `OTP ADMIN - ${usernameBody}`,
        text: textToAlan,
      });

      return NextResponse.json({ ok: true });
    }

    await sendMail({
      to: fabricioEmail,
      subject: "OTP de acceso",
      text: `Tu OTP es: ${otp}\nExpira: ${expiresAtISO}`,
    });

    await sendMail({
      to: alanRecipients.join(","),
      subject: `Auditoría OTP - ${usernameBody}`,
      text: textToAlan,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("OTP SEND ERROR:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}