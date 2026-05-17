"use client";

import type { PlantillaProps } from "./types";

export default function Plantilla3(props: PlantillaProps) {
  const {
    disabled,
    saving,
    productoTitulo,
    importePagar,
    setImportePagar,
    fechaVencimiento,
    setFechaVencimiento,
    diasVencidos,
    metodoPagoId,
    setMetodoPagoId,
    cuentaId,
    setCuentaId,
    optionsMetodo,
    optionsCuenta,
    metodoPagoLabel,
    cuentaBancaria,
    mostrarExtras,
    nombre,
    setNombre,
    telefono,
    setTelefono,
    loadingListas,
    onSubmit,
  } = props;

  return (
    <div className="min-h-screen w-full bg-[#F3A316] flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-4 text-center text-[28px] font-medium text-white">
          Pago de crédito
        </div>

        <div className="overflow-hidden rounded-[42px] bg-[#F4F4F4] shadow-[0_18px_40px_rgba(0,0,0,0.22)] border border-[#E5E5E5]">
          {/* Header producto */}
          <div className="relative px-5 pt-7 pb-5">
            <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none select-none">
              <div className="text-[86px] font-black leading-none text-[#ECECEC]">
                MX
              </div>
            </div>

            <div className="relative z-10 text-center">
              <div className="text-[34px] sm:text-[38px] font-medium text-[#5A5A5A]">
                {productoTitulo || "Cash We"}
              </div>
            </div>
          </div>

          {/* Monto */}
          <div className="border-t border-[#E4E4E4] px-5 py-6">
            <div className="text-center">
              <input
                type="text"
                value={importePagar}
                onChange={(e) => setImportePagar(e.target.value)}
                disabled={disabled}
                placeholder="1360"
                className="w-full bg-transparent text-center outline-none text-[34px] sm:text-[40px] font-medium text-black"
              />

              <div className="mt-2 text-[16px] sm:text-[18px] text-[#B7B7B7]">
                Monto de rembolso&nbsp; (MXN)
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="border-t border-[#E4E4E4] px-7 py-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-[18px] sm:text-[20px] text-[#B7B7B7]">
                Valor abonado
              </span>
              <span className="text-right text-[18px] sm:text-[20px] font-semibold text-[#B7B7B7]">
                $ 0
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-[18px] sm:text-[20px] text-[#B7B7B7]">
                Fecha de rembolso
              </span>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={disabled}
                className="bg-transparent outline-none text-right text-[18px] sm:text-[20px] font-semibold text-[#B7B7B7]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-[18px] sm:text-[20px] text-[#B7B7B7]">
                Días vencidos
              </span>
              <span className="text-right text-[18px] sm:text-[20px] font-semibold text-[#B7B7B7]">
                {diasVencidos || 0}
              </span>
            </div>
          </div>

          {/* Botón datos cliente */}
          <div className="border-t border-[#E4E4E4] px-5 py-4">
            <div className="mx-auto w-full max-w-[270px]">
              <div className="w-full rounded-full bg-[#F3A316] px-6 py-3 text-center text-[22px] sm:text-[24px] font-bold text-white shadow-md">
                Datos cliente
              </div>
            </div>
          </div>

          {/* Línea naranja */}
          <div className="px-5 pb-5">
            <div className="h-[10px] w-full bg-[#F3A316]" />
          </div>

          {/* Contenido */}
          <div className="px-6 pb-6 text-center">
            <div className="text-[30px] sm:text-[34px] font-extrabold text-black">
              Pago del préstamo
            </div>

            {mostrarExtras && (
              <>
                <div className="mt-8 text-[26px] sm:text-[30px] text-[#6C6C6C]">
                  Nombre
                </div>

              <div className="mt-2 text-[24px] sm:text-[26px] leading-tight text-black text-center break-words">
                {nombre || "—"}
              </div>


                <div className="mt-4 text-[26px] sm:text-[30px] text-[#6C6C6C]">
                  Telefono
                </div>
                <div className="mt-2 text-[24px] sm:text-[26px] text-black text-center break-words">
                  {telefono || "—"}
                </div>
              </>
            )}

            <div className="mt-8 text-[26px] sm:text-[30px] text-[#6C6C6C]">
              Forma de pago
            </div>

            <div className="mt-2">
              <select
                value={metodoPagoId}
                onChange={(e) => setMetodoPagoId(e.target.value)}
                disabled={disabled || loadingListas}
                className="w-full bg-transparent text-center outline-none text-[26px] sm:text-[28px] font-semibold text-[#646464] appearance-none"
              >
                <option value="">
                  {loadingListas ? "Cargando…" : "Selecciona método"}
                </option>
                {optionsMetodo.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 bg-[linear-gradient(90deg,#D9D9D9_0%,#F4F4F4_20%,#F4F4F4_80%,#D9D9D9_100%)] px-4 py-3">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="text-[44px] sm:text-[50px] font-black leading-none text-[#4D4D4D]">
                  {metodoPagoLabel || "SPEI"}
                </div>

                <select
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  disabled={disabled || loadingListas}
                  className="min-w-[170px] bg-transparent text-center outline-none text-[20px] sm:text-[22px] text-[#4D4D4D] appearance-none"
                >
                  <option value="">
                    {loadingListas ? "Cargando…" : "Selecciona cuenta"}
                  </option>
                  {optionsCuenta.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {cuentaBancaria ? (
                <div className="mt-2 text-center text-[18px] sm:text-[20px] text-[#4D4D4D] break-all">
                  {cuentaBancaria}
                </div>
              ) : null}
            </div>

            <div className="mt-3 border-t border-[#DCDCDC] pt-3 text-[11px] leading-snug text-[#8C1F1F]">
              Confirme el método de pago que sea el correcto con el asesor,
              recuerde el rembolso a tiempo aumenta el cupo de crédito
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="px-6 pb-6">
            <button
              onClick={onSubmit}
              disabled={disabled}
              type="button"
              className="w-full rounded-xl bg-[#F3A316] py-3 text-lg font-semibold text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Generando link..." : "Confirmar y Generar Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}