"use client";

import type { PlantillaProps } from "./types";

export default function Plantilla1(props: PlantillaProps) {
  const {
    cardBg,
    primaryColor,
    fotoHabilitada,
    resolvedLogoUrl,
    productoTitulo,
    monto,
    setMonto,
    importePagar,
    setImportePagar,
    fechaVencimiento,
    setFechaVencimiento,
    diasVencidos,
    isCo,
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
    disabled,
    saving,
    onToggleFoto,
    onSubmit,
  } = props;

  return (
    <div
      className="w-[420px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
      style={{ backgroundColor: cardBg }}
    >
      <div
        className="w-full h-[190px] flex flex-col items-center justify-center pt-2"
        style={{ background: "linear-gradient(180deg,#5CB0FF 0%,#A3D4FF 100%)" }}
      >
        {fotoHabilitada ? (
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow">
            {resolvedLogoUrl ? (
              <img
                src={resolvedLogoUrl}
                className="w-full h-full object-cover"
                alt="logo"
              />
            ) : (
              <span className="text-lg font-bold text-[#142546]">IMG</span>
            )}
          </div>
        ) : null}

        <button
          type="button"
          className="mt-2 text-xs px-3 py-1 rounded-md bg-white/70 hover:bg-white text-[#142546] font-semibold disabled:opacity-60"
          onClick={onToggleFoto}
          disabled={disabled}
        >
          {fotoHabilitada ? "Inhabilitar foto" : "Habilitar foto"}
        </button>

        <h2 className="mt-3 text-lg font-bold text-[#142546]">
          {productoTitulo || "-"}
        </h2>
      </div>

      <div
        className="mx-4 -mt-4 rounded-xl p-4 text-white shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="text-xs opacity-90">Monto de Préstamo</div>
        <input
          type="text"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="$0.00"
          className="w-full bg-transparent text-3xl font-bold outline-none"
          disabled={disabled}
        />
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        <div
          className="bg-transparent rounded-xl border p-3 shadow-sm"
          style={{ backgroundColor: cardBg }}
        >
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">
              Importe a Pagar
            </span>
            <input
              type="text"
              value={importePagar}
              onChange={(e) => setImportePagar(e.target.value)}
              className="text-gray-500 text-right w-28 bg-transparent font-semibold outline-none"
              disabled={disabled}
            />
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">
              Fecha Vencimiento
            </span>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              className="text-gray-500 text-right bg-transparent outline-none"
              disabled={disabled}
            />
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-medium text-gray-700">
              Días vencimiento
            </span>
            <span className="text-sm text-gray-500">{diasVencidos} días</span>
          </div>
        </div>

        <div
          className="bg-transparent rounded-xl p-3 shadow-sm"
          style={{ backgroundColor: cardBg }}
        >
          <div className="text-sm font-medium text-gray-700 mb-2">
            Pago ({isCo ? "Colombia" : "México"})
          </div>

          <div className="flex items-center justify-center bg-[#F8FAFB] p-4 rounded-md">
            <div className="text-center w-full">
              <select
                className="w-full text-center text-sm font-semibold text-gray-700 bg-transparent outline-none"
                value={metodoPagoId}
                onChange={(e) => setMetodoPagoId(e.target.value)}
                disabled={disabled || loadingListas}
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

              <div className="mt-3">
                <select
                  className="w-full text-center text-sm font-semibold text-gray-700 bg-transparent outline-none"
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  disabled={disabled || loadingListas}
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
                <div className="mt-2 text-xs text-gray-500">
                  {metodoPagoLabel}
                </div>
              ) : null}
              {cuentaBancaria ? (
                <div className="mt-1 text-xs text-gray-500">
                  {cuentaBancaria}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {mostrarExtras && (
          <div
            className="bg-transparent rounded-xl p-3 shadow-sm"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Nombre</span>
              <input
                className="text-sm text-right bg-transparent outline-none text-gray-700"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700">
                Teléfono
              </span>
              <input
                className="text-sm text-right bg-transparent outline-none text-gray-700"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        <button
          onClick={onSubmit}
          className="w-full text-white p-3 rounded-xl text-lg font-semibold mt-2 disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
          disabled={disabled}
          type="button"
        >
          {saving ? "Generando link..." : "Confirmar y Generar Link"}
        </button>
      </div>
    </div>
  );
}