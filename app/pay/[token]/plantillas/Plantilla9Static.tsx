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
};

function formatMoney(v?: string | null) {
  if (!v) return "0.00";

  const n = Number(
    String(v)
      .replace(/[^\d.-]/g, "")
  );

  if (Number.isNaN(n)) return v;

  return n.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(v?: string | null) {
  if (!v) return "dd-mm-aaaa";

  const [y, m, d] = String(v)
    .slice(0, 10)
    .split("-");

  if (!y || !m || !d) return v;

  return `${d}-${m}-${y}`;
}

export default function Plantilla9Static({
  token: tokenProp,
}: {
  token?: string;
}) {

  const params = useParams<{ token?: string }>();

  const token = String(
    tokenProp || params?.token || ""
  ).trim();


  const [data, setData] = useState<Data | null>(null);


  useEffect(() => {

    if (!token) return;


    (async () => {

      const res = await fetch(
        `/api/plantillas-temporales-3/${token}`,
        {
          cache: "no-store",
        }
      );


      const json = await res.json();

      setData(
        json?.data ?? json
      );

    })();


  }, [token]);



  if (!data) {
    return (
      <div className="p-6">
        Cargando...
      </div>
    );
  }



  const producto =
    data.producto_label ||
    data.producto ||
    "GENUINO";


  const monto =
    data.importe_pagar ||
    data.monto ||
    "0";


  const fecha =
    formatDate(
      data.fecha_vencimiento
    );


  const nombre =
    data.nombre_cliente ||
    "—";


  const telefono =
    data.telefono_cliente ||
    "—";



  const desembolso =
    Number(
      String(monto)
        .replace(/[^\d.-]/g, "")
    ) * 0.6;



  return (

    <div className="min-h-screen bg-[#f3f3f3] px-4 py-6">

      <div className="mx-auto max-w-[470px]">


        {/* HEADER */}

        <div className="h-[250px] rounded-t-[25px] bg-[#347ff0] flex justify-center pt-5">

          <h1 className="text-white text-2xl font-bold drop-shadow">
            {producto}
          </h1>

        </div>



        {/* CARD PRINCIPAL */}

        <div className="relative -mt-10 rounded-[28px] bg-white p-6 text-center shadow-lg">


          <p className="text-xl">
            Monto a reembolsar
          </p>


          <h2 className="my-5 text-5xl font-bold">

            $ {formatMoney(monto)}

          </h2>



          <div className="rounded-full bg-gradient-to-r from-yellow-200 to-orange-300 py-4 text-xl">

            Reembolso en curso

          </div>


        </div>




        {/* INFORMACION */}

        <div className="mt-5 rounded-[25px] bg-white p-6">


          <h2 className="mb-5 text-xl font-bold">
            Información sobre el préstamo
          </h2>



          <div className="border-t border-dashed pt-5 space-y-5">


            <div className="flex justify-between">
              <span className="text-gray-400">
                Proveedor del préstamo
              </span>

              <b>
                🌞 {producto}
              </b>
            </div>



            <div className="flex justify-between">
              <span className="text-gray-400">
                Monto del préstamo
              </span>

              <b>
                $ {formatMoney(monto)}
              </b>
            </div>



            <div className="flex justify-between">
              <span className="text-gray-400">
                Fecha de caducidad
              </span>

              <b>
                {fecha}
              </b>
            </div>



            <div className="flex justify-between">
              <span className="text-gray-400">
                Comprobante de desembolso
              </span>

              <span className="text-green-500 font-semibold">
                Ver detalles
              </span>
            </div>


          </div>


        </div>




        {/* CLIENTE */}

        <div className="mt-5 rounded-xl bg-white p-5 shadow-sm">


          <div className="flex justify-between">

            <span className="text-gray-400">
              Cliente
            </span>

            <b>
              {nombre}
            </b>

          </div>



          <div className="mt-4 flex justify-between">

            <span className="text-gray-400">
              Teléfono
            </span>

            <b>
              {telefono}
            </b>

          </div>


        </div>




        {/* BOTON */}

        <button
          className="
            mt-6
            w-full
            rounded-full
            bg-[#347ff0]
            py-4
            text-xl
            font-bold
            text-white
            shadow-lg
          "
        >
          PAGO TOTAL
        </button>



      </div>


    </div>

  );
}