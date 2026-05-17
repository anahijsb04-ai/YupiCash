"use client";

import type { PlantillaProps } from "./types";

export default function Plantilla7(props: PlantillaProps) {
  const {
    disabled,
    saving,
    resolvedLogoUrl,
    productoTitulo,
    importePagar,
    setImportePagar,
    fechaVencimiento,
    setFechaVencimiento,
    nombre,
    telefono,
    metodoPagoId,
    setMetodoPagoId,
    cuentaId,
    setCuentaId,
    optionsMetodo,
    optionsCuenta,
    metodoPagoLabel,
    cuentaBancaria,
    loadingListas,
    onSubmit,
  } = props;

  return (
    <div className="min-h-screen bg-[#dcdcdc] flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-[760px] flex justify-center">
        <div className="w-full max-w-[430px]">
          {/* HEADER */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {resolvedLogoUrl ? (
              <img
                src={resolvedLogoUrl}
                alt="logo"
                className="w-[92px] h-[72px] object-contain shrink-0"
              />
            ) : (
              <div className="w-[92px] h-[72px] rounded-xl bg-gray-300 shrink-0" />
            )}

            <div className="min-w-0">
              <div className="text-[30px] sm:text-[38px] leading-none font-serif font-semibold text-black break-words">
                {productoTitulo || "Red Crédito"}
              </div>
            </div>
          </div>

          {/* CARD ROJA */}
          <div className="rounded-[20px] bg-[#ff1a23] px-4 sm:px-5 pt-5 pb-4 shadow-lg">
            <div className="text-center text-[18px] sm:text-[20px] font-medium text-[#6f5d5d]">
              Monto a rembolsar
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center justify-center gap-2 min-w-0 w-full">
                <span className="text-[42px] sm:text-[54px] leading-none text-white font-light shrink-0">
                  $
                </span>

                <input
                  value={importePagar}
                  onChange={(e) => setImportePagar(e.target.value)}
                  disabled={disabled}
                  placeholder="0"
                  className="w-full max-w-[220px] bg-transparent outline-none text-[42px] sm:text-[54px] leading-none text-white text-center placeholder:text-white/70"
                />

                <span className="text-[42px] sm:text-[54px] leading-none text-white font-light shrink-0">
                  MXN
                </span>
              </div>

              <div className="shrink-0">
                <div className="w-[72px] h-[72px] rounded-[22px] border-2 border-white/40 flex items-center justify-center bg-white/10">
                  <span className="text-white text-[34px] leading-none">▶</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between gap-4 flex-wrap">
              <span className="text-[22px] sm:text-[26px] text-[#3d3838] font-medium shrink-0">
                Fecha de pago:
              </span>

              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={disabled}
                className="bg-transparent outline-none text-right text-[22px] sm:text-[26px] font-semibold text-[#3d3838]"
              />
            </div>

            <div className="mt-10 rounded-[20px] border border-white/30 bg-[#ff2530] px-4 py-4 flex items-center gap-4">
              <div className="w-[58px] h-[58px] rounded-full bg-[#4b49a9] flex items-center justify-center text-[34px] font-bold text-[#efb0b0] shrink-0">
                !
              </div>

              <div className="text-[16px] sm:text-[18px] leading-tight text-white font-medium">
                El rembolso a tiempo aumentará su cupo de crédito, y tendras
                muchos beneficios extras.
              </div>
            </div>
          </div>

          {/* CARD CLIENTE */}
          <div className="mt-5 rounded-[18px] bg-[#f5f5f5] px-5 py-6 shadow">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#555] shrink-0">
                Cliente:
              </span>
              <span className="text-[22px] sm:text-[24px] text-black text-right break-words">
                {nombre || "—"}
              </span>
            </div>

            <div className="mt-7 flex items-start justify-between gap-4">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#555] shrink-0">
                Número:
              </span>
              <span className="text-[22px] sm:text-[24px] text-black text-right break-words">
                {telefono || "—"}
              </span>
            </div>
          </div>

          {/* MÉTODO */}
          <div className="mt-5">
            <div className="mx-auto w-full max-w-[360px] bg-white/30 p-2">
              <div className="rounded-[18px] bg-[#e57d80] text-center py-3 px-3 text-[28px] sm:text-[34px] leading-none text-black">
                Metodo de rembolso
              </div>
            </div>

            <div className="mt-5 text-center">
              <label className="block text-[15px] sm:text-[16px] text-[#555] mb-2">
                Selecciona método
              </label>

              <select
                value={metodoPagoId}
                onChange={(e) => setMetodoPagoId(e.target.value)}
                disabled={disabled || loadingListas}
                className="max-w-full bg-transparent outline-none text-center text-[44px] sm:text-[56px] font-black text-[#3441b2] appearance-none"
              >
                <option value="">
                  {loadingListas ? "Cargando..." : "Selecciona método"}
                </option>
                {optionsMetodo.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>

              <div className="mt-2 text-[16px] sm:text-[18px] italic font-semibold text-[#3441b2]">
                pagos más rápidos y seguros
              </div>

              {metodoPagoLabel ? (
                <div className="mt-2 text-[15px] sm:text-[16px] text-[#3441b2] font-medium">
                  {metodoPagoLabel}
                </div>
              ) : null}
            </div>

            <div className="mt-6 border-t-2 border-[#bfbfbf] pt-6">
              <label className="block text-center text-[15px] sm:text-[16px] text-[#555] mb-3">
                Selecciona cuenta
              </label>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <select
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  disabled={disabled || loadingListas}
                  className="max-w-full bg-transparent outline-none text-center text-[18px] sm:text-[20px] font-semibold text-[#1f3f86] appearance-none"
                >
                  <option value="">
                    {loadingListas ? "Cargando..." : "Selecciona cuenta"}
                  </option>
                  {optionsCuenta.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {cuentaBancaria ? (
                <div className="mt-5 text-center text-[28px] sm:text-[34px] font-bold text-[#1f3f86] break-all">
                  {cuentaBancaria}
                </div>
              ) : null}
            </div>
          </div>

          {/* BOTÓN */}
          <button
            onClick={onSubmit}
            disabled={disabled}
            type="button"
            className="mt-6 w-full rounded-xl bg-[#ff1a23] py-3 text-base font-semibold text-white shadow-md disabled:opacity-60"
          >
            {saving ? "Generando link..." : "Confirmar y Generar Link"}
          </button>
        </div>
      </div>
    </div>
  );
}