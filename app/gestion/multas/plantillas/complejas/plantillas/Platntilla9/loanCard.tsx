import type { PlantillaProps } from "./types";


export default function LoanCard({
  importePagar,
}: Pick<PlantillaProps, "importePagar">) {


  return (
    <div className="bg-white rounded-[28px] p-6 text-center shadow-sm">

      <p className="text-xl">
        Monto a reembolsar
      </p>


      <h2 className="text-5xl font-bold my-5">
        $ {importePagar}
      </h2>


      <div
        className="
          bg-gradient-to-r 
          from-yellow-200 
          to-orange-300
          rounded-full
          py-4
          text-xl
        "
      >
        Reembolso en curso
      </div>


    </div>
  );
}