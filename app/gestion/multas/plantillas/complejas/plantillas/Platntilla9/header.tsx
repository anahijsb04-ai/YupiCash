import type { PlantillaProps } from "../types";


export default function Header({
  productoTitulo,
}: Pick<PlantillaProps, "productoTitulo">) {

  return (
    <div className="h-[250px] bg-[#347ff0] flex justify-center pt-5">

      <h1 className="text-white text-2xl font-bold drop-shadow-[1px_1px_0_black]">
        {productoTitulo}
      </h1>

    </div>
  );
}