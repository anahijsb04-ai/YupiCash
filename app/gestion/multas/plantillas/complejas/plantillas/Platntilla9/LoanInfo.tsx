"use client";

import { useState } from "react";
import type { PlantillaProps } from "./types";

export default function LoanInfo({
  productoTitulo,
  importePagar,
  fechaVencimiento,
  setFechaVencimiento,
  nombre,
}: Pick<
  PlantillaProps,
  "productoTitulo" | "importePagar" | "fechaVencimiento" | "setFechaVencimiento" | "nombre"
>) {

  const [comprobanteAbierto, setComprobanteAbierto] = useState(false);

  const monto = Number(
    String(importePagar || "0")
      .replace(/[^\d.,]/g, "")
      .replace(",", ".")
  );

  const montoActual = Number.isFinite(monto) ? monto : 0;

  const montoFormateado = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montoActual);

  const desembolso = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montoActual * 0.6);

  const fechaTransaccion = fechaVencimiento
    ? new Date(
        new Date(`${fechaVencimiento}T00:00:00`).getTime() -
        7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "***";

  return (
    <div className="bg-white rounded-[25px] p-6">

      <h2 className="text-xl font-bold mb-5">
        Información sobre el préstamo
      </h2>

      <div className="border-t border-dashed pt-5 space-y-5">

        <div className="flex justify-between">
          <span className="text-gray-400">
            Proveedor del préstamo
          </span>
          <b>
            🌞 {productoTitulo}
          </b>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">
            Monto del préstamo
          </span>
          <b>
            $ {montoFormateado}
          </b>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">
            Fecha de caducidad
          </span>

          <input
            type="date"
            value={fechaVencimiento}
            onChange={(e) =>
              setFechaVencimiento(e.target.value)
            }
            className="bg-transparent text-right font-semibold outline-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">
            Comprobante de desembolso
          </span>

          <button
            type="button"
            onClick={() => setComprobanteAbierto(true)}
            className="text-green-400 font-semibold"
          >
            Ver detalles &gt;
          </button>
        </div>

      </div>

      {comprobanteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

          <div className="w-full max-w-[470px] overflow-hidden rounded-[25px] bg-white">

            <div className="flex justify-between items-center bg-[#b8ff38] px-5 py-5">
              <h2 className="text-[22px] font-bold">
                Certificado de desembolso
              </h2>

              <button
                onClick={() => setComprobanteAbierto(false)}
                className="text-[35px] text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-5 py-6 text-[18px]">

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Monto transferido
                </span>
                <b>
                  $ {desembolso}
                </b>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Fecha de Transacción
                </span>
                <b>
                  {fechaTransaccion}
                </b>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Nombre propietario
                </span>
                <b>
                  {nombre || "***"}
                </b>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Banco
                </span>
                <b>
                  ***
                </b>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Número cuenta
                </span>
                <b>
                  ***
                </b>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Estado desembolso
                </span>
                <b>
                  SUCCESS
                </b>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}