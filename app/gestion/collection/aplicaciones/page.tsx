"use client";

import Sidebar from "@/app/components/Sidebar";

import AplicacionesView from "./components/AplicacionesView";

export default function AplicacionesPage() {
  return (
    <div className="min-h-screen text-slate-900">
      <Sidebar />

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
        <AplicacionesView />
      </main>
    </div>
  );
}
