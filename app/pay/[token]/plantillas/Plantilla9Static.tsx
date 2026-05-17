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
    <svg className={className} viewBox="0 0 24 24" fill="none">
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
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function formatMoney(v?: string | null) {
  if (!v) return "0.00";
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(n)) return v;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(v?: string | null) {
  if (!v) return "dd-mm-aaaa";
  const [y, m, d] = String(v).slice(0, 10).split("-");
  if (!y || !m || !d) return v;
  return `${d}-${m}-${y}`;
}

export default function Plantilla5Static({
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

    (async () => {
      const res = await fetch(`/api/plantillas-temporales-3/${token}`, {
        cache: "no-store",
      });

      const json = await res.json();
      setData(json?.data ?? json);
    })();
  }, [token]);

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  if (!data) return <div className="p-6">Cargando...</div>;

  const producto = data.producto_label || data.producto || "GENUINO";
  const monto = data.importe_pagar || data.monto || "0";
  const fecha = formatDate(data.fecha_vencimiento);
  const nombre = data.nombre_cliente || "—";
  const telefono = data.telefono_cliente || "—";
  const metodo = data.metodo_pago_label || data.metodo_pago || "SPEI";
  const cuenta = data.liga_pago_label || data.cuenta_bancaria || ".";

  return (
    <div className="min-h-screen bg-[#dddddd] flex items-center justify-center px-4 py-10">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[420px]">

          {/* HEADER */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <img
              src="/logoa.png"
              alt="logo"
              className="w-[72px] h-[50px] object-contain"
            />

            <div className="text-[30px] font-semibold text-[#eceff1] drop-shadow">
              {producto}
            </div>
          </div>

          {/* BLOQUE NARANJA */}
          <div className="rounded-[16px] bg-[#ff8126] px-5 pt-5 pb-5 shadow-lg">
            <div className="text-center text-[20px] font-medium text-black">
              MONTO A REMBOLSAR
            </div>

            <div className="mt-5 flex justify-between items-center">
              <div className="text-[38px] text-white">
                {formatMoney(monto)}
              </div>
              <div className="text-[38px] text-white">MXN</div>
            </div>

            <div className="mt-7 border-[3px] border-[#ffd67c] p-2">
              <div className="border border-[#ffd67c] px-4 py-4 flex justify-between">
                <span className="font-semibold">Fecha de pago:</span>
                <span>{fecha}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="w-10 h-10 bg-[#4454d8] rounded-full flex items-center justify-center text-white">
                !
              </div>
              <div className="text-sm text-white">
                El rembolso a tiempo y forma aumenta su cupo crediticio.
              </div>
            </div>
          </div>

          {/* CLIENTE */}
          <div className="mt-5 bg-white rounded-xl p-4 shadow">
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Cliente:</span>
              <span>{nombre}</span>
            </div>

            <div className="flex justify-between mt-3">
              <span className="font-bold text-gray-600">Número:</span>
              <span>{telefono}</span>
            </div>
          </div>

          {/* METODO */}
          <div className="mt-5 text-center bg-white rounded-xl p-4 shadow">
            <div className="bg-[#e57d80] rounded-full py-2 mb-4">
              Metodo de rembolso
            </div>

            <div className="text-[46px] font-black text-[#3341b2]">
              {metodo}
            </div>

            <div className="text-sm italic text-[#3341b2]">
              pagos más rápidos y seguros
            </div>

            <div className="mt-5 border-t pt-4 flex items-center justify-center gap-2">
              <div className="text-[20px] break-all">{cuenta}</div>

              <button
                onClick={() => handleCopy(cuenta)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5"
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              los reembolsos generalmente llevan efecto el mismo día
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}