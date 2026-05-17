"use client";

import Sidebar from "@/app/components/Sidebar";
import CasosView from "./CasosView";

export default function CasosPage() {
  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden">
      <Sidebar />

      <main
        className="
          min-h-screen
          px-4 sm:px-6 md:px-8 lg:px-10
          py-6 sm:py-8 md:py-10
          bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100
          transition-[margin,width] duration-300
        "
        style={{
          marginLeft: "calc(var(--sidebar-w) + 12px)",   // 👈 MÁS ESPACIO
          width: "calc(100% - var(--sidebar-w) -  )", // 👈 AJUSTE PROPORCIONAL
        }}
      >
        <div className="w-full">
          <CasosView />
        </div>
      </main>
    </div>
  );
}