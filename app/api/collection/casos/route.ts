export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

async function getAuth(req: Request): Promise<{ userId: string; role: "admin" | "user" }> {
  const role = (req.headers.get("x-role") as any) || "admin";
  const userId = req.headers.get("x-user-id") || "";
  return { userId, role };
}

export async function GET(req: Request) {
  const { userId, role } = await getAuth(req);

  const client = await pool.connect();
  try {
    const baseSelect = `
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
        collection_account
      FROM public.cliente
    `;

    const where = role === "admin" ? `` : ` WHERE collection_account = $1 `;

    const sql = `
      ${baseSelect}
      ${where}
      ORDER BY numero_prestamo DESC
      LIMIT 500
    `;

    const params = role === "admin" ? [] : [userId];
    const { rows } = await client.query(sql, params);

    return NextResponse.json({ ok: true, data: rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
