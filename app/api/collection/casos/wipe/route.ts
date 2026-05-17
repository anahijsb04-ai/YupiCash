export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Client } from "pg";

function ensureAdmin(req: Request) {
  const role = req.headers.get("x-role");
  if (role !== "admin") throw new Error("No autorizado");
}

export async function POST(req: Request) {
  try {
    ensureAdmin(req);

    const table = (process.env.CLIENTE_TABLE || "cliente").trim();

    // evita inyección por nombre de tabla
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error("CLIENTE_TABLE inválida");
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: /ssl=true/i.test(process.env.DATABASE_URL || "")
        ? { rejectUnauthorized: false }
        : undefined,
    });

    await client.connect();

    try {
      const before = await client.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
      const countBefore = before.rows?.[0]?.c ?? 0;

      await client.query("BEGIN");
      // CASCADE por si hay tablas que referencian cliente  
      await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      await client.query("COMMIT");

      return NextResponse.json({
        ok: true,
        table,
        deletedApprox: countBefore,
      });
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      await client.end();
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error" },
      { status: 500 }
    );
  }
}
