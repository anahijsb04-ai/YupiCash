export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";

type CreateClientBody = {
  nombre_cliente: string;
  telefono_cliente: string;
  valor_cobrar: number | string;
  producto: string;
};

function parseMoneyLike(v: any): number {
  const raw = String(v ?? "").trim();
  if (!raw) return NaN;

  const cleaned = raw.replace(/[^\d.,-]/g, "");
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(/,/g, ".")
        : cleaned.replace(/,/g, "");
  } else if (hasComma && !hasDot) {
    const commas = (cleaned.match(/,/g) || []).length;
    normalized =
      commas > 1 ? cleaned.replace(/,/g, "") : cleaned.replace(/,/g, ".");
  } else {
    const dots = (cleaned.match(/\./g) || []).length;
    normalized = dots > 1 ? cleaned.replace(/\./g, "") : cleaned;
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}

function cleanPhone(v: any) {
  return String(v ?? "").replace(/\D/g, "").trim();
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = (await req.json()) as Partial<CreateClientBody>;

    const nombre_cliente = String(body?.nombre_cliente ?? "").trim();
    const telefono_cliente = cleanPhone(body?.telefono_cliente);
    const producto = String(body?.producto ?? "").trim();
    const valor_deuda = parseMoneyLike(body?.valor_cobrar);

    if (!nombre_cliente) {
      return NextResponse.json(
        { ok: false, error: "Falta 'nombre_cliente'" },
        { status: 400 }
      );
    }

    if (!telefono_cliente) {
      return NextResponse.json(
        { ok: false, error: "Falta 'telefono_cliente'" },
        { status: 400 }
      );
    }

    if (!producto) {
      return NextResponse.json(
        { ok: false, error: "Falta 'producto'" },
        { status: 400 }
      );
    }

    if (Number.isNaN(valor_deuda) || valor_deuda <= 0) {
      return NextResponse.json(
        { ok: false, error: "Valor de deuda inválido" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO public.cliente
      (nombre_cliente, telefono_cliente, valor_deuda, producto)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await client.query(sql, [
      nombre_cliente,
      telefono_cliente,
      valor_deuda,
      producto,
    ]);

    return NextResponse.json({
      ok: true,
      data: result.rows[0],
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}