export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const asesor = String(body?.asesor || "").trim();

  if (!asesor) {
    return NextResponse.json({ ok: false, error: "asesor requerido" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  // ✅ cookies httpOnly
  res.cookies.set("role", "user", { httpOnly: true, sameSite: "lax", path: "/" });
  res.cookies.set("asesor", asesor, { httpOnly: true, sameSite: "lax", path: "/" });

  return res;
}
