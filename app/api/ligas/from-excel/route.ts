// app/api/ligas/from-excel/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    const items = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debes enviar un array de elementos" },
        { status: 400 }
      );
    }

    const results = [];

    for (const item of items) {
      const { subproducto, cliente_nombre, cliente_cedula, monto, fecha_limite } =
        item;

      // Buscar plantilla
      const plantillaRes = await pool.query(
        `SELECT * FROM plantillas_pago WHERE subproducto = $1 LIMIT 1`,
        [subproducto]
      );

      if (plantillaRes.rows.length === 0) {
        return NextResponse.json(
          { error: `No existe plantilla para subproducto ${subproducto}` },
          { status: 400 }
        );
      }

      const plantilla = plantillaRes.rows[0];

      // Generar link único
      const token = randomUUID();
      const link = `https://tu-dominio.com/pagos/${token}`;

      // Crear liga
      const insert = await pool.query(
        `
        INSERT INTO ligas_pago
        (plantilla_id, plantilla_subproducto, plantilla_numero_cuenta, plantilla_imagen_url,
         cliente_nombre, cliente_cedula, monto, fecha_limite, link)
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
        `,
        [
          plantilla.id,
          plantilla.subproducto,
          plantilla.numero_cuenta,
          plantilla.imagen_url,
          cliente_nombre,
          cliente_cedula,
          monto,
          fecha_limite,
          link,
        ]
      );

      results.push(insert.rows[0]);
    }

    return NextResponse.json(
      { message: "Ligas creadas correctamente", ligas: results },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
