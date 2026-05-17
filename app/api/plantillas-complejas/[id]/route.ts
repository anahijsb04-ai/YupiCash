import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type Params = { params: Promise<{ id: string }> };

/* =========================
   GET → OBTENER PLANTILLA
========================= */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const res = await pool.query("SELECT * FROM plantillas_pago WHERE id=$1", [
      id,
    ]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "No existe" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (e: any) {
    console.error("GET ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* =========================
   PATCH → HABILITAR / DESHABILITAR
========================= */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { visual } = await req.json();

    if (!["si", "no"].includes(visual)) {
      return NextResponse.json(
        { error: "Valor visual inválido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE plantillas_pago
      SET visual = $1
      WHERE id = $2
      RETURNING id, visual
      `,
      [visual, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Error al actualizar visual", detail: error?.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE → ELIMINAR PLANTILLA
========================= */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const result = await pool.query(`DELETE FROM plantillas_pago WHERE id = $1`, [
      id,
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Error al eliminar", detail: error?.message },
      { status: 500 }
    );
  }
}
