import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

function normalizeToken(v: any) {
  return String(v ?? "").trim();
}

function getTokenFromPath(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    let token = "";

    // body
    try {
      const body = await req.json();
      if (body?.token) token = normalizeToken(body.token);
    } catch {}

    // query
    if (!token) {
      const { searchParams } = new URL(req.url);
      token = normalizeToken(searchParams.get("token"));
    }

    // path
    if (!token) {
      token = normalizeToken(getTokenFromPath(req));
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 400 }
      );
    }

    console.log("🔍 TOKEN BUSCADO:", token);

    // 🔥 SOLO VALIDAR EN plantillas_temporales
    const check = await client.query(
      `
      SELECT token
      FROM plantillas_temporales
      WHERE token::text = $1
      LIMIT 1
      `,
      [token]
    );

    if ((check.rowCount ?? 0) === 0) {
      return NextResponse.json(
        {
          error: "Token no encontrado",
          debug: token,
        },
        { status: 404 }
      );
    }

    // actualizar plantilla
    await client.query(
      `
      UPDATE plantillas_temporales
      SET pagado = true
      WHERE token::text = $1
      `,
      [token]
    );

    return NextResponse.json({
      ok: true,
      token,
      message: "Pago actualizado correctamente",
    });
  } catch (error: any) {
    console.error("❌ Error sync-pago:", error);

    return NextResponse.json(
      { error: error?.message || "Error interno" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}