"use client";

import Link from "next/link";
import Sidebar from "./components/Sidebar";
import {
  FileText,
  FilePlus,
  Upload,
  Users,
  LayoutGrid,
  Search,
  ShieldCheck,
  Bell,
  Clock,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Database,
  Folder,
  Settings,
  BarChart3,
  PieChart,
  FileUp,
  ListChecks,
  Sparkles,
} from "lucide-react";

export default function GestionPage() {
  const cards = [
    {
      title: "Collection",
      desc: "Carga de base para gestión",
      icon: <FilePlus size={22} />,
      href: "/gestion/collection/casos",
    },
    {
      title: "Ligas",
      desc: "Administración visual de las ligas",
      icon: <LayoutGrid size={22} />,
      href: "/gestion/base",
    },
    {
      title: "Usuarios",
      desc: "Gestión de usuarios y roles",
      icon: <Users size={22} />,
      href: "/gestion/usuarios",
    },
    {
      title: "Subir Base",
      desc: "Importar CSV o Excel",
      icon: <Upload size={22} />,
      href: "/gestion/base-datos",
    },
  ];

  const quickActions = [
    {
      title: "Buscar registro",
      desc: "Encuentra datos rápidamente",
      icon: <Search size={18} />,
      href: "/gestion/base",
    },
    {
      title: "Reportes",
      desc: "Resumen y métricas",
      icon: <BarChart3 size={18} />,
      href: "/gestion/reportes",
    },
    {
      title: "Auditoría",
      desc: "Cambios y trazabilidad",
      icon: <ListChecks size={18} />,
      href: "/gestion/auditoria",
    },
    {
      title: "Notificaciones",
      desc: "Alertas del sistema",
      icon: <Bell size={18} />,
      href: "/gestion/notificaciones",
    },
  ];

  const recentActivity = [
    {
      title: "Se importó base: vehiculos_2026.xlsx",
      meta: "Hace 12 min",
      icon: <FileUp size={18} />,
    },
    {
      title: "Se actualizó rol: Operador → Supervisor",
      meta: "Hace 2 h",
      icon: <ShieldCheck size={18} />,
    },
    {
      title: "Nueva multa registrada: #MT-19302",
      meta: "Ayer",
      icon: <FileText size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar />

      <main
        className="
          min-h-screen
          pl-[76px] sm:pl-[88px] md:pl-[96px] lg:pl-[110px]
          pr-4 sm:pr-6 md:pr-10
          py-6 sm:py-8 md:py-10
          transition-all duration-300
        "
      >
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-[34px] border border-white bg-white shadow-[0_10px_50px_rgba(15,23,42,0.06)]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/70 via-white to-slate-50" />

          <div className="relative z-10 p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2 rounded-2xl
                    border border-slate-200
                    bg-white
                    shadow-sm
                    mb-5
                  "
                >
                  <Sparkles
                    size={16}
                    className="text-slate-700"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Dashboard
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                  Panel de Gestión
                </h1>

                <p className="text-slate-500 mt-4 max-w-[650px] text-sm sm:text-base leading-relaxed">
                  Administra collections, usuarios,
                  auditorías y bases desde un panel limpio,
                  moderno y optimizado.
                </p>
              </div>

              <div
                className="
                  flex items-center gap-3
                  px-5 py-3
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  shadow-sm
                "
              >
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <span className="text-sm font-medium text-slate-700">
                  Sistema activo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARDS PRINCIPALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
          {cards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                border border-slate-200/80
                bg-white/90
                backdrop-blur-xl
                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                p-6
                hover:-translate-y-1
                hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)]
                transition-all duration-300
              "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 opacity-0 group-hover:opacity-100 transition" />

              <div className="relative z-10">
                <div
                  className="
                    h-12 w-12 rounded-2xl
                    bg-slate-100
                    border border-slate-200
                    flex items-center justify-center
                    text-slate-700
                    shadow-sm
                  "
                >
                  {item.icon}
                </div>

                <h2 className="mt-5 text-lg font-semibold text-slate-900">
                  {item.title}
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="h-px flex-1 bg-slate-200" />

                  <div className="ml-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                    Abrir
                    <ArrowRight
                      size={15}
                      className="group-hover:translate-x-1 transition"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Accesos rápidos
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Herramientas importantes del sistema
              </p>
            </div>

            <Link
              href="/gestion/configuracion"
              className="
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-2xl
                border border-slate-200
                bg-white
                hover:bg-slate-50
                transition
                text-sm
                text-slate-700
                shadow-sm
              "
            >
              <Settings size={16} />
              Configuración
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
            {quickActions.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                className="
                  rounded-[28px]
                  border border-slate-200/80
                  bg-white
                  p-5
                  shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                  hover:-translate-y-1
                  hover:shadow-[0_14px_40px_rgba(15,23,42,0.07)]
                  transition-all duration-300
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      h-11 w-11 rounded-2xl
                      bg-slate-100
                      border border-slate-200
                      flex items-center justify-center
                      text-slate-700
                    "
                  >
                    {a.icon}
                  </div>

                  <ArrowRight
                    size={16}
                    className="text-slate-400"
                  />
                </div>

                <div className="mt-5">
                  <div className="font-semibold text-slate-900">
                    {a.title}
                  </div>

                  <div className="text-sm text-slate-500 mt-1">
                    {a.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ACTIVIDAD + RESUMEN */}
        <section className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* ACTIVIDAD */}
          <div
            className="
              xl:col-span-2
              rounded-[32px]
              border border-slate-200/80
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.05)]
              p-6
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Actividad reciente
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Últimos movimientos del sistema
                </p>
              </div>

              <Link
                href="/gestion/auditoria"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Ver todo →
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {recentActivity.map((it) => (
                <div
                  key={it.title}
                  className="
                    rounded-3xl
                    border border-slate-200
                    bg-slate-50/70
                    p-4
                    flex items-center gap-4
                    hover:bg-slate-50
                    transition
                  "
                >
                  <div
                    className="
                      h-12 w-12 rounded-2xl
                      bg-white
                      border border-slate-200
                      flex items-center justify-center
                      text-slate-700
                      shadow-sm
                    "
                  >
                    {it.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {it.title}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <Clock size={14} />
                      {it.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RESUMEN */}
          <div
            className="
              rounded-[32px]
              border border-slate-200/80
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.05)]
              p-6
            "
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Resumen
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Estado general del panel
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Database size={16} />
                  Bases
                </div>

                <span className="text-slate-400 font-medium">
                  —
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Folder size={16} />
                  Collections
                </div>

                <span className="text-slate-400 font-medium">
                  —
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <PieChart size={16} />
                  Reportes
                </div>

                <span className="text-slate-400 font-medium">
                  —
                </span>
              </div>
            </div>

            <div
              className="
                mt-6
                rounded-3xl
                border border-slate-200
                bg-gradient-to-br
                from-white
                to-slate-50
                p-5
              "
            >
              <div className="text-sm font-medium text-slate-700">
                Estado del sistema
              </div>

              <div className="mt-2 text-2xl font-semibold text-slate-900">
                Operativo
              </div>

              <div className="mt-2 text-sm text-slate-500 leading-relaxed">
                Todos los módulos principales están
                funcionando correctamente.
              </div>
            </div>
          </div>
        </section>

        {/* AYUDA */}
        <section className="mt-10">
          <div
            className="
              rounded-[32px]
              border border-slate-200/80
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.05)]
              p-6 sm:p-8
            "
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Centro de ayuda
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Accede a manuales, documentación y soporte
                  técnico del sistema.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/gestion/manual"
                  className="
                    px-5 py-3
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    hover:bg-slate-50
                    transition
                    flex items-center gap-2
                    text-sm font-medium text-slate-700
                  "
                >
                  <BookOpen size={16} />
                  Manual
                </Link>

                <Link
                  href="/gestion/soporte"
                  className="
                    px-5 py-3
                    rounded-2xl
                    bg-slate-900
                    hover:bg-black
                    transition
                    text-white
                    flex items-center gap-2
                    text-sm font-medium
                    shadow-lg
                  "
                >
                  <HelpCircle size={16} />
                  Soporte
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}