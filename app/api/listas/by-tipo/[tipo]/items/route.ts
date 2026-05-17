import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;
  const cleanTipo = String(tipo || "").trim();

  const { searchParams } = new URL(req.url);
  const listaNombre = (searchParams.get("lista_nombre") || "").trim();

  const values: any[] = [cleanTipo];
  let extraWhere = "";

  if (listaNombre) {
    values.push(listaNombre);
    extraWhere = "AND l.nombre = $2";
  }

  const { rows } = await pool.query(
    `
    SELECT
      li.id,
      li.label,
      li.value,
      li.url_imagen,
      li.orden,
      l.id AS lista_id,
      l.nombre AS lista_nombre,
      l.tipo AS lista_tipo
    FROM listas l
    JOIN lista_items li ON li.lista_id = l.id
    WHERE l.tipo = $1
    ${extraWhere}
    ORDER BY l.nombre ASC, li.orden ASC NULLS LAST, li.label ASC
    `,
    values
  );

  return NextResponse.json(rows);
}
