"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Data = {
  producto?: string | null;
  producto_label?: string | null;

  monto?: string | null;
  importe_pagar?: string | null;

  fecha_vencimiento?: string | null;
  dias_vencidos?: number | null;

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
  if (!v) return "$ 0";
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(n)) return `$ ${v}`;
  return `$ ${n.toLocaleString("en-US")}`;
}

function formatDate(v?: string | null) {
  if (!v) return "dd-mm-aaaa";
  const clean = String(v).slice(0, 10);
  if (!clean.includes("-")) return clean;

  const [y, m, d] = clean.split("-");
  if (!y || !m || !d) return clean;
  return `${d}-${m}-${y}`;
}

export default function Plantilla3Static({
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
        const res = await fetch(`/api/plantillas-temporales-3/${encodeURIComponent(token)}`, {
          cache: "no-store",
        });

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

  const producto = data.producto_label || data.producto || "Cash We";
  const monto = data.importe_pagar || data.monto || "0";
  const fecha = formatDate(data.fecha_vencimiento);
  const dias = data.dias_vencidos ?? 0;
  const nombre = data.nombre_cliente || "—";
  const telefono = data.telefono_cliente || "—";
  const metodo = data.metodo_pago_label || data.metodo_pago || "Transferencia";
  const cuenta = data.liga_pago_label || data.cuenta_bancaria || ".";

  return (
    <div className="min-h-screen w-full bg-[#F3A316] flex items-center justify-center px-3 py-3">
      <div className="w-full max-w-[420px]">
        <div className="mb-2 text-center text-[28px] font-medium text-white">
          Pago de crédito
        </div>

        <div className="overflow-hidden rounded-[42px] bg-[#F4F4F4] shadow-[0_18px_40px_rgba(0,0,0,0.22)] border border-[#E5E5E5]">
          <div className="relative px-5 pt-5 pb-4">
            <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none select-none">
              <div className="text-[86px] font-black leading-none text-[#ECECEC]">
                MX
              </div>
            </div>

            <div className="relative z-10 text-center">
              <div className="text-[34px] sm:text-[38px] font-medium text-[#5A5A5A]">
                {producto}
              </div>
            </div>
          </div>

          <div className="border-t border-[#E4E4E4] px-5 py-4">
            <div className="text-center">
              <div className="w-full bg-transparent text-center text-[34px] sm:text-[40px] font-medium text-black">
                {formatMoney(monto)}
              </div>

              <div className="mt-1 text-[16px] sm:text-[18px] text-[#B7B7B7]">
                Monto de rembolso&nbsp; (MXN)
              </div>
            </div>
          </div>

          <div className="border-t border-[#E4E4E4] px-7 py-3">
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-[18px] sm:text-[20px] text-[#B7B7B7]">
                Valor abonado
              </span>
              <span className="text-right text-[18px] sm:text-[20px] font-semibold text-[#B7B7B7]">
                $ 0
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-[18px] sm:text-[20px] text-[#B7B7B7]">
                Fecha de rembolso
              </span>
              <span className="bg-transparent text-right text-[18px] sm:text-[20px] font-semibold text-[#B7B7B7]">
                {fecha}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-[18px] sm:text-[20px] text-[#B7B7B7]">
                Días vencidos
              </span>
              <span className="text-right text-[18px] sm:text-[20px] font-semibold text-[#B7B7B7]">
                {dias}
              </span>
            </div>
          </div>

          <div className="border-t border-[#E4E4E4] px-5 py-3">
            <div className="mx-auto w-full max-w-[270px]">
              <div className="w-full rounded-full bg-[#F3A316] px-6 py-2 text-center text-[22px] sm:text-[24px] font-bold text-white shadow-md">
                Datos cliente
              </div>
            </div>
          </div>

          <div className="px-5 pb-3">
            <div className="h-[8px] w-full bg-[#F3A316]" />
          </div>

          <div className="px-6 pb-4 text-center">
            <div className="text-[24px] sm:text-[26px] font-extrabold text-black">
  Pago del préstamo
</div>

<div className="mt-4 text-[20px] sm:text-[22px] text-[#6C6C6C]">
  Nombre
</div>
<div className="mt-1 text-[18px] sm:text-[20px] leading-tight text-black text-center break-words">
  {nombre}
</div>

<div className="mt-3 text-[20px] sm:text-[22px] text-[#6C6C6C]">
  Telefono
</div>
<div className="mt-1 text-[18px] sm:text-[20px] text-black text-center break-words">
  {telefono}
</div>

<div className="mt-4 text-[20px] sm:text-[22px] text-[#6C6C6C]">
  Forma de pago
</div>

<div className="mt-1 text-[20px] sm:text-[22px] font-semibold text-[#646464]">
  {metodo}
</div>

            <div className="mt-3 bg-[linear-gradient(90deg,#D9D9D9_0%,#F4F4F4_20%,#F4F4F4_80%,#D9D9D9_100%)] px-4 py-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div
                  className="text-[18px] sm:text-[24px] md:text-[28px] font-semibold leading-tight text-[#4D4D4D] text-center break-all max-w-full"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                  title={cuenta}
                >
                  {cuenta}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(cuenta)}
                  title={copied ? "Copiado" : "Copiar"}
                  aria-label={copied ? "Copiado" : "Copiar cuenta"}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#4D4D4D] hover:bg-black/5 transition"
                >
                  {copied ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <CopyIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2 border-t border-[#DCDCDC] pt-2 text-[11px] leading-snug text-[#8C1F1F]">
              Confirme el método de pago que sea el correcto con el asesor,
              recuerde el rembolso a tiempo aumenta el cupo de crédito
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}