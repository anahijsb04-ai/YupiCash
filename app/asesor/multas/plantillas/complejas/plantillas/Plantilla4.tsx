"use client";

import type { PlantillaProps } from "./types";

export default function Plantilla6(props: PlantillaProps) {
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
    cuentaBancaria,
    loadingListas,
    resolvedLogoUrl,
    onSubmit,
  } = props;

  return (
    <div className="min-h-screen bg-[#dcdcdc] flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-[760px] flex justify-center">
        <div className="w-full max-w-[430px]">
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-4">
            {resolvedLogoUrl ? (
              <img
                src={resolvedLogoUrl}
                className="w-[74px] h-[74px] object-contain shrink-0"
                alt="logo"
              />
            ) : (
              <div className="w-[74px] h-[74px] rounded-full bg-gray-300 shrink-0" />
            )}

            <div className="min-w-0">
              <div className="text-[18px] sm:text-[20px] font-medium text-black">
                Vinculo de pago
              </div>

              <div className="mt-2 text-[30px] sm:text-[36px] leading-none font-serif font-semibold text-[#1a1a1a] break-words">
                {productoTitulo || "Big pesitos"}
              </div>
            </div>
          </div>

          <div className="w-full h-[5px] bg-black rounded-full mb-6" />

          {/* TITULO */}
          <div className="text-center text-[26px] sm:text-[30px] font-medium text-[#1a1a1a] mb-5">
            Detalle de rembolso
          </div>

          {/* CARD */}
          <div className="bg-[#f3f3f3] rounded-[14px] shadow-md px-5 py-6 border-l-[5px] border-r-[5px] border-[#20c84b]">
            {/* CANTIDAD PENDIENTE */}
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Cantidad pendiente
              </span>

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[18px] sm:text-[20px] font-medium text-black shrink-0">
                  $
                </span>
                <input
                  value={importePagar}
                  onChange={(e) => setImportePagar(e.target.value)}
                  disabled={disabled}
                  className="w-[120px] sm:w-[150px] bg-transparent outline-none text-right text-[18px] sm:text-[20px] font-medium text-black placeholder:text-gray-400"
                  placeholder="0"
                />
              </div>
            </div>

            <Divider />

            {/* VALOR ABONADO */}
            <Row label="Valor abonado" value="$ 0" />

            <Divider />

            {/* FECHA */}
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
                Fecha de vencimiento
              </span>

              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={disabled}
                className="bg-transparent outline-none text-right text-[18px] sm:text-[20px] font-medium text-black"
              />
            </div>

            <Divider />

            {/* NOMBRE */}
            <Row label="Nombre:" value={nombre || "—"} bold />

            <Divider />

            {/* MOVIL */}
            <Row label="Móvil:" value={telefono || "—"} />

            <Divider />

            {/* METODO */}
            <div className="text-center text-[24px] sm:text-[28px] font-medium text-black mt-5 mb-5">
              Método de pago
            </div>

            <Divider />

            {/* SELECT METODO */}
            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              <select
                value={metodoPagoId}
                onChange={(e) => setMetodoPagoId(e.target.value)}
                disabled={disabled || loadingListas}
                className="bg-transparent outline-none text-[28px] sm:text-[34px] font-semibold text-black text-center appearance-none max-w-full"
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

            <Divider className="mt-5" />

            {/* SELECT CUENTA */}
            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              <div className="text-[18px] sm:text-[20px] text-[#444]">
                Clave
              </div>

              <select
                value={cuentaId}
                onChange={(e) => setCuentaId(e.target.value)}
                disabled={disabled || loadingListas}
                className="bg-transparent outline-none text-[18px] sm:text-[20px] text-[#1f3f86] text-center appearance-none max-w-full"
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

            {cuentaBancaria && (
              <div className="mt-4 text-center text-[20px] sm:text-[22px] font-semibold text-[#1f3f86] break-all">
                {cuentaBancaria}
              </div>
            )}

            <div className="text-center text-[12px] sm:text-[13px] text-[#8f96a6] mt-6">
              los reembolsos generalmente llevan el mismo día
            </div>
          </div>

          {/* BOTON */}
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="mt-6 w-full rounded-xl bg-[#1ec949] py-3 text-base font-semibold text-white shadow-md disabled:opacity-60"
          >
            {saving ? "Generando..." : "Confirmar y Generar Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-[18px] sm:text-[19px] text-[#505765] shrink-0">
        {label}
      </span>

      <span
        className={`text-[18px] sm:text-[20px] text-right text-black break-words ${
          bold ? "font-bold" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
} 

function Divider({ className = "" }: { className?: string }) {
  return <div className={`w-full h-[1px] bg-[#d6d6d6] ${className}`} />;
}