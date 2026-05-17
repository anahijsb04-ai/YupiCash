"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NewTemplateForm from "../components/NewTemplateForm";

/* =======================
  TIPOS
======================= */
type PlantillaDB = {
  id: number;
  cuenta_bancaria: string;
  subproducto: string;
  url: string;
  tipo: "rapida" | "personalizada";
  visual: "si" | "no";
};

type PlantillaUI = {
  id: number;
  numero_cuenta: string;
  subproducto: string;
  imagen_url: string;
  tipo: "rapida" | "personalizada";
  visual: "si" | "no";
};

type Lista = {
  id: number;
  nombre: string;
  tipo?: string;
};

type TipoPlantilla = "rapida" | "personalizada";

type ConfigState = {
  subproducto_lista_id: string;
  liga_pago_lista_id: string;
  metodo_pago_lista_id: string;
  producto_lista_id: string;
};

type SelectProps = {
  label: string;
  options: Lista[];
  value: string;
  onChange: (value: string) => void;
};

/* =======================
  HELPERS
======================= */
function normalizeListaArray(json: unknown): Lista[] {
  const source =
    Array.isArray(json)
      ? json
      : json &&
        typeof json === "object" &&
        Array.isArray((json as Record<string, unknown>).data)
      ? ((json as Record<string, unknown>).data as unknown[])
      : [];

  return source
    .map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;

      return {
        id: Number(obj.id ?? 0),
        nombre: String(obj.nombre ?? obj.label ?? "").trim(),
        tipo: String(obj.tipo ?? "").trim(),
      };
    })
    .filter((item) => item.id > 0 && item.nombre !== "");
}

