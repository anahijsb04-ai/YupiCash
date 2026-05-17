export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

type Body = { userIds: Array<string | number> };

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const body = (await req.json().catch(() => null)) as Body | null;

    // ✅ convertir a INT
    const userIds = (body?.userIds ?? [])
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n > 0);

    if (userIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Selecciona al menos 1 asesor." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // ✅ casos sin asignar (collection_account IS NULL)
    const casosRes = await client.query(`
      SELECT numero_prestamo
      FROM public.cliente
      WHERE collection_account IS NULL
      ORDER BY numero_prestamo ASC
    `);

    const casos: number[] = casosRes.rows.map((r: any) => Number(r.numero_prestamo)).filter(Number.isFinite);

    if (casos.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ ok: true, assigned: 0, note: "No hay casos sin asignar." });
    }

    // ✅ round-robin equitativo
    const values: any[] = [];
    const chunks: string[] = [];

    for (let i = 0; i < casos.length; i++) {
      const loan = casos[i];
      const uid = userIds[i % userIds.length];

      const base = i * 2;
      // numero_prestamo BIGINT, user_id INT
      chunks.push(`($${base + 1}::bigint, $${base + 2}::int)`);
      values.push(loan, uid);
    }

    const sql = `
      UPDATE public.cliente c
      SET collection_account = v.user_id
      FROM (VALUES ${chunks.join(",")}) AS v(numero_prestamo, user_id)
      WHERE c.numero_prestamo = v.numero_prestamo
      RETURNING c.numero_prestamo, c.collection_account
    `;

    const updated = await client.query(sql, values);

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      assigned: updated.rowCount ?? 0,
    });
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("AUTO-ASSIGN ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Error auto-assign", detail: e?.detail, code: e?.code },
      { status: 500 }
    );  
  } finally {
    client.release();
  }
}
