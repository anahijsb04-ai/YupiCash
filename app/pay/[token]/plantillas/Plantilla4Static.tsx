"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Data = {
  producto?: string | null;
  producto_label?: string | null;

  monto?: string | null;
  importe_pagar?: string | null;

  fecha_vencimiento?: string | null;

  nombre_cliente?: string | null;
  telefono_cliente?: string | null;

  metodo_pago_label?: string | null;
  metodo_pago?: string | null;

  liga_pago_label?: string | null;
  cuenta_bancaria?: string | null;
};

function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 9h10v10H9V9Z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function formatMoney(v?: string | null) {
  if (!v) return "0.0";
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatDate(v?: string | null) {
  if (!v) return "dd-mm-aaaa";
  const clean = String(v).slice(0, 10);
  if (!clean.includes("-")) return clean;

  const [y, m, d] = clean.split("-");
  if (!y || !m || !d) return clean;
  return `${d}-${m}-${y}`;
}

export default function Plantilla4Static({
  token: tokenProp,
}: {
  token?: string;
}) {
  const params = useParams<{ token?: string }>();
  const token = String(tokenProp || params?.token || "").trim();

  const [data, setData] = useState<Data | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancel = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/plantillas-temporales-3/${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );

        const json = await res.json().catch(() => ({}));
        const payload = json?.data ?? json;

        if (!cancel) setData(payload);
      } catch {
        if (!cancel) setData(null);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [token]);

  async function handleCopy(text: string) {
    if (!text) return;

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

  if (!data) {
    return <div className="text-white p-6">Cargando...</div>;
  }

  const producto = data.producto_label || data.producto || "Producto";
  const monto = data.importe_pagar || data.monto || "0";
  const fecha = formatDate(data.fecha_vencimiento);
  const nombre = data.nombre_cliente || "—";
  const telefono = data.telefono_cliente || "—";
  const metodo = data.metodo_pago_label || data.metodo_pago || "SPEI";
  const cuenta = data.liga_pago_label || data.cuenta_bancaria || ".";

  return (
    <div className="min-h-screen bg-[#e9e9e9] flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-[420px]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[28px] font-semibold text-black">
            {producto} <span className="text-green-500">Crédito</span>
          </div>
          <div className="text-[22px]">🇲🇽</div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="bg-[#5c5c5c] rounded-2xl p-5 text-white shadow-lg">
          <div className="text-[22px] opacity-80 mb-2">Monto a pagar:</div>

          <div className="flex items-center justify-between gap-2">
            <div className="bg-transparent text-[36px] font-semibold w-full">
              {formatMoney(monto)}
            </div>
            <span className="text-[18px] shrink-0">MXN</span>
          </div>

          <div className="mt-4 text-[16px] opacity-80">
            fecha de rembolso: {fecha}
          </div>

          {/* ALERTA */}
          <div className="mt-4 bg-[#6b6b6b] rounded-xl p-4 flex items-center gap-3">
            <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
              !
            </div>
            <div className="text-[16px] leading-tight">
              El rembolso a tiempo y forma aumenta su cupo de crédito
            </div>
          </div>
        </div>

        {/* CLIENTE */}
        <div className="mt-4 bg-white rounded-xl p-4 shadow">
          <div className="flex justify-between gap-4 text-[16px]">
            <span className="font-semibold text-gray-600 shrink-0">Cliente:</span>
            <span className="text-black text-right break-words">{nombre}</span>
          </div>

          <div className="flex justify-between gap-4 mt-2 text-[16px]">
            <span className="font-semibold text-gray-600 shrink-0">Número:</span>
            <span className="text-gray-800  text-right break-words">{telefono}</span>
          </div>
        </div>

        {/* METODO */}
        <div className="mt-4 text-[18px] text-gray-500">
          Método de reembolso
        </div>

        <div className="mt-2 bg-white rounded-xl p-4 shadow">
          <div className="text-center text-[18px] text-gray-500 mb-2">
            Metodo de pago
          </div>

          {/* METODO DE PAGO */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="bg-transparent text-[36px] font-bold text-[#2E3FA8] text-center">
              {metodo}
            </div>
          </div>

          {/* CUENTA */}
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <div className="bg-transparent text-[18px] text-[#2E3FA8] text-center break-all max-w-full">
              {cuenta}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(cuenta)}
              title={copied ? "Copiado" : "Copiar"}
              aria-label={copied ? "Copiado" : "Copiar cuenta"}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#2E3FA8] hover:bg-black/5 transition"
            >
              {copied ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <CopyIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-4 border-t pt-3 text-[12px] text-gray-400 text-center">
            los reembolsos generalmente llevan efecto el mismo día
          </div>
        </div>
      </div>
    </div>
  );
}