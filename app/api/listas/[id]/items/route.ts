import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false },
});

/* ======================================================
   GET → obtener items de una lista por ID
   URL: /api/listas/:id/items
   Soporta filtro: ?origen=<string>
====================================================== */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const plantillaId = Number(id);

  if (!Number.isInteger(plantillaId)) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(req.url);
  const origenRaw = searchParams.get("origen");
  const origen =
    typeof origenRaw === "string" && origenRaw.trim()
      ? origenRaw.trim()
      : null;

  try {
    // Diagnóstico de conexión real
    const debugConn = await pool.query(`
      SELECT current_database() AS db, current_schema() AS schema
    `);
    console.log("DEBUG DB/SCHEMA GET:", debugConn.rows[0]);

    const debugCols = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'lista_items'
      ORDER BY ordinal_position
    `);
    console.log(
      "DEBUG COLUMNAS public.lista_items GET:",
      debugCols.rows.map((r) => r.column_name)
    );

    const query = `
      SELECT
        id,
        label,
        value,
        url_imagen,
        orden,
        origen
      FROM public.lista_items
      WHERE plantilla_id = $1
        AND ($2::text IS NULL OR origen = $2)
      ORDER BY orden ASC NULLS LAST, id ASC
    `;

    const { rows } = await pool.query(query, [plantillaId, origen]);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/listas/[id]/items:", err);
    return NextResponse.json([]);
  }
}

/* ======================================================
   POST → crear item en una lista
   URL: /api/listas/:id/items
   Recibe: { label, value?, url_imagen?, origen? }
====================================================== */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const plantillaId = Number(id);

  if (!Number.isInteger(plantillaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const label = typeof body?.label === "string" ? body.label.trim() : "";
    const value = typeof body?.value === "string" ? body.value.trim() : "";

    const url_imagen =
      typeof body?.url_imagen === "string" && body.url_imagen.trim()
        ? body.url_imagen.trim()
        : null;

    const origen =
      typeof body?.origen === "string" && body.origen.trim()
        ? body.origen.trim()
        : null;

    if (!label) {
      return NextResponse.json({ error: "label requerido" }, { status: 400 });
    }

    // Diagnóstico de conexión real
    const debugConn = await pool.query(`
      SELECT current_database() AS db, current_schema() AS schema
    `);
    console.log("DEBUG DB/SCHEMA POST:", debugConn.rows[0]);

    const debugCols = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'lista_items'
      ORDER BY ordinal_position
    `);
    console.log(
      "DEBUG COLUMNAS public.lista_items POST:",
      debugCols.rows.map((r) => r.column_name)
    );

    const query = `
      INSERT INTO public.lista_items (
        plantilla_id,
        label,
        value,
        url_imagen,
        origen,
        orden
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        COALESCE(
          (
            SELECT MAX(li.orden) + 1
            FROM public.lista_items li
            WHERE li.plantilla_id = $1
          ),
          1
        )
      )
      RETURNING
        id,
        label,
        value,
        url_imagen,
        orden,
        origen
    `;

    const { rows } = await pool.query(query, [
      plantillaId,
      label,
      value || label,
      url_imagen,
      origen,
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/listas/[id]/items:", err);
    return NextResponse.json({ error: "Error al crear item" }, { status: 500 });
  }
}