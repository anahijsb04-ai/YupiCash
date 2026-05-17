  import { NextResponse } from "next/server";
  import { Pool } from "pg";

  export const runtime = "nodejs";

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  /* =========================
    GET → LISTAR LISTAS
  ========================= */
  export async function GET() {
    try {
      const res = await pool.query(
        `
        SELECT id, nombre, tipo
        FROM listas
        ORDER BY id DESC
        `
      );

      return NextResponse.json(res.rows);
    } catch (error: any) {
      console.error("GET /listas error:", error);
      return NextResponse.json(
        { error: "Error al listar" },
        { status: 500 }
      );
    }
  }

  /* =========================
    POST → CREAR LISTA
  ========================= */
  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { nombre, tipo } = body;

      if (!nombre || !tipo) {
        return NextResponse.json(
          { error: "nombre y tipo son obligatorios" },
          { status: 400 }
        );
      }

      const res = await pool.query(
        `
        INSERT INTO listas (nombre, tipo)
        VALUES ($1, $2)
        RETURNING *
        `,
        [nombre, tipo]
      );

      return NextResponse.json(res.rows[0]);
    } catch (error: any) {
      console.error("POST /listas error:", error);
      return NextResponse.json(
        { error: "Error al crear lista" },
        { status: 500 }
      );
    }
  }
