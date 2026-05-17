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

type Ctx = {
  params: Promise<{ tipo: string }>;
};

function normalizeTipo(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { tipo } = await ctx.params;
    const tipoNormalizado = normalizeTipo(tipo);

    if (!tipoNormalizado) {
      return NextResponse.json(
        { error: "tipo requerido", data: [] },
        { status: 400 }
      );
    }

    // Busca primero por nombre exacto normalizado
    const listaResult = await pool.query(
      `
      SELECT id, nombre
      FROM listas
      WHERE LOWER(REPLACE(TRIM(nombre), ' ', '_')) = $1
      ORDER BY id ASC
      LIMIT 1
      `,
      [tipoNormalizado]
    );

    if (listaResult.rows.length === 0) {
      return NextResponse.json({
        data: [],
        debug: `No existe lista con nombre = ${tipoNormalizado}`,
      });
    }

    const lista = listaResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT
        id,
        COALESCE(NULLIF(label, ''), NULLIF(nombre, ''), NULLIF(value, ''), CONCAT('Item ', id)) AS nombre,
        label,
        value,
        url_imagen,
        lista_id
      FROM lista_items
      WHERE lista_id = $1           
      ORDER BY
        CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
        orden ASC,
        id ASC
      `,
      [lista.id]
    );

    return NextResponse.json({
      lista: {
        id: lista.id,
        nombre: lista.nombre,
      },
      data: itemsResult.rows,
    });
  } catch (e: any) {
    console.error("❌ ERROR GET /api/listas/tipo/[tipo]:", e);
    return NextResponse.json(
      {
        error: e?.message || "Error interno",
        data: [],
      },
      { status: 500 }
    );
  }
}