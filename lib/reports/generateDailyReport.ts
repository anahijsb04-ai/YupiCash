import * as XLSX from "xlsx";
import path from "path";
import os from "os";
import fs from "fs/promises";

type Params = {
  reportDateYMD: string;
  mode?: "manual" | "auto";
};

type DailyReportResult = {
  ok: true;
  reportDateYMD: string;
  fileName: string;
  tmpPath: string;
  file_path: string;
};

// ⚠️ Reemplaza por tu consulta real (debe devolver SIEMPRE un array)
async function getReportRows(reportDateYMD: string): Promise<any[]> {
  return [
    { Cliente: "Juan", Total: 10, Fecha: reportDateYMD },
    { Cliente: "Ana", Total: 20, Fecha: reportDateYMD },
  ];
}

export async function generateDailyReport({
  reportDateYMD,
}: Params): Promise<DailyReportResult> {
  const rowsRaw = await getReportRows(reportDateYMD);

  if (!Array.isArray(rowsRaw)) {
    throw new Error("La data del reporte no es un array (rowsRaw inválido)");
  }

  const wb = XLSX.utils.book_new();
  const ws =
    rowsRaw.length > 0
      ? XLSX.utils.json_to_sheet(rowsRaw)
      : XLSX.utils.aoa_to_sheet([["Sin datos para esta fecha"]]);

  XLSX.utils.book_append_sheet(wb, ws, "Reporte");

  const fileName = `reporte_clientes_${reportDateYMD}.xlsx`;

  const tmpDir = os.tmpdir(); // Windows/Mac/Linux/Vercel
  const outDir = path.join(tmpDir, "reportes");
  await fs.mkdir(outDir, { recursive: true });

  const tmpPath = path.join(outDir, fileName);

  // ✅ 1) Crear el Excel en memoria
  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "buffer",
  }) as Buffer;

  // ✅ 2) Guardar archivo físico con fs (muestra errores reales)
  try {
    await fs.writeFile(tmpPath, buffer);
  } catch (err: any) {
    throw new Error(
      `No se pudo guardar el reporte en ${tmpPath}: ${err?.message || String(err)}`
    );
  }

  return {
    ok: true,
    reportDateYMD,
    fileName,
    tmpPath,
    file_path: `/api/reportes/download?date=${encodeURIComponent(reportDateYMD)}`,
  };
}
