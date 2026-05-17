// app/plantilla/[token]/page.tsx
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import React from "react";

export const runtime = "nodejs";

// Función para formatear fecha
const formatDateReadable = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

// Props
type Props = {
  params: {
    token: string;
  };
};

export default async function PlantillaPage({ params }: Props) {
  const { token } = params;

  // Buscar plantilla en la BD
  const res = await query(
    `SELECT * FROM plantillas_temporales WHERE token = $1`,
    [token]
  );

  if (res.rowCount === 0) {
    notFound();
  }

  const plantilla = res.rows[0];

  // Verificar expiración
  if (
    plantilla.expires_at &&
    new Date(plantilla.expires_at) < new Date()
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg font-bold">
          Esta plantilla ha expirado.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-[#152032]">
      <div
        className="w-[420px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: plantilla.card_bg_color }}
      >
        {/* HEADER */}
        <div
          className="w-full h-[160px] flex flex-col items-center pt-6"
          style={{
            background:
              "linear-gradient(180deg,#5CB0FF 0%,#A3D4FF 100%)",
          }}
        >
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow">
            {plantilla.logo_url ? (
              <img
                src={plantilla.logo_url}
                className="w-full h-full object-cover"
                alt="logo"
              />
            ) : (
              <span className="text-lg font-bold text-[#142546]">
                IMG
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-[#142546] mt-4">
            {plantilla.producto}
          </h2>
        </div>

        {/* MONTO */}
        <div
          className="mx-4 -mt-4 rounded-xl p-4 text-white shadow-md"
          style={{ backgroundColor: plantilla.primary_color }}
        >
          <div className="text-xs opacity-90">
            Monto de Préstamo
          </div>
          <div className="text-3xl font-bold">
            {plantilla.monto}
          </div>
        </div>

        {/* DETALLES */}
        <div className="px-4 py-5 flex flex-col gap-4">
          <div
            className="rounded-xl border p-3 shadow-sm"
            style={{ backgroundColor: plantilla.card_bg_color }}
          >
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">
                Producto
              </span>
              <span className="text-sm text-gray-600">
                {plantilla.producto}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">
                Importe a Pagar
              </span>
              <span className="text-gray-500">
                {plantilla.importe_pagar}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">
                Fecha Vencimiento
              </span>
              <span className="text-sm text-gray-600">
                {formatDateReadable(
                  plantilla.fecha_vencimiento
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-700">
                Días vencimiento
              </span>
              <span className="text-sm text-gray-500">
                {plantilla.dias_vencidos} días
              </span>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div
            className="rounded-xl p-3 shadow-sm"
            style={{ backgroundColor: plantilla.card_bg_color }}
          >
            <div className="text-sm font-medium text-gray-700 mb-2">
              Método de pago
            </div>

            <div className="flex items-center justify-center bg-[#F8FAFB] p-4 rounded-md">
              <div className="text-center">
                <div className="text-xs text-gray-500">
                  SPEI
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-700 mt-1">
                  {plantilla.cuenta_bancaria}
                </div>
              </div>
            </div>
          </div>

          {/* EXTRAS */}
          {plantilla.mostrar_extras && (
            <div
              className="rounded-xl p-3 shadow-sm"
              style={{ backgroundColor: plantilla.card_bg_color }}
            >
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-700">
                  Nombre
                </span>
                <span className="text-sm text-gray-600">
                  {plantilla.nombre_cliente}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700">
                  Teléfono
                </span>
                <span className="text-sm text-gray-600">
                  {plantilla.telefono_cliente}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
