export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { poolInstance as pool } from "@/lib/db";
import nodemailer from "nodemailer";

type Row = Record<string, any>;

type MailResult =
  | { ok: true; to: string[] }
  | { ok: false; error: string };

// Normaliza claves
function normKey(s: string) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

type MappedRow = {
  nombre_cliente: string;
  telefono_cliente: string;
  valor_deuda: number;
  producto: string;
};

// Mapeo de headers
const HEADER_MAP: Record<string, keyof MappedRow> = {
  "nombre del cliente": "nombre_cliente",
  "nombre cliente": "nombre_cliente",
  "nombre_cliente": "nombre_cliente",
  "cliente": "nombre_cliente",

  "numero de telefono movil": "telefono_cliente",
  "número de telefono movil": "telefono_cliente",
  "número de teléfono móvil": "telefono_cliente",
  "telefono movil": "telefono_cliente",
  "telefono": "telefono_cliente",
  "teléfono": "telefono_cliente",
  "telefono_cliente": "telefono_cliente",

  "importe adeudado": "valor_deuda",
  "valor deuda": "valor_deuda",
  "valor_deuda": "valor_deuda",
  "adeudado": "valor_deuda",
  "importe": "valor_deuda",

  "producto": "producto",
};

// Convierte dinero a número
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

// Mapear fila
function mapRow(raw: Row): MappedRow {
  const out: Partial<MappedRow> = {};

  for (const [k, v] of Object.entries(raw)) {
    const nk = normKey(k);
    const mapped = HEADER_MAP[nk];
    if (!mapped) continue;

    if (mapped === "valor_deuda") out.valor_deuda = parseMoneyLike(v);
    else out[mapped] = String(v ?? "").trim();
  }

  if (!out.nombre_cliente) throw new Error("Falta 'Nombre del Cliente'");
  if (!out.telefono_cliente) throw new Error("Falta 'Teléfono'");
  if (!out.producto) throw new Error("Falta 'Producto'");
  if (out.valor_deuda === undefined || Number.isNaN(out.valor_deuda)) {
    throw new Error("Valor de deuda inválido");
  }

  return out as MappedRow;
}

// Parse Excel
function parseExcel(buffer: Buffer): Row[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { defval: "" }) as Row[];
}

// Insertar batch
async function insertBatch(client: any, rows: MappedRow[]) {
  const values: any[] = [];
  const chunks: string[] = [];

  rows.forEach((r, i) => {
    const base = i * 4;
    chunks.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
    values.push(
      r.nombre_cliente,
      r.telefono_cliente,
      r.valor_deuda,
      r.producto
    );
  });

  const sql = `
    INSERT INTO public.cliente (nombre_cliente, telefono_cliente, valor_deuda, producto)
    VALUES ${chunks.join(",")}
    RETURNING numero_prestamo
  `;

  const r = await client.query(sql, values);

  return {
    createdPrestamos: r.rows.map((x: any) => x.numero_prestamo),
    rowCount: r.rowCount ?? r.rows.length,
  };
}

// Validar email
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Enviar correo
async function sendMailWithAttachment(opts: {
  to: string[];
  subject: string;
  text: string;
  filename: string;
  content: Buffer;
  contentType: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: opts.to.join(","),
    subject: opts.subject,
    text: opts.text,
    attachments: [
      {
        filename: opts.filename,
        content: opts.content,
        contentType: opts.contentType,
      },
    ],
  });
}

// ENDPOINT
export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const bytes = Buffer.from(await file.arrayBuffer());

    // ✅ SOLO EXCEL
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos Excel (.xlsx, .xls)" },
        { status: 400 }
      );
    }

    const rawRows = parseExcel(bytes);

    const good: MappedRow[] = [];
    const bad: { index: number; reason: string }[] = [];

    rawRows.forEach((r, idx) => {
      try {
        good.push(mapRow(r));
      } catch (e: any) {
        bad.push({ index: idx + 2, reason: e?.message || "Error" });
      }
    });

    await client.query("BEGIN");

    const BATCH_SIZE = 250;
    const created: string[] = [];
    let insertedTotal = 0;

    for (let i = 0; i < good.length; i += BATCH_SIZE) {
      const slice = good.slice(i, i + BATCH_SIZE);
      const r = await insertBatch(client, slice);
      insertedTotal += r.rowCount;
      created.push(...r.createdPrestamos);
    }

    await client.query("COMMIT");

    const emails = [
      (process.env.ALAN_EMAIL || "").trim(),
      (process.env.BRANDON_EMAIL || "").trim(),
    ].filter((e) => e && isValidEmail(e));

    let mail: MailResult = {
      ok: false,
      error: "No hay correos válidos",
    };

    if (emails.length > 0) {
      try {
        await sendMailWithAttachment({
          to: emails,
          subject: `Archivo importado: ${file.name}`,
          text: `Insertados: ${insertedTotal}\nErrores: ${bad.length}`,
          filename: file.name,
          content: bytes,
          contentType: file.type || "application/octet-stream",
        });

        mail = { ok: true, to: emails };
      } catch (err: any) {
        mail = { ok: false, error: err?.message };
      }
    }

    return NextResponse.json({
      ok: true,
      imported: rawRows.length,
      inserted: insertedTotal,
      skipped: bad.length,
      bad,
      numero_prestamo_creados: created,
      mail,
    });
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => {});
    return NextResponse.json(
      { ok: false, error: e?.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}