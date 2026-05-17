"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type StaticPayload = {
  token: string;
  producto?: string | null;
  producto_label?: string | null;
  subproducto_label?: string | null;

  monto?: string | null;
  importe_pagar?: string | null;
  fecha_vencimiento?: string | null;
  dias_vencidos?: number | null;

  metodo_pago_label?: string | null;
  metodo_pago?: string | null;
  cuenta_bancaria?: string | null;
  liga_pago_label?: string | null;

  mostrar_extras?: boolean | null;
  nombre_cliente?: string | null;
  telefono_cliente?: string | null;

  primary_color?: string | null;
};

function normalizePayload(raw: any): StaticPayload {
  const p = raw ?? {};

  return {
    ...p,
    token: String(p.token ?? ""),
    producto_label:
      p.producto_label ?? p.subproducto_label ?? p.producto ?? "PRODUCTO",
    monto: p.monto ?? p.importe_pagar ?? null,
    importe_pagar: p.importe_pagar ?? p.monto ?? null,
    metodo_pago_label: p.metodo_pago_label ?? p.metodo_pago ?? null,
    cuenta_bancaria: p.cuenta_bancaria ?? p.liga_pago_label ?? null,
  };
}

function truncateMiddle(text?: string | null, max = 22) {
  if (!text) return "";
  const t = String(text).trim();
  if (t.length <= max) return t;

  const start = t.slice(0, 10);
  const end = t.slice(-8);
  return `${start}...${end}`;
}