function normalizeText(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function matchesTipo(
  lista: Lista,
  expected: "subproducto" | "liga_pago" | "metodo_pago" | "producto"
) {
  const tipo = normalizeText(lista.tipo ?? "");
  const nombre = normalizeText(lista.nombre ?? "");

  if (expected === "liga_pago") {
    return (
      tipo === "liga_pago" ||
      tipo === "cuenta_bancaria" ||
      nombre.includes("liga_pago") ||
      nombre.includes("cuenta_bancaria")
    );
  }

  return tipo === expected || nombre.includes(expected);
}

/* =======================
  COMPONENTE
======================= */
export default function TemplatesView() {
  const [plantillas, setPlantillas] = useState<PlantillaUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoPlantilla, setTipoPlantilla] =
    useState<TipoPlantilla>("rapida");

  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [creatingCustom, setCreatingCustom] = useState(false);

  const [subproductos, setSubproductos] = useState<Lista[]>([]);
  const [ligas, setLigas] = useState<Lista[]>([]);
  const [metodos, setMetodos] = useState<Lista[]>([]);
  const [productos, setProductos] = useState<Lista[]>([]);

  const [config, setConfig] = useState<ConfigState>({
    subproducto_lista_id: "",
    liga_pago_lista_id: "",
    metodo_pago_lista_id: "",
    producto_lista_id: "",
  });

  const canCreateCustom =
    !!nombrePlantilla.trim() &&
    !!config.subproducto_lista_id &&
    !!config.liga_pago_lista_id &&
    !!config.metodo_pago_lista_id &&
    !!config.producto_lista_id;

  const listasVacias =
    !subproductos.length &&
    !ligas.length &&
    !metodos.length &&
    !productos.length;

  /* =======================
    CARGAR PLANTILLAS
  ======================= */
  async function load() {
    try {
      setLoading(true);

      const res = await fetch("/api/plantillas", { cache: "no-store" });
      const json = await res.json();

      const arr = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];

      const mapped: PlantillaUI[] = (arr as PlantillaDB[]).map((p) => ({
        id: p.id,
        numero_cuenta: p.cuenta_bancaria,
        subproducto: p.subproducto,
        imagen_url: p.url,
        tipo: p.tipo,
        visual: p.visual,
      }));

      setPlantillas(mapped);
    } catch (error) {
      console.error("❌ Error cargando plantillas:", error);
      setPlantillas([]);
    } finally {
      setLoading(false);
    }
  }

  /* =======================
    CARGAR LISTAS
  ======================= */
  async function loadAllListas() {
    try {
      const res = await fetch("/api/listas", { cache: "no-store" });
      const json: unknown = await res.json().catch(() => []);

      if (!res.ok) {
        console.error("❌ Error cargando /api/listas:", json);
        setSubproductos([]);
        setLigas([]);
        setMetodos([]);
        setProductos([]);
        return;
      }

      const listas = normalizeListaArray(json);

      console.log("📦 LISTAS:", listas);

      const subproductosFiltrados = listas.filter((l) =>
        matchesTipo(l, "subproducto")
      );

      const ligasFiltradas = listas.filter((l) =>
        matchesTipo(l, "liga_pago")
      );

      const metodosFiltrados = listas.filter((l) =>
        matchesTipo(l, "metodo_pago")
      );

      const productosFiltrados = listas.filter((l) =>
        matchesTipo(l, "producto")
      );

      console.log("✅ subproductos:", subproductosFiltrados);
      console.log("✅ ligas:", ligasFiltradas);
      console.log("✅ metodos:", metodosFiltrados);
      console.log("✅ productos:", productosFiltrados);

      setSubproductos(subproductosFiltrados);
      setLigas(ligasFiltradas);
      setMetodos(metodosFiltrados);
      setProductos(productosFiltrados);
    } catch (error) {
      console.error("❌ Error cargando listas:", error);
      setSubproductos([]);
      setLigas([]);
      setMetodos([]);
      setProductos([]);
    }
  }

  useEffect(() => {
    load();
    loadAllListas();
  }, []);

  const subproductosOrdenados = useMemo(
    () => [...subproductos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [subproductos]
  );

  const ligasOrdenadas = useMemo(
    () => [...ligas].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [ligas]
  );

  const metodosOrdenados = useMemo(
    () => [...metodos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [metodos]
  );

  const productosOrdenados = useMemo(
    () => [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [productos]
  );

  /* =======================
    CREAR PERSONALIZADA
  ======================= */
  async function createCustomTemplate() {
    if (!canCreateCustom) {
      alert(
        "Debes completar todos los campos para crear la plantilla personalizada."
      );
      return;
    }

    setCreatingCustom(true);

    try {
      const res = await fetch("/api/plantillas-personalizadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuenta_bancaria: "0000000000",
          subproducto: nombrePlantilla,
          url: "/plantillas/custom/default.png",
          tipo: "personalizada",
          visual: "no",
        }),
      });

      const plantilla = await res.json();

      if (!res.ok) {
        throw new Error(plantilla?.error || "No se pudo crear la plantilla");
      }

      const resConfig = await fetch("/api/plantillas-personalizadas/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantilla_id: plantilla.id,
          ...config,
        }),
      });

      const configJson = await resConfig.json().catch(() => ({}));

      if (!resConfig.ok) {
        throw new Error(
          (configJson as { error?: string })?.error ||
            "No se pudo guardar la configuración"
        );
      }

      setNombrePlantilla("");
      setConfig({
        subproducto_lista_id: "",
        liga_pago_lista_id: "",
        metodo_pago_lista_id: "",
        producto_lista_id: "",
      });

      load();
    } catch (error) {
      console.error("❌ Error creando plantilla personalizada:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error creando plantilla personalizada"
      );
    } finally {
      setCreatingCustom(false);
    }
  }

  /* =======================
    TOGGLE VISUAL
  ======================= */
  async function toggleVisual(id: number, actual: "si" | "no") {
    await fetch(`/api/plantillas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visual: actual === "si" ? "no" : "si",
      }),
    });

    load();
  }

  /* =======================
    ELIMINAR
  ======================= */
  async function deleteTemplate(id: number) {
    if (!confirm("¿Eliminar plantilla?")) return;

    await fetch(`/api/plantillas/${id}`, { method: "DELETE" });
    load();
  }

  /* =======================
    RENDER
  ======================= */
  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Nueva plantilla</h2>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setTipoPlantilla("rapida")}
              className={`px-4 py-2 rounded-xl ${
                tipoPlantilla === "rapida"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-200"
              }`}
            >
              Plantilla rápida
            </button>

            <button
              onClick={() => setTipoPlantilla("personalizada")}
              className={`px-4 py-2 rounded-xl ${
                tipoPlantilla === "personalizada"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-200"
              }`}
            >
              Plantilla personalizada
            </button>
          </div>

          {tipoPlantilla === "rapida" && <NewTemplateForm onCreated={load} />}

          {tipoPlantilla === "personalizada" && (
            <div className="space-y-4">
              <input
                value={nombrePlantilla}
                onChange={(e) => setNombrePlantilla(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Ej: Multa VIP"
              />

              <Select
                label="Subproducto"
                options={subproductosOrdenados}
                value={config.subproducto_lista_id}
                onChange={(v) =>
                  setConfig({ ...config, subproducto_lista_id: v })
                }
              />

              <Select
                label="Liga de pago"
                options={ligasOrdenadas}
                value={config.liga_pago_lista_id}
                onChange={(v) =>
                  setConfig({ ...config, liga_pago_lista_id: v })
                }
              />

              <Select
                label="Método de pago"
                options={metodosOrdenados}
                value={config.metodo_pago_lista_id}
                onChange={(v) =>
                  setConfig({ ...config, metodo_pago_lista_id: v })
                }
              />

              <Select
                label="Producto"
                options={productosOrdenados}
                value={config.producto_lista_id}
                onChange={(v) =>
                  setConfig({ ...config, producto_lista_id: v })
                }
              />

              {listasVacias && (
                <div className="text-sm text-red-600">
                  No se cargaron listas desde <b>/api/listas</b>.
                </div>
              )}

              <button
                onClick={createCustomTemplate}
                disabled={!canCreateCustom || creatingCustom}
                className={`w-full px-4 py-2 rounded-xl text-white ${
                  canCreateCustom && !creatingCustom
                    ? "bg-violet-600"
                    : "bg-violet-300 cursor-not-allowed"
                }`}
              >
                {creatingCustom
                  ? "Creando..."
                  : "Crear plantilla personalizada"}
              </button>

              {!canCreateCustom && (
                <div className="text-sm text-slate-600">
                  Completa nombre + las 4 listas para poder crear la plantilla
                  personalizada.
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Plantillas existentes
          </h2>

          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="space-y-4">
              {plantillas.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-4 bg-white border rounded-3xl"
                >
                  <img
                    src={p.imagen_url}
                    className="w-20 h-20 rounded-xl object-cover"
                    alt={p.subproducto}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{p.subproducto}</div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          p.tipo === "rapida"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-violet-50 text-violet-700 border-violet-200"
                        }`}
                      >
                        {p.tipo === "rapida" ? "Rápida" : "Personalizada"}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600">
                      {p.numero_cuenta}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={
                        p.tipo === "personalizada"
                          ? `/gestion/multas/plantillas/personalizada/${p.id}`
                          : `/gestion/multas/plantillas/${p.id}`
                      }
                      className="px-3 py-2 bg-sky-600 text-white rounded-xl text-sm text-center"
                    >
                      Ver
                    </Link>

                    <button
                      onClick={() => toggleVisual(p.id, p.visual)}
                      className="px-3 py-2 bg-slate-700 text-white rounded-xl text-sm"
                    >
                      {p.visual === "si" ? "Deshabilitar" : "Habilitar"}
                    </button>

                    <button
                      onClick={() => deleteTemplate(p.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-xl text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================
  SELECT REUTILIZABLE
======================= */
function Select({ label, options, value, onChange }: SelectProps) {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl"
      >
        <option value="">Seleccionar</option>
        {safeOptions.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.nombre}
          </option>
        ))}
      </select>
    </div>
  );
} 