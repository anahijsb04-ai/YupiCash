import type { PlantillaProps } from "./types";

export default function PaymentView({
  onSubmit,
  disabled,
  saving,
}: Pick<PlantillaProps, "onSubmit" | "disabled" | "saving">) {

  return (
    <div className="w-full px-4 py-6">

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || saving}
        className="
          w-full
          rounded-full
          bg-[#347ff0]
          py-4
          text-xl
          font-bold
          text-white
          shadow-[0_8px_20px_rgba(52,127,240,0.35)]
          disabled:opacity-60
        "
      >
        {saving
          ? "Generando link..."
          : "PAGO TOTAL"}
      </button>

    </div>
  );
}