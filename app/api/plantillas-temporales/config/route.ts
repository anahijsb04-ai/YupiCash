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

function safeInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/* =========================================
   GET -> obtener config por plantilla_id
   URL: /api/plantillas-personalizadas/config?plantilla_id=1
========================================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plantillaId = safeInt(searchParams.get("plantilla_id"));

    if (!plantillaId) {
      return NextResponse.json(
        { error: "plantilla_id requerido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id
      FROM plantillas_personalizadas_config
      WHERE plantilla_id = $1
      LIMIT 1
      `,
      [plantillaId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No existe config para esta plantilla" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (e: any) {
    console.error("❌ ERROR GET config:", e);
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
}

/* =========================================
   POST -> guardar/reemplazar config
========================================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const plantilla_id = safeInt(body?.plantilla_id);
    const subproducto_lista_id = safeInt(body?.subproducto_lista_id);
    const liga_pago_lista_id = safeInt(body?.liga_pago_lista_id);
    const metodo_pago_lista_id = safeInt(body?.metodo_pago_lista_id);
    const producto_lista_id = safeInt(body?.producto_lista_id);

    if (!plantilla_id) {
      return NextResponse.json(
        { error: "plantilla_id requerido" },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM plantillas_personalizadas_config WHERE plantilla_id = $1`,
      [plantilla_id]
    );

    await pool.query(
      `
      INSERT INTO plantillas_personalizadas_config
      (
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id,
      ]
    );

    return NextResponse.json({
      ok: true,
      plantilla_id,
      subproducto_lista_id,
      liga_pago_lista_id,
      metodo_pago_lista_id,
      producto_lista_id,
    });
  } catch (e: any) {
    console.error("❌ ERROR POST config:", e);
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
} 