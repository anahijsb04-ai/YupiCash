import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PATCH(req: NextRequest) {
  try {
    const { id, visual } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    if (!["si", "no"].includes(visual)) {
      return NextResponse.json(
        { error: "Valor visual inválido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE plantillas_pago
       SET visual = $1
       WHERE id = $2
       RETURNING *`,
      [visual, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
