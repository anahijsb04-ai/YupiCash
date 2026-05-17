// app/api/marcar-pagado/route.ts

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json().catch(() => ({}));

    const numero_prestamo = body?.numero_prestamo ?? null;
    const token = body?.token ?? null;

    if (!numero_prestamo && !token) {
      return NextResponse.json(
        { error: "numero_prestamo o token requerido" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    let finalToken = token;

    // 🔥 si no viene token → sacarlo desde cliente
    if (!finalToken && numero_prestamo) {
      const caso = await client.query(
        `SELECT liga_pago FROM cliente WHERE numero_prestamo = $1 LIMIT 1`,
        [numero_prestamo]
      );

      const liga = caso.rows[0]?.liga_pago ?? "";

      if (liga.includes("/pay/")) {
        finalToken = liga.split("/pay/")[1]?.split("/")[0] ?? null;
      }
    }

    // 🔥 actualizar cliente
    if (numero_prestamo) {
      await client.query(
        `
        UPDATE cliente
        SET pagado = true,
            estado_pago = 'pagado'
        WHERE numero_prestamo = $1
        `,
        [numero_prestamo]
      );
    }

    // 🔥 actualizar plantilla
    if (finalToken) {
      await client.query(
        `
        UPDATE plantillas_temporales
        SET pagado = true
        WHERE token = $1::uuid
        `,
        [finalToken]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      token: finalToken,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}