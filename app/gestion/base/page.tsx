"use client";

import Sidebar from "@/app/gestion/components/Sidebar";
import BaseClient from "./BaseClient";

export default function Page() {
  return (
    // ✅ Fondo claro global para que NO aparezca la franja negra
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100 text-slate-900">
      <Sidebar />

      <main
        className="
          min-h-screen
          transition-[padding] duration-300
        "
        // ✅ Overlay cuando está abierta (18rem) y empuja solo 88px cuando está cerrada
        style={{ paddingLeft: "min(var(--sidebar-w), 88px)" }}
      >
        <BaseClient />
      </main>
    </div>
  );
}
