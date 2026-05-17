"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

type ReportRow = {
  date: string;
  file_path: string;
};

export default function ReportesPage() {
  const [date, setDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const [items, setItems] = useState<ReportRow[]>([]);
  const [runTime, setRunTime] = useState("22:00");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function loadAll() {
    setStatus("");

    const r1 = await fetch("/api/reportes/list", {
      cache: "no-store",
    });

    const j1 = await r1.json();

    if (j1.ok) {
      setItems(j1.data || []);
    }

    const r2 = await fetch("/api/reportes/schedule", {
      cache: "no-store",
    });

    const j2 = await r2.json();

    if (j2.run_time) {
      setRunTime(String(j2.run_time).slice(0, 5));
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const selectedExists = useMemo(
    () => items.some((x) => x.date === date),
    [items, date]
  );

  const selectedUrl = useMemo(() => {
    const fromDb = items.find(
      (x) => x.date === date
    )?.file_path;

    return (
      fromDb ||
      `/reports/reporte_clientes_${date}.xlsx`
    );
  }, [items, date]);

  async function onGenerateManual() {
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(
        `/api/reportes/manual?date=${encodeURIComponent(
          date
        )}`,
        {
          method: "POST",
          headers: {
            "x-role": "admin",
          },
        }
      );

      const j = await res.json();

      if (!j.ok) {
        throw new Error(
          j.error ||
            "No se pudo generar el reporte"
        );
      }

      setStatus(
        `✅ Reporte generado correctamente`
      );

      await loadAll();
    } catch (e: any) {
      setStatus(
        `❌ ${e?.message || "Error"}`
      );
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setLoading(true);
    setStatus("");

    try {
      await loadAll();

      setStatus(
        "✅ Lista actualizada"
      );
    } catch {
      setStatus(
        "❌ No se pudo actualizar"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* HEADER */}
            <section
              className="
                relative overflow-hidden
                rounded-[34px]
                border border-slate-200
                bg-white
                shadow-[0_10px_50px_rgba(15,23,42,0.06)]
              "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

              <div className="relative z-10 p-6 sm:p-8 md:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div
                      className="
                        inline-flex items-center gap-2
                        px-4 py-2
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        shadow-sm
                        mb-5
                      "
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />

                      <span className="text-sm font-medium text-slate-700">
                        Sistema de reportes
                      </span>
                    </div>

                    <h1
                      className="
                        text-3xl sm:text-4xl md:text-5xl
                        font-semibold
                        tracking-tight
                        text-slate-900
                      "
                    >
                      Reportes diarios
                    </h1>

                    <p className="text-slate-500 mt-4 max-w-[700px] text-sm sm:text-base leading-relaxed">
                      Genera, descarga y administra
                      reportes automáticamente desde
                      un panel moderno y limpio.
                    </p>
                  </div>

                  <div
                    className="
                      rounded-3xl
                      border border-slate-200
                      bg-white
                      px-5 py-4
                      shadow-sm
                    "
                  >
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Estado
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                      <span className="font-semibold text-slate-900">
                        Operativo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ACTIONS */}
            <section
              className="
                mt-6
                rounded-[32px]
                border border-slate-200
                bg-white
                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                p-5 sm:p-6
              "
            >
              <div className="flex flex-col xl:flex-row xl:items-end gap-5">
                <div className="flex flex-wrap items-end gap-4">
                  {/* FECHA */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Fecha
                    </label>

                    <input
                      type="date"
                      value={date}
                      onChange={(e) =>
                        setDate(
                          e.target.value
                        )
                      }
                      className="
                        h-11 w-[180px]
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        px-4
                        text-sm text-slate-900
                        outline-none
                        focus:ring-4
                        focus:ring-slate-900/5
                      "
                    />
                  </div>

                  {/* DESCARGAR */}
                  <a
                    href={selectedUrl}
                    download
                    aria-disabled={!selectedExists}
                    className={[
                      `
                        h-11
                        inline-flex items-center justify-center
                        rounded-2xl
                        px-5
                        text-sm font-semibold
                        transition-all duration-300
                      `,
                      selectedExists
                        ? `
                          bg-slate-900
                          text-white
                          hover:bg-black
                          shadow-lg
                        `
                        : `
                          bg-slate-100
                          text-slate-400
                          pointer-events-none
                        `,
                    ].join(" ")}
                  >
                    Descargar
                  </a>

                  {/* GENERAR */}
                  <button
                    onClick={onGenerateManual}
                    disabled={loading}
                    type="button"
                    className="
                      h-11
                      rounded-2xl
                      px-5
                      text-sm font-semibold
                      bg-white
                      border border-slate-200
                      text-slate-700
                      hover:bg-slate-50
                      transition-all duration-300
                      disabled:opacity-60
                    "
                  >
                    {loading
                      ? "Generando..."
                      : "Generar manual"}
                  </button>

                  {/* REFRESH */}
                  <button
                    onClick={onRefresh}
                    disabled={loading}
                    type="button"
                    className="
                      h-11
                      rounded-2xl
                      px-5
                      text-sm font-semibold
                      bg-white
                      border border-slate-200
                      text-slate-700
                      hover:bg-slate-50
                      transition-all duration-300
                      disabled:opacity-60
                    "
                  >
                    Actualizar
                  </button>
                </div>

                <div className="xl:ml-auto">
                  <div
                    className={[
                      `
                        inline-flex items-center gap-2
                        px-4 py-3
                        rounded-2xl
                        text-sm font-medium
                        border
                      `,
                      selectedExists
                        ? `
                          border-emerald-200
                          bg-emerald-50
                          text-emerald-700
                        `
                        : `
                          border-slate-200
                          bg-slate-50
                          text-slate-600
                        `,
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-2 w-2 rounded-full",
                        selectedExists
                          ? "bg-emerald-500"
                          : "bg-slate-400",
                      ].join(" ")}
                    />

                    {selectedExists
                      ? "Hay reporte disponible"
                      : "No existe reporte"}
                  </div>
                </div>
              </div>

              {/* STATUS */}
              {status && (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border border-slate-200
                    bg-slate-50
                    px-4 py-3
                    text-sm text-slate-700
                  "
                >
                  {status}
                </div>
              )}
            </section>

            {/* REPORTES */}
            <section
              className="
                mt-6
                rounded-[32px]
                border border-slate-200
                bg-white
                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                p-5 sm:p-6
              "
            >
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Reportes disponibles
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Lista de archivos generados
                  </p>
                </div>

                <div
                  className="
                    px-4 py-2
                    rounded-2xl
                    border border-slate-200
                    bg-slate-50
                    text-sm font-medium text-slate-700
                  "
                >
                  Total: {items.length}
                </div>
              </div>

              {items.length === 0 ? (
                <div
                  className="
                    rounded-3xl
                    border border-dashed border-slate-300
                    bg-slate-50/70
                    py-14 px-6
                    text-center
                  "
                >
                  <div className="text-slate-900 font-semibold">
                    No hay reportes disponibles
                  </div>

                  <div className="text-sm text-slate-500 mt-2">
                    Usa “Generar manual”
                    para crear el primero.
                  </div>
                </div>
              ) : (
                <div
                  className="
                    grid grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-3
                    gap-4
                  "
                >
                  {items.map((r) => (
                    <a
                      key={r.file_path}
                      href={r.file_path}
                      download
                      className="
                        group
                        rounded-3xl
                        border border-slate-200
                        bg-white
                        p-5
                        hover:-translate-y-1
                        hover:shadow-[0_14px_40px_rgba(15,23,42,0.06)]
                        transition-all duration-300
                      "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900 text-lg">
                            {r.date}
                          </div>

                          <div className="text-xs text-slate-500 mt-2 break-all leading-relaxed">
                            {r.file_path}
                          </div>
                        </div>

                        <div
                          className="
                            shrink-0
                            px-3 py-1.5
                            rounded-xl
                            bg-slate-100
                            text-xs font-medium
                            text-slate-600
                            group-hover:bg-slate-900
                            group-hover:text-white
                            transition
                          "
                        >
                          Descargar
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}