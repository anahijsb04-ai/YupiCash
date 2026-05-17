export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

type Ctx = { params: Promise<{ numero_prestamo: string }> };

export async function GET(_req: Request, context: Ctx) {
  const client = await pool.connect();
  try {
    const { numero_prestamo } = await context.params;

    const { rows } = await client.query(
      `SELECT
         numero_prestamo,
         nombre_cliente,
         telefono_cliente,
         valor_deuda,
         valor_recaudado,
         producto,
         segmento,
         fecha_cobro,
         estado_pago,
         collection_account,
         liga_pago
       FROM public.cliente
       WHERE numero_prestamo = $1
       LIMIT 1`,
      [numero_prestamo]
    );

    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ ok: false, error: "Caso no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: row });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PATCH(req: Request, context: Ctx) {
  const client = await pool.connect();
  try {
    const { numero_prestamo } = await context.params;
    const body = await req.json().catch(() => ({} as any));

    // ✅ campos permitidos (los que tu front parchea)
    const valor_recaudado =
      body?.valor_recaudado === null || body?.valor_recaudado === undefined
        ? undefined
        : Number(body.valor_recaudado);

    const estado_pago =
      body?.estado_pago === "pagado" || body?.estado_pago === "pendiente"
        ? body.estado_pago
        : undefined;

    const collection_account =
      body?.collection_account === null || body?.collection_account === undefined || body?.collection_account === ""
        ? null
        : Number(body.collection_account);

    const liga_pago =
      body?.liga_pago === null || body?.liga_pago === undefined
        ? undefined
        : String(body.liga_pago).trim();

    // ✅ arma SET dinámico
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (valor_recaudado !== undefined) {
      if (!Number.isFinite(valor_recaudado)) {
        return NextResponse.json({ ok: false, error: "valor_recaudado inválido" }, { status: 400 });
      }
      sets.push(`valor_recaudado = $${i++}`);
      values.push(valor_recaudado);
    }

    if (estado_pago !== undefined) {
      sets.push(`estado_pago = $${i++}`);
      values.push(estado_pago);
    }

    if (body?.collection_account !== undefined) {
      // aquí permitimos null
      if (collection_account !== null && !Number.isFinite(collection_account)) {
        return NextResponse.json({ ok: false, error: "collection_account inválido" }, { status: 400 });
      }
      sets.push(`collection_account = $${i++}`);
      values.push(collection_account);
    }

    if (liga_pago !== undefined) {
      sets.push(`liga_pago = $${i++}`);
      values.push(liga_pago || null);
    }

    if (sets.length === 0) {
      return NextResponse.json({ ok: false, error: "Nada para actualizar" }, { status: 400 });
    }

    values.push(numero_prestamo);

    const { rows } = await client.query(
      `UPDATE public.cliente
       SET ${sets.join(", ")}
       WHERE numero_prestamo = $${i}
       RETURNING
         numero_prestamo,
         nombre_cliente,
         telefono_cliente,
         valor_deuda,
         valor_recaudado,
         producto,
         segmento,
         fecha_cobro,
         estado_pago,
         collection_account,
         liga_pago`,
      values
    );

    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ ok: false, error: "Caso no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: row });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
