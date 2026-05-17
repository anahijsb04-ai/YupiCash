export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const result = await query(
      "SELECT username, password, role FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const user = result.rows[0];

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const role = String(user.role || "").toLowerCase();
    const isAdmin = role === "admin";

    // ✅ NO ADMIN: token final inmediato
    if (!isAdmin) {
      const token = signToken({
        username: user.username,
        role: user.role,
        otpVerified: true,
      });

      const res = NextResponse.json({
        ok: true,
        requiresOtp: false,
        user: { username: user.username, role: user.role },
      });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      // limpiar pre_token si existía
      res.cookies.set("pre_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });

      return res;
    }

    // ✅ ADMIN: requiere OTP (sin token final aún)
    const preToken = signToken({
      username: user.username,
      role: user.role,
      otpVerified: false,
    });

    const res = NextResponse.json({
      ok: true,
      requiresOtp: true,
      user: { username: user.username, role: user.role },
    });

    res.cookies.set("pre_token", preToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 10 * 60,
    });

    // borrar token final previo si había
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
  