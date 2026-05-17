"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

type Plantilla = {
  id: number;
  subproducto?: string;
  url?: string | null;
  tipo: "rapida" | "personalizada";
  visual: "si" | "no";
};

export default function DashboardAsesorPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const fetchPlantillas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plantillas", { cache: "no-store" });
      if (!res.ok) throw new Error("Error al cargar plantillas");
      const data = await res.json();

      // 🔥 SOLO HABILITADAS
      const visibles = Array.isArray(data)
        ? data.filter((p) => p.visual === "si")
        : [];

      setPlantillas(visibles);
    } catch {
      setPlantillas([]);
      setToast("Error al cargar plantillas");
      setTimeout(() => setToast(""), 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantillas();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Dashboard Asesor
          </h1>
          <p className="text-slate-500 mt-2">
            Selecciona una plantilla habilitada.
          </p>
        </div>

        <div
          className="
            hidden sm:flex items-center gap-2
            px-4 py-2 rounded-2xl
            bg-white/60 backdrop-blur-xl
            border border-slate-200/60
            shadow-sm
            text-sm text-slate-600
          "
        >
          <LayoutGrid size={16} />
          Plantillas
        </div>
      </div>

      {toast && (
        <div className="mt-5 rounded-2xl bg-white/60 border border-slate-200/60 px-4 py-3 text-slate-700 shadow-sm">
          {toast}
        </div>
      )}

      <div className="mt-8 border-t border-slate-200/70" />

      {/* Grid */}
      <section className="mt-8">
        {loading ? (
          <div className="rounded-3xl bg-white/55 border border-slate-200/60 p-6 text-slate-500">
            Cargando plantillas…
          </div>
        ) : plantillas.length === 0 ? (
          <div className="rounded-3xl bg-white/55 border border-slate-200/60 p-6 text-slate-500">
            No hay plantillas habilitadas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantillas.map((p) => (
            <Link
              key={p.id}
              href={
                p.tipo === "personalizada"
                  ? `/asesor/plantilla/personalizada/${p.id}`
                  : `/asesor/plantilla/${p.id}`
              }
              className="
                group rounded-3xl
                bg-white/55 backdrop-blur-xl
                border border-slate-200/60
                shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                p-5
                hover:shadow-[0_12px_40px_rgba(15,23,42,0.10)]
                hover:-translate-y-0.5
                transition
                flex flex-col
              "
            >

                {p.url ? (
                  <img
                    src={p.url}
                    alt={p.subproducto || `Plantilla ${p.id}`}
                    className="w-full h-36 object-cover rounded-2xl border bg-white/60"
                  />
                ) : (
                  <div className="w-full h-36 rounded-2xl border bg-white/60 flex items-center justify-center text-slate-500">
                    Sin imagen
                  </div>
                )}

                <div className="mt-4 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-slate-900 truncate">
                      {p.subproducto || `Plantilla #${p.id}`}
                    </h2>

                    {/* BADGE TIPO */}
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        p.tipo === "rapida"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-violet-100 text-violet-700"
                      }`} 
                    >
                      {p.tipo}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div
                    className="
                      w-full text-center
                      px-4 py-3 rounded-2xl
                      bg-gradient-to-r from-sky-700 to-slate-800
                      text-white font-semibold
                      shadow-sm
                      group-hover:from-sky-800 group-hover:to-slate-900
                      transition
                    "
                  >
                    Editar →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
