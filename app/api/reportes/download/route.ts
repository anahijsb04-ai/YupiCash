// app/api/reportes/download/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateDailyReport } from "@/lib/reports/generateDailyReport";
import fs from "fs/promises";

function todayYMDInGuayaquil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("date") || "").trim();
    const reportDateYMD = /^\d{4}-\d{2}-\d{2}$/.test(q)
      ? q
      : todayYMDInGuayaquil();

    const r = await generateDailyReport({ reportDateYMD, mode: "manual" });
    const fileBuffer = await fs.readFile(r.tmpPath);

    // limpiar /tmp (opcional)
    await fs.unlink(r.tmpPath).catch(() => {});

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${r.fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error" },
      { status: 500 }
    );
  }
}
