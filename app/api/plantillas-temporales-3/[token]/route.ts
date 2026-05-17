import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await ctx.params;
    const clean = String(token || "").trim();

    if (!clean) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    const query = `
      SELECT
        pt.token,
        pt.tipo_plantilla,

        pt.producto,
        pt.cuenta_bancaria,
        pt.logo_url,
        pt.metodo_pago,

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

        pt.producto AS producto_label,
        pt.producto AS subproducto_label,

        COALESCE(m.value, pt.metodo_pago) AS metodo_pago_label,
        COALESCE(l.value, pt.cuenta_bancaria) AS liga_pago_label,
        l.value AS liga_value

      FROM plantillas_temporales pt
      LEFT JOIN collection_aplicaciones_items m
        ON m.id = pt.metodo_pago_lista_id
      LEFT JOIN collection_aplicaciones_items l
        ON l.id = pt.liga_pago_lista_id
      WHERE pt.token = $1
      LIMIT 1
    `;

    const r = await pool.query(query, [clean]);

    if (r.rows.length === 0) {
      return NextResponse.json({ error: "No existe" }, { status: 404 });
    }

    console.log("✅ GET ROW:", r.rows[0]);

    return NextResponse.json({ ok: true, data: r.rows[0] });
  } catch (e: any) {
    console.error("GET plantillas-temporales-3 error:", e);
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
}