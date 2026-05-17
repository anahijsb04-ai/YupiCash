"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  LogOut,
  Settings,
  Palette,
  UserCog,
  Folder,
  ChevronDown,
  Database,
  UserRound,
  BarChart3,
  Briefcase,
  AppWindow,
  Menu,
  X,
  Sparkles,
  Search,
} from "lucide-react";

type SidebarTheme = "light";
type SettingsTab = "sesion" | "diseno";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTab>("sesion");
  const [collectionOpen, setCollectionOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setSettingsOpen(false);
      setCollectionOpen(false);
    }
  }, [open]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (!res.ok) return;

      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const isCollectionRoute = useMemo(() => {
    if (!pathname) return false;

    return pathname.startsWith("/gestion/collection");
  }, [pathname]);

  useEffect(() => {
    if (open && isCollectionRoute) {
      setCollectionOpen(true);
    }
  }, [open, isCollectionRoute]);

  return (
    <>
      {/* BOTON */}
      <button
        onClick={() => setOpen(true)}
        className={[
          "fixed left-4 top-4 z-[10000]",
          "h-12 w-12 rounded-2xl",
          "bg-white border border-slate-200",
          "shadow-[0_8px_30px_rgba(15,23,42,0.08)]",
          "flex items-center justify-center",
          "text-slate-700",
          "transition-all duration-300",
          "hover:bg-slate-50",
          open
            ? "opacity-0 pointer-events-none"
            : "opacity-100",
        ].join(" ")}
      >
        <Menu size={22} />
      </button>

      {/* OVERLAY */}
      <div
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-[9997]",
          "bg-slate-900/30 backdrop-blur-[2px]",
          "transition-all duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed left-0 top-0 z-[9999]",
          "h-screen w-[300px] max-w-[88vw]",
          "bg-white/95 backdrop-blur-2xl",
          "border-r border-slate-200",
          "shadow-[0_20px_60px_rgba(15,23,42,0.10)]",
          "transition-all duration-300",
          "flex flex-col",
          open
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        {/* HEADER */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="
                  h-11 w-11 rounded-2xl
                  bg-slate-900
                  text-white
                  flex items-center justify-center
                  shadow-lg
                  shrink-0
                "
              >
                <Sparkles size={18} />
              </div>

              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate">
                  Gestión
                </div>

                <div className="text-xs text-slate-500 mt-0.5">
                  Dashboard
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="
                h-10 w-10 rounded-2xl
                border border-slate-200
                bg-white
                flex items-center justify-center
                text-slate-700
                hover:bg-slate-50
                transition
              "
            >
              <X size={18} />
            </button>
          </div>

          {/* SEARCH */}
          <div
            className="
              mt-5
              flex items-center gap-3
              rounded-2xl
              border border-slate-200
              bg-slate-50
              px-4 py-3
            "
          >
            <Search size={18} className="text-slate-400" />

            <input
              placeholder="Buscar..."
              className="
                bg-transparent
                outline-none
                text-sm
                flex-1
                text-slate-700
                placeholder:text-slate-400
              "
            />
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            <NavItem
              href="/gestion"
              icon={<Home size={19} />}
              label="Inicio"
              active={pathname === "/gestion"}
              onNavigate={() => setOpen(false)}
            />

            <NavItem
              href="/gestion/reportes"
              icon={<BarChart3 size={19} />}
              label="Reportes"
              active={pathname === "/gestion/reportes"}
              onNavigate={() => setOpen(false)}
            />

            {/* COLLECTION */}
            <div>
              <button
                onClick={() =>
                  setCollectionOpen((v) => !v)
                }
                className={[
                  "w-full",
                  "flex items-center gap-3",
                  "px-4 py-3 rounded-2xl",
                  "transition-all duration-300",
                  isCollectionRoute
                    ? "bg-slate-900 text-white shadow-lg"
                    : "hover:bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                <Folder size={19} />

                <span className="flex-1 text-left text-sm font-medium">
                  Collection
                </span>

                <ChevronDown
                  size={16}
                  className={[
                    "transition",
                    collectionOpen
                      ? "rotate-180"
                      : "",
                  ].join(" ")}
                />
              </button>

              <div
                className={[
                  "overflow-hidden transition-all duration-300",
                  collectionOpen
                    ? "max-h-40 opacity-100 mt-2"
                    : "max-h-0 opacity-0",
                ].join(" ")}
              >
                <div
                  className="
                    ml-4
                    pl-4
                    border-l border-slate-200
                    space-y-1
                  "
                >
                  <SubItem
                    href="/gestion/collection/casos"
                    icon={<Briefcase size={16} />}
                    label="Casos"
                    active={
                      pathname ===
                      "/gestion/collection/casos"
                    }
                    onNavigate={() => setOpen(false)}
                  />

                  <SubItem
                    href="/gestion/collection/aplicaciones"
                    icon={<AppWindow size={16} />}
                    label="Aplicaciones"
                    active={
                      pathname ===
                      "/gestion/collection/aplicaciones"
                    }
                    onNavigate={() => setOpen(false)}
                  />
                </div>
              </div>
            </div>

            <NavItem
              href="/gestion/base"
              icon={<Database size={19} />}
              label="Ligas"
              active={pathname === "/gestion/base"}
              onNavigate={() => setOpen(false)}
            />

            <NavItem
              href="/gestion/usuarios"
              icon={<UserRound size={19} />}
              label="Usuarios"
              active={pathname === "/gestion/usuarios"}
              onNavigate={() => setOpen(false)}
            />

            <NavItem
              href="/gestion/base-datos"
              icon={<FileText size={19} />}
              label="Base de datos"
              active={
                pathname === "/gestion/base-datos"
              }
              onNavigate={() => setOpen(false)}
            />
          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() =>
              setSettingsOpen((v) => !v)
            }
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              rounded-2xl
              border border-slate-200
              bg-white
              hover:bg-slate-50
              transition
              text-slate-700
            "
          >
            <Settings size={18} />

            <span className="flex-1 text-left text-sm font-medium">
              Ajustes
            </span>
          </button>

          {settingsOpen && (
            <div
              className="
                mt-3
                rounded-3xl
                border border-slate-200
                bg-slate-50/80
                p-3
              "
            >
              {/* TABS */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("sesion")}
                  className={[
                    "flex-1 px-3 py-2 rounded-xl text-sm font-medium transition",
                    tab === "sesion"
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Sesión
                </button>

                <button
                  onClick={() => setTab("diseno")}
                  className={[
                    "flex-1 px-3 py-2 rounded-xl text-sm font-medium transition",
                    tab === "diseno"
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Diseño
                </button>
              </div>

              <div className="mt-3">
                {tab === "sesion" ? (
                  <div className="space-y-2">
                    <Link
                      href="/"
                      onClick={() =>
                        setOpen(false)
                      }
                      className="
                        flex items-center gap-3
                        px-4 py-3 rounded-2xl
                        bg-white
                        border border-slate-200
                        hover:bg-slate-50
                        transition
                        text-slate-700
                      "
                    >
                      <UserCog size={17} />
                      <span className="text-sm font-medium">
                        Cambiar sesión
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="
                        w-full
                        flex items-center gap-3
                        px-4 py-3
                        rounded-2xl
                        bg-slate-900
                        hover:bg-black
                        transition
                        text-white
                      "
                    >
                      <LogOut size={17} />

                      <span className="text-sm font-semibold">
                        Cerrar sesión
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      className="
                        w-full
                        flex items-center gap-3
                        px-4 py-3
                        rounded-2xl
                        bg-slate-900
                        text-white
                      "
                    >
                      <Palette size={17} />

                      <span className="text-sm font-medium">
                        Tema claro activo
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex items-center gap-3",
        "px-4 py-3 rounded-2xl",
        "transition-all duration-300",
        active
          ? "bg-slate-900 text-white shadow-lg"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {icon}

      <span className="text-sm font-medium">
        {label}
      </span>
    </Link>
  );
}

function SubItem({
  href,
  icon,
  label,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex items-center gap-2",
        "px-3 py-2 rounded-xl",
        "transition text-sm",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100",
      ].join(" ")}
    >
      {icon}

      <span className="font-medium">
        {label}
      </span>
    </Link>
  );
}