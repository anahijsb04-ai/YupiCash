export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

type Ctx = { params: Promise<{ numero_prestamo: string }> };

function isDraftLink(s: any) {
  const v = String(s ?? "");
  return v.startsWith("/gestion/multas/plantillas/complejas/");
}

export async function POST(_req: Request, context: Ctx) {
  const client = await pool.connect();

  try {
    const { numero_prestamo } = await context.params;

    // 1) Caso
    const casoRes = await client.query(
      `SELECT numero_prestamo, liga_pago
       FROM public.cliente
       WHERE numero_prestamo = $1
       LIMIT 1`,
      [numero_prestamo]
    );

    const caso = casoRes.rows?.[0];
    if (!caso) {
      return NextResponse.json({ ok: false, error: "Caso no encontrado" }, { status: 404 });
    }

    // 2) Si ya existe una liga:
    // - Si es draft (editor), reusar y mandar a editor
    // - Si es final, NO la reemplazamos, solo devolvemos la final
    if (caso.liga_pago) {
      const linkExistente = String(caso.liga_pago);

      // draft => editor
      if (isDraftLink(linkExistente)) {
        return NextResponse.json({ ok: true, link: linkExistente, reused: true, type: "draft" });
      }

      // final => ya existe pago final
      return NextResponse.json({ ok: true, link: linkExistente, reused: true, type: "final" });
    }

    // 3) Crear DRAFT link hacia el editor (NO STATIC)
    // ✅ Esta es la ruta que pediste:
    const draft = `/asesor/multas/plantillas/complejas/${encodeURIComponent(numero_prestamo)}`;

    // 4) Guardar draft en cliente.liga_pago
    await client.query(
      `UPDATE public.cliente
       SET liga_pago = $1, updated_at = NOW()
       WHERE numero_prestamo = $2`,
      [draft, numero_prestamo]
    );

    return NextResponse.json({ ok: true, link: draft, reused: false, type: "draft" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
      