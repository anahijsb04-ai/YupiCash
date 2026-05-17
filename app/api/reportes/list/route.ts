export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    const r = await client.query(`
      SELECT id, report_date::text AS date, file_path, file_name, created_at
      FROM public.reportes_diarios
      ORDER BY report_date DESC, created_at DESC
      LIMIT 365
    `);
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
        