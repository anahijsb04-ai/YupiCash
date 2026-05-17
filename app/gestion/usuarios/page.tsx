"use client";

import Sidebar from "@/app/gestion/components/Sidebar";
import UsuariosTable from "./UsuariosTable";

export default function UsuariosPage() {
  return (
    <div className="min-h-screen text-slate-900">
      {/* Sidebar fija */}
      <Sidebar />

      {/* Contenido */}
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
              Gestión de Usuarios
            </h1>
            <p className="text-slate-500 mt-2">
              Crear, editar y eliminar usuarios del sistema.
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
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Admin
          </div>
        </div>

        {/* Contenido */}
        <section className="mt-8">
          <UsuariosTable />
        </section>
      </main>
    </div>
  );
}
