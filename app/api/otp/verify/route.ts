export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashOtp } from "@/lib/otp";
import { normalizeUser } from "@/lib/admin-rules";
import { verifyToken, signToken } from "@/lib/auth";

type PreTokenPayload = {
  username: string;
  role: string;
  otpVerified?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const usernameRaw = String(body?.username ?? "").trim();
    const otpRaw = String(body?.otp ?? "").trim();

    const usernameBody = normalizeUser(usernameRaw);
    const otpBody = otpRaw.replace(/\D/g, "").slice(0, 6);

    if (!usernameBody) {
      return NextResponse.json(
        { error: "Username requerido" },
        { status: 400 }
      );
    }

    if (otpBody.length !== 6) {
      return NextResponse.json(
        { error: "OTP inválido, deben ser 6 dígitos" },
        { status: 400 }
      );
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
      payload = verifyToken<PreTokenPayload>(preToken);
    } catch {
      return NextResponse.json(
        { error: "pre_token inválido o expirado" },
        { status: 401 }
      );
    }

    const usernameToken = normalizeUser(String(payload.username || ""));
    const role = String(payload.role || "").toLowerCase();

    console.log("OTP VERIFY USERNAME BODY:", usernameBody);
    console.log("OTP VERIFY USERNAME TOKEN:", usernameToken);

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

    const debugRows = await query<{
      id: number;
      username: string;
      used_at: Date | null;
      created_at: Date;
      expires_at: Date;
      now_server: Date;
    }>(
      `
      SELECT id, username, used_at, created_at, expires_at, NOW() AS now_server
      FROM otp_tokens
      WHERE username = $1
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [usernameBody]
    );

    console.log("OTP VERIFY DEBUG:", debugRows.rows);

    const r = await query<{
      id: number;
      otp_hash: string;
    }>(
      `
      SELECT id, otp_hash
      FROM otp_tokens
      WHERE username = $1
        AND used_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [usernameBody]
    );

    if (!r.rows || r.rows.length === 0) {
      return NextResponse.json(
        { error: "No hay OTP activo para este usuario" },
        { status: 400 }
      );
    }

    const row = r.rows[0];
    const incomingHash = hashOtp(otpBody);

    if (incomingHash !== row.otp_hash) {
      return NextResponse.json(
        { error: "OTP incorrecto" },
        { status: 401 }
      );
    }

    await query(
      `UPDATE otp_tokens SET used_at = NOW() WHERE id = $1`,
      [row.id]
    );

    const token = signToken({
      username: usernameBody,
      role: payload.role,
      otpVerified: true,
    });

    const res = NextResponse.json({ ok: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    res.cookies.set("pre_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("OTP VERIFY ERROR:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}