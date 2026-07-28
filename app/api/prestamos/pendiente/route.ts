import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const usuario_id = searchParams.get("usuario_id");
    const telefono = searchParams.get("telefono");
    const limite = Number(searchParams.get("limite") ?? 50);

    let sql = `
      SELECT
        id,
        usuario_id,
        producto,
        monto,
        importe_pagar,
        fecha_vencimiento,
        dias_vencidos,
        nombre_cliente,
        telefono_cliente,
        cuenta_bancaria,
        token,
        tipo_plantilla,
        pagado,
        created_at
      FROM plantillas_temporales
      WHERE (pagado = false OR pagado IS NULL OR pagado = 'false')
    `;

    const values: any[] = [];

    if (usuario_id) {
      values.push(usuario_id);
      sql += ` AND usuario_id = $${values.length}`;
    }

    if (telefono) {
      values.push(telefono);
      sql += ` AND telefono_cliente = $${values.length}`;
    }

    values.push(limite);
    sql += `
      ORDER BY created_at DESC NULLS LAST
      LIMIT $${values.length}
    `;

    const result = await query(sql, values);

    return NextResponse.json({
      ok: true,
      registrado: result.rows.length > 0,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET_PRESTAMOS_PENDIENTES_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        registrado: false,
        message: "Error obteniendo préstamos pendientes",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}