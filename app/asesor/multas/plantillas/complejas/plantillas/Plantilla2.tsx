  "use client";

  import type { PlantillaProps } from "./types";

  export default function Plantilla2(props: PlantillaProps) {
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
      primaryColor,
      onSubmit,
    } = props;

    return (
      <div className="w-[420px] bg-[#f3f3f3] rounded-2xl overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)] border border-[#ececec]">
        {/* Header superior */}
        <div className="relative bg-[#f3f3f3] px-6 pt-5 pb-3">
          <div className="absolute left-0 top-0 h-16 w-16 overflow-hidden">
            <div className="absolute -left-5 -top-5 w-20 h-2 bg-[#183A72] rotate-[-45deg]" />
            <div className="absolute -left-1 top-2 w-20 h-1.5 bg-[#183A72] rotate-[-45deg]" />
          </div>

          <div className="flex justify-end">
            <div className="text-[18px] font-semibold text-black">Pago importe</div>
          </div>
        </div>

        {/* Card principal */}
        <div className="mx-4 mb-4 bg-[#f7f7f7] rounded-xl p-5 shadow-sm border border-[#efefef]">
          {/* Producto */}
          <div className="text-center mb-5">
            <h1 className="text-[42px] leading-none font-serif tracking-wide text-black drop-shadow-[4px_2px_0px_rgba(76,92,255,0.85)]">
              {productoTitulo || "PRODUCTO"}
            </h1>
          </div>

          {/* Monto y retraso */}
          <div className="grid grid-cols-2 gap-4 items-end mb-8">
            <div>
              <div className="inline-block text-[16px] font-medium text-[#4f4f4f] bg-[#f2f2f2] px-1 mb-2">
                Monto a pagar actual
              </div>

              <input
                type="text"
                value={importePagar}
                onChange={(e) => setImportePagar(e.target.value)}
                disabled={disabled}
                className="w-full bg-transparent outline-none text-[56px] leading-none font-serif font-bold text-[#4A55D9]"
                placeholder="$0.00"
              />
            </div>

            <div className="flex justify-end">
              <div className="w-full border border-red-400 rounded-[22px] px-6 py-4 text-red-500 text-[24px] leading-none font-serif bg-[#fff7f7] text-center">
                {diasVencidos} días de retraso
              </div>
            </div>
          </div>

          {/* Fecha editable */}
          <div className="mb-10">
            <div className="flex items-center justify-between gap-4 border-b border-transparent">
              <span className="inline-block text-[18px] md:text-[20px] font-medium text-[#5c5c5c] bg-[#f2f2f2] px-1 font-serif">
                Fecha de vencimiento
              </span>

              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={disabled}
                className="bg-transparent outline-none text-right text-[18px] font-medium text-[#5c5c5c] font-serif"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div className="mb-10">
            <div className="inline-block text-[18px] md:text-[20px] font-medium text-[#5c5c5c] bg-[#f2f2f2] px-1 mb-5 font-serif">
              Método de pago
            </div>

            <div className="bg-[#f8f8f8] rounded-xl p-4 border border-[#ececec]">
              <div className="mb-4">
                <select
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value)}
                  disabled={disabled || loadingListas}
                  className="w-full bg-transparent outline-none text-[30px] font-extrabold text-[#2E3FA8] font-sans text-center appearance-none"
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

              <div>
                <select
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  disabled={disabled || loadingListas}
                  className="w-full bg-transparent outline-none text-[26px] font-medium text-[#183A72] font-serif text-center appearance-none tracking-wide"
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

              {metodoPagoLabel ? (
                <div className="mt-4 text-center text-sm text-[#56627a]">
                  {metodoPagoLabel}
                </div>
              ) : null}

              {cuentaBancaria ? (
                <div className="mt-1 text-center text-sm text-[#56627a] break-all">
                  {cuentaBancaria}
                </div>
              ) : null}
            </div>
          </div>

          {/* Detalles */}
          <div>
            <h2 className="text-[28px] font-serif font-semibold text-black mb-6">
              Detalles del pedido
            </h2>

            <div className="space-y-5">
              <div className="flex justify-between items-center gap-4">
                <span className="text-[18px] font-serif text-[#5c5c5c]">
                  Monto a reembolsar
                </span>
                <span className="text-[18px] font-serif text-black">
                  ${importePagar || "0"}
                </span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-[18px] font-serif text-[#5c5c5c]">
                  Gasto por mora
                </span>
                <span className="text-[18px] font-serif text-black">$ 0</span>
              </div>

              {mostrarExtras && (
                <>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[18px] font-serif text-[#5c5c5c]">
                      Nombre
                    </span>
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={disabled}
                      placeholder="Nombre"
                      className="bg-transparent outline-none text-right text-[18px] font-serif text-black w-[65%]"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[18px] font-serif text-[#5c5c5c]">
                      Teléfono
                    </span>
                    <input
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      disabled={disabled}
                      placeholder="Teléfono"
                      className="bg-transparent outline-none text-right text-[18px] font-serif text-black w-[65%]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-7 text-white text-[18px] leading-snug font-serif"
          style={{ backgroundColor: primaryColor || "#4348D0" }}
        >
          Pague a tiempo y forma para acceder a créditos con montos elevados de la financiera.
        </div>

        {/* Botón */}
        <div className="p-4 bg-[#f3f3f3]">
          <button
            onClick={onSubmit}
            disabled={disabled}
            type="button"
            className="w-full text-white p-3 rounded-xl text-lg font-semibold disabled:opacity-60"
            style={{ backgroundColor: primaryColor || "#4348D0" }}
          >
            {saving ? "Generando link..." : "Confirmar y Generar Link"}
          </button>
        </div>
      </div>
    );
  }   