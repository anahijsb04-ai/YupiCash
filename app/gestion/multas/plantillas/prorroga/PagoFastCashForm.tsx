"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Plantilla1 from "./plantillas/Plantilla1";
import Plantilla2 from "./plantillas/Plantilla2";
import Plantilla3 from "./plantillas/Plantilla3";
import Plantilla4 from "./plantillas/Plantilla4";
import Plantilla5 from "./plantillas/Plantilla5";
import Plantilla6 from "./plantillas/Plantilla6";
import Plantilla7 from "./plantillas/Plantilla7";
import Plantilla8 from "./plantillas/Plantilla8";
import Plantilla9 from "./plantillas/Plantilla9";
import type { PlantillaProps } from "./plantillas/types";

type AnyRecord = Record<string, unknown>;
type TemplateId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Caso = {
  numero_prestamo: string;
  nombre_cliente: string | null;
  telefono_cliente: string | null;
  valor_deuda: number | null;
  producto: string | null;
  segmento: string | null;
  liga_pago: string | null;
};

type OptionItem = {
  id: string;
  label: string;
  value: string;
  raw: AnyRecord;
};

function norm(s: unknown) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isTemplateId(value: string): value is TemplateId {
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(value);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
function money(n: number | null | undefined) {
  if (n === null || typeof n === "undefined") return "—";
  return `$${Number(n).toLocaleString()}`;
}
export default function PagoFastCashForm() {
  const params = useParams();
  const router = useRouter();
  const numeroPrestamo = String(
    (params as any)?.numero_prestamo ?? (params as any)?.id ?? ""
  ).trim();

  const isHex = (s: unknown): boolean =>
    /^#([0-9A-Fa-f]{6})$/.test(String(s ?? ""));

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

  const [caso, setCaso] = useState<Caso | null>(null);
  const [loadingCaso, setLoadingCaso] = useState(true);
  const [errorCaso, setErrorCaso] = useState("");

  useEffect(() => {
    let cancel = false;

    async function fetchCaso() {
      if (!numeroPrestamo) {
        setLoadingCaso(false);
        setErrorCaso("Falta el número de préstamo en la URL.");
        return;
      }

      setLoadingCaso(true);
      setErrorCaso("");

      try {
        const res = await fetch(
          `/api/collection/casos/${encodeURIComponent(numeroPrestamo)}`,
          {
            cache: "no-store",
          }
        );

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((json as any)?.error || "No se pudo cargar el caso");
        }

        const row = ((json as any)?.data ?? json) as Caso;
        if (!cancel) setCaso(row);
      } catch (e: any) {
        if (!cancel) setErrorCaso(e?.message || "Error cargando caso");
      } finally {
        if (!cancel) setLoadingCaso(false);
      }
    }

    fetchCaso();

    return () => {
      cancel = true;
    };
  }, [numeroPrestamo]);

  const isCo = useMemo(() => {
    const seg = norm(caso?.segmento);
    return seg.includes("col");
  }, [caso?.segmento]);

  const listCuentaKey = isCo
    ? "cuenta_bancaria_colombia"
    : "cuenta_bancaria_mexico";
  const listMetodoKey = isCo
    ? "metodo_pago_colombia"
    : "metodo_pago_mexico";
  const listProdKey = isCo ? "producto_colombia" : "producto_mexico";

  const [optionsCuenta, setOptionsCuenta] = useState<OptionItem[]>([]);
  const [optionsMetodo, setOptionsMetodo] = useState<OptionItem[]>([]);
  const [loadingListas, setLoadingListas] = useState(false);

  const normalizeItem = (o: unknown): OptionItem => {
    const obj = (o ?? {}) as AnyRecord;
    const value = String(obj?.["value"] ?? obj?.["name"] ?? "").trim();
    const label = String(
      obj?.["label"] ?? obj?.["value"] ?? obj?.["name"] ?? value
    ).trim();

    return {
      id: String(obj?.["id"] ?? ""),
      label,
      value,
      raw: obj,
    };
  };

  async function loadLista(
    listKey: string,
    setter: (arr: OptionItem[]) => void
  ) {
    const res = await fetch(
      `/api/collection/aplicaciones/${encodeURIComponent(listKey)}`,
      {
        cache: "no-store",
      }
    );

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setter([]);
      return;
    }

    const arr = ((json as any)?.items ?? (json as any)?.data ?? []) as any[];
    const items = Array.isArray(arr) ? arr.map(normalizeItem) : [];
    setter(items);
  }

  useEffect(() => {
    if (!caso) return;

    let cancel = false;

    async function run() {
      setLoadingListas(true);
      try {
        await Promise.all([
          loadLista(listMetodoKey, (v) => {
            if (!cancel) setOptionsMetodo(v);
          }),
          loadLista(listCuentaKey, (v) => {
            if (!cancel) setOptionsCuenta(v);
          }),
        ]);
      } finally {
        if (!cancel) setLoadingListas(false);
      }
    }

    run();

    return () => {
      cancel = true;
    };
  }, [caso, listMetodoKey, listCuentaKey]);

  const [logoFromCatalog, setLogoFromCatalog] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;

    async function findLogo() {
      setLogoFromCatalog(null);
      if (!caso?.producto) return;

      try {
        const res = await fetch(
          `/api/collection/aplicaciones/${encodeURIComponent(listProdKey)}`,
          {
            cache: "no-store",
          }
        );

        const json = await res.json().catch(() => ({}));
        if (!res.ok) return;

        const arr = ((json as any)?.items ?? (json as any)?.data ?? []) as any[];
        const items = Array.isArray(arr) ? arr : [];

        const target = norm(caso.producto);
        const found = items.find((it: any) => norm(it?.name) === target);

        const img = (found?.url as string | null | undefined) ?? null;
        if (!cancel) setLogoFromCatalog(img);
      } catch {
        if (!cancel) setLogoFromCatalog(null);
      }
    }

    if (caso) findLogo();

    return () => {
      cancel = true;
    };
  }, [caso, listProdKey]);

  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [cuentaId, setCuentaId] = useState("");

  useEffect(() => {
    if (!metodoPagoId && optionsMetodo.length > 0) {
      setMetodoPagoId(optionsMetodo[0].id);
    }
  }, [optionsMetodo, metodoPagoId]);

  useEffect(() => {
    if (!cuentaId && optionsCuenta.length > 0) {
      setCuentaId(optionsCuenta[0].id);
    }
  }, [optionsCuenta, cuentaId]);

  const selectedMetodo = useMemo<OptionItem | null>(
    () => optionsMetodo.find((o) => o.id === metodoPagoId) || null,
    [optionsMetodo, metodoPagoId]
  );

  const selectedCuenta = useMemo<OptionItem | null>(
    () => optionsCuenta.find((o) => o.id === cuentaId) || null,
    [optionsCuenta, cuentaId]
  );

  const productoTitulo = String(caso?.producto ?? "");
  const metodoPagoLabel = selectedMetodo?.label ?? "";
  const cuentaBancaria = selectedCuenta?.value ?? "";
  const logoUrlRaw = logoFromCatalog;
  const resolvedLogoUrl = useMemo(
    () => normalizeUrl(logoUrlRaw),
    [logoUrlRaw]
  );

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mostrarExtras, setMostrarExtras] = useState(true);

  const [monto, setMonto] = useState("");
  const [importePagar, setImportePagar] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [diasVencidos, setDiasVencidos] = useState(0);

  useEffect(() => {
    if (!caso) return;

    setNombre((prev) => prev || String(caso.nombre_cliente ?? ""));
    setTelefono((prev) => prev || String(caso.telefono_cliente ?? ""));

    const valorOriginal = Number(caso.valor_deuda ?? 0);
    const montoProrroga =
      valorOriginal > 0 ? roundMoney(valorOriginal * 0.55) : 0;
    const vd = montoProrroga > 0 ? String(montoProrroga) : "";

    setMonto((prev) => prev || vd);
    setImportePagar((prev) => prev || vd);
  }, [caso]);

  useEffect(() => {
    setImportePagar(monto);
  }, [monto]);

  useEffect(() => {
    if (!fechaVencimiento) {
      setDiasVencidos(0);
      return;
    }

    const hoy = new Date();
    const venc = new Date(`${fechaVencimiento}T00:00:00`);
    const diff = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);
    setDiasVencidos(diff);
  }, [fechaVencimiento]);

  const [fotoHabilitada, setFotoHabilitada] = useState(true);

  const [cardBg, setCardBg] = useState("#FFFFFF");
  const [cardBgHexInput, setCardBgHexInput] = useState("#FFFFFF");
  const [primaryColor, setPrimaryColor] = useState("#0F56F7");
  const [primaryHexInput, setPrimaryHexInput] = useState("#0F56F7");
  const [cardBgError, setCardBgError] = useState("");
  const [primaryError, setPrimaryError] = useState("");

  const [plantillaActiva, setPlantillaActiva] = useState<TemplateId>("1");

  const plantillaActivaNormalizada = useMemo<TemplateId>(() => {
    return isTemplateId(plantillaActiva) ? plantillaActiva : "1";
  }, [plantillaActiva]);

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

  const cardBgOptions = [
    { label: "Blanco", value: "#FFFFFF" },
    { label: "Gris claro", value: "#F8FAFC" },
    { label: "Gris suave", value: "#EEF2F6" },
    { label: "Marfil", value: "#FFF4E6" },
    { label: "Crema", value: "#FFF7ED" },
  ];

  const primaryOptions = [
    { label: "Azul (default)", value: "#0F56F7" },
    { label: "Naranja", value: "#FF6B00" },
    { label: "Verde", value: "#10B981" },
    { label: "Rojo", value: "#EF4444" },
  ];

  const [saving, setSaving] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const disabled = saving;

  const plantillaPagoId = isCo ? 2 : 1;
  const montoProrrogaPreview = useMemo(() => {
    const valorOriginal = Number(caso?.valor_deuda ?? 0);
    return valorOriginal > 0 ? roundMoney(valorOriginal * 0.55) : 0;
  }, [caso?.valor_deuda]);

  async function crearLinkEstatico(): Promise<string> {
    const templateNumber = Number(plantillaActivaNormalizada);

    const payload: AnyRecord = {
      plantilla_pago_id: plantillaPagoId,
      tipo_plantilla: templateNumber,
      template_id: templateNumber,
      metodo_pago_lista_id: metodoPagoId || null,
      liga_pago_lista_id: cuentaId || null,
      subproducto: productoTitulo,
      cuenta_bancaria: cuentaBancaria,
      metodo_pago: selectedMetodo?.label ?? selectedMetodo?.value ?? "",
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
      es_prorroga: true,
      porcentaje_prorroga: 0.55,
      monto_original: Number(caso?.valor_deuda ?? 0),
      monto_prorroga: Number(importePagar || monto || 0),
    };

    console.log("PLANTILLA ACTIVA:", plantillaActivaNormalizada);
    console.log("PAYLOAD ENVIADO:", payload);

    const res = await fetch("/api/plantillas-temporales-3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json: AnyRecord = (await res.json().catch(() => ({}))) as AnyRecord;

    if (!res.ok) {
      throw new Error(
        (json?.["error"] as string | undefined) ??
          "No se pudo generar el link"
      );
    }

    return String(json?.["link"] ?? "");
  }

  async function guardarLigaFinalEnCaso(link: string) {
    await fetch(`/api/collection/casos/${encodeURIComponent(numeroPrestamo)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liga_pago: link }),
    }).catch(() => null);
  }

  const handleConfirmAndLock = async () => {
    if (saving) return;

    if (!metodoPagoId) {
      alert("Selecciona el método de pago.");
      return;
    }

    if (!cuentaId || !cuentaBancaria) {
      alert("Selecciona la cuenta bancaria.");
      return;
    }

    setSaving(true);

    try {
      const link = await crearLinkEstatico();
      setShareLink(link);
      await guardarLigaFinalEnCaso(link);
      window.location.href = link;
    } catch (e: any) {
      alert(e?.message || "Error generando link");
    } finally {
      setSaving(false);
    }
  };

  const plantillaProps: PlantillaProps = {
    cardBg,
    primaryColor,
    fotoHabilitada,
    resolvedLogoUrl,
    productoTitulo,
    monto,
    setMonto,
    importePagar,
    setImportePagar,
    fechaVencimiento,
    setFechaVencimiento,
    diasVencidos,
    isCo,
    metodoPagoId,
    setMetodoPagoId,
    cuentaId,
    setCuentaId,
    optionsMetodo,
    optionsCuenta,
    metodoPagoLabel,
    cuentaBancaria,
    mostrarExtras,
    nombre,
    setNombre,
    telefono,
    setTelefono,
    loadingListas,
    disabled,
    saving,
    onToggleFoto: () => setFotoHabilitada((v) => !v),
    onSubmit: handleConfirmAndLock,
  };

  function renderPlantilla() {
    switch (plantillaActivaNormalizada) {
      case "1":
        return <Plantilla1 {...plantillaProps} />;
      case "2":
        return <Plantilla2 {...plantillaProps} />;
      case "3":
        return <Plantilla3 {...plantillaProps} />;
      case "4":
        return <Plantilla4 {...plantillaProps} />;
      case "5":
        return <Plantilla5 {...plantillaProps} />;
      case "6":
        return <Plantilla6 {...plantillaProps} />;
      case "7":
        return <Plantilla7 {...plantillaProps} />;
      case "8":
        return <Plantilla8 {...plantillaProps} />;
      case "9":
        return <Plantilla9 {...plantillaProps} />;
      default:
        return <Plantilla1 {...plantillaProps} />;
    }
  }

  if (loadingCaso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#152032] text-white p-6">
        Cargando caso…
      </div>
    );
  }

  if (errorCaso || !caso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#152032] text-white p-6">
        <div className="max-w-md w-full">
          <button
            type="button"
            onClick={() => router.push("/gestion/collection/casos")}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition"
          >
            ← Regresar
          </button>

          <div className="text-xl font-bold mb-2">
            No se pudo cargar el caso
          </div>
          <div className="text-sm opacity-90">
            {errorCaso || "Caso no encontrado"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#152032]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col xl:flex-row xl:items-start xl:justify-center">
        <aside
          className="
            w-full
            xl:sticky xl:top-0 xl:h-screen xl:w-[320px] xl:min-w-[320px]
            border-b border-white/10 xl:border-b-0 xl:border-r xl:border-white/10
            bg-[#152032]/95 backdrop-blur-sm
            z-40
          "
        >
          <div className="flex h-full flex-col gap-4 p-4 sm:p-5 xl:p-6 overflow-y-auto">
            <button
              type="button"
              onClick={() => router.push("/gestion/collection/casos")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              ← Regresar a casos
            </button>

            <div className="bg-violet-500/15 border border-violet-300/20 p-3 rounded-lg text-white">
              <div className="text-xs font-semibold uppercase tracking-wide text-violet-200">
                Modo prórroga
              </div>
              <div className="mt-1 text-sm">
                Esta pantalla genera la liga con el <b>55%</b> del valor adeudado.
              </div>
              <div className="mt-2 text-xs text-violet-100/90">
                Valor original:{" "}
                <span className="font-semibold">
                  {money(Number(caso.valor_deuda ?? 0))}
                </span>
              </div>
              <div className="text-xs text-violet-100/90">
                Monto prórroga:{" "}
                <span className="font-semibold">
                  {money(montoProrrogaPreview)}
                </span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-xs text-white mb-2 font-medium">Plantilla</div>
              <select
                className="w-full p-2 rounded-md text-sm"
                value={plantillaActivaNormalizada}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlantillaActiva(isTemplateId(value) ? value : "1");
                }}
                disabled={disabled}
              >
                <option value="1">Plantilla #1</option>
                <option value="2">Plantilla #2</option>
                <option value="3">Plantilla #3</option>
                <option value="4">Plantilla #4</option>
                <option value="5">Plantilla #5</option>
                <option value="6">Plantilla #6</option>
                <option value="7">Plantilla #7</option>
                <option value="8">Plantilla #8</option>
                <option value="9">Plantilla #9</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 text-white bg-white/5 p-3 rounded-lg">
              <span className="text-sm font-medium">
                Mostrar datos del cliente
              </span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
              <div className="text-xs text-white mb-2 font-medium">
                Fondo de la tarjeta
              </div>
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
                  className="flex-1 min-w-0 p-2 rounded-md text-sm"
                  placeholder="#RRGGBB"
                  disabled={disabled}
                />
                <div
                  className="w-10 h-10 rounded-md border shrink-0"
                  style={{
                    backgroundColor: isHex(cardBgHexInput)
                      ? cardBgHexInput
                      : cardBg,
                  }}
                />
              </div>
              {cardBgError && (
                <div className="text-xs text-rose-400 mt-1">{cardBgError}</div>
              )}
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-xs text-white mb-2 font-medium">
                Color del botón
              </div>
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
                  className="flex-1 min-w-0 p-2 rounded-md text-sm"
                  placeholder="#RRGGBB"
                  disabled={disabled}
                />
                <div
                  className="w-10 h-10 rounded-md border shrink-0"
                  style={{
                    backgroundColor: isHex(primaryHexInput)
                      ? primaryHexInput
                      : primaryColor,
                  }}
                />
              </div>
              {primaryError && (
                <div className="text-xs text-rose-400 mt-1">{primaryError}</div>
              )}
            </div>

            {shareLink && (
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-xs text-white mb-2 font-medium">
                  Link generado
                </div>
                <input
                  className="w-full p-2 rounded-md text-sm"
                  value={shareLink}
                  readOnly
                />
                <button
                  className="mt-2 w-full p-2 rounded-md text-sm bg-white/10 hover:bg-white/20 text-white transition"
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  type="button"
                >
                  Copiar link
                </button>
              </div>
            )}
          </div>
        </aside>

        <main
          className="
            flex-1
            min-w-0
            flex
            items-start
            xl:items-center
            justify-center
            px-3 sm:px-4 md:px-6 xl:px-8
            py-4 sm:py-6 xl:py-8
          "
        >
          <div className="w-full max-w-full overflow-x-auto">
            {renderPlantilla()}
          </div>
        </main>
      </div>
    </div>
  );
}