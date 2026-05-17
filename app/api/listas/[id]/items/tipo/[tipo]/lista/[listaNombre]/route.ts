import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type Ctx = { params: Promise<{ tipo: string; listaNombre: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { tipo, listaNombre } = await params;

  const nombre = decodeURIComponent(listaNombre || "").trim();
  if (!nombre) {
    return NextResponse.json({ error: "listaNombre requerido" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT li.id, li.label, li.value, li.url_imagen, li.orden,
             l.nombre AS lista_nombre, l.tipo
      FROM listas l
      JOIN lista_items li ON li.lista_id = l.id
      WHERE l.tipo = $1 AND l.nombre = $2
      ORDER BY li.orden ASC, li.label ASC
      `,
      [tipo, nombre]
    );

    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("❌ /api/listas/items/tipo/[tipo]/lista/[listaNombre]:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
