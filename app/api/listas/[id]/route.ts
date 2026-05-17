export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/* ====================== 
   GET → UNA LISTA
====================== */
export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const listaId = Number(id);

    if (!Number.isInteger(listaId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM listas WHERE id = $1`,
      [listaId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Lista no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error en GET /api/listas/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista" },
      { status: 500 }
    );
  }
}

/* ======================
   DELETE → BORRAR LISTA A LA FUERZA
====================== */
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  const client = await pool.connect();

  try {
    const { id } = await context.params;
    const listaId = Number(id);

    if (!Number.isInteger(listaId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Verificar existencia
    const existe = await client.query(
      `SELECT id FROM listas WHERE id = $1`,
      [listaId]
    );

    if ((existe.rowCount ?? 0) === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Lista no encontrada" },
        { status: 404 }
      );
    }

    // 1) Eliminar items
    await client.query(
      `DELETE FROM lista_items WHERE lista_id = $1`,
      [listaId]
    );

    // 2) Eliminar configs relacionadas
    await client.query(
      `
      DELETE FROM plantillas_personalizadas_config
      WHERE producto_lista_id = $1
         OR metodo_pago_lista_id = $1
         OR subproducto_lista_id = $1
         OR liga_pago_lista_id = $1
      `,
      [listaId]
    );

    // 3) Eliminar lista
    const deleted = await client.query(
      `DELETE FROM listas WHERE id = $1`,
      [listaId]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      deleted: deleted.rowCount ?? 0,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("❌ Error en DELETE /api/listas/[id]:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error al borrar la lista",
        code: error?.code || null,
        detail: error?.detail || null,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 