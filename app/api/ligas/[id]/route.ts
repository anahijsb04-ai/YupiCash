import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CONSULTA BD
    const sql = `
      SELECT 
        id,
        subproducto,
        cuenta_bancaria,
        url AS logo_url
      FROM plantillas_pago
      WHERE id = $1
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // LIGA FINAL INEDITABLE
    const finalUrl = `${process.env.NEXT_PUBLIC_URL}/gestion/plantillas/${id}`;

    return NextResponse.json({
      ok: true,
      data: {
        id: row.id,
        subproducto: row.subproducto,
        cuenta_bancaria: row.cuenta_bancaria,
        url: row.logo_url,
        link_final: finalUrl,
      },
    });
  } catch (err) {
    console.error("Error API ligas:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
