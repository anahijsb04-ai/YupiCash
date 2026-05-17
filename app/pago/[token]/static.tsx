"use client";

import { useEffect, useMemo, useState } from "react";

type StaticPayload = {
  token: string;
  
  pagado?: boolean | null;
  card_bg_color?: string | null;
  primary_color?: string | null;
  mostrar_extras?: boolean | null;
  foto_habilitada?: boolean | null;

  monto?: string | null;
  importe_pagar?: string | null;
  fecha_vencimiento?: string | null;
  dias_vencidos?: number | null;

  nombre_cliente?: string | null;
  telefono_cliente?: string | null;

  producto_label?: string | null;
  subproducto_label?: string | null;
  metodo_pago_label?: string | null;
  liga_pago_label?: string | null;

  cuenta_bancaria?: string | null;
  logo_url?: string | null;

  liga_value?: string | number | null;
  referencia?: string | number | null;

  labels?: Record<string, string> | null;
};

function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Normaliza payloads para que funcionen con:
 * - /api/plantillas-temporales/[token] (vieja)
 * - /api/plantillas-temporales-2/[token] (nueva / plantillas_temporales)
 */
function normalizePayload(raw: any): StaticPayload {
  const p = raw ?? {};

  // El POST nuevo guarda "producto" (no subproducto_label)
  const productoLabel = p.producto_label ?? p.subproducto_label ?? p.producto ?? "Producto";
  const subproductoLabel = p.subproducto_label ?? p.producto ?? p.subproducto ?? null;

  // Liga: si no existe liga_pago_label, mostramos cuenta_bancaria (SPEI)
  const ligaPagoLabel = p.liga_pago_label ?? p.cuenta_bancaria ?? null;

  // Método: default SPEI si no lo manda
  const metodoPagoLabel = p.metodo_pago_label ?? (p.cuenta_bancaria ? "SPEI" : null);

  // Logo: soporta varios nombres
  const logoUrl =
    p.logo_url ?? p.url ?? p.imagen_url ?? p.logoUrl ?? p.logo ?? null;

  // Monto: tu UI muestra data.monto en el header, así que si viene vacío pero hay importe_pagar, úsalo
  const monto = p.monto ?? p.importe_pagar ?? null;

  const out: StaticPayload = {
    ...p,
    token: String(p.token ?? ""),
    producto_label: productoLabel,
    subproducto_label: subproductoLabel,
    liga_pago_label: ligaPagoLabel,
    metodo_pago_label: metodoPagoLabel,
    logo_url: logoUrl,
    monto,
  };

  return out;
}

