export const LISTS = [
  { key: "cuenta_bancaria_mexico", label: "Cuenta bancaria (México)" },
  { key: "metodo_pago_mexico", label: "Método de pago (México)" },
  { key: "producto_mexico", label: "Productos (México)" },

  { key: "cuenta_bancaria_colombia", label: "Cuenta bancaria (Colombia)" },
  { key: "metodo_pago_colombia", label: "Método de pago (Colombia)" },
  { key: "producto_colombia", label: "Productos (Colombia)" },
] as const;

export type ListKey = (typeof LISTS)[number]["key"];

export type AnyItem = {
  id: number;
  list_key: ListKey;
  label?: string | null;
  value: string;               // obligatorio SIEMPRE
  image_url?: string | null;   // solo productos
  active?: boolean;
};
