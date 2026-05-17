// app/api/usuarios/[id]/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function sendError(msg: string, status = 500) {
  return NextResponse.json({ error: msg }, { status });
}

function extractIdFromReq(req: Request) {
  try {
    // 1) si params no existe en el entorno, caller puede pasar undefined
    // 2) fallback: parsear la URL del request
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ['api','usuarios','123']
    const last = parts[parts.length - 1];
    return last;
  } catch {
    return null;
  }
}

export async function PUT(req: Request, context: any) {
  try {
    console.log("[API PUT] context:", context);
    const idFromParams = context?.params?.id;
    const id = idFromParams ?? extractIdFromReq(req);

    if (!id) return sendError("Falta id en la ruta", 400);

    const body = await req.json();
    console.log("[API PUT] body:", body);

    const { username, password, role } = body ?? {};

    if (!username || !role) {
      return sendError("Faltan campos: username y role son obligatorios", 400);
    }

    // check user exists
    const exists = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (exists.rowCount === 0) {
      return sendError("Usuario no encontrado", 404);
    }

    let result;
    if (password && String(password).trim() !== "") {
      const hashed = await bcrypt.hash(String(password), 10);
      const q = `
        UPDATE users
        SET username = $1, password = $2, role = $3
        WHERE id = $4
        RETURNING id, username, role;
      `;
      result = await pool.query(q, [username, hashed, role, id]);
    } else {
      const q = `
        UPDATE users
        SET username = $1, role = $2
        WHERE id = $3
        RETURNING id, username, role;
      `;
      result = await pool.query(q, [username, role, id]);
    }

    if (!result || result.rowCount === 0) {
      return sendError("No se pudo actualizar el usuario", 500);
    }

    console.log("[API PUT] updated:", result.rows[0]);
    return NextResponse.json(result.rows[0]);
  } catch (e: any) {
    console.error("[API PUT] ERROR:", e);
    return sendError(e.message || "Error interno", 500);
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    console.log("[API DELETE] context:", context);
    const idFromParams = context?.params?.id;
    const id = idFromParams ?? extractIdFromReq(req);

    if (!id) return sendError("Falta id en la ruta", 400);

    // validate numeric-ish id (optional)
    const numeric = Number(id);
    if (Number.isNaN(numeric)) {
      // still allow string ids if your DB uses UUIDs; otherwise reject
      // return sendError('Id inválido', 400);
    }

    // check user exists
    const exists = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (exists.rowCount === 0) {
      return sendError("Usuario no encontrado", 404);
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    console.log("[API DELETE] deleted id:", id);
    return NextResponse.json({ success: true, id });
  } catch (e: any) {
    console.error("[API DELETE] ERROR:", e);
    return sendError(e.message || "Error interno", 500);
  }
}
