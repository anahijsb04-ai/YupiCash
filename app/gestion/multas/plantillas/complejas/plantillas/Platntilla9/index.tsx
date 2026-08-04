import type { PlantillaProps } from "../types";

import Header from "./header";
import LoanCard from "./loanCard";
import LoanInfo from "./LoanInfo";
import PaymentView from "./PaymentView";
import BottomBar from "./BottomBar";


export default function Plantilla9(props: PlantillaProps) {

  return (
    <main className="min-h-screen bg-[#f3f3f3]">

      <div className="relative">

        <Header
          productoTitulo={props.productoTitulo}
        />


        <div className="absolute left-0 right-0 top-[160px] z-10 px-4">

          <LoanCard
            importePagar={props.importePagar}
            fechaVencimiento={props.fechaVencimiento}
          />

        </div>


      </div>


      <div className="px-4 pt-[190px]">

        <LoanInfo
          productoTitulo={props.productoTitulo}
          importePagar={props.importePagar}
          fechaVencimiento={props.fechaVencimiento}
          setFechaVencimiento={props.setFechaVencimiento}
          nombre={props.nombre}
          telefono={props.telefono}
        />


        <PaymentView
          onSubmit={props.onSubmit}
          disabled={props.disabled}
          saving={props.saving}
        />


        <BottomBar />

      </div>


    </main>
  );
}