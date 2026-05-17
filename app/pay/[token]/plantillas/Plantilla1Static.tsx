"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type StaticPayload = {
  token: string;

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

  metodo_pago?: string | null;
  cuenta_bancaria?: string | null;

  logo_url?: string | null;

  labels?: Record<string, string> | null;
};

function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 9h10v10H9V9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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

function normalizePayload(raw: any): StaticPayload {
  const p = raw ?? {};

  const productoLabel = p.producto_label ?? p.subproducto_label ?? p.producto ?? "Producto";
  const subproductoLabel = p.subproducto_label ?? p.subproducto ?? p.producto ?? null;

  const metodoPagoLabel = p.metodo_pago_label ?? p.metodo_pago ?? null;
  const ligaPagoLabel = p.liga_pago_label ?? p.cuenta_bancaria ?? null;

  const logoUrl = p.logo_url ?? p.url ?? p.imagen_url ?? p.logoUrl ?? p.logo ?? null;
  const monto = p.monto ?? p.importe_pagar ?? null;

  return {
    ...p,
    token: String(p.token ?? ""),
    producto_label: String(productoLabel ?? "Producto"),
    subproducto_label: subproductoLabel != null ? String(subproductoLabel) : null,
    metodo_pago_label: metodoPagoLabel != null ? String(metodoPagoLabel) : null,
    metodo_pago: p.metodo_pago != null ? String(p.metodo_pago) : null,
    liga_pago_label: ligaPagoLabel != null ? String(ligaPagoLabel) : null,
    logo_url: logoUrl != null ? String(logoUrl) : null,
    monto: monto != null ? String(monto) : null,
  };
}

export default function PagoFastCashStatic({
  token: tokenProp,
}: {
  token?: string;
}) {
  const params = useParams<{ token?: string }>();
  const token = String(tokenProp || params?.token || "").trim();

  const [data, setData] = useState<StaticPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const origin = useMemo(() => (typeof window === "undefined" ? "" : window.location.origin), []);

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

        const endpoints = [
          `/api/plantillas-temporales-3/${encodeURIComponent(token)}`,
          `/api/plantillas-temporales/${encodeURIComponent(token)}`,
        ];

        let lastErr: any = null;

        for (const url of endpoints) {
          const res = await fetch(url, { cache: "no-store" });
          const json = await res.json().catch(() => ({}));

          if (res.ok) {
            const payload = normalizePayload((json as any)?.data ?? json);
            payload.token = payload.token || token;
            if (!cancel) setData(payload);
            return;
          }

          lastErr = (json as any)?.error || `Error cargando plantilla (${res.status})`;
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
    return <div className="min-h-screen bg-black text-white p-6 sm:p-10">Cargando...</div>;
  }

  const cardBg = data.card_bg_color || "#FFFFFF";
  const primaryColor = data.primary_color || "#0F56F7";
  const mostrarExtras = data.mostrar_extras !== false;
  const fotoHabilitada = data.foto_habilitada !== false;

  const logoRaw = data.logo_url ?? null;
  const logoUrl =
    logoRaw && typeof logoRaw === "string" && logoRaw.startsWith("/") ? `${origin}${logoRaw}` : logoRaw;

  const titulo = data.producto_label ?? data.subproducto_label ?? "Producto";
  const ligaText = String(data.liga_pago_label ?? "").trim();
  const metodoText = String(data.metodo_pago_label ?? data.metodo_pago ?? "").trim() || "—";

  const formatDateReadable = (iso: string | null | undefined) => {
    if (!iso) return "—";
    try {
      return new Date(String(iso).slice(0, 10) + "T00:00:00").toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
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



          <h1 className="mt-4 sm:mt-5 text-2xl sm:text-3xl font-extrabold text-[#0F2A44] text-center px-4 leading-tight">
            {titulo}
          </h1>
        </div>

        <div className="mx-3 sm:mx-4 -mt-4 rounded-xl p-4 text-white shadow-md" style={{ backgroundColor: primaryColor }}>
          <div className="text-xs opacity-90">Monto de Préstamo</div>
          <div className="text-2xl sm:text-3xl font-bold">{data.monto ?? "$0.00"}</div>
        </div>

        <div className="px-3 sm:px-4 py-5 flex flex-col gap-4">
          <div className="rounded-xl border p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
            <div className="flex justify-between items-center py-3 border-b gap-3">
              <span className="text-sm font-medium text-gray-700">Importe a Pagar</span>
              <span className="text-sm font-semibold text-gray-600 text-right break-words">
                {data.importe_pagar ?? "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b gap-3">
              <span className="text-sm font-medium text-gray-700">Fecha Vencimiento</span>
              <span className="text-sm text-gray-600 text-right break-words">
                {data.fecha_vencimiento ? formatDateReadable(data.fecha_vencimiento) : "dd/mm/aaaa"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 gap-3">
              <span className="text-sm font-medium text-gray-700">Días vencimiento</span>
              <span className="text-sm text-gray-500 text-right">{data.dias_vencidos ?? 0} días</span>
            </div>
          </div>

          <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
            <div className="text-sm font-medium text-gray-700 mb-2">Pago (México)</div>

            <div className="flex items-center justify-center bg-[#F8FAFB] p-4 rounded-md">
              <div className="text-center w-full">
                <div className="text-xs text-gray-500">{metodoText}</div>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="text-xl sm:text-2xl font-extrabold tracking-wide text-gray-700 break-words">
                    {data.liga_pago_label ?? "."}
                  </div>

                  <button
                    type="button"
                    title={copied ? "Copiado" : "Copiar"}
                    aria-label={copied ? "Copiado" : "Copiar liga"}
                    onClick={() => ligaText && copyToClipboard(ligaText)}
                    disabled={!ligaText}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 border border-slate-200/70 text-slate-600 shadow-sm hover:bg-white hover:text-slate-800 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                  </button>
                </div>

                <div className="mt-2 text-[11px] text-gray-500 text-center">{metodoText}</div>
                <div className="mt-1 text-[11px] text-gray-500 text-center">{data.liga_pago_label ?? "."}</div>
              </div>
            </div>
          </div>

          {mostrarExtras && (
            <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: cardBg }}>
              <div className="flex justify-between items-center py-2 border-b gap-3">
                <span className="text-sm font-medium text-gray-700">Nombre</span>
                <span className="text-sm text-gray-700 text-right break-words">{data.nombre_cliente ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 gap-3">
                <span className="text-sm font-medium text-gray-700">Teléfono</span>
                <span className="text-sm text-gray-700 text-right break-words">{data.telefono_cliente ?? "—"}</span>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}