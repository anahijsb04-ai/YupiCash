export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function GET() {
  const c = await cookies();

  const role = c.get("role")?.value;
  const asesorRaw = c.get("asesor")?.value || "";
  const asesorId = Number(asesorRaw);

  // 🔴 SI NO ES ASESOR → REDIRECT CORRECTO
  if (role !== "user" || !Number.isInteger(asesorId) || asesorId <= 0) {
    return NextResponse.redirect(
      new URL("/asesor/multas/plantillas/complejas", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
    );
  }

  try {
    // detectar liga_pago
    const col = await query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name='cliente'
        AND column_name='liga_pago'
      LIMIT 1
    `);

    const hasLiga = col.rows.length > 0;

    const sql = `
      SELECT
        numero_prestamo,
        nombre_cliente,
        telefono_cliente,
        valor_deuda,
        valor_recaudado,
        producto,
        CASE
          WHEN segmento IS NULL OR segmento = '' OR segmento = 'multas' THEN '-'
          ELSE segmento
        END AS segmento,
        fecha_cobro,
        estado_pago,
        collection_account,
        ${hasLiga ? "liga_pago" : "NULL::text AS liga_pago"}
      FROM public.cliente
      WHERE collection_account = $1
      ORDER BY numero_prestamo DESC
      LIMIT 500
    `;

    const result = await query(sql, [asesorId]);

    return NextResponse.json({ ok: true, data: result.rows });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e),
        code: e?.code || null,
      },
      { status: 500 }
    );
  }
}
