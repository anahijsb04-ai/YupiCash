import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* =========================
  GET → OBTENER PLANTILLA
========================= */
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const res = await pool.query(
      "SELECT * FROM plantillas_pago WHERE id = $1",
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: "No existe" },
        { status: 404 }
      );
    }

    const row = res.rows[0];

    // 🔥 VALIDACIÓN DE PAGO
    const yaPagado =
      row.pagado === true ||
      row.pagado === "true" ||
      row.pagado === "si";

    if (yaPagado) {
      return NextResponse.json({
        ok: true,
        pagado: true,
      });
    }

    return NextResponse.json({
      ok: true,
      pagado: false,
      data: row,
    });

  } catch (error: any) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Error al obtener plantilla" },
      { status: 500 }
    );
  }
}

/* =========================
  PATCH → HABILITAR / DESHABILITAR
========================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { visual } = await req.json();

    if (visual !== "si" && visual !== "no") {
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
      { error: "Error al actualizar visual" },
      { status: 500 }
    );
  }
}

/* =========================
  DELETE → ELIMINAR
========================= */
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await pool.query(
      "DELETE FROM plantillas_pago WHERE id = $1",
      [id]
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Error al eliminar" },
      { status: 500 }
    );
  }
}