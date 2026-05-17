import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function splitEmails(raw?: string) {
  if (!raw) return [];
  return raw
    .split(/[\n,;]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function uniq(list: string[]) {
  return Array.from(new Set(list.map((x) => x.toLowerCase())));
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendMailWithAttachment(opts: {
  to: string[];
  subject: string;
  text: string;
  filename: string;
  content: Buffer;
  contentType: string;
}) {
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || (secure ? 465 : 587)),
    secure,
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

export async function POST(req: Request) {
  const token = req.headers.get("x-cron-token");
  if (!process.env.CRON_TOKEN || token !== process.env.CRON_TOKEN) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date"); // opcional: YYYY-MM-DD
  const reportDate = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const dateYMD = ymd(reportDate);

  const client = await pool.connect();
  try {
    const sql = `
      SELECT
        numero_prestamo,
        nombre_cliente,
        telefono_cliente,
        valor_deuda,
        valor_recaudado,
        producto,
        CASE
          WHEN segmento IS NULL OR segmento = '' OR segmento = 'multas' THEN '-'
          ELSE segmento
        END AS segmento,
        fecha_cobro,
        estado_pago,
        collection_account
      FROM public.cliente
      ORDER BY numero_prestamo DESC;
    `;

    const { rows } = await client.query(sql);

    const totalRecaudado = rows.reduce((acc, r) => acc + Number(r.valor_recaudado || 0), 0);
    const totalPagados = rows.filter((r) => r.estado_pago === "pagado").length;
    const totalPendientes = rows.filter((r) => r.estado_pago === "pendiente").length;

    const wb = XLSX.utils.book_new();

    const resumen = [
      { campo: "fecha_reporte", valor: dateYMD },
      { campo: "total_registros", valor: rows.length },
      { campo: "total_pagados", valor: totalPagados },
      { campo: "total_pendientes", valor: totalPendientes },
      { campo: "total_recaudado", valor: totalRecaudado },
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), "Resumen");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Detalle");

    // ✅ guardar (tu carpeta actual "reports")
    const dir = path.join(process.cwd(), "reports");
    fs.mkdirSync(dir, { recursive: true });

    const fileName = `reporte_clientes_${dateYMD}.xlsx`;
    const filePath = path.join(dir, fileName);
    XLSX.writeFile(wb, filePath);

    // ✅ registrar en BD
    await client.query(
      `
      INSERT INTO public.reportes_diarios (report_date, file_name, file_path)
      VALUES ($1::date, $2, $3)
      ON CONFLICT (report_date)
      DO UPDATE SET file_name = EXCLUDED.file_name, file_path = EXCLUDED.file_path;
      `,
      [dateYMD, fileName, filePath]
    );

    // ✅ enviar por correo
    const to = uniq(splitEmails(process.env.REPORT_EMAILS)).filter(isValidEmail);

    let mail: any = { ok: false, error: "REPORT_EMAILS vacío o inválido." };
    if (to.length > 0) {
      const buffer = fs.readFileSync(filePath);
      try {
        await sendMailWithAttachment({
          to,
          subject: `Reporte del día ${dateYMD}`,
          text: `Adjunto reporte del día ${dateYMD}.\n\nTotal registros: ${rows.length}\nTotal recaudado: ${totalRecaudado}`,
          filename: fileName,
          content: buffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        mail = { ok: true };
      } catch (e: any) {
        mail = { ok: false, error: e?.message || "Error enviando correo" };
      }
    }

    return NextResponse.json({
      ok: true,
      date: dateYMD,
      fileName,
      saved: true,
      mail,
      stats: { total: rows.length, totalPagados, totalPendientes, totalRecaudado },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  } finally {
    client.release();
  }
}
