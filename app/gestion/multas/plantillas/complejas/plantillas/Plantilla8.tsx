"use client";

import { useState } from "react";
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

  const [infoAbierta, setInfoAbierta] = useState(true);
  const [limiteAbierto, setLimiteAbierto] = useState(true);

  // =========================
  // CÁLCULO DE MONTOS
  // =========================

  const monto = Number(
    String(importePagar || "0")
      .replace(/[^\d.,]/g, "")
      .replace(",", ".")
  );

  const montoActual = Number.isFinite(monto) ? monto : 0;

  // 40 % menos
  const montoAnterior = montoActual * 0.6;

  // 40 % más
  const montoSiguiente = montoActual * 1.4;

  const formatearMonto = (valor: number) =>
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);

  const montoAnteriorFormateado =
    formatearMonto(montoAnterior);

  const montoActualFormateado =
    formatearMonto(montoActual);

  const montoSiguienteFormateado =
    formatearMonto(montoSiguiente);

  // =========================
  // FECHA
  // =========================

  const fechaFormateada = fechaVencimiento
    ? new Date(
        `${fechaVencimiento}T00:00:00`
      ).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  // =========================
  // ESTADO DE VENCIMIENTO
  // =========================

  const calcularEstadoVencimiento = () => {
    if (!fechaVencimiento) {
      return "Selecciona una fecha";
    }

    const hoy = new Date();
    const fechaPago = new Date(
      `${fechaVencimiento}T00:00:00`
    );

    hoy.setHours(0, 0, 0, 0);
    fechaPago.setHours(0, 0, 0, 0);

    const diferencia =
      fechaPago.getTime() - hoy.getTime();

    const dias = Math.round(
      diferencia / (1000 * 60 * 60 * 24)
    );

    if (dias < 0) {
      const diasVencidos = Math.abs(dias);

      return `Vencido hace ${diasVencidos} ${
        diasVencidos === 1 ? "día" : "días"
      }`;
    }

    if (dias === 0) {
      return "Vence hoy";
    }

    if (dias === 1) {
      return "Vence en 1 día";
    }

    return `Vence en ${dias} días`;
  };

  const estadoVencimiento =
    calcularEstadoVencimiento();

  // =========================
  // GENERAR LINK
  // =========================

  const generarLink = () => {
    /*
      Este botón es el único que genera el link.

      El tipo_plantilla se envía como 8.
    */

    onSubmit();
  };

  // =========================
  // BOTÓN DE PAGO
  // =========================

  const irAPago = () => {
    /*
      Este botón NO genera el link.

      Cambia esta ruta por la página
      donde estará el flujo de pago.
    */

    window.location.href = "/pago";
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-4 py-4 text-[#343434]">
      <div className="mx-auto w-full max-w-[470px]">

        {/* =====================
            TARJETA PRINCIPAL
        ====================== */}

        <section className="overflow-hidden rounded-[21px] bg-[#3d45ad] shadow-[0_16px_35px_rgba(42,48,120,0.18)]">
          <div className="px-6 pt-5 pb-7 text-center">

            <h1 className="text-[22px] font-semibold text-[#eeeeee]">
              Importe vencimiento
            </h1>

            <div className="mt-1 flex items-center justify-center gap-2">

              <span className="text-[39px] font-medium text-white">
                $
              </span>

              <input
                value={importePagar}
                onChange={(e) =>
                  setImportePagar(e.target.value)
                }
                disabled={disabled}
                placeholder="410000"
                className="w-[280px] max-w-full bg-transparent text-center text-[43px] font-bold tracking-[2px] text-white outline-none placeholder:text-white"
              />

            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[17px] text-[#eeeeee]">

              <span>
                Fecha de pago:
              </span>

              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) =>
                  setFechaVencimiento(
                    e.target.value
                  )
                }
                disabled={disabled}
                className="w-[145px] bg-transparent text-center text-[16px] text-[#eeeeee] outline-none [color-scheme:dark]"
              />

            </div>

            <div className="mx-auto mt-5 w-fit rounded-full bg-[#ffa45b] px-7 py-2 text-[20px] font-semibold text-white">

              {estadoVencimiento}

            </div>

          </div>
        </section>

        {/* =====================
            INFORMACIÓN
        ====================== */}

        <section className="mt-5">

          <button
            type="button"
            onClick={() =>
              setInfoAbierta(
                !infoAbierta
              )
            }
            className="flex w-full items-center justify-between border-b border-[#d6d6d6] px-1 pb-4 text-left"
          >

            <span className="text-[18px]">
              Información sobre el préstamo
            </span>

            <span
              className={`text-[27px] leading-none text-[#777] transition-transform ${
                infoAbierta
                  ? "rotate-180"
                  : ""
              }`}
            >
              ⌄
            </span>

          </button>

          {infoAbierta && (

            <div className="pt-5">

              {/* PROVEEDOR */}

              <div className="flex items-center justify-between gap-4">

                <span className="text-[19px] text-[#737373]">
                  Proveedor de préstamo
                </span>

                <span className="flex items-center gap-2 text-[20px] font-medium text-[#2e2e2e]">

                  <span className="text-[24px] text-[#3b4ca5]">
                    ♿
                  </span>

                  {productoTitulo ||
                    "Hola efectivo"}

                </span>

              </div>

              {/* MONTO */}

              <div className="mt-5 flex items-center justify-between gap-4">

                <span className="text-[19px] text-[#737373]">
                  Monto del préstamo
                </span>

                <span className="text-[20px] font-medium">

                  $ {montoActualFormateado}

                </span>

              </div>

              {/* FECHA */}

              <div className="mt-5 flex items-center justify-between gap-4">

                <span className="text-[19px] text-[#737373]">
                  Fecha de vencimiento
                </span>

                <span className="text-[20px] font-medium">

                  {fechaFormateada}

                </span>

              </div>

              {/* COMPROBANTE */}

              <div className="mt-5 flex items-center justify-between gap-4">

                <span className="text-[19px] text-[#737373]">
                  Comprobante de desembolso
                </span>

                <button
                  type="button"
                  className="rounded-full border border-[#3d4ca8] px-4 py-1 text-[17px] text-[#34468f]"
                >
                  Ver detalles
                </button>

              </div>

              {/* DATOS ADICIONALES */}

              <div className="mt-6 rounded-xl bg-white px-5 py-4 shadow-sm">

                <div className="flex justify-between gap-4">

                  <span className="text-[#777]">
                    Cliente
                  </span>

                  <span className="max-w-[220px] text-right">
                    {nombre || "—"}
                  </span>

                </div>

                <div className="mt-4 flex justify-between gap-4">

                  <span className="text-[#777]">
                    Teléfono
                  </span>

                  <span>
                    {telefono || "—"}
                  </span>

                </div>

              </div>

            </div>

          )}

        </section>

        {/* =====================
            AUMENTAR LÍMITE
        ====================== */}

        <section className="mt-4">

          <button
            type="button"
            onClick={() =>
              setLimiteAbierto(
                !limiteAbierto
              )
            }
            className="flex w-full items-center justify-between py-7 text-left"
          >

            <span className="text-[18px]">
              Aumentar límite
            </span>

            <span
              className={`text-[28px] text-[#888] transition-transform ${
                limiteAbierto
                  ? "rotate-180"
                  : ""
              }`}
            >
              ⌄
            </span>

          </button>

          {limiteAbierto && (

            <div className="pb-8">

              <div className="rounded-l-[17px] bg-[#e1e4ed] px-4 py-3 text-[13px] text-[#33405a]">

                Consejo: Pagar a tiempo puede aumentar su límite de crédito

              </div>

              {/* CUOTAS */}

              <div className="relative mt-8 px-4">

                <div className="absolute left-1/2 top-[27px] h-[104px] w-[4px] -translate-x-1/2 bg-[#d8d9df]" />

                <div className="relative grid grid-cols-[1fr_38px_1fr] items-center">

                  <span className="text-right">
                    Última cuota
                  </span>

                  <div className="mx-auto h-[20px] w-[20px] rounded-full border-[4px] border-[#3d4ca8] bg-[#f3f3f3]" />

                  <span className="pl-4 font-bold">

                    $ {montoAnteriorFormateado}

                  </span>

                </div>

                <div className="relative mt-6 grid grid-cols-[1fr_38px_1fr] items-center">

                  <span className="text-right">
                    La cuota de esta vez
                  </span>

                  <div className="mx-auto h-[20px] w-[20px] rounded-full border-[4px] border-[#3d4ca8] bg-[#f3f3f3]" />

                  <span className="pl-4 font-bold">

                    $ {montoActualFormateado}

                  </span>

                </div>

                <div className="relative mt-6 grid grid-cols-[1fr_38px_1fr] items-center">

                  <span className="text-right">
                    Siguiente cantidad
                  </span>

                  <div className="mx-auto h-[20px] w-[20px] rounded-full border-[4px] border-[#3d4ca8] bg-[#f3f3f3]" />

                  <span className="pl-4 font-bold">

                    $ {montoSiguienteFormateado}

                  </span>

                </div>

              </div>

              {/* MÉTODO */}

              <div className="mt-10 border-t border-[#dedede] pt-6">

                <select
                  value={metodoPagoId}
                  onChange={(e) =>
                    setMetodoPagoId(
                      e.target.value
                    )
                  }
                  disabled={
                    disabled ||
                    loadingListas
                  }
                  className="w-full appearance-none bg-transparent text-center text-[18px] font-semibold text-[#33479d] outline-none"
                >

                  <option value="">

                    {loadingListas
                      ? "Cargando..."
                      : "Selecciona método"}

                  </option>

                  {optionsMetodo.map(
                    (opcion) => (

                      <option
                        key={opcion.id}
                        value={opcion.id}
                      >

                        {opcion.label}

                      </option>

                    )
                  )}

                </select>

                {metodoPagoLabel && (

                  <p className="mt-2 text-center text-[14px] text-[#666]">

                    {metodoPagoLabel}

                  </p>

                )}

                <select
                  value={cuentaId}
                  onChange={(e) =>
                    setCuentaId(
                      e.target.value
                    )
                  }
                  disabled={
                    disabled ||
                    loadingListas
                  }
                  className="mt-5 w-full appearance-none bg-transparent text-center text-[17px] font-semibold text-[#33479d] outline-none"
                >

                  <option value="">

                    Selecciona una cuenta

                  </option>

                  {optionsCuenta.map(
                    (opcion) => (

                      <option
                        key={opcion.id}
                        value={opcion.id}
                      >

                        {opcion.label}

                      </option>

                    )
                  )}

                </select>

                {cuentaBancaria && (

                  <p className="mt-2 break-all text-center text-[14px] text-[#666]">

                    {cuentaBancaria}

                  </p>

                )}

              </div>

            </div>

          )}

        </section>

        {/* =====================
            BOTÓN DE PAGO
            NO GENERA LINK
        ====================== */}

        <button
          type="button"
          onClick={irAPago}
          disabled={disabled}
          className="mt-2 w-full rounded-full bg-[#3d45ad] px-5 py-4 text-[20px] font-semibold text-white shadow-[0_7px_15px_rgba(47,57,150,0.2)]"
        >

          Paga todo y desbloquea
          {" "}
          $ {montoSiguienteFormateado}

        </button>

        {/* =====================
            GENERAR LINK
        ====================== */}

        <button
          type="button"
          onClick={generarLink}
          disabled={
            disabled ||
            saving
          }
          className="mt-5 w-full rounded-full border-2 border-[#3d45ad] bg-white px-5 py-4 text-[19px] font-semibold text-[#3d45ad] transition hover:bg-[#eef0ff] disabled:cursor-not-allowed disabled:opacity-60"
        >

          {saving
            ? "Generando link..."
            : "Generar link"}

        </button>

        <p className="mt-6 pb-5 text-center text-[16px] leading-relaxed text-[#34477f]">

          Después de completar el pago, puede actualizar este préstamo
          y acceder a nuevos beneficios.

        </p>

      </div>
    </main>
  );
}