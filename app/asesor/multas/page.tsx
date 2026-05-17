"use client";
import AsesorSidebar from "@/app/asesor/dashboard/components/AsesorSidebar";
import TemplatesView from "./templates/TemplatesView";

export default function MultasPage() {
  return (
    <div className="min-h-screen text-slate-900">
      {/* Sidebar fija */}
      <AsesorSidebar />

      {/* Contenido (respeta ancho sidebar por --sidebar-w) */}
      <main
        className="
          min-h-screen
          px-6 sm:px-10
          py-8 sm:py-10
          bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100
          transition-[padding] duration-300
        "
        style={{
          // ✅ Si --sidebar-w es 18rem (abierta), quitamos el padding para overlay.
          // ✅ Si es 88px (cerrada), dejamos 88px para que no tape.
          paddingLeft: "min(var(--sidebar-w), 88px)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Multas
            </h1>
            <p className="text-slate-500 mt-2">
              Administración y gestión de multas.
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
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Gestión
          </div>
        </div>

        {/* Separador */}
        <div className="mt-8 border-t border-slate-200/70" />

        {/* Contenedor principal tipo “card” como la referencia */}
        <section
          className="
            mt-8
            rounded-3xl
            bg-white/55 backdrop-blur-xl
            border border-slate-200/60
            shadow-[0_8px_30px_rgba(15,23,42,0.06)]
            p-4 sm:p-6
          "
        >
          {/* Puedes envolver TemplatesView con padding interno suave */}
          <div className="rounded-2xl bg-white/50 border border-slate-200/60 p-4 sm:p-6">
            <TemplatesView />
          </div>
        </section>
      </main>
    </div>
  );
}
