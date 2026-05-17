"use client";

import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

/* =======================
   TIPOS
======================= */

type MultasFastCashData = {
  id?: string | number;
  monto?: string;
  subproducto?: string;
  descripcion?: string;
  dias_vencidos?: number;
  fecha_vencimiento?: string;
  numero_cuenta?: string;
  cuenta_bancaria?: string;
  imagen_url?: string;
  url?: string;
};

type FormState = {
  id: string | number;
  monto: string;
  producto: string;
  importe: string;
  diasVencidos: number;
  fechaVencimiento: string;
  clabe: string;
  imagen: string;
};

type Props = {
  data: MultasFastCashData;
};

/* =======================
   COMPONENTE
======================= */

export default function MultasFastCash({ data }: Props) {
  const [form, setForm] = useState<FormState | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data) return;

    setForm({
      id: data.id ?? "",
      monto: data.monto ?? "",
      producto: data.subproducto ?? "",
      importe: data.descripcion ?? "",
      diasVencidos:
        typeof data.dias_vencidos === "number"
          ? data.dias_vencidos
          : calcularDiasVencidos(data.fecha_vencimiento),
      fechaVencimiento: data.fecha_vencimiento ?? "",
      clabe: data.numero_cuenta ?? data.cuenta_bancaria ?? "",
      imagen: data.imagen_url ?? data.url ?? "",
    });
  }, [data]);

  if (!form) {
    return (
      <div className="text-gray-500 p-6 text-xl">
        Cargando...
      </div>
    );
  }

  /* =======================
     FUNCIONES
  ======================= */

  function calcularDiasVencidos(
    fechaVencimiento?: string
  ): number {
    if (!fechaVencimiento) return 0;

    const hoy = new Date();
    const venc = new Date(fechaVencimiento);

    const hoyUTC = Date.UTC(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );

    const vencUTC = Date.UTC(
      venc.getFullYear(),
      venc.getMonth(),
      venc.getDate()
    );

    const diffMs = hoyUTC - vencUTC;
    const dias = Math.floor(
      diffMs / (1000 * 60 * 60 * 24)
    );

    return dias > 0 ? dias : 0;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    // NO permitir modificar campos bloqueados
    if (name === "producto") return;
    if (name === "clabe") return;

    setForm((prev) => {
      if (!prev) return prev;

      const next: FormState = {
        ...prev,
        [name]: value,
      };

      if (name === "fechaVencimiento") {
        next.diasVencidos =
          calcularDiasVencidos(value);
      }

      return next;
    });
  };

  const handleGuardar = () => {
    setEdit(false);
  };

  const handleConfirmar = async () => {
    try {
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 120));

      const element = cardRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `pago_${form.id || "plantilla"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(
        "Error al generar imagen:",
        err
      );
      alert(
        "No se pudo generar la imagen. Revisa la consola."
      );
    }
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f2a33] p-6">
      <div
        ref={cardRef}
        className="w-[380px] bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-b from-[#4285f4] to-[#6aaaff] p-6 pb-12 text-center relative">
          <div className="mx-auto w-20 h-20 bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={form.imagen}
              crossOrigin="anonymous"
              alt="imagen"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-xl mt-3 font-semibold text-white">
            {form.producto}
          </h1>

          <div className="absolute left-0 right-0 bottom-0 h-4 bg-white rounded-t-xl" />
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4 bg-[#f2f4f7]">
          {/* MONTO */}
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
              💳
            </div>

            <div className="flex-1">
              <p className="text-sm text-black">
                Monto de Préstamo
              </p>

              {edit ? (
                <input
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  className="text-black border rounded px-2 py-1 text-right w-full"
                />
              ) : (
                <p className="text-xl font-bold text-gray-900">
                  ${form.monto}
                </p>
              )}
            </div>
          </div>

          {/* DETALLES */}
          <div className="bg-white rounded-xl shadow divide-y">
            <Row label="Producto">
              {form.producto}
            </Row>

            <Row label="Importe a Pagar">
              {edit ? (
                <input
                  name="importe"
                  value={form.importe}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-right"
                />
              ) : (
                form.importe
              )}
            </Row>

            <Row label="Días vencidos">
              {`${form.diasVencidos} días`}
            </Row>

            <Row label="Fecha de Vencimiento">
              {edit ? (
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={form.fechaVencimiento}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-right"
                />
              ) : (
                form.fechaVencimiento || "—"
              )}
            </Row>

            <Row label="Cuenta Bancaria">
              {form.clabe || "—"}
            </Row>
          </div>

          {/* BOTONES */}
          <div className="grid grid-cols-2 gap-3">
            {edit ? (
              <button
                onClick={handleGuardar}
                className="py-3 rounded-full bg-green-500 text-white font-semibold shadow"
              >
                Guardar
              </button>
            ) : (
              <button
                onClick={handleConfirmar}
                className="py-3 rounded-full bg-orange-400 text-white font-semibold shadow"
              >
                Confirmar
              </button>
            )}

            <button
              onClick={() => setEdit((s) => !s)}
              className="py-3 rounded-full bg-gray-200 text-black font-semibold shadow"
            >
              {edit ? "Cancelar" : "Modificar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =======================
   ROW COMPONENT
======================= */

type RowProps = {
  label: string;
  children: React.ReactNode;
};

function Row({ label, children }: RowProps) {
  return (
    <div className="flex justify-between items-center p-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">
        {children}
      </span>
    </div>
  );
}
