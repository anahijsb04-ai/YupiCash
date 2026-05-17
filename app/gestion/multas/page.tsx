"use client";

import Sidebar from "../components/Sidebar";
import TemplatesView from "./templates/TemplatesView";

export default function MultasPage() {
  return (
    <div className="min-h-screen text-slate-900">
      {/* Sidebar fija */}
      <Sidebar />

      {/* Contenido (respeta ancho sidebar por --sidebar-w) */}
      <main
        className="
          min-h-screen
          pl-[76px] sm:pl-[88px] md:pl-[96px] lg:pl-[110px]
          pr-4 sm:pr-6 md:pr-10
          py-6 sm:py-8 md:py-10
          bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100
          transition-[padding] duration-300
        "
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              Multas
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Administración y gestión de multas.
            </p>
          </div>

          <div
            className="
              hidden sm:flex items-center gap-2
              px-3 sm:px-4 py-2 rounded-2xl
              bg-white/60 backdrop-blur-xl
              border border-slate-200/60
              shadow-sm
              text-xs sm:text-sm text-slate-600
            "
          >
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Gestión
          </div>
        </div>

        {/* Separador */}
        <div className="mt-6 sm:mt-8 border-t border-slate-200/70" />

        {/* Contenedor principal tipo “card” como la referencia */}
        <section
          className="
            mt-6 sm:mt-8
            rounded-3xl
            bg-white/55 backdrop-blur-xl
            border border-slate-200/60
            shadow-[0_8px_30px_rgba(15,23,42,0.06)]
            p-3 sm:p-4 md:p-6
          "
        >
          {/* Puedes envolver TemplatesView con padding interno suave */}
          <div className="rounded-2xl bg-white/50 border border-slate-200/60 p-3 sm:p-4 md:p-6">
            <TemplatesView />
          </div>
        </section>
      </main>
    </div>
  );
}