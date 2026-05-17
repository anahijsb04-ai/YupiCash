"use client";

import type { PlantillaProps } from "./types";

export default function Plantilla6(props: PlantillaProps) {
  const {
    fotoHabilitada,
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
    disabled,
    saving,
    onToggleFoto,
    onSubmit,
  } = props;

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

              <button
                type="button"
                onClick={onToggleFoto}
                disabled={disabled}
                className="mt-2 text-[11px] px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-black font-semibold disabled:opacity-60"
              >
                {fotoHabilitada ? "Ocultar logo" : "Mostrar logo"}
              </button>
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
              <label className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Cantidad pendiente
              </label>

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[18px] sm:text-[20px] text-black font-medium shrink-0">
                  $
                </span>
                <input
                  value={importePagar}
                  onChange={(e) => setImportePagar(e.target.value)}
                  disabled={disabled}
                  placeholder="0"
                  className="w-[120px] sm:w-[150px] bg-transparent outline-none text-right text-[18px] sm:text-[20px] text-black font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            <Divider />

            {/* ABONADO */}
            <div className="flex items-center justify-between gap-4 py-4">
              <label className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Valor abonado
              </label>

              <span className="text-[18px] sm:text-[20px] text-black font-medium">
                $ 0
              </span>
            </div>

            <Divider />

            {/* FECHA */}
            <div className="flex items-center justify-between gap-4 py-4">
              <label className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Fecha de vencimiento
              </label>

              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={disabled}
                className="bg-transparent outline-none text-right text-[18px] sm:text-[20px] text-black font-medium"
              />
            </div>

            <Divider />

            {/* NOMBRE */}
            <div className="flex items-center justify-between gap-4 py-4">
              <label className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Nombre:
              </label>

              <span className="text-[18px] sm:text-[20px] text-right text-black font-bold break-words">
                {nombre || "—"}
              </span>
            </div>

            <Divider />

            {/* MOVIL */}
            <div className="flex items-center justify-between gap-4 py-4">
              <label className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Móvil:
              </label>

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

            {/* SELECT METODO */}
            <div className="mt-5">
              <label className="block text-center text-[16px] sm:text-[17px] text-[#505765] mb-2">
                Selecciona método
              </label>

              <div className="flex justify-center">
                <select
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value)}
                  disabled={disabled || loadingListas}
                  className="max-w-full bg-transparent outline-none text-center text-[24px] sm:text-[30px] font-semibold text-black appearance-none"
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
              </div>

              {metodoPagoLabel ? (
                <div className="mt-2 text-center text-[15px] sm:text-[16px] text-[#1f3f86] font-medium">
                  {metodoPagoLabel}
                </div>
              ) : null}
            </div>

            <Divider className="mt-5" />

            {/* SELECT CUENTA */}
            <div className="mt-5">
              <label className="block text-center text-[16px] sm:text-[17px] text-[#505765] mb-2">
                Selecciona cuenta
              </label>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-[18px] sm:text-[20px] text-[#444]">
                  Clave
                </span>

                <select
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  disabled={disabled || loadingListas}
                  className="max-w-full bg-transparent outline-none text-center text-[17px] sm:text-[19px] text-[#1f3f86] font-medium appearance-none"
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
                <div className="mt-4 text-center text-[20px] sm:text-[22px] font-semibold text-[#1f3f86] break-all">
                  {cuentaBancaria}
                </div>
              ) : null}
            </div>

            <div className="text-center text-[12px] sm:text-[13px] text-[#8f96a6] mt-6">
              los reembolsos generalmente llevan el mismo día
            </div>
          </div>

          {/* BOTON */}
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="mt-6 w-full rounded-xl bg-[#1ec949] py-3 text-base font-semibold text-white shadow-md disabled:opacity-60"
            type="button"
          >
            {saving ? "Generando..." : "Confirmar y Generar Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Divider({ className = "" }: { className?: string }) {
  return <div className={`w-full h-[1px] bg-[#d6d6d6] ${className}`} />;
} 