export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateDailyReport } from "@/lib/reports/generateDailyReport";
import { sendMail } from "@/lib/mailer";
import fs from "fs/promises";

function todayYMDInGuayaquil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function ensureAdmin(req: Request) {
  const role = req.headers.get("x-role");
  if (role !== "admin") throw new Error("No autorizado");
}

export async function POST(req: Request) {
  try {
    ensureAdmin(req);

    const url = new URL(req.url);
    const q = (url.searchParams.get("date") || "").trim();
    const reportDateYMD = /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : todayYMDInGuayaquil();

    const r = await generateDailyReport({ reportDateYMD, mode: "manual" });

    const tmpPath = (r as any).tmpPath;
    const fileName =
      (r as any).fileName || `reporte_clientes_${reportDateYMD}.xlsx`;

    if (!tmpPath) throw new Error("No se generó tmpPath");

    const fileBuffer = await fs.readFile(tmpPath);

    const to = process.env.ALAN_EMAIL;
    if (!to) throw new Error("ALAN_EMAIL no configurado");

    await sendMail({
      to,
      subject: `Reporte diario - ${reportDateYMD}`,
      text: `Adjunto el reporte del día ${reportDateYMD}. Descarga: ${(r as any).file_path || ""}`,
      attachments: [
        {
          filename: fileName,
          content: fileBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });

    // limpiar /tmp (opcional)
    await fs.unlink(tmpPath).catch(() => {});

    // ✅ evita duplicar ok
    const { ok: _ok, ...rest } = r as any;

    return NextResponse.json({
      ok: true,
      ...rest,
      emailedTo: to,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error" },
      { status: 500 }
    );
  }
}
