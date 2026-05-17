import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function toInt(v: any) {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plantillaIdRaw = searchParams.get("plantilla_id");

    if (!plantillaIdRaw) {
      return NextResponse.json({ error: "plantilla_id es obligatorio" }, { status: 400 });
    }

    const plantilla_id = toInt(plantillaIdRaw);
    if (!plantilla_id) {
      return NextResponse.json({ error: "plantilla_id inválido" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `
      SELECT
        plantilla_id,
        subproducto_lista_id,
        metodo_pago_lista_id,
        producto_lista_id,
        liga_pago_lista_id
      FROM plantillas_personalizadas_config
      WHERE plantilla_id = $1
      LIMIT 1
      `,
      [plantilla_id]
    );

    if (rows.length === 0) return NextResponse.json(null, { status: 200 });

    return NextResponse.json(rows[0], { status: 200 });
  } catch (e) {
    console.error("❌ GET config error:", e);
    return NextResponse.json({ error: "Error interno obteniendo configuración" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const plantilla_id = toInt(body?.plantilla_id);
    const subproducto_lista_id = toInt(body?.subproducto_lista_id);
    const metodo_pago_lista_id = toInt(body?.metodo_pago_lista_id);
    const producto_lista_id = toInt(body?.producto_lista_id);
    const liga_pago_lista_id = toInt(body?.liga_pago_lista_id);

    // ✅ validación fuerte
    if (!plantilla_id) {
      return NextResponse.json({ error: "plantilla_id inválido" }, { status: 400 });
    }
    if (!subproducto_lista_id || !metodo_pago_lista_id || !producto_lista_id || !liga_pago_lista_id) {
      return NextResponse.json(
        { error: "Faltan lista_id: subproducto/metodo_pago/producto/liga_pago" },
        { status: 400 }
      );
    }

    // ✅ Validar que cada id corresponde a su tipo correcto en tabla listas
    const ids = [subproducto_lista_id, metodo_pago_lista_id, producto_lista_id, liga_pago_lista_id];

    const { rows: listas } = await pool.query(
      `SELECT id, tipo FROM listas WHERE id = ANY($1::int[])`,
      [ids]
    );

    const mapTipo = new Map<number, string>();
    for (const r of listas) mapTipo.set(Number(r.id), String(r.tipo));

    // faltantes
    for (const id of ids) {
      if (!mapTipo.has(id)) {
        return NextResponse.json(
          { error: `La lista_id=${id} no existe en tabla listas` },
          { status: 400 }
        );
      }
    }

    // mismatch (esto evita que te guarde producto=liga_pago)
    const expected = [
      { key: "subproducto_lista_id", id: subproducto_lista_id, tipo: "subproducto" },
      { key: "metodo_pago_lista_id", id: metodo_pago_lista_id, tipo: "metodo_pago" },
      { key: "producto_lista_id", id: producto_lista_id, tipo: "producto" },
      { key: "liga_pago_lista_id", id: liga_pago_lista_id, tipo: "liga_pago" },
    ];

    const mismatches = expected
      .map((x) => {
        const real = mapTipo.get(x.id);
        return real !== x.tipo ? { campo: x.key, id: x.id, esperado: x.tipo, real } : null;
      })
      .filter(Boolean);

    if (mismatches.length > 0) {
      return NextResponse.json(
        {
          error: "Config inválida: estás mandando IDs que no corresponden al tipo",
          mismatches,
        },
        { status: 400 }
      );
    }

    // ✅ Upsert: si ya existe config para plantilla, actualiza. Si no, inserta.
    // IMPORTANTE: esto requiere UNIQUE(plantilla_id) en plantillas_personalizadas_config.
    const { rows } = await pool.query(
      `
      INSERT INTO plantillas_personalizadas_config
        (plantilla_id, subproducto_lista_id, metodo_pago_lista_id, producto_lista_id, liga_pago_lista_id)
      VALUES
        ($1, $2, $3, $4, $5)
      ON CONFLICT (plantilla_id)
      DO UPDATE SET
        subproducto_lista_id = EXCLUDED.subproducto_lista_id,
        metodo_pago_lista_id = EXCLUDED.metodo_pago_lista_id,
        producto_lista_id = EXCLUDED.producto_lista_id,
        liga_pago_lista_id = EXCLUDED.liga_pago_lista_id
      RETURNING *
      `,
      [plantilla_id, subproducto_lista_id, metodo_pago_lista_id, producto_lista_id, liga_pago_lista_id]
    );

    return NextResponse.json(rows[0], { status: 200 });
  } catch (e) {
    console.error("❌ POST config error:", e);
    return NextResponse.json({ error: "Error interno guardando configuración" }, { status: 500 });
  }
}
