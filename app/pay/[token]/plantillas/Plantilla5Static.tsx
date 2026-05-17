"use client";

import { useEffect, useMemo, useState } from "react";

type StaticTemplateProps = {
  data: any;
  origin: string;
  copied: boolean;
  onCopy: (text: string) => Promise<void>;
};

function formatMoney(value: any) {
  const raw = String(value ?? "").replace(/,/g, "").trim();
  const num = Number(raw);

  if (!Number.isFinite(num)) return String(value ?? "0.00");

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* 🔥 CORREGIDO: elimina hora y deja día-mes-texto-año */
function formatDateDisplay(value: any) {
  const s = String(value ?? "").trim();
  if (!s) return "dd-mes-aaaa";

  // 🔥 elimina la hora tipo T05:00:00.000Z
  const soloFecha = s.split("T")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
    const [y, m, d] = soloFecha.split("-");

    const meses = [
      "enero","febrero","marzo","abril","mayo","junio",
      "julio","agosto","septiembre","octubre","noviembre","diciembre"
    ];

    const mesTexto = meses[Number(m) - 1] || m;

    return `${d}-${mesTexto}-${y}`;
  }

  return soloFecha;
}

export default function Plantilla5Static({
  data,
  copied,
  onCopy,
}: StaticTemplateProps) {
  const productoTitulo = String(
    data?.producto ??
      data?.producto_label ??
      data?.subproducto ??
      data?.subproducto_label ??
      "Big pesitos"
  );

  const importePagar = formatMoney(
    data?.importe_pagar ?? data?.monto ?? "0.00"
  );

  const fechaVencimiento = formatDateDisplay(data?.fecha_vencimiento);

  const nombre =
    data?.mostrar_extras === false
      ? ""
      : String(data?.nombre_cliente ?? "—");

  const telefono =
    data?.mostrar_extras === false
      ? ""
      : String(data?.telefono_cliente ?? "—");

  const metodoPago = String(
    data?.metodo_pago_label ??
      data?.metodo_pago ??
      "Método de pago"
  ).trim();

  const cuentaBancaria = String(
    data?.cuenta_bancaria ??
      data?.liga_pago_label ??
      data?.liga_value ??
      ""
  ).trim();

  const ligaPago = String(data?.liga_pago ?? "").trim();

  const textoParaCopiar = ligaPago || cuentaBancaria;

  const [copiedLocal, setCopiedLocal] = useState(false);

  useEffect(() => {
    if (!copiedLocal) return;
    const t = setTimeout(() => setCopiedLocal(false), 1800);
    return () => clearTimeout(t);
  }, [copiedLocal]);

  const handleCopy = async () => {
    if (!textoParaCopiar) return;

    try {
      if (onCopy) {
        await onCopy(textoParaCopiar);
      } else if (navigator?.clipboard) {
        await navigator.clipboard.writeText(textoParaCopiar);
      }
      setCopiedLocal(true);
    } catch {
      setCopiedLocal(false);
    }
  };

  const avisoCopiado = copied || copiedLocal;

  return (
    <div className="min-h-screen bg-[#dddddd] flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-[760px] flex justify-center">
        <div className="w-full max-w-[430px]">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <img
              src="/logoa.png"
              alt="logo"
              className="w-[68px] h-[48px] object-contain"
            />

            <div className="text-[26px] sm:text-[32px] font-semibold text-[#eceff1] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] text-center">
              {productoTitulo}
            </div>
          </div>

          {/* Bloque naranja */}
          <div className="rounded-[16px] bg-[#ff8126] px-4 sm:px-5 pt-4 sm:pt-5 pb-5 shadow-lg">
            <div className="text-center text-[18px] sm:text-[20px] font-medium text-black">
              MONTO A REMBOLSAR
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="w-full text-[34px] sm:text-[40px] leading-none text-white text-center break-words font-normal">
                {importePagar}
              </div>

              <div className="text-[34px] sm:text-[40px] text-white shrink-0">
                MXN
              </div>
            </div>

            <div className="mt-7 border-[3px] border-[#ffd67c] p-2">
              <div className="border border-[#ffd67c] px-4 py-4 flex items-center justify-between gap-4">
                <span className="text-[18px] sm:text-[20px] font-semibold text-white">
                  Fecha de pago:
                </span>

                <span className="text-right text-[17px] sm:text-[19px] text-white">
                  {fechaVencimiento}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#4454d8] flex items-center justify-center text-white text-[28px] font-bold shrink-0">
                !
              </div>

              <div className="text-[14px] sm:text-[15px] leading-snug text-white">
                El rembolso a tiempo y forma aumenta su cupo crediticio.
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="mt-5 rounded-[18px] bg-white px-5 py-6 shadow">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[22px] sm:text-[24px] font-bold text-[#555] shrink-0">
                Cliente:
              </span>
              <span className="text-[18px] sm:text-[20px] text-[#222] text-right break-words">
                {nombre || "—"}
              </span>
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <span className="text-[22px] sm:text-[24px] font-bold text-[#555] shrink-0">
                Número:
              </span>
              <span className="text-[18px] sm:text-[20px] text-[#222] text-right break-words">
                {telefono || "—"}
              </span>
            </div>
          </div>

          {/* Método */}
          <div className="mt-5 rounded-[18px] bg-white px-5 py-6 shadow">
            <div className="mx-auto w-full max-w-[350px] bg-white/30 p-2">
              <div className="rounded-[18px] bg-[#e57d80] text-center py-3 text-[18px] sm:text-[20px] text-white">
                Metodo de rembolso
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="mx-auto max-w-full text-center text-[28px] sm:text-[34px] font-extrabold leading-tight text-[#3341b2] break-words">
                {metodoPago || "Método de pago"}
              </div>

              <div className="mt-2 text-[15px] sm:text-[16px] italic font-semibold text-[#3341b2]">
                pagos más rápidos y seguros
              </div>
            </div>

            <div className="mt-6 border-t-2 border-[#d7d7d7] pt-6">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="max-w-full text-center text-[22px] sm:text-[26px] font-bold text-[#5f6470] break-all">
                  {cuentaBancaria || "Sin número disponible"}
                </div>

                {textoParaCopiar ? (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center rounded-lg border border-[#cfd4dc] bg-white px-4 py-2 text-[14px] font-semibold text-[#3341b2] shadow-sm transition hover:bg-[#f7f8fb]"
                  >
                    {avisoCopiado ? "Copiado" : "Copiar liga de pago"}
                  </button>
                ) : null}

                <div className="text-center text-[12px] sm:text-[13px] text-[#9aa3b2]">
                  los reembolsos generalmente llevan efecto el mismo día
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}