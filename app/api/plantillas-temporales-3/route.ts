  import { NextRequest, NextResponse } from "next/server";
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

  function safeTipoPlantilla(v: any) {
    const s = String(v ?? "").trim();
    return ["1", "2", "3", "4","5", "6", "7"].includes(s) ? s : "1";
  }

  function generarToken() {
    return crypto.randomBytes(16).toString("hex");
  }

  export async function POST(req: NextRequest) {
    const client = await pool.connect();

    try {
      const body = await req.json().catch(() => ({}));
      console.log("📦 BODY RECIBIDO:", body);

      // mapear exactamente lo que ya envías
      const subproducto = safeString(body.subproducto);
      const cuenta_bancaria = safeString(body.cuenta_bancaria);
      const metodo_pago = safeString(body.metodo_pago);
      const tipo_plantilla = safeTipoPlantilla(
        body.tipo_plantilla ?? body.template_id
      );

      const metodo_pago_lista_id = safeInt(body.metodo_pago_lista_id);
      const liga_pago_lista_id = safeInt(body.liga_pago_lista_id);

      if (!subproducto || !cuenta_bancaria || !metodo_pago) {
        return NextResponse.json(
          {
            error: "subproducto, cuenta_bancaria y metodo_pago son obligatorios",
          },
          { status: 400 }
        );
      }

      let token = "";
      let existe = true;

      while (existe) {
        token = generarToken();
        const check = await client.query(
          `SELECT 1 FROM plantillas_temporales WHERE token = $1 LIMIT 1`,
          [token]
        );
        existe = (check.rowCount ?? 0) > 0;
      }

      const result = await client.query(
        `
        INSERT INTO plantillas_temporales (
          token,
          producto,
          tipo_plantilla,
          metodo_pago,
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
          foto_habilitada,
          metodo_pago_lista_id,
          liga_pago_lista_id,
          created_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW()
        )
        RETURNING *
        `,
        [
          token,
          subproducto, // se guarda el mismo valor que ya envías
          tipo_plantilla,
          metodo_pago,
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
          safeBool(body.foto_habilitada) ?? true,
          metodo_pago_lista_id,
          liga_pago_lista_id,
        ]
      );

      console.log("✅ ROW GUARDADA:", result.rows[0]);

      return NextResponse.json({
        ok: true,
        token,
        tipo_plantilla,
        link: `/pay/${token}`,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error("❌ Error plantillas-temporales-3:", error);
      return NextResponse.json(
        { error: error?.message || "Error interno del servidor" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  }