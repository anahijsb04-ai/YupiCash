export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({  error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // ✅ trae el id también
    const result = await query(
      "SELECT id, username, password, role FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const user = result.rows[0];

    if (user.role !== "asesor") {
      return NextResponse.json({ error: "No autorizado: rol inválido" }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const token = signToken({ username: user.username, role: user.role });

    const res = NextResponse.json({
      ok: true,
      redirectTo: "/asesor/dashboard",
      user: { id: user.id, username: user.username, role: user.role },
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // ✅ tu UI usa admin|user
    res.cookies.set("role", "user", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // ✅ IMPORTANTÍSIMO: guardar ID NUMÉRICO (collection_account es int)
    res.cookies.set("asesor", String(user.id), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    console.error("LOGIN ASESOR ERROR:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
