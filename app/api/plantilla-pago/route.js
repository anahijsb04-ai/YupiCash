import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT cuenta_bancaria, url, subproducto
      FROM plantillas_pago
      ORDER BY id DESC
      LIMIT 1
    `);

    return NextResponse.json(result.rows[0] ?? {});
  } catch (error) {
    console.error("ERROR API plantilla-pago:", error);
    return NextResponse.json(
      { error: "Error al obtener plantilla_pago" },
      { status: 500 }
    );
  }
}
