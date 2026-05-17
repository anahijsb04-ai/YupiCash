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

type Context = {
  params: Promise<{ token: string }>;
};

function normalize(v: any) {
  return String(v ?? "").trim();
}

export async function POST(req: Request, context: Context) {
  const client = await pool.connect();

  try {
    let token = "";

    /* =====================
       TOKEN DESDE URL (NEXT 16)
    ===================== */
    const params = await context.params;
    if (params?.token) {
      token = normalize(params.token);
    }

    /* fallback body */
    if (!token) {
      try {
        const body = await req.json();
        if (body?.token) token = normalize(body.token);
      } catch {}
    }

    /* fallback query */
    if (!token) {
      const { searchParams } = new URL(req.url);
      token = normalize(searchParams.get("token"));
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 400 }
      );
    }

    console.log("🔍 TOKEN FINAL:", token);

    /* =====================
       VALIDAR EXISTENCIA
    ===================== */
    const check = await client.query(
      `SELECT token FROM plantillas_temporales WHERE token::text = $1 LIMIT 1`,
      [token]
    );

    if ((check.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Token no encontrado", token },
        { status: 404 }
      );
    }

    /* =====================
       🔥 DESACTIVAR TRIGGERS
    ===================== */
    await client.query("BEGIN");
    await client.query("SET LOCAL session_replication_role = replica");

    /* =====================
       UPDATE SEGURO
    ===================== */
    await client.query(
      `
      UPDATE plantillas_temporales
      SET pagado = false
      WHERE token::text = $1
      `,
      [token]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      token,
      message: "Pago actualizado correctamente",
    });
  } catch (error: any) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("❌ Error sync-pago:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error interno",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}