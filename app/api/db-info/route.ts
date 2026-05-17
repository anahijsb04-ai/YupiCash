export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const r = await query(`
    SELECT
      inet_server_addr()::text AS server_ip,
      inet_server_port() AS port,
      current_database() AS db,
      current_schema() AS schema
  `);
  return NextResponse.json(r.rows[0]);
}
