import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await pool.query(
      "SELECT * FROM plantillas_temporales WHERE id = $1",
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "No existe" }, { status: 404 });
    }

    const row = res.rows[0];

    // ✅ NORMALIZAR logo/url
    let logo = row.url || row.logo_url || null;

    if (logo) {
      logo = String(logo).replaceAll("\\", "/");

      if (logo.startsWith("public/")) {
        logo = logo.replace("public/", "/");
      }

      if (logo.startsWith("uploads/")) {
        logo = "/" + logo;
      }
    }

    return NextResponse.json({
      ...row,
      logo_url: logo,
      url: logo, // compatibilidad
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
