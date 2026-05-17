export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

export async function GET() {
  const c = await pool.connect();
  const r = await c.query(`SELECT run_time::text FROM report_schedule WHERE id=1`);
  c.release();
  return NextResponse.json({ run_time: r.rows[0]?.run_time || "22:00" });
}

export async function POST(req: Request) {
  const { run_time } = await req.json();
  const c = await pool.connect();
  await c.query(`
    INSERT INTO report_schedule (id, run_time)
    VALUES (1, $1)
    ON CONFLICT (id) DO UPDATE SET run_time=$1
  `, [run_time]);
  c.release();
  return NextResponse.json({ ok: true });
}
