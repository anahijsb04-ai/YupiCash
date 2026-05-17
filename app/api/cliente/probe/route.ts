export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ins = await client.query(
      `INSERT INTO public.cliente (nombre_cliente, telefono_cliente, valor_deuda, producto)
       VALUES ('PRUEBA_API', '3000000000', 1234, 'Daviplata')
       RETURNING numero_prestamo`
    );

    await client.query("COMMIT");

    const countRes = await client.query(`SELECT COUNT(*)::int AS total FROM public.cliente`);
    const lastRes = await client.query(`
      SELECT numero_prestamo, nombre_cliente, producto
      FROM public.cliente
      ORDER BY numero_prestamo DESC
      LIMIT 1
    `);

    return NextResponse.json({
      ok: true,
      inserted_numero_prestamo: ins.rows[0].numero_prestamo,
      db_check: {
        total_en_public_cliente: countRes.rows[0].total,
        last_row: lastRes.rows[0] ?? null,
      },
    });
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => {});
    return NextResponse.json(
      { ok: false, error: e?.message, detail: e?.detail, code: e?.code },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
