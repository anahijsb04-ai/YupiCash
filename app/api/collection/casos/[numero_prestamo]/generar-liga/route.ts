export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

type Ctx = { params: Promise<{ numero_prestamo: string }> };

function buildDraftLink(numero_prestamo: string) {
  return `/gestion/multas/plantillas/complejas/${encodeURIComponent(
    numero_prestamo
  )}`;
}

/* =========================================================
   POST => GENERAR
   - Siempre genera la liga draft
   - Si ya existe una, la SOBREESCRIBE
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

    // 1) Verificar que el caso exista
    const casoRes = await client.query(
      `
      SELECT numero_prestamo
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

    // 2) Siempre generar la draft link
    const draft = buildDraftLink(numero_prestamo);

    // 3) Sobreescribir la liga actual
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
      reused: false,
      overwritten: true,
      type: "draft",
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
   GET => ENTRAR
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
      SELECT numero_prestamo, liga_pago
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

    return NextResponse.json({
      ok: true,
      link: String(caso.liga_pago),
      type: "existing",
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