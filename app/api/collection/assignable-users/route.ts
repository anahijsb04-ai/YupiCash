export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

async function getAuth(req: Request): Promise<{ role: "admin" | "user" }> {
  const role = (req.headers.get("x-role") as any) || "admin";
  return { role };
}

// ✅ Ya sabemos la real (pero dejo fallback por si luego agregas otra)
const TABLES = ["public.users", "public.bd_users", "public.usuarios"];

// posibles nombres de columna de rol
const ROLE_COLS = ["role", "rol", "tipo", "perfil", "cargo"];

export async function GET(req: Request) {
  const { role } = await getAuth(req);
  if (role !== "admin") {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    // 1) ¿Qué tablas existen?
    const exist = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema='public'
        AND table_name IN ('users','bd_users','usuarios')
      ORDER BY table_name
    `);

    const existingTables = exist.rows.map((r: any) => `public.${r.table_name}`);
    if (existingTables.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No existe users/bd_users/usuarios en public." },
        { status: 500 }
      );
    }

    const table = TABLES.find((t) => existingTables.includes(t)) ?? existingTables[0];

    // 2) ¿Qué columnas tiene?
    const colsRes = await client.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1
      ORDER BY ordinal_position
      `,
      [table.replace("public.", "")]
    );

    const cols = colsRes.rows.map((r: any) => r.column_name);
    const colset = new Set(cols);

    const idCol = colset.has("id") ? "id" : null;

    // ✅ tu tabla usa username
    const usernameCol = colset.has("username")
      ? "username"
      : colset.has("nombre")
      ? "nombre"
      : colset.has("name")
      ? "name"
      : null;

    const roleCol = ROLE_COLS.find((c) => colset.has(c)) ?? null;

    // 3) Validación mínima (no pedimos email porque no existe en tu tabla)
    if (!idCol || !usernameCol) {
      return NextResponse.json(
        {
          ok: false,
          error: "Faltan columnas requeridas (id/username).",
          debug: { table, columns: cols },
        },
        { status: 500 }
      );
    }

    if (!roleCol) {
      return NextResponse.json(
        {
          ok: false,
          error: "No encontré columna de rol (role/rol/tipo/perfil/cargo).",
          debug: { table, columns: cols },
        },
        { status: 500 }
      );
    }

    // 4) Filtrar asesores
    const sql = `
      SELECT ${idCol}::text AS id,
             ${usernameCol}::text AS username
      FROM ${table}
      WHERE LOWER(${roleCol}::text) = 'asesor'
      ORDER BY ${usernameCol} ASC
      LIMIT 500
    `;

    const r = await client.query(sql);

    return NextResponse.json({
      ok: true,
      users: r.rows,         // ✅ {id, username}
      debug: { table, roleCol },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error BD", detail: e?.detail, code: e?.code },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
