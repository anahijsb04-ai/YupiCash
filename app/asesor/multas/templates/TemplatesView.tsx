  "use client";

  import React, { useEffect, useState } from "react";
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
    COMPONENTE
  ======================= */
  export default function TemplatesView() {
    const [plantillas, setPlantillas] = useState<PlantillaUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [tipoPlantilla, setTipoPlantilla] = useState<TipoPlantilla>("rapida");

    const [nombrePlantilla, setNombrePlantilla] = useState("");
    const [creatingCustom, setCreatingCustom] = useState(false);

    /* LISTAS */
    const [subproductos, setSubproductos] = useState<Lista[]>([]);
    const [ligas, setLigas] = useState<Lista[]>([]);
    const [metodos, setMetodos] = useState<Lista[]>([]);
    const [productos, setProductos] = useState<Lista[]>([]);

    /* CONFIG SELECCIONADA */
    const [config, setConfig] = useState<ConfigState>({
      subproducto_lista_id: "",
      liga_pago_lista_id: "",
      metodo_pago_lista_id: "",
      producto_lista_id: "",
    });

    // ✅ VALIDACIÓN: todos los campos requeridos para "personalizada"
    const canCreateCustom =
      !!nombrePlantilla.trim() &&
      !!config.subproducto_lista_id &&
      !!config.liga_pago_lista_id &&
      !!config.metodo_pago_lista_id &&
      !!config.producto_lista_id;

    /* =======================
      CARGAR PLANTILLAS
    ======================= */
    async function load() {
      setLoading(true);

      const res = await fetch("/api/plantillas", { cache: "no-store" });
      const json = await res.json();

      const mapped: PlantillaUI[] = (json as PlantillaDB[]).map((p) => ({
        id: p.id,
        numero_cuenta: p.cuenta_bancaria,
        subproducto: p.subproducto,
        imagen_url: p.url,
        tipo: p.tipo,
        visual: p.visual,
      }));

      setPlantillas(mapped);
      setLoading(false);
    }

    /* =======================
      CARGAR LISTAS
    ======================= */
    async function loadListas(tipo: string, setter: React.Dispatch<React.SetStateAction<Lista[]>>) {
      const res = await fetch(`/api/listas/tipo/${tipo}`, { cache: "no-store" });
      const data = (await res.json()) as Lista[];
      setter(data);
    }

    useEffect(() => {
      load();
      loadListas("subproducto", setSubproductos);
      loadListas("liga_pago", setLigas);
      loadListas("metodo_pago", setMetodos);
      loadListas("producto", setProductos);
    }, []);

    /* =======================
      CREAR PERSONALIZADA
    ======================= */
    async function createCustomTemplate() {
      if (!canCreateCustom) {
        alert("Debes completar todos los campos para crear la plantilla personalizada.");
        return;
      }

      setCreatingCustom(true);

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

      if (res.ok) {
        await fetch("/api/plantillas-personalizadas/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plantilla_id: plantilla.id,
            ...config,
          }),
        });

        setNombrePlantilla("");
        setConfig({
          subproducto_lista_id: "",
          liga_pago_lista_id: "",
          metodo_pago_lista_id: "",
          producto_lista_id: "",
        });

        load();
      }

      setCreatingCustom(false);
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
          {/* ================= CREAR ================= */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Nueva plantilla</h2>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setTipoPlantilla("rapida")}
                className={`px-4 py-2 rounded-xl ${
                  tipoPlantilla === "rapida" ? "bg-sky-600 text-white" : "bg-slate-200"
                }`}
              >
                Plantilla rápida
              </button>

              <button
                onClick={() => setTipoPlantilla("personalizada")}
                className={`px-4 py-2 rounded-xl ${
                  tipoPlantilla === "personalizada" ? "bg-violet-600 text-white" : "bg-slate-200"
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
                  options={subproductos}
                  value={config.subproducto_lista_id}
                  onChange={(v) => setConfig({ ...config, subproducto_lista_id: v })}
                />

                <Select
                  label="Liga de pago"
                  options={ligas}
                  value={config.liga_pago_lista_id}
                  onChange={(v) => setConfig({ ...config, liga_pago_lista_id: v })}
                />

                <Select
                  label="Método de pago"
                  options={metodos}
                  value={config.metodo_pago_lista_id}
                  onChange={(v) => setConfig({ ...config, metodo_pago_lista_id: v })}
                />

                <Select
                  label="Producto"
                  options={productos}
                  value={config.producto_lista_id}
                  onChange={(v) => setConfig({ ...config, producto_lista_id: v })}
                />

                <button
                  onClick={createCustomTemplate}
                  disabled={!canCreateCustom || creatingCustom}
                  className={`w-full px-4 py-2 rounded-xl text-white ${
                    canCreateCustom && !creatingCustom
                      ? "bg-violet-600"
                      : "bg-violet-300 cursor-not-allowed"
                  }`}
                >
                  {creatingCustom ? "Creando..." : "Crear plantilla personalizada"}
                </button>

                {!canCreateCustom && (
                  <div className="text-sm text-slate-600">
                    Completa nombre + las 4 listas para poder crear la plantilla personalizada.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= LISTADO ================= */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Plantillas existentes</h2>

            {loading ? (
              <p>Cargando...</p>
            ) : (
              <div className="space-y-4">
                {plantillas.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-white border rounded-3xl">
                    <img src={p.imagen_url} className="w-20 h-20 rounded-xl object-cover" />

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

                      <div className="text-sm text-slate-600">{p.numero_cuenta}</div>
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
    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-xl"
        >
          <option value="">Seleccionar</option>
          {options.map((o) => (
            <option key={o.id} value={String(o.id)}>
              {o.nombre}
            </option>
          ))}
        </select>
      </div>
    );
  }
