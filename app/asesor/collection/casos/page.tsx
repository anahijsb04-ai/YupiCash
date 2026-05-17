"use client";

import AsesorSidebar from "@/app/asesor/dashboard/components/AsesorSidebar";
import CasosView from "./CasosView";

export default function CasosPage() {
  return (
    <div className="min-h-screen text-slate-900">
      <AsesorSidebar />

      <main
        className="
          min-h-screen
          px-6 sm:px-10
          py-8 sm:py-10
          bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100
          transition-[padding] duration-300
        "
        style={{ paddingLeft: "min(var(--sidebar-w), 88px)" }}
      >
        <CasosView />
      </main>
    </div>
  );
}
