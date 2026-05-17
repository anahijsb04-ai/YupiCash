export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

function norm(s: any): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function getCatalogSets(
  client: any
): Promise<{ setMx: Set<string>; setCo: Set<string> }> {
  const mx = await client.query(
    `SELECT value FROM collection_aplicaciones_items
     WHERE list_key='producto_mexico' AND active=true`
  );
  const co = await client.query(
    `SELECT value FROM collection_aplicaciones_items
     WHERE list_key='producto_colombia' AND active=true`
  );

  const setMx = new Set<string>(mx.rows.map((r: any) => norm(r.value)));
  const setCo = new Set<string>(co.rows.map((r: any) => norm(r.value)));

  return { setMx, setCo };
}

function resolveSegmento(producto: string, setMx: Set<string>, setCo: Set<string>) {
  const p = norm(producto);
  if (!p) return "-";

  const inMx = setMx.has(p);
  const inCo = setCo.has(p);

  if (inMx && inCo) return "-";
  if (inMx) return "mexico";
  if (inCo) return "colombia";
  return "-";
}

export async function POST() {
  const client = await pool.connect();
  try {
    const { setMx, setCo } = await getCatalogSets(client);

    const casos = await client.query(
      `SELECT numero_prestamo, producto
       FROM public.cliente
       WHERE segmento IS NULL OR segmento = '' OR segmento = '-' OR segmento = 'multas'`
    );

    let updated = 0;

    for (const c of casos.rows as Array<{ numero_prestamo: string; producto: string }>) {
      const seg = resolveSegmento(c.producto, setMx, setCo);

      await client.query(
        `UPDATE public.cliente
         SET segmento = $1
         WHERE numero_prestamo = $2`,
        [seg, c.numero_prestamo]
      );

      updated++;
    }

    return NextResponse.json({
      ok: true,
      updated,
      scanned: casos.rowCount,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
