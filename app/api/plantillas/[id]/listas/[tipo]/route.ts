import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type Ctx = { params: Promise<{ id: string; tipo: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id, tipo } = await params;

  const plantillaId = Number(id);
  const cleanTipo = String(tipo || "").trim();

  if (!Number.isFinite(plantillaId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  // 1) leer config
  const cfg = await pool.query(
    `SELECT subproducto_lista_id, metodo_pago_lista_id, producto_lista_id, liga_pago_lista_id
     FROM plantillas_personalizadas_config
     WHERE plantilla_id = $1
     LIMIT 1`,
    [plantillaId]
  );

  if (cfg.rows.length === 0) {
    return NextResponse.json({ error: "Config no existe" }, { status: 404 });
  }

  // 2) decidir qué columna usar según tipo
  const map: Record<string, string> = {
    subproducto: "subproducto_lista_id",
    metodo_pago: "metodo_pago_lista_id",
    producto: "producto_lista_id",
    liga_pago: "liga_pago_lista_id",
  };

  const col = map[cleanTipo];
  if (!col) {
    return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
  }

  const listaId = cfg.rows[0][col];
  if (!listaId) {
    return NextResponse.json([]); // si no está configurado, no hay opciones
  }

  // 3) devolver SOLO items de esa lista
  const items = await pool.query(
    `
    SELECT li.id, li.label, li.value, li.url_imagen, li.orden
    FROM lista_items li
    WHERE li.lista_id = $1
    ORDER BY li.orden ASC, li.label ASC
    `,
    [listaId]
  );

  return NextResponse.json(items.rows);
}
