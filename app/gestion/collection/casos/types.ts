// 🔵 Datos verdes → Excel / BD
export type CasoImportado = {
  numeroCaso: string;
  producto: string;
  cliente: string;
  fechaIngreso: string;
};

// 🔵 Datos azules → generados por código
export type CasoCalculado = {
  estado: "pendiente" | "procesado" | "error";
  diasTranscurridos: number;
  urlAplicacion: string;
};

// 🔹 Caso final (lo que verá la tabla)
export type Caso = CasoImportado & CasoCalculado;
