import { NextResponse, NextRequest } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ listaId: string }> }
) {
  try {
    // ✅ NEXT 16: params ES PROMISE
    const { listaId } = await context.params;

    if (!listaId || isNaN(Number(listaId))) {
      return NextResponse.json(
        { error: "listaId inválido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        id,
        lista_id,
        label,
        value,
        url_imagen,
        orden
      FROM lista_items
      WHERE lista_id = $1
      ORDER BY orden ASC, id ASC
      `,
      [Number(listaId)]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/listas/items/por-lista error:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
