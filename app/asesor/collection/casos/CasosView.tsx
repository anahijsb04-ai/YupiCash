"use client";

import { useState } from "react";
import CasosToolbar, { CasosFilters } from "./components/CasosToolbar";
import CasosTable from "./components/CasosTable";

export default function CasosView() {
  // ✅ USUARIO NORMAL
  const role: "admin" | "user" = "user";

  const [filters, setFilters] = useState<CasosFilters>({
    numero_prestamo: "",
    nombre_cliente: "",
    telefono_cliente: "",
    producto: "",
    estado_pago: "",
    collection_account: "",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Casos</h1>
          <p className="text-slate-500 mt-1">
            Solo puedes ver tus casos asignados.
          </p>
        </div>
      </div>

      {/* Toolbar (SIN importar / auto-assign / reset) */}
      <CasosToolbar
        role={role}
        filters={filters}
        onChange={setFilters}
        // ❌ NO onOpenImport
        // ❌ NO onOpenAutoAssign
        // ❌ NO onResetAssign
      />

      {/* Tabla (SOLO ver + botones Generar enlace / Entrar) */}
      <CasosTable role={role} filters={filters} />
    </div>
  );
}
  