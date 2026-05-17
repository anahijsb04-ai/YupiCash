import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // tú quieres crear con un nombre (lo guardo en subproducto)
    const subproducto = String(body?.nombre ?? body?.subproducto ?? "").trim();

    if (!subproducto) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    // mismo esquema que rápida
    const cuenta_bancaria = "0000000000";
    const url = "/plantillas/custom/default.png"; // o la ruta que exista
    const tipo = "personalizada";
    const visual = "no"; // o "si" si quieres que aparezca habilitada

    const result = await pool.query(
      `
      INSERT INTO plantillas_pago
      (cuenta_bancaria, subproducto, url, tipo, visual)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [cuenta_bancaria, subproducto, url, tipo, visual]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e: any) {
    console.error("ERROR plantilla personalizada:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
