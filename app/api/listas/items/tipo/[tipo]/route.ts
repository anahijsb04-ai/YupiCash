import { NextResponse, type NextRequest } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const listaIdRaw = searchParams.get("lista_id");
    if (!listaIdRaw) {
      return NextResponse.json(
        { error: "lista_id es obligatorio" },
        { status: 400 }
      );
    }

    const listaId = Number(listaIdRaw);
    if (!Number.isInteger(listaId)) {
      return NextResponse.json(
        { error: "lista_id inválido" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `
      SELECT
        id,
        label,
        value,
        url_imagen,
        orden,
        lista_id
      FROM lista_items
      WHERE lista_id = $1
      ORDER BY orden ASC, label ASC
      `,
      [listaId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ Error cargando items por lista_id:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
