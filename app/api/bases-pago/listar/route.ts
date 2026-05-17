import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
const res = await pool.query(`
  SELECT  
    pt.id,
    pt.producto,
    pt.cuenta_bancaria,
    pt.logo_url,
    pt.created_at,
    pt.token, -- 🔥 AQUI
    u.username AS asesor_nombre
  FROM plantillas_temporales pt
  LEFT JOIN users u ON u.id = pt.usuario_id
  ORDER BY pt.id DESC
`);

    return NextResponse.json(res.rows);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
