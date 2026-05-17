"use client";

import { useEffect, useState } from "react";

export default function PlantillaPagoPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plantilla-pago")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#152032]">
        Cargando...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#152032]">
        No hay datos
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#152032] p-6">
      <div className="w-[400px] bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        {/* LOGO */}
        <div className="flex justify-center">
          {data.url ? (
            <img
              src={data.url}
              alt="logo"
              className="w-20 h-20 object-cover rounded-xl"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
              IMG
            </div>
          )}
        </div>

        {/* SUBPRODUCTO */}
        <div className="text-center">
          <div className="text-xs text-gray-500">Producto</div>
          <div className="text-lg font-bold text-gray-800">
            {data.subproducto}
          </div>
        </div>

        {/* CUENTA */}
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Cuenta bancaria</div>
          <div className="text-xl font-extrabold text-gray-800 mt-1">
            {data.cuenta_bancaria}
          </div>
        </div>
      </div>
    </div>
  );
}
