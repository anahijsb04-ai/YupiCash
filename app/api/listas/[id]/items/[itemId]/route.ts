import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(
  req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await context.params;

  await pool.query(
    "DELETE FROM lista_items WHERE id = $1",
    [itemId]
  );

  return NextResponse.json({ ok: true });
}
