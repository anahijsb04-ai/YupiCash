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

function safeInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function norm(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

type ListaRow = {
  id: number;
  nombre: string | null;
  tipo: string | null;
};

async function getListaById(id: number | null): Promise<ListaRow | null> {
  if (!id) return null;

  const result = await pool.query(
    `
    SELECT id, nombre, tipo
    FROM listas
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  if (result.rows.length === 0) return null;
  return result.rows[0] as ListaRow;
}

function matchesExpectedType(
  lista: ListaRow | null,
  expected: "subproducto" | "liga_pago" | "metodo_pago" | "producto"
): boolean {
  if (!lista) return false;

  const tipo = norm(lista.tipo);
  const nombre = norm(lista.nombre);

  if (expected === "subproducto") {
    return (
      tipo === "subproducto" ||
      nombre === "subproducto" ||
      nombre.startsWith("subproducto_") ||
      nombre.includes("subproducto")
    );
  }

  if (expected === "producto") {
    return (
      tipo === "producto" ||
      nombre === "producto" ||
      nombre.startsWith("producto_") ||
      (nombre.includes("producto") && !nombre.includes("subproducto"))
    );
  }

  if (expected === "metodo_pago") {
    return (
      tipo === "metodo_pago" ||
      nombre === "metodo_pago" ||
      nombre.startsWith("metodo_pago_") ||
      nombre.includes("metodo_pago")
    );
  }

  if (expected === "liga_pago") {
    return (
      tipo === "liga_pago" ||
      tipo === "cuenta_bancaria" ||
      nombre === "liga_pago" ||
      nombre.startsWith("liga_pago_") ||
      nombre.includes("liga_pago") ||
      nombre === "cuenta_bancaria" ||
      nombre.startsWith("cuenta_bancaria_") ||
      nombre.includes("cuenta_bancaria")
    );
  }

  return false;
}

/* =========================================
   GET -> obtener config por plantilla_id
   /api/plantillas-personalizadas/config?plantilla_id=26
========================================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plantillaId = safeInt(searchParams.get("plantilla_id"));

    if (!plantillaId) {
      return NextResponse.json(
        { error: "plantilla_id requerido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id
      FROM plantillas_personalizadas_config
      WHERE plantilla_id = $1
      LIMIT 1
      `,
      [plantillaId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No existe config para esta plantilla" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (e: any) {
    console.error("❌ ERROR GET config:", e);
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
}

/* =========================================
   POST -> guardar config
========================================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const plantilla_id = safeInt(body?.plantilla_id);
    const subproducto_lista_id = safeInt(body?.subproducto_lista_id);
    const liga_pago_lista_id = safeInt(body?.liga_pago_lista_id);
    const metodo_pago_lista_id = safeInt(body?.metodo_pago_lista_id);
    const producto_lista_id = safeInt(body?.producto_lista_id);

    if (!plantilla_id) {
      return NextResponse.json(
        { error: "plantilla_id requerido" },
        { status: 400 }
      );
    }

    if (
      !subproducto_lista_id ||
      !liga_pago_lista_id ||
      !metodo_pago_lista_id ||
      !producto_lista_id
    ) {
      return NextResponse.json(
        {
          error:
            "Debes enviar subproducto_lista_id, liga_pago_lista_id, metodo_pago_lista_id y producto_lista_id",
        },
        { status: 400 }
      );
    }

    const [subproductoLista, ligaPagoLista, metodoPagoLista, productoLista] =
      await Promise.all([
        getListaById(subproducto_lista_id),
        getListaById(liga_pago_lista_id),
        getListaById(metodo_pago_lista_id),
        getListaById(producto_lista_id),
      ]);

    if (!subproductoLista || !ligaPagoLista || !metodoPagoLista || !productoLista) {
      return NextResponse.json(
        {
          error: "Uno o más IDs no existen en la tabla listas",
          debug: {
            subproducto_lista_id,
            liga_pago_lista_id,
            metodo_pago_lista_id,
            producto_lista_id,
            subproductoExiste: !!subproductoLista,
            ligaExiste: !!ligaPagoLista,
            metodoExiste: !!metodoPagoLista,
            productoExiste: !!productoLista,
          },
        },
        { status: 400 }
      );
    }

    const subproductoOk = matchesExpectedType(subproductoLista, "subproducto");
    const ligaPagoOk = matchesExpectedType(ligaPagoLista, "liga_pago");
    const metodoPagoOk = matchesExpectedType(metodoPagoLista, "metodo_pago");
    const productoOk = matchesExpectedType(productoLista, "producto");

    if (!subproductoOk || !ligaPagoOk || !metodoPagoOk || !productoOk) {
      return NextResponse.json(
        {
          error: "Config inválida: estás mandando IDs que no corresponden al tipo",
          debug: {
            subproducto: {
              recibido: subproductoLista,
              valido: subproductoOk,
              esperado: "subproducto / subproducto_*",
            },
            liga_pago: {
              recibido: ligaPagoLista,
              valido: ligaPagoOk,
              esperado: "liga_pago / cuenta_bancaria / *_*",
            },
            metodo_pago: {
              recibido: metodoPagoLista,
              valido: metodoPagoOk,
              esperado: "metodo_pago / metodo_pago_*",
            },
            producto: {
              recibido: productoLista,
              valido: productoOk,
              esperado: "producto / producto_*",
            },
          },
        },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM plantillas_personalizadas_config WHERE plantilla_id = $1`,
      [plantilla_id]
    );

    const insertResult = await pool.query(
      `
      INSERT INTO plantillas_personalizadas_config
      (
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id
      `,
      [
        plantilla_id,
        subproducto_lista_id,
        liga_pago_lista_id,
        metodo_pago_lista_id,
        producto_lista_id,
      ]
    );

    return NextResponse.json({
      ok: true,
      data: insertResult.rows[0],
    });
  } catch (e: any) {
    console.error("❌ ERROR POST config:", e);
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
}   