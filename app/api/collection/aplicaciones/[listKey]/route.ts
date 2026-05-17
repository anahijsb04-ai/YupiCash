export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

const ALLOWED = new Set([
  "cuenta_bancaria_mexico",
  "metodo_pago_mexico",
  "producto_mexico",
  "cuenta_bancaria_colombia",
  "metodo_pago_colombia",
  "producto_colombia",
]);

function assertList(listKey: string) {
  if (!ALLOWED.has(listKey)) throw new Error("Lista no permitida");
}

function isProductos(listKey: string) {
  return listKey === "producto_mexico" || listKey === "producto_colombia";
}

// ✅ En tu Next: params es Promise
type Ctx = { params: Promise<{ listKey: string }> };

async function safeJson(req: Request) {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    throw new Error("JSON inválido");
  }
}

export async function GET(_req: Request, context: Ctx) {
  const client = await pool.connect();
  try {
    const { listKey } = await context.params;
    assertList(listKey);

    const { rows } = await client.query(
      `
      SELECT id, value, image_url
      FROM collection_aplicaciones_items
      WHERE list_key = $1 AND active = TRUE
      ORDER BY value ASC
      `,
      [listKey]
    );

    const items = rows.map((r: any) =>
      isProductos(listKey)
        ? { id: r.id, name: r.value, url: r.image_url ?? "" }
        : { id: r.id, value: r.value }
    );

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  } finally {
    client.release();
  }
}

export async function POST(req: Request, context: Ctx) {
  const client = await pool.connect();
  try {
    const { listKey } = await context.params;
    assertList(listKey);

    const body = await safeJson(req);

    if (isProductos(listKey)) {
      const name = String(body?.name ?? "").trim();
      const url = String(body?.url ?? "").trim();
      if (!name) throw new Error("name requerido");
      if (!url) throw new Error("url requerido");

      const { rows } = await client.query(
        `
        INSERT INTO collection_aplicaciones_items (list_key, value, image_url, active)
        VALUES ($1, $2, $3, TRUE)
        ON CONFLICT (list_key, value)
        DO UPDATE SET active = TRUE, image_url = EXCLUDED.image_url
        RETURNING id, value, image_url
        `,
        [listKey, name, url]
      );

      return NextResponse.json({
        ok: true,
        item: { id: rows[0].id, name: rows[0].value, url: rows[0].image_url ?? "" },
      });
    }

    // ✅ listas normales: cuenta/metodo
    const value = String(body?.value ?? "").trim();
    if (!value) throw new Error("value requerido");

    const { rows } = await client.query(
      `
      INSERT INTO collection_aplicaciones_items (list_key, value, active)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (list_key, value)
      DO UPDATE SET active = TRUE
      RETURNING id, value
      `,
      [listKey, value]
    );

    return NextResponse.json({ ok: true, item: { id: rows[0].id, value: rows[0].value } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  } finally {
    client.release();
  }
}

export async function PATCH(req: Request, context: Ctx) {
  const client = await pool.connect();
  try {
    const { listKey } = await context.params;
    assertList(listKey);

    const body = await safeJson(req);
    const id = Number(body?.id);
    if (!Number.isFinite(id)) throw new Error("id inválido");

    if (isProductos(listKey)) {
      const name = String(body?.name ?? "").trim();
      const url = String(body?.url ?? "").trim();
      if (!name) throw new Error("name requerido");
      if (!url) throw new Error("url requerido");

      const { rows } = await client.query(
        `
        UPDATE collection_aplicaciones_items
        SET value = $1, image_url = $2
        WHERE id = $3 AND list_key = $4
        RETURNING id, value, image_url
        `,
        [name, url, id, listKey]
      );

      if (!rows?.[0]) throw new Error("No se encontró el item");

      return NextResponse.json({
        ok: true,
        item: { id: rows[0].id, name: rows[0].value, url: rows[0].image_url ?? "" },
      });
    }

    const value = String(body?.value ?? "").trim();
    if (!value) throw new Error("value requerido");

    const { rows } = await client.query(
      `
      UPDATE collection_aplicaciones_items
      SET value = $1
      WHERE id = $2 AND list_key = $3
      RETURNING id, value
      `,
      [value, id, listKey]
    );

    if (!rows?.[0]) throw new Error("No se encontró el item");

    return NextResponse.json({ ok: true, item: { id: rows[0].id, value: rows[0].value } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: Request, context: Ctx) {
  const client = await pool.connect();
  try {
    const { listKey } = await context.params;
    assertList(listKey);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isFinite(id)) throw new Error("id inválido");

    await client.query(
      `
      UPDATE collection_aplicaciones_items
      SET active = FALSE
      WHERE id = $1 AND list_key = $2
      `,
      [id, listKey]
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  } finally {
    client.release();
  }
}
    