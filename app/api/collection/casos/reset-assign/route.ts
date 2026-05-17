export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

export async function POST() {
  const client = await pool.connect();
  try {
    const r = await client.query(`
      UPDATE public.cliente
      SET collection_account = NULL
      WHERE collection_account IS NOT NULL
    `);

    return NextResponse.json({ ok: true, cleared: r.rowCount ?? 0 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error reset", detail: e?.detail, code: e?.code },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
