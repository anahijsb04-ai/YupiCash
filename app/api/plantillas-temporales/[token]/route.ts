import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await ctx.params;
    const clean = String(token || "").trim();
    if (!clean) return NextResponse.json({ error: "Token inválido" }, { status: 400 });

    const q = `
      SELECT
        pt.token,

        pt.producto,
        pt.cuenta_bancaria,
        pt.monto,
        pt.importe_pagar,
        pt.fecha_vencimiento,
        pt.dias_vencidos,
        pt.nombre_cliente,
        pt.telefono_cliente,
        pt.mostrar_extras,
        pt.card_bg_color,
        pt.primary_color,
        pt.foto_habilitada,

        pt.producto_lista_id,
        pt.subproducto_lista_id,
        pt.metodo_pago_lista_id,
        pt.liga_pago_lista_id,

        p.label      AS producto_label,
        p.url_imagen AS logo_url,

        s.label      AS subproducto_label,
        m.label      AS metodo_pago_label,
        l.label      AS liga_pago_label,
        l.value      AS liga_value

      FROM plantillas_temporales pt
      LEFT JOIN lista_items p ON p.id = pt.producto_lista_id
      LEFT JOIN lista_items s ON s.id = pt.subproducto_lista_id
      LEFT JOIN lista_items m ON m.id = pt.metodo_pago_lista_id
      LEFT JOIN lista_items l ON l.id = pt.liga_pago_lista_id
      WHERE pt.token = $1
      LIMIT 1
    `;

    const r = await pool.query(q, [clean]);
    if (r.rows.length === 0) return NextResponse.json({ error: "No existe" }, { status: 404 });

    const row = r.rows[0];

    // Si tu cuenta_bancaria viene de la tabla pero está vacía, usa liga_value
    const cuenta = row.cuenta_bancaria ?? (row.liga_value != null ? String(row.liga_value) : null);

    return NextResponse.json({
      ok: true,
      data: {
        ...row,
        cuenta_bancaria: cuenta,
      },
    });
  } catch (e: any) {
    console.error("GET /api/plantillas-temporales/[token] error:", e);
    return NextResponse.json({ error: e?.message || "Error interno" }, { status: 500 });
  }
}
