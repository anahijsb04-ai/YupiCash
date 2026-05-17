import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const res = await pool.query("SELECT * FROM plantillas_pago ORDER BY id DESC");
    return NextResponse.json(res.rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Formato inválido (se espera JSON)" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);

    const cuenta = String(body?.cuenta_bancaria || "").trim();
    const subproducto = String(body?.subproducto || "").trim();
    const url = String(body?.url || "").trim(); // ✅ ahora es URL string

    if (!cuenta || !subproducto || !url) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    if (!isValidHttpUrl(url)) {
      return NextResponse.json(
        { error: "URL inválida. Debe iniciar con http:// o https://"},
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO plantillas_pago
      (cuenta_bancaria, subproducto, url, tipo, visual)
      VALUES ($1, $2, $3, 'rapida', 'si')
      RETURNING *
      `,
      [cuenta, subproducto, url]
    );

    return NextResponse.json(result.rows[0]);
  } catch (e: any) {
    console.error("ERROR plantilla rápida:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
