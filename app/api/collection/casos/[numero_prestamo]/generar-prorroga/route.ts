export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

type Ctx = { params: Promise<{ numero_prestamo: string }> };

function toNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function buildProrrogaLink(numero_prestamo: string) {
  return `/gestion/multas/plantillas/prorroga/${encodeURIComponent(
    numero_prestamo
  )}`;
}

/* =========================================================
   POST => GENERAR PRÓRROGA
   - Calcula 55% del valor_deuda
   - Genera la liga hacia el nuevo front de prórroga
   - Sobreescribe la liga actual en cliente.liga_pago
========================================================= */
export async function POST(_req: Request, context: Ctx) {
  const client = await pool.connect();

  try {
    const { numero_prestamo } = await context.params;

    if (!numero_prestamo) {
      return NextResponse.json(
        { ok: false, error: "numero_prestamo requerido" },
        { status: 400 }
      );
    }

    // 1) Verificar que el caso exista y obtener valor_deuda
    const casoRes = await client.query(
      `
      SELECT numero_prestamo, valor_deuda, liga_pago
      FROM public.cliente
      WHERE numero_prestamo = $1
      LIMIT 1
      `,
      [numero_prestamo]
    );

    const caso = casoRes.rows?.[0];

    if (!caso) {
      return NextResponse.json(
        { ok: false, error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    const valorDeuda = toNumber(caso.valor_deuda);

    if (!valorDeuda || valorDeuda <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "El caso no tiene un valor_deuda válido para generar prórroga",
        },
        { status: 400 }
      );
    }

    // 2) Calcular 55%
    const porcentajeProrroga = 0.55;
    const montoProrroga = roundMoney(valorDeuda * porcentajeProrroga);

    // 3) Generar liga al nuevo front de prórroga
    const draft = buildProrrogaLink(numero_prestamo);

    // 4) Sobreescribir la liga actual
    await client.query(
      `
      UPDATE public.cliente
      SET liga_pago = $1, updated_at = NOW()
      WHERE numero_prestamo = $2
      `,
      [draft, numero_prestamo]
    );

    return NextResponse.json({
      ok: true,
      link: draft,
      liga_pago: draft,
      reused: false,
      overwritten: true,
      type: "draft-prorroga",
      numero_prestamo,
      monto_original: valorDeuda,
      porcentaje_prorroga: porcentajeProrroga,
      monto_prorroga: montoProrroga,
      importe_pagar: montoProrroga,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error interno" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/* =========================================================
   GET => ENTRAR PRÓRROGA
   - Solo devuelve la liga ya guardada
   - No genera nada
========================================================= */
export async function GET(_req: Request, context: Ctx) {
  const client = await pool.connect();

  try {
    const { numero_prestamo } = await context.params;

    if (!numero_prestamo) {
      return NextResponse.json(
        { ok: false, error: "numero_prestamo requerido" },
        { status: 400 }
      );
    }

    const casoRes = await client.query(
      `
      SELECT numero_prestamo, liga_pago, valor_deuda
      FROM public.cliente
      WHERE numero_prestamo = $1
      LIMIT 1
      `,
      [numero_prestamo]
    );

    const caso = casoRes.rows?.[0];

    if (!caso) {
      return NextResponse.json(
        { ok: false, error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    if (!caso.liga_pago) {
      return NextResponse.json(
        { ok: false, error: "Este caso aún no tiene una liga generada" },
        { status: 404 }
      );
    }

    const valorDeuda = toNumber(caso.valor_deuda);
    const porcentajeProrroga = 0.55;
    const montoProrroga = roundMoney(valorDeuda * porcentajeProrroga);

    return NextResponse.json({
      ok: true,
      link: String(caso.liga_pago),
      liga_pago: String(caso.liga_pago),
      type: "existing-prorroga",
      numero_prestamo,
      monto_original: valorDeuda,
      porcentaje_prorroga: porcentajeProrroga,
      monto_prorroga: montoProrroga,
      importe_pagar: montoProrroga,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error interno" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}