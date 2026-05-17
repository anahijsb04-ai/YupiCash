"use client";

import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";

import CasosToolbar, {
  CasosFilters,
} from "./components/CasosToolbar";

import CasosTable from "./components/CasosTable";

type AssignUser = {
  id: number;
  username: string;
};

export default function CasosView() {
  const role: "admin" | "user" = "admin";

  const [importOpen, setImportOpen] =
    useState(false);

  const [autoOpen, setAutoOpen] =
    useState(false);

  const [filters, setFilters] =
    useState<CasosFilters>({
      numero_prestamo: "",
      nombre_cliente: "",
      telefono_cliente: "",
      producto: "",
      estado_pago: "",
      collection_account: "",
    });

  // RESET
  const onResetAssign = async () => {
    if (role !== "admin") return;

    try {
      const res = await fetch(
        "/api/collection/casos/reset-assign",
        {
          method: "POST",
          headers: {
            "x-role": "admin",
          },
          credentials: "include",
        }
      );

      const j = await res
        .json()
        .catch(() => null);

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error || "Error reiniciando"
        );
      }

      window.dispatchEvent(
        new Event("casos:reload")
      );
    } catch (e: any) {
      alert(e?.message || "Error");
    }
  };

  // RESEGMENT
  const resegment = async () => {
    if (role !== "admin") return;

    try {
      const res = await fetch(
        "/api/collection/casos/resegment",
        {
          method: "POST",
          headers: {
            "x-role": "admin",
          },
          credentials: "include",
        }
      );

      const j = await res
        .json()
        .catch(() => null);

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error ||
            "Error resegmentando"
        );
      }

      window.dispatchEvent(
        new Event("casos:reload")
      );
    } catch (e: any) {
      alert(e?.message || "Error");
    }
  };

  // WIPE
  const wipeDb = async () => {
    if (role !== "admin") return;

    try {
      const res = await fetch(
        "/api/collection/casos/wipe",
        {
          method: "POST",
          headers: {
            "x-role": "admin",
          },
          credentials: "include",
        }
      );

      const j = await res
        .json()
        .catch(() => null);

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error ||
            "Error borrando base"
        );
      }

      window.dispatchEvent(
        new Event("casos:reload")
      );
    } catch (e: any) {
      alert(e?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* HERO */}
            <section
              className="
                relative overflow-hidden
                rounded-[34px]
                border border-slate-200
                bg-white
                shadow-[0_10px_50px_rgba(15,23,42,0.06)]
              "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

              <div className="relative z-10 p-6 sm:p-8 md:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  <div>
                    <div
                      className="
                        inline-flex items-center gap-2
                        px-4 py-2
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        shadow-sm
                        mb-5
                      "
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />

                      <span className="text-sm font-medium text-slate-700">
                        Gestión de casos
                      </span>
                    </div>

                    <h1
                      className="
                        text-3xl sm:text-4xl md:text-5xl
                        font-semibold
                        tracking-tight
                        text-slate-900
                      "
                    >
                      Casos
                    </h1>

                    <p className="text-slate-500 mt-4 max-w-[700px] text-sm sm:text-base leading-relaxed">
                      Administración y seguimiento
                      de casos importados desde
                      collections y bases externas.
                    </p>
                  </div>

                  <div
                    className="
                      rounded-3xl
                      border border-slate-200
                      bg-white
                      px-5 py-4
                      shadow-sm
                    "
                  >
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Estado
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                      <span className="font-semibold text-slate-900">
                        Operativo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TOOLBAR */}
            <section
              className="
                mt-6
                rounded-[32px]
                border border-slate-200
                bg-white
                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                p-5 sm:p-6
              "
            >
              <CasosToolbar
                filters={filters}
                onChange={setFilters}
                onOpenImport={() =>
                  setImportOpen(true)
                }
                onOpenAutoAssign={() =>
                  setAutoOpen(true)
                }
                onResetAssign={
                  onResetAssign
                }
                onResegment={resegment}
                onWipeDb={wipeDb}
                role={role}
              />
            </section>

            {/* TABLA */}
            <section
              className="
                mt-6
                rounded-[32px]
                border border-slate-200
                bg-white
                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                overflow-hidden
              "
            >
              <div className="p-5 sm:p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">
                  Lista de casos
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Visualiza y administra
                  registros importados.
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <CasosTable
                  role={role}
                  filters={filters}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* MODALS */}
      {importOpen && (
        <ImportModal
          onClose={() =>
            setImportOpen(false)
          }
          onDone={() =>
            window.dispatchEvent(
              new Event("casos:reload")
            )
          }
        />
      )}

      {autoOpen && (
        <AutoAssignModal
          onClose={() =>
            setAutoOpen(false)
          }
          onDone={() =>
            window.dispatchEvent(
              new Event("casos:reload")
            )
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   IMPORT MODAL
========================================================= */

function ImportModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [msg, setMsg] = useState<
    string | null
  >(null);

  const handleUpload = async () => {
    if (!file) {
      setMsg(
        "Selecciona un archivo CSV o Excel."
      );

      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const form = new FormData();

      form.append("file", file);

      const res = await fetch(
        "/api/collection/casos/import",
        {
          method: "POST",
          body: form,
        }
      );

      const j = await res
        .json()
        .catch(() => null);

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error ||
            "Error al importar"
        );
      }

      setMsg(
        `✅ Importado: ${
          j.imported ?? 0
        } filas`
      );

      setFile(null);

      onDone();
    } catch (e: any) {
      setMsg(
        `❌ ${
          e?.message ||
          "Error inesperado"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className="
          relative
          w-full max-w-xl
          rounded-[34px]
          border border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.15)]
          p-6 sm:p-7
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Importar casos
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Sube un archivo CSV o
              Excel para importar datos.
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              px-4 py-2
              text-sm font-medium
              text-slate-700
              hover:bg-slate-50
              transition
            "
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6">
          <div
            className="
              rounded-3xl
              border border-dashed border-slate-300
              bg-slate-50/70
              p-6
            "
          >
            <div className="text-sm font-medium text-slate-800">
              Archivo
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Formatos soportados:
              .csv, .xlsx, .xls
            </p>

            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="
                mt-4 block w-full
                text-sm text-slate-700
                file:mr-4
                file:rounded-2xl
                file:border
                file:border-slate-200
                file:bg-white
                file:px-4
                file:py-2.5
                file:text-sm
                file:font-medium
                hover:file:bg-slate-50
              "
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ||
                    null
                )
              }
            />

            {file && (
              <div className="mt-4 text-sm text-slate-600">
                Seleccionado:
                <span className="font-medium ml-1">
                  {file.name}
                </span>
              </div>
            )}
          </div>

          {msg && (
            <div
              className="
                mt-4
                rounded-2xl
                border border-slate-200
                bg-slate-50
                p-4
                text-sm text-slate-700
              "
            >
              {msg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                px-5 py-3
                text-sm font-medium
                text-slate-700
                hover:bg-slate-50
                transition
              "
            >
              Cancelar
            </button>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="
                rounded-2xl
                bg-slate-900
                hover:bg-black
                px-5 py-3
                text-sm font-semibold
                text-white
                transition
                disabled:opacity-60
              "
            >
              {loading
                ? "Subiendo..."
                : "Subir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AUTO ASSIGN MODAL
========================================================= */

function AutoAssignModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [users, setUsers] =
    useState<AssignUser[]>([]);

  const [checked, setChecked] =
    useState<Record<number, boolean>>(
      {}
    );

  const [loading, setLoading] =
    useState(false);

  const [msg, setMsg] = useState<
    string | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          "/api/collection/assignable-users",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const j = await r
          .json()
          .catch(() => null);

        if (
          j?.ok &&
          Array.isArray(j.users)
        ) {
          const u = j.users
            .map((x: any) => ({
              id: Number(x.id),
              username: String(
                x.username ?? ""
              ),
            }))
            .filter(
              (x: any) =>
                Number.isFinite(x.id) &&
                x.username
            );

          setUsers(u);

          const map: Record<
            number,
            boolean
          > = {};

          u.forEach(
            (x: any) =>
              (map[x.id] = true)
          );

          setChecked(map);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const toggle = (id: number) =>
    setChecked((p) => ({
      ...p,
      [id]: !p[id],
    }));

  const allSelected =
    users.length > 0 &&
    users.every((u) => !!checked[u.id]);

  const someSelected =
    users.some((u) => !!checked[u.id]) &&
    !allSelected;

  const toggleAll = () => {
    setChecked((prev) => {
      const next = { ...prev };

      const target = !allSelected;

      users.forEach(
        (u) => (next[u.id] = target)
      );

      return next;
    });
  };

  const run = async () => {
    const userIds = Object.entries(
      checked
    )
      .filter(([, v]) => v)
      .map(([id]) => Number(id))
      .filter(
        (n) =>
          Number.isInteger(n) && n > 0
      );

    if (userIds.length === 0) {
      setMsg(
        "Selecciona al menos 1 asesor."
      );

      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(
        "/api/collection/casos/auto-assign",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userIds,
          }),
        }
      );

      const j = await res
        .json()
        .catch(() => null);

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error ||
            "Error asignando"
        );
      }

      setMsg(
        `✅ Asignados: ${
          j.assigned ?? 0
        }`
      );

      onDone();

      onClose();
    } catch (e: any) {
      setMsg(
        `❌ ${
          e?.message || "Error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className="
          relative
          w-full max-w-xl
          rounded-[34px]
          border border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.15)]
          p-6 sm:p-7
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Asignación automática
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Selecciona asesores para
              distribuir casos
              equitativamente.
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              px-4 py-2
              text-sm font-medium
              text-slate-700
              hover:bg-slate-50
              transition
            "
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label
            className="
              flex items-center gap-3
              rounded-2xl
              border border-slate-200
              bg-slate-50
              px-4 py-3
            "
          >
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate =
                    someSelected;
                }
              }}
              onChange={toggleAll}
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-slate-800">
              Seleccionar todos
            </span>

            <span className="ml-auto text-xs text-slate-500">
              {
                users.filter(
                  (u) => checked[u.id]
                ).length
              }
              /{users.length}
            </span>
          </label>

          <div
            className="
              max-h-72 overflow-y-auto
              rounded-3xl
              border border-slate-200
              bg-slate-50/70
              p-3
            "
          >
            {users.length === 0 ? (
              <div className="text-sm text-slate-500 p-3">
                No hay asesores.
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className="
                      flex items-center gap-3
                      rounded-2xl
                      bg-white
                      border border-slate-200
                      px-4 py-3
                      hover:bg-slate-50
                      transition
                      cursor-pointer
                    "
                  >
                    <input
                      type="checkbox"
                      checked={
                        !!checked[u.id]
                      }
                      onChange={() =>
                        toggle(u.id)
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-medium text-slate-800">
                      {u.username}
                    </span>

                    <span className="ml-auto text-xs text-slate-500">
                      #{u.id}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {msg && (
            <div
              className="
                rounded-2xl
                border border-slate-200
                bg-slate-50
                p-4
                text-sm text-slate-700
              "
            >
              {msg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                px-5 py-3
                text-sm font-medium
                text-slate-700
                hover:bg-slate-50
                transition
              "
            >
              Cancelar
            </button>

            <button
              onClick={run}
              disabled={loading}
              className="
                rounded-2xl
                bg-slate-900
                hover:bg-black
                px-5 py-3
                text-sm font-semibold
                text-white
                transition
                disabled:opacity-60
              "
            >
              {loading
                ? "Asignando..."
                : "Asignar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}