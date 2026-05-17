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

/* 🔥 dd/mm/yyyy sin hora */
function formatDate(value: any) {
  const s = String(value ?? "").trim();
  if (!s) return "dd/mm/aaaa";

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

export default function Plantilla7Static({
  data,
  origin,
  copied,
  onCopy,
}: StaticTemplateProps) {
  const productoTitulo = String(
    data?.producto ??
      data?.producto_label ??
      data?.subproducto ??
      "Red Crédito"
  );

  const importePagar = formatMoney(data?.importe_pagar ?? data?.monto ?? "0");
  const fechaVencimiento = formatDate(data?.fecha_vencimiento);
  const nombre = String(data?.nombre_cliente ?? "—");
  const telefono = String(data?.telefono_cliente ?? "—");

  const metodoPago = String(
    data?.metodo_pago_label ?? data?.metodo_pago ?? "Método"
  );

  const cuentaBancaria = String(
    data?.cuenta_bancaria ?? data?.liga_pago_label ?? data?.liga_value ?? ""
  );

  const ligaPago = String(data?.liga_pago ?? "").trim();

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
    <div className="min-h-screen bg-[#dcdcdc] flex items-center justify-center px-3 py-4">
      <div className="w-full max-w-[760px] flex justify-center">
        <div className="w-full max-w-[430px]">

          {/* HEADER */}
          <div className="flex items-center justify-center gap-4 mb-3">
            {resolvedLogoUrl ? (
              <img
                src={resolvedLogoUrl}
                className="w-[92px] h-[72px] object-contain"
                alt="logo"
              />
            ) : (
              <div className="w-[92px] h-[72px] bg-gray-300 rounded-xl" />
            )}

            <div className="text-[30px] sm:text-[38px] font-serif font-semibold text-black">
              {productoTitulo}
            </div>
          </div>

          {/* CARD ROJA */}
          <div className="rounded-[20px] bg-[#ff1a23] px-5 pt-4 pb-3 shadow-lg">

            <div className="text-center text-[18px] text-[#6f5d5d]">
              Monto a rembolsar
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center justify-center gap-2 w-full">
                <span className="text-[46px] text-white">$</span>
                <span className="text-[46px] text-white">
                  {importePagar}
                </span>
                <span className="text-[46px] text-white">MXN</span>
              </div>

              <div className="w-[70px] h-[70px] rounded-[22px] border border-white/40 flex items-center justify-center">
                ▶
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <span className="text-[22px] text-[#3d3838]">
                Fecha de pago:
              </span>

              <span className="text-[22px] font-semibold text-[#3d3838]">
                {fechaVencimiento}
              </span>
            </div>

            <div className="mt-5 rounded-[20px] border border-white/30 bg-[#ff2530] px-4 py-3 flex items-center gap-4">
              <div className="w-[50px] h-[50px] rounded-full bg-[#4b49a9] flex items-center justify-center text-white text-[24px]">
                !
              </div>

              <div className="text-white text-[15px]">
                El rembolso a tiempo aumentará su cupo de crédito.
              </div>
            </div>
          </div>

          {/* CLIENTE */}
          <div className="mt-4 rounded-[18px] bg-[#f5f5f5] px-5 py-4 shadow">
            <Row label="Cliente:" value={nombre} />
            <Row label="Número:" value={telefono} />
          </div>

          {/* MÉTODO */}
          <div className="mt-4">
            <div className="mx-auto w-full max-w-[360px] bg-white/30 p-2">
              <div className="rounded-[18px] bg-[#e57d80] text-center py-2 text-[28px] text-black">
                Metodo de rembolso
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-[44px] font-black text-[#3441b2]">
                {metodoPago}
              </div>

              <div className="mt-1 text-[16px] italic text-[#3441b2]">
                pagos más rápidos y seguros
              </div>
            </div>

            <div className="mt-4 border-t pt-4 text-center">
              <div className="text-[30px] font-bold text-[#1f3f86] break-all">
                {cuentaBancaria || "No disponible"}
              </div>

              {textoParaCopiar && (
                <button
                  onClick={handleCopy}
                  className="mt-3 px-4 py-2 bg-white rounded-lg shadow text-sm font-semibold text-[#1f3f86]"
                >
                  {copiedFinal ? "Copiado" : "Copiar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔥 FIX: valores alineados a la derecha */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-[22px] text-[#555] font-bold">{label}</span>
      <span className="text-[22px] text-black text-right break-words">
        {value}
      </span>
    </div>
  );
}