"use client";

import { useEffect, useState } from "react";

type StaticTemplateProps = {
  data: any;
  origin: string;
  copied: boolean;
  onCopy: (text: string) => Promise<void>;
};

function formatMoney(value: any) {
  const raw = String(value ?? "").replace(/,/g, "").trim();
  const num = Number(raw);

  if (!Number.isFinite(num)) return String(value ?? "0");

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/* 🔥 CORREGIDO: dd/mm/yyyy sin hora */
function formatDate(value: any) {
  const s = String(value ?? "").trim();
  if (!s) return "dd/mm/aaaa";

  // 🔥 elimina la hora
  const soloFecha = s.split("T")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
    const [y, m, d] = soloFecha.split("-");
    return `${d}/${m}/${y}`;
  }

  return soloFecha;
}

function normalizeUrl(u: any, origin: string) {
  if (!u) return null;

  let s = String(u).trim().replaceAll("\\", "/");

  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("public/uploads/")) s = s.replace("public/", "");
  if (s.startsWith("uploads/")) s = `/${s}`;
  if (s.startsWith("/")) return origin ? `${origin}${s}` : s;

  return origin ? `${origin}/${s}` : s;
}

export default function Plantilla6Static({
  data,
  origin,
  copied,
  onCopy,
}: StaticTemplateProps) {
  const productoTitulo = String(
    data?.producto ??
      data?.producto_label ??
      data?.subproducto ??
      data?.subproducto_label ??
      "Big pesitos"
  ).trim();

  const importePagar = formatMoney(data?.importe_pagar ?? data?.monto ?? "0");
  const fechaVencimiento = formatDate(data?.fecha_vencimiento);
  const nombre = String(data?.nombre_cliente ?? "—");
  const telefono = String(data?.telefono_cliente ?? "—");

  const metodoPago = String(
    data?.metodo_pago_label ?? data?.metodo_pago ?? "Método no disponible"
  ).trim();

  const cuentaBancaria = String(
    data?.cuenta_bancaria ?? data?.liga_pago_label ?? data?.liga_value ?? ""
  ).trim();

  const ligaPago = String(data?.liga_pago ?? "").trim();

  const fotoHabilitada =
    typeof data?.foto_habilitada === "boolean" ? data.foto_habilitada : true;

  const resolvedLogoUrl = normalizeUrl(
    data?.resolvedLogoUrl ?? data?.logo_url ?? data?.url,
    origin
  );

  const textoParaCopiar = ligaPago || cuentaBancaria;
  const [copiedLocal, setCopiedLocal] = useState(false);

  useEffect(() => {
    if (!copiedLocal) return;
    const t = setTimeout(() => setCopiedLocal(false), 1800);
    return () => clearTimeout(t);
  }, [copiedLocal]);

  async function handleCopy() {
    if (!textoParaCopiar) return;

    try {
      await onCopy(textoParaCopiar);
      setCopiedLocal(true);
    } catch {
      setCopiedLocal(false);
    }
  }

  const copiedFinal = copied || copiedLocal;

  return (
    <div className="min-h-screen bg-[#dcdcdc] flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-[760px] flex justify-center">
        <div className="w-full max-w-[430px]">
          {/* HEADER */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex flex-col items-center shrink-0">
              {fotoHabilitada ? (
                <div className="w-[78px] h-[78px] bg-white rounded-xl flex items-center justify-center overflow-hidden shadow">
                  {resolvedLogoUrl ? (
                    <img
                      src={resolvedLogoUrl}
                      className="w-full h-full object-cover"
                      alt="logo"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-600">IMG</span>
                  )}
                </div>
              ) : null}
            </div>

            <div className="min-w-0 pt-1">
              <div className="text-[18px] sm:text-[20px] text-black font-medium">
                Vinculo de pago
              </div>

              <div className="mt-2 text-[30px] sm:text-[38px] leading-none font-serif font-semibold text-[#1a1a1a] break-words">
                {productoTitulo || "Big pesitos"}
              </div>
            </div>
          </div>

          <div className="w-full h-[5px] bg-black rounded-full mb-6" />

          {/* TITULO */}
          <div className="text-center text-[26px] sm:text-[30px] text-[#1a1a1a] font-medium mb-5">
            Detalle de rembolso
          </div>

          {/* CARD */}
          <div className="bg-[#f3f3f3] rounded-[14px] shadow-md px-5 py-6 border-l-[5px] border-r-[5px] border-[#20c84b]">
            {/* CANTIDAD */}
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Cantidad pendiente
              </span>

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[18px] sm:text-[20px] text-black font-medium shrink-0">
                  $
                </span>
                <span className="text-[18px] sm:text-[20px] text-black font-medium text-right">
                  {importePagar}
                </span>
              </div>
            </div>

            <Divider />

            {/* ABONADO */}
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Valor abonado
              </span>

              <span className="text-[18px] sm:text-[20px] text-black font-medium">
                $ 0
              </span>
            </div>

            <Divider />

            {/* FECHA */}
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Fecha de vencimiento
              </span>

              <span className="text-[18px] sm:text-[20px] text-right text-black font-medium">
                {fechaVencimiento}
              </span>
            </div>

            <Divider />

            {/* NOMBRE */}
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Nombre:
              </span>

              <span className="text-[18px] sm:text-[20px] text-right text-black font-bold break-words">
                {nombre || "—"}
              </span>
            </div>

            <Divider />

            {/* MOVIL */}
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Móvil:
              </span>

              <span className="text-[18px] sm:text-[20px] text-right text-black font-medium break-words">
                {telefono || "—"}
              </span>
            </div>

            <Divider />

            {/* METODO */}
            <div className="text-center text-[24px] sm:text-[28px] font-medium text-black mt-5 mb-5">
              Método de pago
            </div>

            <Divider />

            <div className="mt-5">
              <div className="flex justify-center">
                <div className="max-w-full text-center text-[24px] sm:text-[30px] font-semibold text-black break-words">
                  {metodoPago}
                </div>
              </div>
            </div>

            <Divider className="mt-5" />

            <div className="mt-5">
              <div className="block text-center text-[16px] sm:text-[17px] text-[#505765] mb-2">
                Cuenta
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-[18px] sm:text-[20px] text-[#444]">
                  Clave:
                </span>

                <div className="max-w-full text-center text-[17px] sm:text-[19px] text-[#1f3f86] font-medium break-words">
                  {cuentaBancaria || "No disponible"}
                </div>
              </div>

              {textoParaCopiar ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center rounded-lg border border-[#cfd4dc] bg-white px-4 py-2 text-[14px] font-semibold text-[#1f3f86] shadow-sm transition hover:bg-[#f7f8fb]"
                  >
                    {copiedFinal ? "Copiado" : "Copiar liga de pago"}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="text-center text-[12px] sm:text-[13px] text-[#8f96a6] mt-6">
              los reembolsos generalmente llevan el mismo día
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider({ className = "" }: { className?: string }) {
  return <div className={`w-full h-[1px] bg-[#d6d6d6] ${className}`} />;
}