function formatMoneyWhole(value?: string | null) {
  if (!value) return "$ 0";
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(n)) return `$ ${value}`;
  return `$ ${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatBigMoney(value?: string | null) {
  if (!value) return "$0.00";
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(n)) return `$${value}`;

  const [intPart, decPart] = n.toFixed(2).split(".");
  return {
    intPart: `$${Number(intPart).toLocaleString("en-US")}`,
    decPart,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "dd/mm/aaaa";

  const clean = String(value).slice(0, 10);
  if (!clean.includes("-")) return clean;

  const [y, m, d] = clean.split("-");
  if (!y || !m || !d) return clean;
  return `${d}-${m}-${y}`;
}

/* SOLO BAJAMOS EL TAMAÑO DEL MONTO, SIN ROMPER LA PLANTILLA */
function getMoneyScale(value?: string | null) {
  const raw = String(value ?? "").replace(/[^\d]/g, "");
  const len = raw.length;

  if (len >= 10) {
    return {
      int: "text-[20px] sm:text-[28px] md:text-[34px]",
      dec: "text-[12px] sm:text-[16px] md:text-[20px]",
    };
  }

  if (len >= 8) {
    return {
      int: "text-[24px] sm:text-[34px] md:text-[42px]",
      dec: "text-[14px] sm:text-[20px] md:text-[24px]",
    };
  }

  if (len >= 6) {
    return {
      int: "text-[28px] sm:text-[40px] md:text-[50px]",
      dec: "text-[16px] sm:text-[22px] md:text-[28px]",
    };
  }

  return {
    int: "text-[32px] sm:text-[48px] md:text-[58px]",
    dec: "text-[18px] sm:text-[28px] md:text-[34px]",
  };
}

export default function Plantilla2Static({
  token: tokenProp,
}: {
  token?: string;
}) {
  const params = useParams<{ token?: string }>();
  const token = String(tokenProp || params?.token || "").trim();

  const [data, setData] = useState<StaticPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const preventContext = (e: MouseEvent) => e.preventDefault();

    const preventKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (
        key === "f12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && key === "u")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", preventContext);
    window.addEventListener("keydown", preventKeys, true);

    return () => {
      document.removeEventListener("contextmenu", preventContext);
      window.removeEventListener("keydown", preventKeys, true);
    };
  }, []);

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

        let loaded = false;
        let lastErr: string | null = null;

        for (const url of endpoints) {
          const res = await fetch(url, { cache: "no-store" });
          const json = await res.json().catch(() => ({}));

          if (res.ok) {
            const payload = normalizePayload((json as any)?.data ?? json);
            payload.token = payload.token || token;

            if (!cancel) setData(payload);
            loaded = true;
            break;
          } else {
            lastErr =
              (json as any)?.error ||
              `Error cargando plantilla (${res.status})`;
          }
        }

        if (!loaded && !cancel) {
          setError(lastErr || "No se pudo cargar la plantilla");
        }
      } catch {
        if (!cancel) setError("Error de conexión");
      }
    })();

    return () => {
      cancel = true;
    };
  }, [token]);

  async function handleCopy(text?: string | null) {
    const value = String(text ?? "").trim();
    if (!value || value === ".") return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div>
          <div className="text-red-400 font-semibold">Error:</div>
          <div className="mt-2">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  const primaryColor = data.primary_color || "#4348D0";
  const productoTitulo = data.producto_label || "PRODUCTO";
  const importePagar = data.importe_pagar || data.monto || "0.00";
  const diasVencidos = data.dias_vencidos ?? 0;
  const fechaVencimiento = data.fecha_vencimiento || "";
  const metodoPagoLabel = data.metodo_pago_label || "SPEI";
  const cuentaBancaria =
    data.cuenta_bancaria || data.liga_pago_label || ".";
  const mostrarExtras = data.mostrar_extras !== false;
  const nombre = data.nombre_cliente || "—";
  const telefono = data.telefono_cliente || "—";
  const moneyBig = formatBigMoney(importePagar);
  const moneyScale = getMoneyScale(importePagar);
  const cuentaBancariaMobile = truncateMiddle(cuentaBancaria, 24);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="w-full max-w-[900px] flex justify-center">
        <div className="w-full max-w-[900px] bg-[#efefef] rounded-[14px] sm:rounded-[18px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.22)] border border-[#e3e3e3]">
          <div className="relative bg-[#efefef] px-4 sm:px-8 pt-4 sm:pt-6 pb-3">
            <div className="absolute left-0 top-0 h-12 w-12 sm:h-20 sm:w-20 overflow-hidden">
              <div className="absolute -left-5 -top-4 w-16 sm:w-28 h-[4px] sm:h-[6px] bg-[#183A72] rotate-[-45deg]" />
              <div className="absolute -left-2 top-2 sm:top-4 w-16 sm:w-28 h-[3px] sm:h-[5px] bg-[#183A72] rotate-[-45deg]" />
            </div>

            <div className="flex justify-end pr-1">
              <div className="text-[18px] sm:text-[28px] md:text-[34px] font-serif font-semibold text-black leading-none">
                Pago importe
              </div>
            </div>
          </div>

          <div className="mx-2 sm:mx-4 md:mx-6 mb-4 bg-[#f3f3f3] rounded-[10px] sm:rounded-[14px] px-4 sm:px-8 md:px-14 pt-4 sm:pt-6 md:pt-7 pb-6 sm:pb-8 md:pb-10 shadow-sm border border-[#ebebeb]">
            <div className="text-center mb-4 sm:mb-6">
              <h1
                className="font-serif leading-none tracking-tight text-black break-words"
                style={{
                  fontSize: "clamp(2.8rem, 8vw, 5.8rem)",
                  textShadow: "4px 2px 0 rgba(76,92,255,0.9)",
                }}
              >
                {productoTitulo}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_420px] gap-4 md:gap-8 items-center mb-8 sm:mb-10">
              <div className="min-w-0">
                <div className="inline-block text-[15px] sm:text-[20px] md:text-[24px] font-medium text-[#4f4f4f] bg-[#efefef] px-1 font-serif mb-2">
                  Monto a pagar actual
                </div>

                <div className="min-w-0 overflow-hidden">
                  {typeof moneyBig === "string" ? (
                    <div
                      className={`${moneyScale.int} font-sans font-bold text-[#4A55D9] leading-[0.9] whitespace-nowrap`}
                    >
                      {moneyBig}
                    </div>
                  ) : (
                    <div className="flex items-start whitespace-nowrap min-w-0">
                      <span
                        className={`${moneyScale.int} font-sans font-bold text-[#4A55D9] leading-[0.9] shrink-0`}
                      >
                        {moneyBig.intPart}
                      </span>
                      <span
                        className={`${moneyScale.dec} font-sans font-bold text-[#4A55D9] leading-[0.9] shrink-0 mt-[2px] sm:mt-1`}
                      >
                        .{moneyBig.decPart}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center md:justify-end">
                <div className="w-full md:max-w-[420px] border border-red-400 rounded-[20px] sm:rounded-[26px] px-6 sm:px-8 py-4 sm:py-5 text-red-500 text-[22px] sm:text-[32px] md:text-[34px] leading-none font-sans bg-[#fff7f7] text-center">
                  {diasVencidos} días de retraso
                </div>
              </div>
            </div>

            <div className="mb-10 sm:mb-12">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-2 md:gap-6">
                <span className="inline-block text-[18px] sm:text-[24px] md:text-[32px] font-medium text-[#5c5c5c] bg-[#efefef] px-1 font-serif">
                  Fecha de vencimiento
                </span>

                <div className="bg-transparent outline-none text-left md:text-left text-[18px] sm:text-[24px] md:text-[30px] font-medium text-[#5c5c5c] font-sans">
                  {formatDate(fechaVencimiento)}
                </div>
              </div>
            </div>

            <div className="mb-10 sm:mb-12 md:mb-14">
              <div className="inline-block text-[18px] sm:text-[24px] md:text-[32px] font-medium text-[#5c5c5c] bg-[#efefef] px-1 mb-4 sm:mb-6 font-serif">
                Método de pago
              </div>

              <div className="bg-[#f3f3f3] rounded-xl px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center justify-center text-center">
                <div className="text-[32px] sm:text-[56px] md:text-[82px] font-black leading-none text-[#2E3FA8] font-sans break-words text-center">
                  {metodoPagoLabel}
                </div>

                <div className="mt-5 sm:mt-7 w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <div
                    className="w-full text-[18px] sm:text-[38px] md:text-[56px] font-sans text-[#183A72] tracking-wide leading-tight text-center px-2"
                    title={cuentaBancaria}
                  >
                    <span className="block sm:hidden break-all">
                      {cuentaBancariaMobile}
                    </span>
                    <span className="hidden sm:block break-all">
                      {cuentaBancaria}
                    </span>
                  </div>

                  {cuentaBancaria && cuentaBancaria !== "." && (
                    <button
                      type="button"
                      onClick={() => handleCopy(cuentaBancaria)}
                      title={copied ? "Copiado" : "Copiar cuenta"}
                      aria-label={copied ? "Copiado" : "Copiar cuenta"}
                      className="inline-flex items-center justify-center rounded-full border border-[#183A72]/20 bg-white/70 hover:bg-white transition px-3 sm:px-4 py-2 text-[#183A72] text-xs sm:text-sm font-semibold shadow-sm"
                    >
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[28px] sm:text-[42px] md:text-[56px] font-serif font-semibold text-black mb-5 sm:mb-8">
                Detalles del pedido
              </h2>

              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <span className="text-[18px] sm:text-[24px] md:text-[34px] font-serif text-[#5c5c5c]">
                    Monto a reembolsar
                  </span>
                  <span className="text-[18px] sm:text-[24px] md:text-[34px] font-sans text-black text-right">
                    {formatMoneyWhole(importePagar)}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <span className="text-[18px] sm:text-[24px] md:text-[34px] font-serif text-[#5c5c5c]">
                    Gasto por mora
                  </span>
                  <span className="text-[18px] sm:text-[24px] md:text-[34px] font-sans text-black text-right">
                    $ 0
                  </span>
                </div>

                {mostrarExtras && (
                  <>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-4 sm:gap-8">
                      <span className="text-[18px] sm:text-[24px] md:text-[34px] font-serif text-[#5c5c5c]">
                        Nombre
                      </span>
                      <div className="text-right text-[18px] sm:text-[24px] md:text-[34px] font-serif text-black break-words">
                        {nombre}
                      </div>
                    </div>

                    <div className="grid grid-cols-[auto_1fr] items-center gap-4 sm:gap-8">
                      <span className="text-[18px] sm:text-[24px] md:text-[34px] font-serif text-[#5c5c5c]">
                        Teléfono
                      </span>
                      <div className="text-right text-[18px] sm:text-[24px] md:text-[34px] font-sans text-black break-words">
                        {telefono}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className="px-4 sm:px-8 md:px-12 py-5 sm:py-8 text-white text-[17px] sm:text-[28px] md:text-[34px] leading-tight font-serif"
            style={{ backgroundColor: primaryColor }}
          >
            Pague a tiempo y forma para acceder a créditos con montos elevados de
            la financiera.
          </div>

          <div className="p-3 sm:p-4 bg-[#efefef]"></div>
        </div>
      </div>
    </div>      
  );
}