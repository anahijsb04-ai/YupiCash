"use client";

import { useMemo, useState } from "react";

export type CasosFilters = {
  numero_prestamo: string;
  nombre_cliente: string;
  telefono_cliente: string;
  producto: string;
  estado_pago: "" | "pendiente" | "pagado";
  collection_account: string;
};

const CREATE_CLIENT_ENDPOINT = "/api/collection/casos/crear";

export default function CasosToolbar({
  filters,
  onChange,
  onOpenImport,
  onOpenAutoAssign,
  onResetAssign,
  onResegment,
  onWipeDb,
  role,
}: {
  filters: CasosFilters;
  onChange: (next: CasosFilters) => void;
  onOpenImport: () => void;
  onOpenAutoAssign: () => void;
  onResetAssign: () => void;
  onResegment: () => Promise<void>;
  onWipeDb: () => Promise<void>;
  role: "admin" | "user";
}) {
  const set = (k: keyof CasosFilters, v: string) =>
    onChange({ ...filters, [k]: v });

  const anyFilter = useMemo(
    () => Object.values(filters).some((v) => String(v).trim() !== ""),
    [filters]
  );

  const [dangerBusy, setDangerBusy] = useState<"wipe" | "resegment" | null>(null);

  const [openAddClient, setOpenAddClient] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const [form, setForm] = useState({
    nombre_completo: "",
    telefono: "",
    valor_cobrar: "",
    producto: "",
  });

  function setFormField(
    key: "nombre_completo" | "telefono" | "valor_cobrar" | "producto",
    value: string
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({
      nombre_completo: "",
      telefono: "",
      valor_cobrar: "",
      producto: "",
    });
    setAddError("");
    setAddSuccess("");
  }

  function openModal() {
    resetForm();
    setOpenAddClient(true);
  }

  function closeModal() {
    if (addBusy) return;
    setOpenAddClient(false);
  }

  async function confirmAndRun(kind: "wipe" | "resegment") {
    const msg =
      kind === "wipe"
        ? "⚠️ Esto borrará la base de casos. ¿Seguro que deseas continuar?"
        : "⚠️ Esto resegmentará/recalculará asignaciones. ¿Continuar?";
    if (!confirm(msg)) return;

    try {
      setDangerBusy(kind);
      if (kind === "wipe") await onWipeDb();
      else await onResegment();
    } finally {
      setDangerBusy(null);
    }
  }

  async function handleCreateClient() {
    setAddError("");
    setAddSuccess("");

    const nombreCompleto = form.nombre_completo.trim();
    const telefono = form.telefono.replace(/\D/g, "");
    const valorCobrar = form.valor_cobrar.trim();
    const producto = form.producto.trim();

    if (!nombreCompleto || !telefono || !valorCobrar || !producto) {
      setAddError("Todos los campos son obligatorios.");
      return;
    }

    const valorNumerico = Number(String(valorCobrar).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setAddError("El valor a cobrar debe ser un número válido mayor a 0.");
      return;
    }

    try {
      setAddBusy(true);

      const body = {
        nombre_cliente: nombreCompleto,
        telefono_cliente: telefono,
        valor_cobrar: valorNumerico,
        valor_deuda: valorNumerico,
        producto,
      };

      const res = await fetch(CREATE_CLIENT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.error ||
            json?.message ||
            `No se pudo crear el cliente (${res.status}).`
        );
      }

      setAddSuccess("Cliente agregado correctamente.");

      setTimeout(() => {
        setOpenAddClient(false);
        resetForm();
        window.location.reload();
      }, 900);
    } catch (err: any) {
      setAddError(err?.message || "Ocurrió un error al agregar el cliente.");
    } finally {
      setAddBusy(false);
    }
  }

  return (
    <>
      <div
        className="
          rounded-[28px]
          border border-slate-200/70
          bg-white/75
          backdrop-blur-xl
          shadow-[0_10px_35px_rgba(15,23,42,0.07)]
          p-4 sm:p-5
          space-y-4
        "
      >
        {/* Header acciones */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-wide text-slate-800">
              Filtros
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Busca, filtra y administra tus casos rápidamente.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenImport}
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-sky-700 to-indigo-700 text-white hover:from-sky-800 hover:to-indigo-800 transition shadow-sm"
              type="button"
            >
              Importar
            </button>

            <button
              onClick={openModal}
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
              type="button"
            >
              Agregar cliente
            </button>

            {role === "admin" && (
              <>
                <button
                  onClick={onOpenAutoAssign}
                  className="rounded-2xl px-4 py-2.5 text-sm font-semibold bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white transition"
                  type="button"
                >
                  Asignar automático
                </button>

                <button
                  onClick={onResetAssign}
                  className="rounded-2xl px-4 py-2.5 text-sm font-semibold bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white transition"
                  type="button"
                >
                  Reiniciar
                </button>

                <button
                  onClick={() => confirmAndRun("wipe")}
                  disabled={dangerBusy !== null}
                  className="rounded-2xl px-4 py-2.5 text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-60"
                  type="button"
                  title="Borra toda la base de casos"
                >
                  {dangerBusy === "wipe" ? "Borrando..." : "Borrar base"}
                </button>
              </>
            )}

            {anyFilter && (
              <button
                onClick={() =>
                  onChange({
                    numero_prestamo: "",
                    nombre_cliente: "",
                    telefono_cliente: "",
                    producto: "",
                    estado_pago: "",
                    collection_account: "",
                  })
                }
                className="rounded-2xl px-4 py-2.5 text-sm font-medium bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white transition"
                type="button"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
          <input
            value={filters.numero_prestamo}
            onChange={(e) => set("numero_prestamo", e.target.value)}
            placeholder="N° préstamo"
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <input
            value={filters.nombre_cliente}
            onChange={(e) => set("nombre_cliente", e.target.value)}
            placeholder="Cliente"
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <input
            value={filters.telefono_cliente}
            onChange={(e) => set("telefono_cliente", e.target.value)}
            placeholder="Teléfono"
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <input
            value={filters.producto}
            onChange={(e) => set("producto", e.target.value)}
            placeholder="Producto"
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <select
            value={filters.estado_pago}
            onChange={(e) => set("estado_pago", e.target.value)}
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Estado (todos)</option>
            <option value="pendiente">pendiente</option>
            <option value="pagado">pagado</option>
          </select>

          <input
            value={filters.collection_account}
            onChange={(e) => set("collection_account", e.target.value)}
            placeholder="Collection (id / user)"
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Modal agregar cliente */}
      {openAddClient && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={closeModal}
          />

          <div className="relative z-[121] w-full max-w-[520px] rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.22)]">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-200/80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Agregar cliente
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Completa los campos obligatorios para crear un cliente único.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={addBusy}
                  className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nombre completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.nombre_completo}
                    onChange={(e) => setFormField("nombre_completo", e.target.value)}
                    placeholder="Ej. Juan Pérez López"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Número de teléfono <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.telefono}
                    onChange={(e) =>
                      setFormField("telefono", e.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="Ej. 5512345678"
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Valor a cobrar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.valor_cobrar}
                    onChange={(e) =>
                      setFormField(
                        "valor_cobrar",
                        e.target.value.replace(/[^\d.]/g, "")
                      )
                    }
                    placeholder="Ej. 1500"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Producto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.producto}
                    onChange={(e) => setFormField("producto", e.target.value)}
                    placeholder="Ej. Big Pesitos"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {addError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {addError}
                </div>
              ) : null}

              {addSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {addSuccess}
                </div>
              ) : null}
            </div>

            <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={addBusy}
                className="rounded-2xl px-4 py-3 text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleCreateClient}
                disabled={addBusy}
                className="rounded-2xl px-4 py-3 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {addBusy ? "Guardando..." : "Guardar cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}