import { NextResponse } from "next/server";
import { Pool } from "pg";
import crypto from "crypto";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

/* =====================
   HELPERS
===================== */
function safeString(v: any) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function safeInt(v: any) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function safeBool(v: any) {
  if (v === true || v === false) return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

async function getItemById(id: number) {
  const r = await pool.query(
    `SELECT label, value, url_imagen FROM lista_items WHERE id = $1 LIMIT 1`,
    [id]
  );
  return r.rows[0] || null;
}

/* =====================
   POST
===================== */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    console.log("BODY:", body);

    const usuario_id = 1;

    const producto_lista_id = safeInt(body.producto_lista_id);
    const subproducto_lista_id = safeInt(body.subproducto_lista_id);
    const metodo_pago_lista_id = safeInt(body.metodo_pago_lista_id);
    const cuenta_lista_id = safeInt(body.cuenta_bancaria_lista_id);
    const liga_pago_lista_id = safeInt(body.liga_pago_lista_id);

    /* =====================
       PRODUCTO
    ===================== */
    let producto = safeString(body.producto);

    if (!producto && producto_lista_id) {
      const item = await getItemById(producto_lista_id);
      producto = item?.label;
    }

    if (!producto && subproducto_lista_id) {
      const item = await getItemById(subproducto_lista_id);
      producto = item?.label;
    }

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no enviado ni resoluble" },
        { status: 400 }
      );
    }

    /* =====================
       MÉTODO DE PAGO
    ===================== */
    let metodo_pago = safeString(body.metodo_pago);

    if (!metodo_pago && metodo_pago_lista_id) {
      const item = await getItemById(metodo_pago_lista_id);
      metodo_pago = item?.label;
    }

    /* =====================
       CUENTA BANCARIA
    ===================== */
    let cuenta_bancaria = safeString(body.cuenta_bancaria);

    if (!cuenta_bancaria && cuenta_lista_id) {
      const item = await getItemById(cuenta_lista_id);
      cuenta_bancaria = item?.value;
    }

    // fallback (si no mandas cuenta explícita)
    if (!cuenta_bancaria && liga_pago_lista_id) {
      const item = await getItemById(liga_pago_lista_id);
      cuenta_bancaria = item?.value;
    }

    if (!cuenta_bancaria) {
      return NextResponse.json(
        { error: "Cuenta bancaria no resoluble" },
        { status: 400 }
      );
    }

    /* =====================
       LOGO (del producto)
    ===================== */
    let logo_url = safeString(body.logo_url);

    if (!logo_url && producto_lista_id) {
      const item = await getItemById(producto_lista_id);
      logo_url = item?.url_imagen;
    }

    /* =====================
       TOKEN
    ===================== */
    const token = crypto.randomBytes(16).toString("hex");

    /* =====================
       INSERT
    ===================== */
    await pool.query(
      `
      INSERT INTO plantillas_temporales (
        token,
        usuario_id,
        producto,
        cuenta_bancaria,
        metodo_pago,
        logo_url,
        producto_lista_id,
        subproducto_lista_id,
        metodo_pago_lista_id,
        liga_pago_lista_id,
        monto,
        importe_pagar,
        fecha_vencimiento,
        dias_vencidos,
        nombre_cliente,
        telefono_cliente,
        mostrar_extras,
        foto_habilitada,
        card_bg_color,
        primary_color,
        tipo_plantilla,
        locked,
        pagado
      )
      VALUES (
        $1,$2,
        $3,$4,$5,$6,
        $7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,$16,
        $17,$18,$19,$20,
        $21,$22,$23
      )
      `,
      [
        token,
        usuario_id,
        producto,
        cuenta_bancaria,
        metodo_pago,
        logo_url,
        producto_lista_id,
        subproducto_lista_id,
        metodo_pago_lista_id,
        liga_pago_lista_id,
        safeString(body.monto),
        safeString(body.importe_pagar),
        safeString(body.fecha_vencimiento),
        safeInt(body.dias_vencidos),
        safeString(body.nombre_cliente),
        safeString(body.telefono_cliente),
        safeBool(body.mostrar_extras) ?? true,
        safeBool(body.foto_habilitada) ?? true,
        safeString(body.card_bg_color) ?? "#FFFFFF",
        safeString(body.primary_color) ?? "#1D4ED8",
        safeString(body.tipo_plantilla) ?? "1",
        true,
        false
      ]
    );

    return NextResponse.json({
      ok: true,
      token,
      link: `/pay/${token}`,
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
}