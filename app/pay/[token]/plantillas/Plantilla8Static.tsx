"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Data = {
  producto?: string | null;
  producto_label?: string | null;

  monto?: string | null;
  importe_pagar?: string | null;

  fecha_vencimiento?: string | null;

  nombre_cliente?: string | null;
  telefono_cliente?: string | null;

  metodo_pago_label?: string | null;
  metodo_pago?: string | null;

  liga_pago_label?: string | null;
  cuenta_bancaria?: string | null;
};

function CopyIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatMoney(
  value?: string | null
) {
  if (!value) return "0,00";

  const cleaned = String(value)
    .replace(/[^\d.,-]/g, "")
    .replace(",", ".");

  const number = Number(cleaned);

  if (Number.isNaN(number)) {
    return value;
  }

  return number.toLocaleString(
    "es-ES",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function formatDate(
  value?: string | null
) {
  if (!value) return "—";

  const [year, month, day] =
    String(value)
      .slice(0, 10)
      .split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}-${month}-${year}`;
}

function calcularVencimiento(
  fechaVencimiento?: string | null
) {
  if (!fechaVencimiento) {
    return "Sin fecha";
  }

  const hoy = new Date();

  const fecha = new Date(
    `${String(
      fechaVencimiento
    ).slice(0, 10)}T00:00:00`
  );

  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  const diferencia =
    fecha.getTime() -
    hoy.getTime();

  const dias = Math.round(
    diferencia /
      (1000 * 60 * 60 * 24)
  );

  if (dias < 0) {
    const vencido =
      Math.abs(dias);

    return `Vencido hace ${vencido} ${
      vencido === 1
        ? "día"
        : "días"
    }`;
  }

  if (dias === 0) {
    return "Vence hoy";
  }

  if (dias === 1) {
    return "Vencido en 1 día";
  }

  return `Vence en ${dias} días`;
}

export default function Plantilla5Static({
  token: tokenProp,
}: {
  token?: string;
}) {
  const params = useParams<{
    token?: string;
  }>();

  const token = String(
    tokenProp ||
      params?.token ||
      ""
  ).trim();

  const [data, setData] =
    useState<Data | null>(
      null
    );

  const [
    mostrarPago,
    setMostrarPago,
  ] = useState(false);

  const [
    informacionAbierta,
    setInformacionAbierta,
  ] = useState(true);

  const [
    limiteAbierto,
    setLimiteAbierto,
  ] = useState(true);

  const [
    copiado,
    setCopiado,
  ] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function cargar() {
      try {
        const response =
          await fetch(
            `/api/plantillas-temporales-3/${token}`,
            {
              cache:
                "no-store",
            }
          );

        const json =
          await response.json();

        setData(
          json?.data ??
            json
        );
      } catch (error) {
        console.error(
          error
        );
      }
    }

    cargar();
  }, [token]);

  async function copiarCuenta(
    cuenta: string
  ) {
    try {
      await navigator.clipboard.writeText(
        cuenta
      );

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 1500);
    } catch {
      console.error(
        "No se pudo copiar"
      );
    }
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f3f3] text-[#3d45ad]">
        Cargando...
      </div>
    );
  }

  const producto =
    data.producto_label ||
    data.producto ||
    "Hola efectivo";

  const montoTexto =
    data.importe_pagar ||
    data.monto ||
    "0";

  const montoNumero =
    Number(
      String(montoTexto)
        .replace(
          /[^\d.,-]/g,
          ""
        )
        .replace(
          ",",
          "."
        )
    );

  const monto =
    Number.isFinite(
      montoNumero
    )
      ? montoNumero
      : 0;

  const montoAnterior =
    monto * 0.6;

  const montoSiguiente =
    monto * 1.4;

  const fecha =
    formatDate(
      data.fecha_vencimiento
    );

  const estado =
    calcularVencimiento(
      data.fecha_vencimiento
    );

  const nombre =
    data.nombre_cliente ||
    "—";

  const telefono =
    data.telefono_cliente ||
    "—";

  const metodo =
    data.metodo_pago_label ||
    data.metodo_pago ||
    "Transferencia";

  const cuenta =
    data.liga_pago_label ||
    data.cuenta_bancaria ||
    "No disponible";

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-4 py-4 pb-[85px] text-[#343434]">

      <div className="mx-auto w-full max-w-[470px]">

        {/* ===================== */}
        {/* PÁGINA PRINCIPAL */}
        {/* ===================== */}

        {!mostrarPago && (
          <>
            {/* TARJETA */}
            <section className="overflow-hidden rounded-[21px] bg-[#3d45ad] shadow-lg">

              <div className="px-6 pt-5 pb-7 text-center">

                <h1 className="text-[22px] font-semibold text-[#eeeeee]">
                  Importe vencimiento
                </h1>

                <div className="mt-1">

                  <span className="text-[42px] font-bold text-white">
                    $ {formatMoney(
                      String(monto)
                    )}
                  </span>

                </div>

                <div className="mt-3 text-[17px] text-[#eeeeee]">
                  Fecha de pago:{" "}
                  {fecha}
                </div>

                <div className="mx-auto mt-5 w-fit rounded-full bg-[#ffa45b] px-7 py-2 text-[19px] font-semibold text-white">
                  {estado}
                </div>

              </div>

            </section>

            {/* INFORMACIÓN */}
            <section className="mt-5">

              <button
                type="button"
                onClick={() =>
                  setInformacionAbierta(
                    !informacionAbierta
                  )
                }
                className="flex w-full items-center justify-between border-b border-[#d6d6d6] pb-4"
              >

                <span className="text-[18px]">
                  Información sobre el préstamo
                </span>

                <span className="text-[24px]">
                  {informacionAbierta
                    ? "⌃"
                    : "⌄"}
                </span>

              </button>

              {informacionAbierta && (
                <div className="pt-5">

                  <div className="flex justify-between">

                    <span className="text-[#777]">
                      Proveedor de préstamo
                    </span>

                    <span>
                      {producto}
                    </span>

                  </div>

                  <div className="mt-5 flex justify-between">

                    <span className="text-[#777]">
                      Monto del préstamo
                    </span>

                    <span>
                      $ {formatMoney(
                        String(
                          monto
                        )
                      )}
                    </span>

                  </div>

                  <div className="mt-5 flex justify-between">

                    <span className="text-[#777]">
                      Fecha de vencimiento
                    </span>

                    <span>
                      {fecha}
                    </span>

                  </div>

                  <div className="mt-5 flex justify-between">

                    <span className="text-[#777]">
                      Cliente
                    </span>

                    <span>
                      {nombre}
                    </span>

                  </div>

                  <div className="mt-5 flex justify-between">

                    <span className="text-[#777]">
                      Teléfono
                    </span>

                    <span>
                      {telefono}
                    </span>

                  </div>

                </div>
              )}

            </section>

            {/* AUMENTAR LÍMITE */}
            <section className="mt-5">

              <button
                type="button"
                onClick={() =>
                  setLimiteAbierto(
                    !limiteAbierto
                  )
                }
                className="flex w-full items-center justify-between py-5"
              >

                <span className="text-[18px]">
                  Aumentar límite
                </span>

                <span className="text-[24px]">
                  {limiteAbierto
                    ? "⌃"
                    : "⌄"}
                </span>

              </button>

              {limiteAbierto && (
                <div>

                  <div className="rounded-xl bg-[#e1e4ed] px-4 py-3 text-[13px]">
                    Consejo: Pagar a tiempo puede aumentar su límite de crédito
                  </div>

                  <div className="mt-7 space-y-6">

                    <div className="flex justify-between">

                      <span>
                        Última cuota
                      </span>

                      <strong>
                        $ {formatMoney(
                          String(
                            montoAnterior
                          )
                        )}
                      </strong>

                    </div>

                    <div className="flex justify-between">

                      <span>
                        La cuota de esta vez
                      </span>

                      <strong>
                        $ {formatMoney(
                          String(
                            monto
                          )
                        )}
                      </strong>

                    </div>

                    <div className="flex justify-between">

                      <span>
                        Siguiente cantidad
                      </span>

                      <strong>
                        $ {formatMoney(
                          String(
                            montoSiguiente
                          )
                        )}
                      </strong>

                    </div>

                  </div>

                </div>
              )}

            </section>

            {/* BOTÓN */}
            <button
              type="button"
              onClick={() =>
                setMostrarPago(
                  true
                )
              }
              className="mt-9 w-full rounded-full bg-[#3d45ad] py-4 text-[20px] font-semibold text-white shadow-lg"
            >

              Paga todo y desbloquea
              {" "}
              $ {formatMoney(
                String(
                  montoSiguiente
                )
              )}

            </button>

          </>
        )}

        {/* ===================== */}
        {/* PANTALLA DE PAGO */}
        {/* ===================== */}

        {mostrarPago && (
          <section>

            {/* ENCABEZADO */}
            <div className="rounded-[21px] bg-[#3d45ad] px-6 py-6 text-center shadow-lg">

              <h1 className="text-[23px] font-semibold text-white">
                Realiza tu pago
              </h1>

              <div className="mt-3 text-[37px] font-bold text-white">

                $ {formatMoney(
                  String(
                    montoSiguiente
                  )
                )}

              </div>

              <p className="mt-2 text-[15px] text-white/80">
                Completa el pago para continuar
              </p>

            </div>

            {/* INFORMACIÓN DEL CLIENTE */}
            <div className="mt-5 rounded-[18px] bg-white p-5 shadow">

              <h2 className="text-[19px] font-semibold text-[#3d45ad]">
                Información del cliente
              </h2>

              <div className="mt-5">

                <p className="text-[14px] text-[#777]">
                  Cliente
                </p>

                <p className="mt-1 text-[18px]">
                  {nombre}
                </p>

              </div>

              <div className="mt-4">

                <p className="text-[14px] text-[#777]">
                  Teléfono
                </p>

                <p className="mt-1 text-[18px]">
                  {telefono}
                </p>

              </div>

            </div>

            {/* MÉTODO */}
            <div className="mt-5 rounded-[18px] bg-white p-5 shadow">

              <h2 className="text-center text-[17px] text-[#555]">
                Método de pago
              </h2>

              <div className="mt-3 text-center text-[34px] font-black text-[#3d45ad]">
                {metodo}
              </div>

              <p className="mt-1 text-center text-[13px] text-[#777]">
                Pagos rápidos y seguros
              </p>

              <div className="mt-5 border-t pt-5">

                <p className="text-center text-[14px] text-[#777]">
                  Cuenta para realizar el pago
                </p>

                <div className="mt-3 flex items-center justify-center gap-2">

                  <span className="max-w-[310px] break-all text-center text-[20px] font-semibold text-[#263b87]">
                    {cuenta}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      copiarCuenta(
                        cuenta
                      )
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d9d9d9] text-[#3d45ad]"
                  >

                    {copiado ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <CopyIcon className="h-5 w-5" />
                    )}

                  </button>

                </div>

                <p className="mt-3 text-center text-[13px] text-[#777]">

                  {copiado
                    ? "Cuenta copiada"
                    : "Presiona el icono para copiar"}

                </p>

              </div>

            </div>

            {/* REGRESAR */}
            <button
              type="button"
              onClick={() =>
                setMostrarPago(
                  false
                )
              }
              className="mt-6 w-full rounded-full border border-[#3d45ad] py-4 text-[18px] font-semibold text-[#3d45ad]"
            >

              Volver a la información

            </button>

          </section>
        )}

      </div>

      {/* BARRA INFERIOR */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[#d9d9d9] bg-[#f4f4f4]">

        <div className="mx-auto flex h-[55px] max-w-[520px] items-center justify-between px-16">

          <div className="flex flex-col items-center">

            <div className="flex h-[26px] w-[26px] items-center justify-center rounded bg-[#3d4ca8] text-white">
              ≡
            </div>

            <span className="text-[15px] text-[#263b87]">
              Pedido
            </span>

          </div>

          <div className="flex flex-col items-center">

            <div className="text-[25px] text-[#3d4ca8]">
              ▯
            </div>

            <span className="text-[15px] text-[#777]">
              Progreso del pago
            </span>

          </div>

        </div>

      </div>

    </main>
  );
}