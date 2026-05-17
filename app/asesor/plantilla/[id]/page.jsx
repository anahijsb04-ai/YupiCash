"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function PagoFastCashForm({ data = {} }) {
  // =========================
  // Helpers
  // =========================
  const isHex = (s) => /^#([0-9A-Fa-f]{6})$/.test(String(s || ""));
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const normalizeUrl = (u) => {
    if (!u) return null;
    let s = String(u).trim().replaceAll("\\", "/");

    if (/^https?:\/\//i.test(s)) return s;

    if (s.startsWith("public/uploads/")) s = s.replace("public/", "");
    if (s.startsWith("uploads/")) s = `/${s}`;

    if (s.startsWith("/")) return origin ? `${origin}${s}` : s;

    return origin ? `${origin}/${s}` : s;
  };

  const mergeDefined = (base = {}, override = {}) => {
    const out = { ...base };
    for (const [k, v] of Object.entries(override || {})) {
      if (v !== undefined && v !== null && v !== "") out[k] = v;
    }
    return out;
  };

  // =========================
  // 1) ID: primero del URL, luego del prop data
  // =========================
  const params = useParams(); // { id: "123" }
  const idFromUrl = params?.id ? String(params.id) : null;

  const idFromData =
    data.plantilla_pago_id ??
    data.plantillas_pago_id ??
    data.plantilla_id ??
    data.id_plantilla ??
    data.plantillaPagoId ??
    data.plantillaId ??
    data.id ??
    null;

  const plantillaId = idFromUrl ?? (idFromData ? String(idFromData) : null);

  // =========================
  // 2) Traer plantilla desde BD por ID
  // =========================
  const [plantillaBD, setPlantillaBD] = useState(null);
  const [loadingPlantilla, setLoadingPlantilla] = useState(true);
  const [errorPlantilla, setErrorPlantilla] = useState("");

  useEffect(() => {
    let cancel = false;

    async function fetchPlantilla() {
      setLoadingPlantilla(true);
      setErrorPlantilla("");

      try {
        // ✅ SIEMPRE por ID cuando existe
        // /api/plantillas/[id] => /api/plantillas/${id}
        const url = plantillaId
          ? `/api/plantillas/${encodeURIComponent(plantillaId)}`
          : `/api/plantilla-pago`; // (opcional) fallback SOLO si no hay ID

        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "No se pudo cargar la plantilla");

        const plantilla = json?.data ?? json;
        if (!cancel) setPlantillaBD(plantilla);
      } catch (e) {
        console.error("❌ Error cargando plantilla:", e);
        if (!cancel) {
          setPlantillaBD(null);
          setErrorPlantilla(e?.message || "Error cargando plantilla");
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
  // 3) Merge BD + temporal (data)
  // =========================
  const merged = useMemo(
    () => mergeDefined(plantillaBD ?? {}, data ?? {}),
    [plantillaBD, data]
  );

  // =========================
  // 4) Derivados (SIN defaults)
  // =========================
  const producto = merged?.subproducto ?? merged?.ubproducto ?? "";
  const cuentaBancaria = merged?.cuenta_bancaria ?? "";
  const logoUrlRaw =
    merged?.url ??
    merged?.logo_url ??
    merged?.imagen_url ??
    merged?.logoUrl ??
    merged?.logo ??
    null;

  const resolvedLogoUrl = useMemo(
    () => normalizeUrl(logoUrlRaw),
    [logoUrlRaw]
  );

  const baseListo = !!producto && !!cuentaBancaria && !!logoUrlRaw;

  // =========================
  // 5) EXTRAS EDITABLES
  // =========================
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mostrarExtras, setMostrarExtras] = useState(true);

  // =========================
  // 6) EDITABLES
  // =========================
  const [monto, setMonto] = useState("");
  const [importePagar, setImportePagar] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [diasVencidos, setDiasVencidos] = useState(0);

  useEffect(() => {
    if (merged?.monto != null && monto === "") setMonto(String(merged.monto));
    if (merged?.importe_pagar != null && importePagar === "")
      setImportePagar(String(merged.importe_pagar));
    if (merged?.fecha_vencimiento && !fechaVencimiento)
      setFechaVencimiento(String(merged.fecha_vencimiento));
    if (typeof merged?.dias_vencidos === "number")
      setDiasVencidos(merged.dias_vencidos);

    if (merged?.nombre_cliente && !nombre) setNombre(String(merged.nombre_cliente));
    if (merged?.telefono_cliente && !telefono) setTelefono(String(merged.telefono_cliente));
    if (typeof merged?.mostrar_extras === "boolean") setMostrarExtras(merged.mostrar_extras);
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
  // 7) COLORES
  // =========================
  const [cardBg, setCardBg] = useState("#ffffff");
  const [cardBgHexInput, setCardBgHexInput] = useState("#ffffff");
  const [primaryColor, setPrimaryColor] = useState("#0F56F7");
  const [primaryHexInput, setPrimaryHexInput] = useState("#0F56F7");
  const [cardBgError, setCardBgError] = useState("");
  const [primaryError, setPrimaryError] = useState("");

  useEffect(() => {
    if (merged?.card_bg_color && isHex(merged.card_bg_color)) {
      setCardBg(String(merged.card_bg_color));
      setCardBgHexInput(String(merged.card_bg_color));
    }
    if (merged?.primary_color && isHex(merged.primary_color)) {
      setPrimaryColor(String(merged.primary_color));
      setPrimaryHexInput(String(merged.primary_color));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged?.card_bg_color, merged?.primary_color]);

  const [saving, setSaving] = useState(false);
  const [shareLink, setShareLink] = useState(null);

  const handleCardBgHexChange = (value) => {
    setCardBgHexInput(value);
    if (isHex(value)) {
      setCardBg(value);
      setCardBgError("");
    } else {
      setCardBgError("Ingresa color en formato #RRGGBB");
    }
  };

  const handlePrimaryHexChange = (value) => {
    setPrimaryHexInput(value);
    if (isHex(value)) {
      setPrimaryColor(value);
      setPrimaryError("");
    } else {
      setPrimaryError("Ingresa color en formato #RRGGBB");
    }
  };

  const cardBgOptions = [
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

  const primaryOptions = [
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

  async function crearLinkEstatico() {
    const payload = {
      usuario_id: 1, // 
      // ✅ referencia real de la plantilla: ID DEL URL
      plantilla_pago_id: plantillaId,

      subproducto: merged.subproducto ?? merged.ubproducto,
      cuenta_bancaria: merged.cuenta_bancaria,
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
    };

    const res = await fetch("/api/plantillas-temporales-2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "No se pudo generar el link");
    return String(json.link);
  }

  const handleConfirmAndLock = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const link = await crearLinkEstatico();
      setShareLink(link);
      window.location.href = link;
    } catch (e) {
      alert(e?.message || "Error generando link");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UI Estados
  // =========================
  if (loadingPlantilla || (!baseListo && !errorPlantilla)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#152032] text-white p-6">
        Cargando plantilla {plantillaId ? `#${plantillaId}` : ""}…
      </div>
    );
  }

  if (errorPlantilla && !baseListo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#152032] text-white p-6">
        <div className="max-w-md">
          <div className="text-xl font-bold mb-2">No se pudo cargar la plantilla</div>
          <div className="text-sm opacity-90">{errorPlantilla}</div>
        </div>
      </div>
    );
  }

  // =========================
  // Render
  // =========================
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 relative bg-[#152032]">
      <div className="absolute right-6 top-16 z-50 flex flex-col gap-4 w-60">
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

          <h2 className="text-lg font-bold text-[#142546] mt-4">{producto}</h2>
        </div>

        <div className="mx-4 -mt-4 rounded-xl p-4 text-white shadow-md" style={{ backgroundColor: primaryColor }}>
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
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">Producto</span>
              <span className="text-sm text-gray-600">{producto}</span>
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

          <div className="bg-transparent rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
            <div className="text-sm font-medium text-gray-700 mb-2">Elige el método de pago</div>
            <div className="flex items-center justify-center bg-[#F8FAFB] p-4 rounded-md">
              <div className="text-center">
                <div className="text-xs text-gray-500">SPEI</div>
                <div className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-700 mt-1">
                  {cuentaBancaria}
                </div>
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
        </div>
      </div>
    </div>
  );
}
