"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCcw,
  Settings,
  Palette,
  User,
  LayoutDashboard,
  FolderKanban,
} from "lucide-react";

type SidebarTheme =
  | "principal"
  | "oscuro"
  | "cafe"
  | "aurora"
  | "bosque"
  | "atardecer"
  | "negro";

type ThemeMeta = {
  id: SidebarTheme;
  name: string;
  dot: string; // bolita en selector
};

const THEME_LIST: ThemeMeta[] = [
  { id: "principal", name: "Celeste", dot: "bg-sky-500" },
  { id: "cafe", name: "Café", dot: "bg-amber-700" },
  { id: "aurora", name: "Aurora", dot: "bg-cyan-500" },
  { id: "bosque", name: "Bosque", dot: "bg-emerald-500" },
  { id: "atardecer", name: "Atardecer", dot: "bg-rose-500" },
  { id: "oscuro", name: "Oscuro", dot: "bg-slate-800" },
  { id: "negro", name: "Negro glass", dot: "bg-black" },
];

export default function AsesorSidebar({ onRefresh }: { onRefresh?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(true);

  const [panelSesion, setPanelSesion] = useState(false);
  const [panelDiseno, setPanelDiseno] = useState(false);

  const [user, setUser] = useState("");
  const [themeId, setThemeId] = useState<SidebarTheme>("principal");

  // ✅ Estilos por tema (los que me pasaste) + negro transparente
  const styles = useMemo(() => {
    const principal = {
      shell:
        "bg-gradient-to-b from-sky-100/70 to-stone-100/60 backdrop-blur-xl text-slate-800 border-sky-200/40",
      brand: "text-slate-900",
      item: "hover:bg-sky-200/40 hover:shadow-sm text-slate-700",
      itemActive: "bg-white/70 shadow-md text-slate-900",
      divider: "border-sky-200/40",
      subtle: "text-slate-500",
      panel: "bg-white/60 backdrop-blur-xl border-sky-200/40 shadow-lg",
      tab: "bg-white/40 hover:bg-white/60 border-sky-200/40 text-slate-600",
      tabActive: "bg-white/80 border-sky-300/50 text-slate-900 shadow",
      button:
        "bg-gradient-to-r from-amber-700 to-stone-700 text-white hover:from-amber-800 hover:to-stone-800",
      ghost: "hover:bg-sky-200/30",
      iconBox: "bg-white/60 border-sky-200/40 shadow-sm",
      iconBoxHover: "hover:bg-white/80",
      card: "bg-white/50 border-sky-200/40",
    };

    const oscuro = {
      shell: "bg-slate-950/60 backdrop-blur-xl text-slate-100 border-white/10",
      brand: "text-white",
      item: "hover:bg-white/10 text-slate-100/90",
      itemActive: "bg-white/10 text-white",
      divider: "border-white/10",
      subtle: "text-slate-100/60",
      panel: "bg-white/5 border-white/10 backdrop-blur-xl",
      tab: "bg-white/5 hover:bg-white/10 border-white/10 text-slate-100/80",
      tabActive: "bg-white/10 border-white/10 text-white",
      button: "bg-white text-slate-950 hover:bg-slate-100",
      ghost: "hover:bg-white/10",
      iconBox: "bg-white/10 border-white/10",
      iconBoxHover: "hover:bg-white/15",
      card: "bg-white/5 border-white/10",
    };

    const cafe = {
      shell:
        "bg-gradient-to-b from-amber-50/70 to-stone-100/60 backdrop-blur-xl text-stone-800 border-amber-200/40",
      brand: "text-stone-900",
      item: "hover:bg-amber-200/35 hover:shadow-sm text-stone-700",
      itemActive: "bg-white/70 shadow-md text-stone-900",
      divider: "border-amber-200/40",
      subtle: "text-stone-500",
      panel: "bg-white/60 backdrop-blur-xl border-amber-200/40 shadow-lg",
      tab: "bg-white/40 hover:bg-white/60 border-amber-200/40 text-stone-600",
      tabActive: "bg-white/80 border-amber-300/50 text-stone-900 shadow",
      button:
        "bg-gradient-to-r from-stone-800 to-amber-800 text-white hover:from-stone-900 hover:to-amber-900",
      ghost: "hover:bg-amber-200/25",
      iconBox: "bg-white/60 border-amber-200/40 shadow-sm",
      iconBoxHover: "hover:bg-white/80",
      card: "bg-white/50 border-amber-200/40",
    };

    const aurora = {
      shell:
        "bg-gradient-to-b from-cyan-100/70 to-indigo-100/55 backdrop-blur-xl text-slate-800 border-cyan-200/40",
      brand: "text-slate-900",
      item: "hover:bg-cyan-200/35 hover:shadow-sm text-slate-700",
      itemActive: "bg-white/70 shadow-md text-slate-900",
      divider: "border-cyan-200/40",
      subtle: "text-slate-500",
      panel: "bg-white/60 backdrop-blur-xl border-cyan-200/40 shadow-lg",
      tab: "bg-white/40 hover:bg-white/60 border-cyan-200/40 text-slate-600",
      tabActive: "bg-white/80 border-cyan-300/50 text-slate-900 shadow",
      button:
        "bg-gradient-to-r from-indigo-700 to-cyan-700 text-white hover:from-indigo-800 hover:to-cyan-800",
      ghost: "hover:bg-cyan-200/25",
      iconBox: "bg-white/60 border-cyan-200/40 shadow-sm",
      iconBoxHover: "hover:bg-white/80",
      card: "bg-white/50 border-cyan-200/40",
    };

    const bosque = {
      shell:
        "bg-gradient-to-b from-emerald-50/75 to-lime-50/60 backdrop-blur-xl text-slate-800 border-emerald-200/40",
      brand: "text-slate-900",
      item: "hover:bg-emerald-200/30 hover:shadow-sm text-slate-700",
      itemActive: "bg-white/70 shadow-md text-slate-900",
      divider: "border-emerald-200/40",
      subtle: "text-slate-500",
      panel: "bg-white/60 backdrop-blur-xl border-emerald-200/40 shadow-lg",
      tab: "bg-white/40 hover:bg-white/60 border-emerald-200/40 text-slate-600",
      tabActive: "bg-white/80 border-emerald-300/50 text-slate-900 shadow",
      button:
        "bg-gradient-to-r from-emerald-700 to-lime-700 text-white hover:from-emerald-800 hover:to-lime-800",
      ghost: "hover:bg-emerald-200/25",
      iconBox: "bg-white/60 border-emerald-200/40 shadow-sm",
      iconBoxHover: "hover:bg-white/80",
      card: "bg-white/50 border-emerald-200/40",
    };

    const atardecer = {
      shell:
        "bg-gradient-to-b from-rose-50/75 to-amber-50/60 backdrop-blur-xl text-slate-800 border-rose-200/40",
      brand: "text-slate-900",
      item: "hover:bg-rose-200/30 hover:shadow-sm text-slate-700",
      itemActive: "bg-white/70 shadow-md text-slate-900",
      divider: "border-rose-200/40",
      subtle: "text-slate-500",
      panel: "bg-white/60 backdrop-blur-xl border-rose-200/40 shadow-lg",
      tab: "bg-white/40 hover:bg-white/60 border-rose-200/40 text-slate-600",
      tabActive: "bg-white/80 border-rose-300/50 text-slate-900 shadow",
      button:
        "bg-gradient-to-r from-rose-700 to-amber-700 text-white hover:from-rose-800 hover:to-amber-800",
      ghost: "hover:bg-rose-200/25",
      iconBox: "bg-white/60 border-rose-200/40 shadow-sm",
      iconBoxHover: "hover:bg-white/80",
      card: "bg-white/50 border-rose-200/40",
    };

    // ✅ Nuevo: negro transparente (glass negro)
    const negro = {
      shell:
        "bg-black/40 backdrop-blur-xl text-white border-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.35)]",
      brand: "text-white",
      item: "hover:bg-white/10 hover:shadow-sm text-white/90",
      itemActive: "bg-white/10 shadow-md text-white",
      divider: "border-white/10",
      subtle: "text-white/60",
      panel: "bg-black/35 backdrop-blur-xl border-white/10 shadow-lg",
      tab: "bg-white/5 hover:bg-white/10 border-white/10 text-white/70",
      tabActive: "bg-white/10 border-white/15 text-white shadow",
      button:
        "bg-gradient-to-r from-slate-900 to-sky-800 text-white hover:from-black hover:to-sky-900",
      ghost: "hover:bg-white/10",
      iconBox: "bg-white/10 border-white/10 shadow-sm",
      iconBoxHover: "hover:bg-white/15",
      card: "bg-white/5 border-white/10",
    };

    const map: Record<SidebarTheme, any> = {
      principal,
      oscuro,
      cafe,
      aurora,
      bosque,
      atardecer,
      negro,
    };

    return map[themeId];
  }, [themeId]);

  // cargar username + theme
  useEffect(() => {
    const loggedUser = localStorage.getItem("username") || "Asesor";
    setUser(loggedUser);

    const saved = localStorage.getItem("asesor_theme_v2") as SidebarTheme | null;
    if (saved && THEME_LIST.some((t) => t.id === saved)) setThemeId(saved);
  }, []);

  // guardar theme
  useEffect(() => {
    localStorage.setItem("asesor_theme_v2", themeId);
  }, [themeId]);

  // exponer ancho para layout
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", open ? "280px" : "88px");
  }, [open]);

  // cerrar paneles al colapsar
  useEffect(() => {
    if (!open) {
      setPanelSesion(false);
      setPanelDiseno(false);
    }
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/");
  };

  const dot = (id: SidebarTheme) => THEME_LIST.find((t) => t.id === id)?.dot ?? "bg-sky-500";
  const themeName = THEME_LIST.find((t) => t.id === themeId)?.name ?? "Tema";

  // ✅ helper para “active”
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navBtnClass = (active: boolean) =>
    [
      "w-full px-4 py-3 rounded-2xl border transition inline-flex items-center justify-center gap-2",
      active ? styles.tabActive : styles.tab,
    ].join(" ");

  return (
    <aside
      className={[
        "fixed left-0 top-0 h-screen z-[9999] isolate",
        open ? "w-[280px]" : "w-[88px]",
        "transition-[width] duration-300",
        "border-r",
        styles.shell,
      ].join(" ")}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={[
              "h-10 w-10 rounded-2xl border flex items-center justify-center font-semibold",
              styles.iconBox,
              styles.brand,
            ].join(" ")}
          >
            A
          </div>

          {open && (
            <div className="min-w-0">
              <div className={["font-semibold leading-5 truncate", styles.brand].join(" ")}>
                Asesor
              </div>
              <div className={["text-xs truncate", styles.subtle].join(" ")}>
                Panel de trabajo
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={[
            "h-10 w-10 rounded-2xl border flex items-center justify-center transition",
            styles.iconBox,
            styles.iconBoxHover,
          ].join(" ")}
          type="button"
          aria-label="Toggle sidebar"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <div className={["mx-4 border-t", styles.divider].join(" ")} />

      <div className="p-4 space-y-3">
        {/* Usuario */}
        <div className={["rounded-3xl border shadow-sm p-4", styles.card].join(" ")}>
          <div className="flex items-center gap-3">
            <div
              className={[
                "h-10 w-10 rounded-2xl border flex items-center justify-center",
                styles.iconBox,
              ].join(" ")}
            >
              <User size={18} />
            </div>

            {open && (
              <div className="min-w-0">
                <div className={["font-semibold truncate", styles.brand].join(" ")}>
                  {user}
                </div>
                <div className={["text-xs", styles.subtle].join(" ")}>Sesión activa</div>
              </div>
            )}
          </div>

          {open && (
            <div className={["mt-3 text-xs", styles.subtle].join(" ")}>
              Tema: <b className={styles.brand}>{themeName}</b>
            </div>
          )}
        </div>

        {/* ✅ Navegación 
        <button
          onClick={() => router.push("/asesor/dashboard")}
          className={navBtnClass(isActive("/asesor/dashboard"))}
          type="button"
          title={!open ? "Dashboard" : undefined}
        >
          <LayoutDashboard size={18} />
          {open && "Dashboard"}
        </button>
        */}
        <button
          onClick={() => router.push("/asesor/collection/casos")}
          className={navBtnClass(isActive("/asesor/collection/casos"))}
          type="button"
          title={!open ? "Collection / Casos" : undefined}
        >
          <FolderKanban size={18} />
          {open && "Collection / Casos"}
        </button>

        {/* Refrescar */}
        <button
          onClick={onRefresh ?? (() => router.refresh())}
          className={[
            "w-full px-4 py-3 rounded-2xl border transition inline-flex items-center justify-center gap-2",
            styles.tab,
          ].join(" ")}
          type="button"
          title={!open ? "Refrescar" : undefined}
        >
          <RefreshCcw size={18} />
          {open && "Refrescar"}
        </button>

        {/* Paneles */}
        <div className={["rounded-3xl border shadow-sm overflow-hidden", styles.card].join(" ")}>
          {/* Sesión */}
          <button
            onClick={() => {
              if (!open) return;
              setPanelSesion((v) => !v);
              setPanelDiseno(false);
            }}
            className={[
              "w-full px-4 py-3 flex items-center justify-between font-medium transition",
              styles.ghost,
            ].join(" ")}
            type="button"
          >
            <span className="flex items-center gap-2">
              <Settings size={18} />
              {open && "Sesión"}
            </span>
            {open && <span className={styles.subtle}>{panelSesion ? "–" : "+"}</span>}
          </button>

          {open && panelSesion && (
            <div className="px-4 pb-4">
              <div className={["text-xs mb-2", styles.subtle].join(" ")}>
                Opciones de sesión
              </div>
              <button
                onClick={handleLogout}
                className={[
                  "w-full px-4 py-3 rounded-2xl font-semibold transition inline-flex items-center justify-center gap-2",
                  styles.button,
                ].join(" ")}
                type="button"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          )}

          <div className={["mx-4 border-t", styles.divider].join(" ")} />

          {/* Diseño */}
          <button
            onClick={() => {
              if (!open) return;
              setPanelDiseno((v) => !v);
              setPanelSesion(false);
            }}
            className={[
              "w-full px-4 py-3 flex items-center justify-between font-medium transition",
              styles.ghost,
            ].join(" ")}
            type="button"
          >
            <span className="flex items-center gap-2">
              <Palette size={18} />
              {open && "Diseño"}
            </span>
            {open && <span className={styles.subtle}>{panelDiseno ? "–" : "+"}</span>}
          </button>

          {open && panelDiseno && (
            <div className="px-4 pb-4">
              <div className={["text-xs mb-3", styles.subtle].join(" ")}>Colores (glass)</div>

              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2">
                {THEME_LIST.map((t) => {
                  const active = t.id === themeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      className={[
                        "w-full px-3 py-3 rounded-2xl border transition flex items-center justify-between gap-3",
                        active ? styles.tabActive : styles.tab,
                      ].join(" ")}
                      type="button"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span
                          className={["h-3.5 w-3.5 rounded-full shadow-sm", dot(t.id)].join(" ")}
                        />
                        <span className="text-sm font-medium truncate">{t.name}</span>
                      </span>
                      <span className={["text-xs", styles.subtle].join(" ")}>
                        {active ? "Activo" : "Elegir"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={["mt-3 text-[11px]", styles.subtle].join(" ")}>
                Tip: el tema se guarda en el navegador.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={["text-xs text-center", styles.subtle].join(" ")}>
          © {new Date().getFullYear()} Gestión
        </div>
      </div>
    </aside>
  );
}