export default function PagoFastCashStatic({ token }: { token: string }) {
  const [data, setData] = useState<StaticPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  useEffect(() => {
    if (!token) {
      setError("Token no recibido en la URL");
      return;
    }

    let cancel = false;

    (async () => {
      try {
        setError(null);

        // ✅ Primero intenta la API nueva, luego fallback a la vieja
        const endpoints = [
          `/api/plantillas-temporales-2/${encodeURIComponent(token)}`,
          `/api/plantillas-temporales/${encodeURIComponent(token)}`,
        ];

        let lastErr: any = null;

        for (const url of endpoints) {
          const res = await fetch(url, { cache: "no-store" });
          const json = await res.json().catch(() => ({}));
          if (res.ok) {
            const payload = normalizePayload(json?.data ?? json);

            // 🔥 AQUI CORRECTO (funciona con ambas APIs)
            const yaPagado = json?.pagado === true || payload?.pagado === true;

            if (yaPagado) {
              window.location.replace("/gracias");
              return;
            }

            payload.token = payload.token || token;

            if (!cancel) setData(payload);
            return;
          }

          lastErr = json?.error || `Error cargando plantilla (${res.status})`;
        }

        if (!cancel) setError(lastErr || "No se pudo cargar la plantilla");
      } catch {
        if (!cancel) setError("Error de conexión");
      }
    })();

    return () => {
      cancel = true;
    };
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 sm:p-10">
        <div className="text-red-400 font-semibold">Error:</div>
        <div className="mt-2 break-words">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white p-6 sm:p-10">
        Cargando...
      </div>
    );
  }

  const cardBg = data.card_bg_color || "#FFFFFF";
  const primaryColor = data.primary_color || "#0F56F7";
  const mostrarExtras = data.mostrar_extras !== false;
  const fotoHabilitada = data.foto_habilitada !== false;

  const pickLabel = (key: string, fallback: string) => {
    if (data?.labels && data.labels[key]) return data.labels[key];
    return fallback;
  };

  const labelSubproducto = pickLabel("subproducto_lista_id", "Subproducto");
  const labelMetodo = pickLabel("metodo_pago_lista_id", "Método de pago");

  const logoRaw = data.logo_url ?? null;
  const logoUrl =
    logoRaw && typeof logoRaw === "string" && logoRaw.startsWith("/")
      ? `${origin}${logoRaw}`
      : logoRaw;

  const rawTitulo = data.producto_label ?? data.subproducto_label ?? "Producto";
  const prettyTitulo =
    rawTitulo && /^\d+$/.test(rawTitulo) ? `${rawTitulo}` : rawTitulo;

  const ligaText = String(data.liga_pago_label ?? "").trim();

  const formatDateReadable = (iso: string | null | undefined) => {
    if (!iso) return "—";
    try {
      return new Date(String(iso).slice(0, 10) + "T00:00:00").toLocaleDateString(
        undefined,
        { day: "2-digit", month: "long", year: "numeric" }
      );
    } catch {
      return String(iso);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-3 py-6 sm:p-6 bg-[#152032]">
      <div
        className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: cardBg }}
      >
        {/* HEADER */}
        <div
          className="w-full h-[150px] sm:h-[160px] flex flex-col items-center pt-5 sm:pt-6"
          style={{ background: "linear-gradient(180deg,#5CB0FF 0%,#A3D4FF 100%)" }}
        >
          {fotoHabilitada && (
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow">
              {logoUrl ? (
                <img src={logoUrl} className="w-full h-full object-cover" alt="logo" />
              ) : (
                <span className="text-lg font-bold text-[#142546]">IMG</span>
              )}
            </div>
          )}

          <h1
            className="
              mt-4 sm:mt-5
              text-2xl sm:text-3xl
              font-extrabold
              tracking-wide
              font-sans
              text-[#0F2A44]
              drop-shadow-sm
              text-center
              px-4
              leading-tight
            "
            style={{ letterSpacing: "0.04em" }}
          >
            {prettyTitulo}
          </h1>
        </div>

        {/* MONTO */}
        <div
          className="mx-3 sm:mx-4 -mt-4 rounded-xl p-4 text-white shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="text-xs opacity-90">Importe a pagar</div>
          <div className="text-2xl sm:text-3xl font-bold">{data.monto ?? "$0.00"}</div>
        </div>

        {/* CONTENIDO */}
        <div className="px-3 sm:px-4 py-5 flex flex-col gap-4">
          <div className="rounded-xl border p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
            <div className="flex justify-between items-center py-3 border-b gap-3">
              <span className="text-sm font-medium text-gray-700">{labelSubproducto}</span>
              <span className="text-sm text-gray-600 text-right break-words">
                {data.subproducto_label ?? "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b gap-3">
              <span className="text-sm font-medium text-gray-700">Importe a Pagar</span>
              <span className="text-sm font-semibold text-gray-600 text-right break-words">
                {data.importe_pagar ?? "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b gap-3">
              <span className="text-sm font-medium text-gray-700">Fecha Vencimiento</span>
              <span className="text-sm text-gray-600 text-right break-words">
                {formatDateReadable(data.fecha_vencimiento)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 gap-3">
              <span className="text-sm font-medium text-gray-700">Días vencimiento</span>
              <span className="text-sm text-gray-500 text-right">
                {data.dias_vencidos ?? 0} días
              </span>
            </div>
          </div>

          {/* MÉTODO + LIGA */}
          <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
            <div className="text-sm font-medium text-gray-700 mb-2">{labelMetodo}</div>

            <div className="flex items-center justify-center bg-[#F8FAFB] p-4 rounded-md">
              <div className="text-center w-full">
                <div className="text-xs text-gray-500">{data.metodo_pago_label ?? "—"}</div>

                {/* Liga + botón sutil */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="text-xl sm:text-2xl font-extrabold tracking-wide text-gray-700 break-words">
                    {data.liga_pago_label ?? "—"}
                  </div>

                  <button
                    type="button"
                    title={copied ? "Copiado" : "Copiar"}
                    aria-label={copied ? "Copiado" : "Copiar liga"}
                    onClick={() => {
                      if (ligaText) copyToClipboard(ligaText);
                    }}
                    disabled={!ligaText}
                    className="
                      inline-flex items-center justify-center
                      w-9 h-9
                      rounded-xl
                      bg-white/70
                      border border-slate-200/70
                      text-slate-600
                      shadow-sm
                      hover:bg-white
                      hover:text-slate-800
                      active:scale-[0.98]
                      transition
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shrink-0
                    "
                  >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                  </button>
                </div>

                <div className="mt-2 text-[11px] text-gray-500 text-center">
                  Toca el ícono para copiar y luego pega en tu app/banco.
                </div>
              </div>
            </div>
          </div>

          {/* EXTRAS */}
          {mostrarExtras && (
            <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
              <div className="flex justify-between items-center py-2 border-b gap-3">
                <span className="text-sm font-medium text-gray-700">Nombre</span>
                <span className="text-sm text-gray-700 text-right break-words">
                  {data.nombre_cliente ?? "—"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 gap-3">
                <span className="text-sm font-medium text-gray-700">Teléfono</span>
                <span className="text-sm text-gray-700 text-right break-words">
                  {data.telefono_cliente ?? "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
