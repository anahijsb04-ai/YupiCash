import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ PROMISE
) {
  const { id } = await params; // ✅ unwrap

  try {
    const res = await pool.query(
      "DELETE FROM plantillas_temporales WHERE id = $1 RETURNING id",
      [id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "No existe" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: res.rows[0]?.id ?? id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
