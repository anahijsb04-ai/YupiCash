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

function safeBool(v: any) {
  if (v === true || v === false) return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

function safeInt(v: any) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/* 🔥 TOKEN UUID CORRECTO */
function generarToken() {
  return crypto.randomUUID();
}

/* =====================
  POST
===================== */
export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json().catch(() => ({}));

    console.log("📦 BODY RECIBIDO:", body);

    const producto =
      safeString(body.subproducto) ||
      safeString(body.producto);

    const cuenta_bancaria =
      safeString(body.cuenta_bancaria) ||
      safeString(body.cuenta);

    if (!producto || !cuenta_bancaria) {
      return NextResponse.json(
        {
          error: "producto y cuenta_bancaria son obligatorios",
        },
        { status: 400 }
      );
    }

    /* ===== TOKEN ÚNICO UUID ===== */
    let token: string | null = null;
    let existe = true;

    while (existe) {
      token = generarToken();

      const check = await client.query(
        `SELECT 1 FROM plantillas_temporales WHERE token = $1 LIMIT 1`,
        [token]
      );

      existe = (check.rowCount ?? 0) > 0;
    }

    /* ===== INSERT ===== */
    await client.query(
      `
      INSERT INTO plantillas_temporales (
        token,
        producto,
        cuenta_bancaria,
        logo_url,
        monto,
        importe_pagar,
        fecha_vencimiento,
        dias_vencidos,
        nombre_cliente,
        telefono_cliente,
        mostrar_extras,
        card_bg_color,
        primary_color,
        locked,
        created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW()
      )
      `,
      [
        token,
        producto,
        cuenta_bancaria,
        safeString(body.url),
        safeString(body.monto),
        safeString(body.importe_pagar),
        safeString(body.fecha_vencimiento),
        safeInt(body.dias_vencidos),
        safeString(body.nombre_cliente),
        safeString(body.telefono_cliente),
        safeBool(body.mostrar_extras) ?? true,
        safeString(body.card_bg_color),
        safeString(body.primary_color),
        safeBool(body.locked) ?? true,
      ]
    );

    const link = `/pay/${token}`;

    return NextResponse.json({
      ok: true,
      token,
      link,
    });
  } catch (error: any) {
    console.error("❌ Error plantillas-temporales-2:", error);

    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 