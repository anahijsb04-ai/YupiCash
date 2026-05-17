export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { poolInstance as pool } from "@/lib/db";

export async function GET() {
  const c = await cookies(); // ✅ ahora sí es ReadonlyRequestCookies
  const role = c.get("role")?.value || "";
  const asesor = c.get("asesor")?.value || "";

  const client = await pool.connect();
  try {
    const ping = await client.query("SELECT 1 AS ok");

    const cols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cliente'
      ORDER BY column_name
    `);

    const test = await client.query(
      `SELECT numero_prestamo, collection_account FROM public.cliente LIMIT 5`
    );

    return new NextResponse(
      [
        "OK DEBUG",
        `role=${role}`,
        `asesor=${asesor}`,
        `ping=${JSON.stringify(ping.rows)}`,
        `cols=${JSON.stringify(cols.rows, null, 2)}`,
        `test=${JSON.stringify(test.rows, null, 2)}`,
      ].join("\n\n"),
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  } catch (e: any) {
    return new NextResponse(
      `DEBUG ERROR\n\n${String(e?.message || e)}\n\n${e?.stack || ""}`,
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  } finally {
    client.release();
  }
}
