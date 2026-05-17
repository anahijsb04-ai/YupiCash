import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET → Obtener todos los usuarios
export async function GET() {
  try {
    const res = await pool.query(
      "SELECT id, username, role FROM users ORDER BY id ASC"
    );
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST → Crear usuario nuevo
export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      RETURNING id, username, role;
    `;

    const result = await pool.query(query, [username, hashed, role]);

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
