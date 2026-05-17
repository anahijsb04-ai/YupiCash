export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { poolInstance as pool } from "@/lib/db";
import { generateDailyReport } from "@/lib/reports/generateDailyReport";

function nowHHMMInGuayaquil() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date()); // "HH:MM"
}

function todayYMDInGuayaquil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // "YYYY-MM-DD"
}

export async function POST(req: Request) {
  // seguridad
  if (req.headers.get("x-cron-token") !== process.env.CRON_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const nowHHMM = nowHHMMInGuayaquil();
  const today = todayYMDInGuayaquil();

  const client = await pool.connect();
  try {
    // horario guardado
    const sched = await client.query(
      `SELECT run_time::text AS run_time
       FROM public.report_schedule
       WHERE id=1`
    );
    const run_time_full = sched.rows?.[0]?.run_time ?? "22:00:00";
    const runHHMM = String(run_time_full).slice(0, 5);

    // si no es la hora, skip
    if (nowHHMM !== runHHMM) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: `Now=${nowHHMM} Expected=${runHHMM}`,
        today,
        nowHHMM,
        runHHMM,
      });
    }

    // verificar si ya existe el AUTO del día (por nombre fijo)
    const autoFileName = `reporte_clientes_${today}.xlsx`;

    const existsAuto = await client.query(
      `SELECT 1
       FROM public.reportes_diarios
       WHERE report_date=$1::date
         AND file_name=$2
       LIMIT 1`,
      [today, autoFileName]
    );

    if (existsAuto.rows.length > 0) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "Auto ya generado hoy",
        today,
        autoFileName,
        nowHHMM,
        runHHMM,
      });
    }

    // generar auto
    const result = await generateDailyReport({
      reportDateYMD: today,
      mode: "auto",
    });

    // ✅ evita duplicar ok: si result trae ok, lo ignoramos
    const { ok: _ok, ...rest } = result as any;

    return NextResponse.json({
      ok: true,
      generated: true,
      ...rest,
      today,
      autoFileName,
      nowHHMM,
      runHHMM,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
