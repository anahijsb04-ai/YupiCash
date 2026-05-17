"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function PagoFastCashForm({ data = {} }) {
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

  const params = useParams();
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

  const [plantillaBD, setPlantillaBD] = useState(null);
  const [loadingPlantilla, setLoadingPlantilla] = useState(true);
  const [errorPlantilla, setErrorPlantilla] = useState("");

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
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json?.error || "No se pudo cargar la plantilla");
        }

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

  const merged = useMemo(
    () => mergeDefined(plantillaBD ?? {}, data ?? {}),
    [plantillaBD, data]
  );

  const producto =
    merged?.subproducto ?? merged?.ubproducto ?? merged?.producto ?? "";
  const cuentaBancaria = merged?.cuenta_bancaria ?? "";

  const logoUrlRaw =
    merged?.url ??
    merged?.logo_url ??
    merged?.imagen_url ??
    merged?.logoUrl ??
    merged?.logo ??
    null;

  const resolvedLogoUrl = useMemo(() => normalizeUrl(logoUrlRaw), [logoUrlRaw]);

  const baseListo = !!producto && !!cuentaBancaria && !!logoUrlRaw;

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mostrarExtras, setMostrarExtras] = useState(true);

  const [monto, setMonto] = useState("");
  const [importePagar, setImportePagar] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [diasVencidos, setDiasVencidos] = useState(0);

  useEffect(() => {
    if (merged?.monto != null && monto === "") setMonto(String(merged.monto));
    if (merged?.importe_pagar != null && importePagar === "") {
      setImportePagar(String(merged.importe_pagar));
    }
    if (merged?.fecha_vencimiento && !fechaVencimiento) {
      setFechaVencimiento(String(merged.fecha_vencimiento));
    }
    if (typeof merged?.dias_vencidos === "number") {
      setDiasVencidos(merged.dias_vencidos);
    }

    if (merged?.nombre_cliente && !nombre) setNombre(String(merged.nombre_cliente));
    if (merged?.telefono_cliente && !telefono) setTelefono(String(merged.telefono_cliente));
    if (typeof merged?.mostrar_extras === "boolean") setMostrarExtras(merged.mostrar_extras);
  }, [merged, monto, importePagar, fechaVencimiento, nombre, telefono]);

  useEffect(() => {
    setImportePagar(monto);
  }, [monto]);

  useEffect(() => {
    if (!fechaVencimiento) {
      setDiasVencidos(0);
      return;
    }

    const hoy = new Date();
    const venc = new Date(fechaVencimiento + "T00:00:00");
    const diff = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);
    setDiasVencidos(diff);
  }, [fechaVencimiento]);

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

  async function crearLinkEstatico() {
    const payload = {
      plantilla_pago_id: plantillaId ? Number(plantillaId) : null,
      tipo_plantilla: merged?.tipo_plantilla ?? "1",
      subproducto: merged?.subproducto ?? merged?.ubproducto ?? merged?.producto ?? "",
      cuenta_bancaria: merged?.cuenta_bancaria ?? "",
      metodo_pago: merged?.metodo_pago ?? merged?.metodo_pago_label ?? "",
      metodo_pago_lista_id: merged?.metodo_pago_lista_id ?? null,
      liga_pago_lista_id: merged?.liga_pago_lista_id ?? null,
      url: resolvedLogoUrl ?? "",
      monto: monto || "",
      importe_pagar: importePagar || "",
      fecha_vencimiento: fechaVencimiento || null,
      dias_vencidos: Number.isFinite(diasVencidos) ? diasVencidos : 0,
      nombre_cliente: nombre || "",
      telefono_cliente: telefono || "",
      mostrar_extras: Boolean(mostrarExtras),
      card_bg_color: cardBg || "#FFFFFF",
      primary_color: primaryColor || "#0F56F7",
      locked: true,
    };

    const res = await fetch("/api/plantillas-temporales-2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || json?.message || `Error ${res.status} generando link`);
    }

    const token = String(json?.token ?? "").trim();
    const link = String(json?.link ?? "").trim();

    if (!token) {
      throw new Error("El backend no devolvió token");
    }

    if (!link) {
      throw new Error("El backend no devolvió link");
    }

    return { token, link };
  }

  const handleConfirmAndLock = async () => {
    if (saving) return;
    setSaving(true);

    try {
      if (!plantillaId) {
        throw new Error("Falta plantilla_pago_id");
      }

      const { token, link } = await crearLinkEstatico();

      const syncRes = await fetch(`/api/sync-pago/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const syncJson = await syncRes.json().catch(() => ({}));

      if (!syncRes.ok) {
        throw new Error(syncJson?.error || "Error actualizando pago");
      }

      setShareLink(link);
      window.location.href = link;
    } catch (e) {
      console.error("❌ Error en handleConfirmAndLock:", e);
      alert(e?.message || "Error generando link");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="w-full min-h-screen bg-[#152032] relative overflow-x-hidden">
      <button
        onClick={() => (window.location.href = "/gestion/multas")}
        className="fixed z-50 top-3 left-3 sm:top-5 sm:left-5 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base rounded-lg bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md transition-all"
        type="button"
      >
        ← Regresar
      </button>

      <div className="w-full min-h-screen flex flex-col xl:flex-row items-center xl:items-start justify-center gap-5 xl:gap-8 px-3 pt-16 pb-6 sm:px-4 sm:pt-20 md:px-6 lg:px-8">
        <div className="w-full max-w-[420px] xl:order-2 order-1">
          <div className="flex flex-col gap-4 w-full xl:w-60 xl:ml-auto">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-medium">Mostrar datos del cliente</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarExtras}
                  onChange={() => setMostrarExtras(!mostrarExtras)}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:left-1 after:top-0.5 peer-checked:after:translate-x-5 transition-all" />
              </label>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-xs text-white mb-2 font-medium">Fondo de la tarjeta</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cardBgHexInput}
                  onChange={(e) => handleCardBgHexChange(e.target.value)}
                  className="flex-1 p-2 rounded-md text-sm min-w-0"
                  placeholder="#RRGGBB"
                  disabled={saving}
                />
                <div
                  className="w-10 h-10 rounded-md border shrink-0"
                  style={{ backgroundColor: isHex(cardBgHexInput) ? cardBgHexInput : cardBg }}
                />
              </div>
              {cardBgError && <div className="text-xs text-rose-400 mt-1">{cardBgError}</div>}
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-xs text-white mb-2 font-medium">Color principal</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={primaryHexInput}
                  onChange={(e) => handlePrimaryHexChange(e.target.value)}
                  className="flex-1 p-2 rounded-md text-sm min-w-0"
                  placeholder="#RRGGBB"
                  disabled={saving}
                />
                <div
                  className="w-10 h-10 rounded-md border shrink-0"
                  style={{ backgroundColor: isHex(primaryHexInput) ? primaryHexInput : primaryColor }}
                />
              </div>
              {primaryError && <div className="text-xs text-rose-400 mt-1">{primaryError}</div>}
            </div>

            {shareLink && (
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-xs text-white mb-2 font-medium">Link generado</div>
                <input className="w-full p-2 rounded-md text-sm min-w-0" value={shareLink} readOnly />
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-[420px] xl:order-1 order-2">
          <div
            className="w-full rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            style={{ backgroundColor: cardBg }}
          >
            <div
              className="w-full h-[160px] flex flex-col items-center pt-6 px-4"
              style={{ background: "linear-gradient(180deg,#5CB0FF 0%,#A3D4FF 100%)" }}
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow shrink-0">
                {resolvedLogoUrl ? (
                  <img
                    src={resolvedLogoUrl}
                    className="w-full h-full object-cover"
                    alt="logo"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <span className="text-lg font-bold text-[#142546]">IMG</span>
                )}
              </div>

              <h2 className="text-lg font-bold text-[#142546] mt-4 text-center break-words">
                {producto}
              </h2>
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
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold outline-none"
                disabled={saving}
              />
            </div>

            <div className="px-4 py-5 flex flex-col gap-4">
              <div className="bg-transparent rounded-xl border p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
                <div className="flex justify-between items-center gap-3 py-3 border-b">
                  <span className="text-sm font-medium text-gray-700">Producto</span>
                  <span className="text-sm text-gray-600 text-right break-words max-w-[55%]">
                    {producto}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-3 py-3 border-b">
                  <span className="text-sm font-medium text-gray-700">Importe a Pagar</span>
                  <input
                    type="text"
                    value={importePagar}
                    onChange={(e) => setImportePagar(e.target.value)}
                    className="text-gray-400 text-right w-28 sm:w-32 bg-transparent font-semibold outline-none"
                    disabled={saving}
                  />
                </div>

                <div className="flex justify-between items-center gap-3 py-3 border-b">
                  <span className="text-sm font-medium text-gray-700">Fecha Vencimiento</span>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="text-gray-400 text-right bg-transparent outline-none min-w-0"
                    disabled={saving}
                  />
                </div>

                <div className="flex justify-between items-center gap-3 py-3">
                  <span className="text-sm font-medium text-gray-700">Días vencimiento</span>
                  <span className="text-sm text-gray-500 text-right">{diasVencidos} días</span>
                </div>
              </div>

              <div className="bg-transparent rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
                <div className="text-sm font-medium text-gray-700 mb-2">Elige el método de pago</div>
                <div className="flex items-center justify-center bg-[#F8FAFB] p-4 rounded-md">
                  <div className="text-center w-full">
                    <div className="text-xs text-gray-500 break-words">
                      {merged?.metodo_pago ?? merged?.metodo_pago_label ?? "Método de pago"}
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-700 mt-1 break-all">
                      {cuentaBancaria}
                    </div>
                  </div>
                </div>
              </div>

              {mostrarExtras && (
                <div className="bg-transparent rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
                  <div className="flex justify-between items-center gap-3 py-2 border-b">
                    <span className="text-sm font-medium text-gray-700">Nombre</span>
                    <input
                      className="text-sm text-right bg-transparent outline-none text-gray-700 min-w-0 max-w-[60%]"
                      placeholder="Nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex justify-between items-center gap-3 py-2">
                    <span className="text-sm font-medium text-gray-700">Teléfono</span>
                    <input
                      className="text-sm text-right bg-transparent outline-none text-gray-700 min-w-0 max-w-[60%]"
                      placeholder="Teléfono"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirmAndLock}
                className="w-full text-white p-3 rounded-xl text-base sm:text-lg font-semibold mt-2 disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
                disabled={saving}
                type="button"
              >
                {saving ? "Generando link..." : "Confirmar y Generar Link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}