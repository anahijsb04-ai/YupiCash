import { poolInstance as pool } from "@/lib/db";      

export type Segmento = "mexico" | "colombia" | "-";

export function norm(s: any) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes
}

export async function loadProductoCatalogSets() {
  const mx = await pool.query(
    `SELECT value FROM collection_aplicaciones_items
     WHERE list_key='producto_mexico' AND active=true`
  );
  const co = await pool.query(
    `SELECT value FROM collection_aplicaciones_items
     WHERE list_key='producto_colombia' AND active=true`
  );

  const setMx = new Set(mx.rows.map((r) => norm(r.value)));
  const setCo = new Set(co.rows.map((r) => norm(r.value)));

  return { setMx, setCo };
}

export function resolveSegmentoFromCatalog(
  producto: string,
  setMx: Set<string>,
  setCo: Set<string>
): Segmento {
  const p = norm(producto);
  if (!p) return "-";

  const inMx = setMx.has(p);
  const inCo = setCo.has(p);

  // Si por error está en ambas, lo mandamos a "-" (para revisar)
  if (inMx && inCo) return "-";

  if (inMx) return "mexico";
  if (inCo) return "colombia";
  return "-";
}
