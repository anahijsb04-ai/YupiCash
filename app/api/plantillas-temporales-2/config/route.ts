import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    const {
      plantilla_id,
      subproducto_lista_id,
      liga_pago_lista_id,
      metodo_pago_lista_id,
      producto_lista_id,
    } = await req.json();

    if (!plantilla_id) {
      return NextResponse.json(
        { error: "plantilla_id requerido" },
        { status: 400 }
      );
    }

    // borra config previa (1 sola config por plantilla)
    await pool.query(
      `DELETE FROM plantillas_personalizadas_config WHERE plantilla_id = $1`,
      [plantilla_id]
    );

    // inserta config nueva
    await pool.query(
      `
      INSERT INTO plantillas_personalizadas_config
      (plantilla_id, subproducto_lista_id, liga_pago_lista_id, metodo_pago_lista_id, producto_lista_id)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ ERROR config:", e);
    return NextResponse.json(
      { error: e.message },
      { status: 500 }       
    );
  }
}
