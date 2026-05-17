"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type AnyRecord = Record<string, unknown>;

export default function PagoFastCashForm({
  data = {},
}: {
  data?: AnyRecord;
}) {
  // =========================
  // Helpers
  // =========================
  const isHex = (s: unknown): boolean => /^#([0-9A-Fa-f]{6})$/.test(String(s ?? ""));

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const normalizeUrl = (u: unknown): string | null => {

    if (!u) return null;
    let s = String(u).trim().replaceAll("\\", "/");

    if (/^https?:\/\//i.test(s)) return s;

    if (s.startsWith("public/uploads/")) s = s.replace("public/", "");
    if (s.startsWith("uploads/")) s = `/${s}`;

    if (s.startsWith("/")) return origin ? `${origin}${s}` : s;

    return origin ? `${origin}/${s}` : s;
  };

  const mergeDefined = (base: AnyRecord, override?: AnyRecord): AnyRecord => {
    const out: AnyRecord = { ...base };
    for (const [k, v] of Object.entries(override ?? {})) {
      if (v !== undefined && v !== null && v !== "") out[k] = v;
    }
    return out;
  };

  // =========================
  // 1) ID: primero del URL, luego del prop data
  // =========================
  const params = useParams();
  const idFromUrl = (params as { id?: string | string[] } | null)?.id
    ? String((params as { id?: string | string[] }).id)
    : null;

  const idFromData =
    (data?.["plantilla_pago_id"] as string | number | undefined) ??
    (data?.["plantillas_pago_id"] as string | number | undefined) ??
    (data?.["plantilla_id"] as string | number | undefined) ??
    (data?.["id_plantilla"] as string | number | undefined) ??
    (data?.["plantillaPagoId"] as string | number | undefined) ??
    (data?.["plantillaId"] as string | number | undefined) ??
    (data?.["id"] as string | number | undefined) ??
    null;

  const plantillaId = idFromUrl ?? (idFromData ? String(idFromData) : null);

  // =========================
  // 2) Traer plantilla desde BD por ID
  // =========================
  const [plantillaBD, setPlantillaBD] = useState<AnyRecord | null>(null);
  const [loadingPlantilla, setLoadingPlantilla] = useState<boolean>(true);
  const [errorPlantilla, setErrorPlantilla] = useState<string>("");

  useEffect(() => {
    let cancel = false;

    async function fetchPlantilla() {
      setLoadingPlantilla(true);
      setErrorPlantilla("");

      try {
        const url = plantillaId
          ? `/api/plantillas/${encodeURIComponent(plantillaId)}`
          : `/api/plantilla-pago`;

        const res = await fetch(url, { cache: "no-store" });
        const json: unknown = await res.json().catch(() => ({}));

        const j = (json ?? {}) as AnyRecord;

        if (!res.ok) {
          const errMsg =
            (j?.["error"] as string | undefined) ?? "No se pudo cargar la plantilla";
          throw new Error(errMsg);
        }

        const plantilla = (j?.["data"] as unknown) ?? j;
        if (!cancel) setPlantillaBD((plantilla ?? null) as AnyRecord);
      } catch (e: unknown) {
        console.error("❌ Error cargando plantilla:", e);

        const msg = e instanceof Error ? e.message : "Error cargando plantilla";

        if (!cancel) {
          setPlantillaBD(null);
          setErrorPlantilla(msg);
        }
      } finally {
        if (!cancel) setLoadingPlantilla(false);
      }
    }

    fetchPlantilla();
    return () => {
      cancel = true;
    };
  }, [plantillaId]);

  // =========================
  // 2.1) Traer CONFIG personalizada (para obtener ORIGEN = nombre)
  // =========================
  const [configListas, setConfigListas] = useState<AnyRecord | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);

      useEffect(() => {
      if (!plantillaId) return;
      const pid = String(plantillaId);

      let cancel = false;

      async function fetchConfig() {
        setLoadingConfig(true);
        try {
          const res = await fetch(
            `/api/plantillas-personalizadas/config?plantilla_id=${encodeURIComponent(pid)}`,
            { cache: "no-store" }
          );

          const json = await res.json().catch(() => null);

          if (!res.ok) {
            console.log("ℹ️ Sin config personalizada", res.status, json || "");
            if (!cancel) setConfigListas(null);
            return;
          }

          if (!cancel) setConfigListas(json as Record<string, unknown>);
        } catch (e: unknown) {
          console.error("❌ Error cargando config personalizada:", e);
          if (!cancel) setConfigListas(null);
        } finally {
          if (!cancel) setLoadingConfig(false);
        }
      }

      fetchConfig();
      return () => {
        cancel = true;
      };
    }, [plantillaId]);


  // =========================
  // 3) Merge BD + temporal (data)
  // =========================
  const merged = useMemo<AnyRecord>(
    () => mergeDefined(plantillaBD ?? {}, data ?? {}),
    [plantillaBD, data]
  );

  // =========================
  // 4) Labels desde BD (tu BD)
  // =========================
  const pickLabel = (fieldKey: string, fallback: string): string => {
    const labels = merged?.["labels"] as AnyRecord | undefined;
    const campos = merged?.["campos_labels"] as AnyRecord | undefined;

    if (labels && labels[fieldKey]) return String(labels[fieldKey]);
    if (campos && campos[fieldKey]) return String(campos[fieldKey]);
    return fallback;
  };

  const labelSubproductoListaId = useMemo(
    () => pickLabel("subproducto_lista_id", "Subproducto"),
    [merged]
  );
  const labelMetodoPagoListaId = useMemo(
    () => pickLabel("metodo_pago_lista_id", "Método de pago"),
    [merged]
  );
  const labelProductoListaId = useMemo(
    () => pickLabel("producto_lista_id", "Producto"),
    [merged]
  );
  const labelLigaPagoListaId = useMemo(
    () => pickLabel("liga_pago_lista_id", "Liga de pago"),
    [merged]
  );

  // =========================
  // 4.1) OPTIONS
  // =========================
  type OptionItem = {
    id: string;
    label: string;
    cuenta: string;
    url: string | null;
    raw: AnyRecord;
  };

  const [optionsSubproducto, setOptionsSubproducto] = useState<OptionItem[]>([]);
  const [optionsMetodoPago, setOptionsMetodoPago] = useState<OptionItem[]>([]);
  const [optionsProducto, setOptionsProducto] = useState<OptionItem[]>([]);
  const [optionsLigaPago, setOptionsLigaPago] = useState<OptionItem[]>([]);

  const normalizeItem = (o: unknown): OptionItem => {
    const obj = (o ?? {}) as AnyRecord;
    return {
      id: String(obj?.["id"] ?? ""),
      label: String(obj?.["label"] ?? ""),
      cuenta: obj?.["value"] != null ? String(obj["value"]) : "",
      url: (obj?.["url_imagen"] as string | null | undefined) ?? null,
      raw: obj,
    };
  };

  async function loadLista(listaId: unknown, setter: (v: OptionItem[]) => void) {
    if (!listaId) {
      setter([]);
      return;
    }

    const res = await fetch(
      `/api/listas/items/por-lista/${encodeURIComponent(String(listaId))}`,
      { cache: "no-store" }
    );
    const json: unknown = await res.json().catch(() => []);

    if (!res.ok) {
      setter([]);
      return;
    }

    const arr = Array.isArray(json) ? json : [];
    setter(arr.map(normalizeItem));
  }

  useEffect(() => {
    if (!configListas) return;

    loadLista(configListas["subproducto_lista_id"], setOptionsSubproducto);
    loadLista(configListas["metodo_pago_lista_id"], setOptionsMetodoPago);
    loadLista(configListas["producto_lista_id"], setOptionsProducto);
    loadLista(configListas["liga_pago_lista_id"], setOptionsLigaPago);
  }, [configListas]);

  // =========================
  // 4.2) Estados de selección (ids)
  // =========================
  const [subproductoListaId, setSubproductoListaId] = useState<string>("");
  const [metodoPagoListaId, setMetodoPagoListaId] = useState<string>("");
  const [productoListaId, setProductoListaId] = useState<string>("");
  const [ligaPagoListaId, setLigaPagoListaId] = useState<string>("");

  // =========================
  // 4.3) Derivados
  // =========================
  const selectedProducto = useMemo<OptionItem | null>(
    () => optionsProducto.find((o) => o.id === productoListaId) || null,
    [optionsProducto, productoListaId]
  );
  const selectedSubproducto = useMemo<OptionItem | null>(
    () => optionsSubproducto.find((o) => o.id === subproductoListaId) || null,
    [optionsSubproducto, subproductoListaId]
  );
  const selectedMetodoPago = useMemo<OptionItem | null>(
    () => optionsMetodoPago.find((o) => o.id === metodoPagoListaId) || null,
    [optionsMetodoPago, metodoPagoListaId]
  );
  const selectedLigaPago = useMemo<OptionItem | null>(
    () => optionsLigaPago.find((o) => o.id === ligaPagoListaId) || null,
    [optionsLigaPago, ligaPagoListaId]
  );

  // Titulo (en header): depende de PRODUCTO
  const productoTitulo =
    selectedProducto?.label ??
    String(merged?.["subproducto"] ?? merged?.["ubproducto"] ?? "");

  // Cuenta: viene de LIGA (value)
  const cuentaBancaria =
    selectedLigaPago?.cuenta ?? String(merged?.["cuenta_bancaria"] ?? "");

  // Foto: viene de PRODUCTO (url_imagen)
  const logoUrlRaw =
    selectedProducto?.url ??
    (merged?.["url"] as string | null | undefined) ??
    (merged?.["logo_url"] as string | null | undefined) ??
    (merged?.["imagen_url"] as string | null | undefined) ??
    (merged?.["logoUrl"] as string | null | undefined) ??
    (merged?.["logo"] as string | null | undefined) ??
    null;

  const resolvedLogoUrl = useMemo(() => normalizeUrl(logoUrlRaw), [logoUrlRaw]);

  // base listo (solo para debug / tip)
  const baseListo = !!productoTitulo && !!cuentaBancaria;

  // =========================
  // 5) EXTRAS EDITABLES
  // =========================
  const [nombre, setNombre] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [mostrarExtras, setMostrarExtras] = useState<boolean>(true);

  // =========================
  // 6) EDITABLES
  // =========================
  const [monto, setMonto] = useState<string>("");
  const [importePagar, setImportePagar] = useState<string>("");
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("");
  const [diasVencidos, setDiasVencidos] = useState<number>(0);

  useEffect(() => {
    if (merged?.["monto"] != null && monto === "") setMonto(String(merged["monto"]));
    if (merged?.["importe_pagar"] != null && importePagar === "")
      setImportePagar(String(merged["importe_pagar"]));
    if (merged?.["fecha_vencimiento"] && !fechaVencimiento)
      setFechaVencimiento(String(merged["fecha_vencimiento"]));
    if (typeof merged?.["dias_vencidos"] === "number")
      setDiasVencidos(merged["dias_vencidos"] as number);

    if (merged?.["nombre_cliente"] && !nombre) setNombre(String(merged["nombre_cliente"]));
    if (merged?.["telefono_cliente"] && !telefono) setTelefono(String(merged["telefono_cliente"]));
    if (typeof merged?.["mostrar_extras"] === "boolean")
      setMostrarExtras(merged["mostrar_extras"] as boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged]);

  useEffect(() => {
    setImportePagar(monto);
  }, [monto]);

  useEffect(() => {
    if (!fechaVencimiento) return setDiasVencidos(0);
    const hoy = new Date();
    const venc = new Date(fechaVencimiento + "T00:00:00");
    const diff = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);
    setDiasVencidos(diff);
  }, [fechaVencimiento]);

  // =========================
  // 6.1) IMAGEN - BOTÓN PARA INHABILITAR FOTO
  // =========================
  const [fotoHabilitada, setFotoHabilitada] = useState<boolean>(true);

  // =========================
  // 6.2) “Bloquear inspeccionar” (deterrente, NO seguridad real)
  // =========================
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const key = String(e.key || "").toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (ctrl && shift && (key === "i" || key === "j" || key === "c")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (ctrl && key === "u") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  // =========================
  // 7) COLORES
  // =========================
  const [cardBg, setCardBg] = useState<string>("#ffffff");
  const [cardBgHexInput, setCardBgHexInput] = useState<string>("#ffffff");
  const [primaryColor, setPrimaryColor] = useState<string>("#0F56F7");
  const [primaryHexInput, setPrimaryHexInput] = useState<string>("#0F56F7");
  const [cardBgError, setCardBgError] = useState<string>("");
  const [primaryError, setPrimaryError] = useState<string>("");

  useEffect(() => {
    if (merged?.["card_bg_color"] && isHex(merged["card_bg_color"])) {
      setCardBg(String(merged["card_bg_color"]));
      setCardBgHexInput(String(merged["card_bg_color"]));
    }
    if (merged?.["primary_color"] && isHex(merged["primary_color"])) {
      setPrimaryColor(String(merged["primary_color"]));
      setPrimaryHexInput(String(merged["primary_color"]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged?.["card_bg_color"], merged?.["primary_color"]]);

  const [saving, setSaving] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleCardBgHexChange = (value: string) => {
    setCardBgHexInput(value);
    if (isHex(value)) {
      setCardBg(value);
      setCardBgError("");
    } else {
      setCardBgError("Ingresa color en formato #RRGGBB");
    }
  };

  const handlePrimaryHexChange = (value: string) => {
    setPrimaryHexInput(value);
    if (isHex(value)) {
      setPrimaryColor(value);
      setPrimaryError("");
    } else {
      setPrimaryError("Ingresa color en formato #RRGGBB");
    }
  };

  const cardBgOptions: { label: string; value: string }[] = [
    { label: "Blanco", value: "#FFFFFF" },
    { label: "Gris claro", value: "#F8FAFC" },
    { label: "Gris suave", value: "#EEF2F6" },
    { label: "Marfil", value: "#FFF4E6" },
    { label: "Crema", value: "#FFF7ED" },
    { label: "Very Light Blue", value: "#F0F9FF" },
    { label: "Lavanda", value: "#F5F3FF" },
    { label: "Rosa claro", value: "#FFF1F2" },
    { label: "Verde suave", value: "#ECFDF5" },
    { label: "Amarillo suave", value: "#FFFBEB" },
    { label: "Gris perla", value: "#F1F5F9" },
    { label: "Humo", value: "#F3F4F6" },
  ];

  const primaryOptions: { label: string; value: string }[] = [
    { label: "Azul (default)", value: "#0F56F7" },
    { label: "Naranja", value: "#FF6B00" },
    { label: "Verde", value: "#10B981" },
    { label: "Rojo", value: "#EF4444" },
    { label: "Morado", value: "#7C3AED" },
    { label: "Teal", value: "#06B6D4" },
    { label: "Indigo", value: "#4F46E5" },
    { label: "Cian", value: "#0891B2" },
    { label: "Rosa fuerte", value: "#EC4899" },
    { label: "Amarillo", value: "#F59E0B" },
    { label: "Gris oscuro", value: "#374151" },
    { label: "Negro", value: "#111827" },
  ];

  const disabled = saving;

  async function crearLinkEstatico(): Promise<string> {
    const payload: AnyRecord = {
      plantilla_pago_id: plantillaId,

      // IDs de ITEMS elegidos en esta pantalla
      subproducto_lista_id: subproductoListaId || null,
      metodo_pago_lista_id: metodoPagoListaId || null,
      producto_lista_id: productoListaId || null,
      liga_pago_lista_id: ligaPagoListaId || null,

      subproducto:
        selectedSubproducto?.label ??
        String(merged?.["subproducto"] ?? merged?.["ubproducto"] ?? ""),
      cuenta_bancaria: cuentaBancaria,
      url: resolvedLogoUrl,

      monto,
      importe_pagar: importePagar,
      fecha_vencimiento: fechaVencimiento || null,
      dias_vencidos: diasVencidos,

      nombre_cliente: nombre,
      telefono_cliente: telefono,

      mostrar_extras: mostrarExtras,
      card_bg_color: cardBg,
      primary_color: primaryColor,
      locked: true,

      foto_habilitada: fotoHabilitada,
    };

    const res = await fetch("/api/plantillas-temporales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json: unknown = await res.json().catch(() => ({}));
    const j = (json ?? {}) as AnyRecord;

    if (!res.ok) {
      throw new Error((j?.["error"] as string | undefined) ?? "No se pudo generar el link");
    }

    return String(j?.["link"]);
  }

  const handleConfirmAndLock = async (): Promise<void> => {
    if (saving) return;
    setSaving(true);

    try {
      const link = await crearLinkEstatico();
      setShareLink(link);
      window.location.href = link;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error generando link";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UI Estados
  // =========================
  if (loadingPlantilla) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#152032] text-white p-6">
        Cargando plantilla {plantillaId ? `#${plantillaId}` : ""}…
      </div>
    );
  }

  if (errorPlantilla) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#152032] text-white p-6">
        <div className="max-w-md">
          <div className="text-xl font-bold mb-2">No se pudo cargar la plantilla</div>
          <div className="text-sm opacity-90">{errorPlantilla}</div>
        </div>
      </div>
    );
  }

  const showConfigWarning = !loadingConfig && !configListas;

  // =========================
  // Render
  // =========================
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 relative bg-[#152032]">
      <div className="absolute right-6 top-16 z-50 flex flex-col gap-4 w-60">
        {showConfigWarning ? (
          <div className="bg-yellow-500/15 border border-yellow-400/40 text-yellow-100 text-xs p-3 rounded-lg">
            Esta plantilla no tiene <b>config personalizada</b> (origen). Los selects filtrados pueden aparecer
            vacíos.
          </div>
        ) : null}

        <div className="flex items-center justify-between text-white">
          <span className="text-sm font-medium">Mostrar datos del cliente</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarExtras}
              onChange={() => setMostrarExtras(!mostrarExtras)}
              className="sr-only peer"
              disabled={disabled}
            />
            <div
              className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full relative
              after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full
              after:absolute after:left-1 after:top-0.5 peer-checked:after:translate-x-5 transition-all"
            />
          </label>
        </div>

        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-xs text-white mb-2 font-medium">Fondo de la tarjeta</div>
          <select
            className="w-full p-2 rounded-md mb-2 text-sm"
            value={cardBg}
            onChange={(e) => {
              setCardBg(e.target.value);
              setCardBgHexInput(e.target.value);
              setCardBgError("");
            }}
            disabled={disabled}
          >
            {cardBgOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} — {o.value}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="text"
              value={cardBgHexInput}
              onChange={(e) => handleCardBgHexChange(e.target.value)}
              className="flex-1 p-2 rounded-md text-sm"
              placeholder="#RRGGBB"
              disabled={disabled}
            />
            <div
              className="w-10 h-10 rounded-md border"
              style={{ backgroundColor: isHex(cardBgHexInput) ? cardBgHexInput : cardBg }}
            />
          </div>
          {cardBgError && <div className="text-xs text-rose-400 mt-1">{cardBgError}</div>}
        </div>

        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-xs text-white mb-2 font-medium">Color del botón / burbuja</div>
          <select
            className="w-full p-2 rounded-md mb-2 text-sm"
            value={primaryColor}
            onChange={(e) => {
              setPrimaryColor(e.target.value);
              setPrimaryHexInput(e.target.value);
              setPrimaryError("");
            }}
            disabled={disabled}
          >
            {primaryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} — {o.value}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="text"
              value={primaryHexInput}
              onChange={(e) => handlePrimaryHexChange(e.target.value)}
              className="flex-1 p-2 rounded-md text-sm"
              placeholder="#RRGGBB"
              disabled={disabled}
            />
            <div
              className="w-10 h-10 rounded-md border"
              style={{ backgroundColor: isHex(primaryHexInput) ? primaryHexInput : primaryColor }}
            />
          </div>
          {primaryError && <div className="text-xs text-rose-400 mt-1">{primaryError}</div>}
        </div>

        {shareLink && (
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-xs text-white mb-2 font-medium">Link generado</div>
            <input className="w-full p-2 rounded-md text-sm" value={shareLink} readOnly />
            <button
              className="mt-2 w-full p-2 rounded-md text-sm bg-white/10 hover:bg-white/20 text-white"
              onClick={() => navigator.clipboard.writeText(shareLink)}
              type="button"
            >
              Copiar link
            </button>
          </div>
        )}
      </div>
      <div
        className="w-[420px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: cardBg }}
      >
        <div
          className="w-full h-[160px] flex flex-col items-center pt-6"
          style={{ background: "linear-gradient(180deg,#5CB0FF 0%,#A3D4FF 100%)" }}
        >
          {fotoHabilitada ? (
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow">
              {resolvedLogoUrl ? (
                <img
                  src={resolvedLogoUrl}
                  className="w-full h-full object-cover"
                  alt="logo"
                  crossOrigin="anonymous"
                  onError={() => console.log("❌ NO carga IMG:", resolvedLogoUrl)}
                />
              ) : (
                <span className="text-lg font-bold text-[#142546]">IMG</span>
              )}
            </div>
          ) : null}

          <button
            type="button"
            className="mt-2 text-xs px-3 py-1 rounded-md bg-white/70 hover:bg-white text-[#142546] font-semibold disabled:opacity-60"
            onClick={() => setFotoHabilitada((v) => !v)}
            disabled={disabled}
          >
            {fotoHabilitada ? "Inhabilitar foto" : "Habilitar foto"}
          </button>

          {/* producto debajo de foto */}
          <div className="mt-2 w-[280px]">
            <select
              className="w-full p-2 rounded-md text-sm bg-white/90 text-[#142546] font-semibold"
              value={productoListaId}
              onChange={(e) => setProductoListaId(e.target.value)}
              disabled={disabled}
            >
              <option value="">{labelProductoListaId}</option>
              {optionsProducto.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="mx-4 -mt-4 rounded-xl p-4 text-white shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="text-xs opacity-90">Monto de Préstamo</div>
          <input
            type="text"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="$0.00"
            className="w-full bg-transparent text-3xl font-bold outline-none"
            disabled={disabled}
          />
        </div>

        <div className="px-4 py-5 flex flex-col gap-4">
          <div className="bg-transparent rounded-xl border p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
            {/* Subproducto */}
            <div className="flex justify-between items-center py-3 border-b gap-3">
              <span className="text-sm font-medium text-gray-700">{labelSubproductoListaId}</span>
              <select
                className="text-sm text-gray-700 text-right bg-transparent font-semibold outline-none"
                value={subproductoListaId}
                onChange={(e) => setSubproductoListaId(e.target.value)}
                disabled={disabled}
              >
                <option value="">{labelSubproductoListaId}</option>
                {optionsSubproducto.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">Importe a Pagar</span>
              <input
                type="text"
                value={importePagar}
                onChange={(e) => setImportePagar(e.target.value)}
                className="text-gray-400 text-right w-28 bg-transparent font-semibold outline-none"
                disabled={disabled}
              />
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">Fecha Vencimiento</span>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="text-gray-400 text-right bg-transparent outline-none"
                disabled={disabled}
              />
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-700">Días vencimiento</span>
              <span className="text-sm text-gray-500">{diasVencidos} días</span>
            </div>
          </div>

          {/* Método + Liga */}
          <div className="bg-transparent rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
            <div className="text-sm font-medium text-gray-700 mb-2">{labelMetodoPagoListaId}</div>

            <div className="flex items-center justify-center bg-[#F8FAFB] p-4 rounded-md">
              <div className="text-center w-full">
                <select
                  className="w-full text-center text-xs text-gray-600 bg-transparent outline-none"
                  value={metodoPagoListaId}
                  onChange={(e) => setMetodoPagoListaId(e.target.value)}
                  disabled={disabled}
                >
                  <option value="">{labelMetodoPagoListaId}</option>
                  {optionsMetodoPago.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <div className="mt-2">
                  <select
                    className="w-full text-center text-lg md:text-xl lg:text-2xl font-extrabold text-gray-700 bg-transparent outline-none"
                    value={ligaPagoListaId}
                    onChange={(e) => setLigaPagoListaId(e.target.value)}
                    disabled={disabled}
                  >
                    <option value="">{labelLigaPagoListaId}</option>
                    {optionsLigaPago.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {cuentaBancaria ? <div className="mt-1 text-xs text-gray-500">{cuentaBancaria}</div> : null}
              </div>
            </div>
          </div>

          {mostrarExtras && (
            <div className="bg-transparent rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-700">Nombre</span>
                <input
                  className="text-sm text-right bg-transparent outline-none text-gray-700"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700">Teléfono</span>
                <input
                  className="text-sm text-right bg-transparent outline-none text-gray-700"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleConfirmAndLock}
            className="w-full text-white p-3 rounded-xl text-lg font-semibold mt-2 disabled:opacity-60"
            style={{ backgroundColor: primaryColor }}
            disabled={disabled}
            type="button"
          >
            {saving ? "Generando link..." : "Confirmar y Generar Link"}
          </button>

          {!baseListo ? (
            <div className="text-xs text-white/70 text-center mt-1">
              Tip: selecciona <b>Producto</b> y <b>Liga</b> para que aparezcan título/cuenta.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
