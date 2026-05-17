  "use client";

  import type { PlantillaProps } from "./types";

  export default function Plantilla5(props: PlantillaProps) {
    const {
      disabled,
      saving,
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
      <div className="min-h-screen bg-[#dddddd] flex items-center justify-center px-3 py-6">
        <div className="w-full max-w-[760px] flex justify-center">
          <div className="w-full max-w-[430px]">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <img
              src="/logoa.png"  
              alt="logo"
              className="w-[72px] h-[50px] object-contain"
            />

              <div className="text-[28px] sm:text-[34px] font-semibold text-[#eceff1] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
                {productoTitulo || "GENUINO"}
              </div>
            </div>

            {/* Bloque naranja */}
            <div className="rounded-[16px] bg-[#ff8126] px-4 sm:px-5 pt-4 sm:pt-5 pb-5 shadow-lg">
              <div className="text-center text-[18px] sm:text-[20px] font-medium text-black">
                MONTO A REMBOLSAR
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <input
                  value={importePagar}
                  onChange={(e) => setImportePagar(e.target.value)}
                  disabled={disabled}
                  placeholder="1365.00"
                  className="w-full bg-transparent outline-none text-[34px] sm:text-[40px] leading-none text-white text-center"
                />
                <div className="text-[34px] sm:text-[40px] text-white shrink-0">
                  MXN
                </div>
              </div>

              <div className="mt-7 border-[3px] border-[#ffd67c] p-2">
                <div className="border border-[#ffd67c] px-4 py-4 flex items-center justify-between gap-4">
                  <span className="text-[18px] sm:text-[20px] font-semibold text-black">
                    Fecha de pago:
                  </span>

                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    disabled={disabled}
                    className="bg-transparent outline-none text-right text-[18px] sm:text-[20px] text-black"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#4454d8] flex items-center justify-center text-white text-[28px] font-bold shrink-0">
                  !
                </div>

                <div className="text-[14px] sm:text-[15px] leading-snug text-white">
                  El rembolso a tiempo y forma aumenta su cupo crediticio,
                  también se otorgará beneficios extras a su perfil de cliente.
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="mt-5 rounded-[18px] bg-white px-5 py-6 shadow">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[22px] sm:text-[24px] font-bold text-[#555] shrink-0">
                  Cliente:
                </span>
                <span className="text-[20px] sm:text-[22px] text-black text-right break-words">
                  {nombre || "—"}
                </span>
              </div>

              <div className="mt-6 flex items-start justify-between gap-4">
                <span className="text-[22px] sm:text-[24px] font-bold text-[#555] shrink-0">
                  Número:
                </span>
                <span className="text-[20px] sm:text-[22px] text-black text-right break-words">
                  {telefono || "—"}
                </span>
              </div>
            </div>

            {/* Metodo */}
            <div className="mt-5">
              <div className="mx-auto w-full max-w-[350px] bg-white/30 p-2">
                <div className="rounded-[18px] bg-[#e57d80] text-center py-3 text-[18px] sm:text-[20px] text-black">
                  Metodo de rembolso
                </div>
              </div>

              <div className="mt-6 text-center">
                <select
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value)}
                  disabled={disabled || loadingListas}
                  className="max-w-full bg-transparent outline-none text-center text-[38px] sm:text-[46px] font-black text-[#3341b2] appearance-none"
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

                <div className="mt-1 text-[15px] sm:text-[16px] italic font-semibold text-[#3341b2]">
                  pagos más rápidos y seguros
                </div>
              </div>

              <div className="mt-6 border-t-2 border-[#bfbfbf] pt-6">
                <div className="flex flex-col items-center justify-center gap-3">
                  <select
                    value={cuentaId}
                    onChange={(e) => setCuentaId(e.target.value)}
                    disabled={disabled || loadingListas}
                    className="max-w-full bg-transparent outline-none text-center text-[28px] sm:text-[34px] font-bold text-[#163b7a] appearance-none"
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

                  {cuentaBancaria ? (
                    <div className="text-center text-[16px] sm:text-[18px] text-[#163b7a] break-all">
                      {cuentaBancaria}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Botón */}
            <button
              onClick={onSubmit}
              disabled={disabled}
              className="mt-6 w-full rounded-xl bg-[#ff8126] py-3 text-base font-semibold text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Generando link..." : "Confirmar y Generar Link"}
            </button>
          </div>
        </div>
      </div>
    );
  }