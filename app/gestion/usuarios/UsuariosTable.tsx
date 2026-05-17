"use client";

import { useEffect, useState } from "react";

type Usuario = {
  id: number;
  username: string;
  role: string;
};

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "asesor">("asesor");

  // edición
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await fetch("/api/usuarios", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchUsers error", err);
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoadingUsers(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setUsername("");
    setPassword("");
    setRole("asesor");
  }

  function startCreate() {
    resetForm();
    setMessage(null);
    setError(null);
  }

  function startEdit(u: Usuario) {
    setEditing(u);
    setUsername(u.username);
    setPassword(""); // vacío = no cambia
    setRole(u.role as "admin" | "asesor");
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (!username.trim()) {
        setError("El username es requerido");
        return;
      }

      // CREATE
      if (!editing) {
        if (!password.trim()) {
          setError("Password es requerido al crear usuario");
          return;
        }

        const payload = { username: username.trim(), password: password.trim(), role };
        const res = await fetch("/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);

        setMessage("Usuario creado ✔");
        startCreate();
        await fetchUsers();
        return;
      }

      // UPDATE
      const payload: any = { username: username.trim(), role };
      if (password && password.trim() !== "") payload.password = password.trim();

      const res = await fetch(`/api/usuarios/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);

      setMessage("Usuario actualizado ✔");
      resetForm();
      await fetchUsers();
    } catch (err: any) {
      console.error("save error", err);
      setError(err?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = confirm("¿Seguro que deseas eliminar este usuario?");
    if (!ok) return;

    setDeletingId(id);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error((data as any)?.error || `Error ${res.status}`);

      setMessage("Usuario eliminado ✔");
      await fetchUsers();
    } catch (err: any) {
      console.error("delete error", err);
      setError(err?.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {editing ? "Editar usuario" : "Crear usuario"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Administra usuarios y roles del sistema.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="
            px-4 py-2 rounded-2xl
            bg-white/60 backdrop-blur-xl
            border border-slate-200/70
            text-slate-700 font-medium
            shadow-sm
            hover:bg-white
            transition
          "
        >
          Nuevo
        </button>
      </div>

      {/* Form Card */}
      <div
        className="
          rounded-3xl
          bg-white/55 backdrop-blur-xl
          border border-slate-200/60
          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          p-5 sm:p-6
          space-y-4
        "
      >
        {message && (
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/60 px-4 py-3 text-emerald-800 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-rose-50/80 border border-rose-200/60 px-4 py-3 text-rose-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Username</label>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full rounded-2xl
                bg-white/70
                border border-slate-200/70
                px-4 py-3
                text-slate-900 placeholder:text-slate-400
                shadow-sm
                outline-none
                focus:ring-2 focus:ring-sky-300/60
                focus:border-sky-200/60
                transition
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Password</label>
            <input
              placeholder={editing ? "Dejar vacío = sin cambiar" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="
                w-full rounded-2xl
                bg-white/70
                border border-slate-200/70
                px-4 py-3
                text-slate-900 placeholder:text-slate-400
                shadow-sm
                outline-none
                focus:ring-2 focus:ring-sky-300/60
                focus:border-sky-200/60
                transition
              "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "asesor")}
              className="
                w-full rounded-2xl
                bg-white/70
                border border-slate-200/70
                px-4 py-3
                text-slate-900
                shadow-sm
                outline-none
                focus:ring-2 focus:ring-sky-300/60
                focus:border-sky-200/60
                transition
              "
            >
              <option value="admin">admin</option>
              <option value="asesor">asesor</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="
              px-4 py-3 rounded-2xl
              bg-gradient-to-r from-sky-700 to-slate-800
              text-white font-semibold
              shadow-sm
              hover:from-sky-800 hover:to-slate-900
              transition
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
          </button>

          {editing && (
            <button
              onClick={startCreate}
              className="
                px-4 py-3 rounded-2xl
                bg-white/60
                border border-slate-200/70
                text-slate-700 font-medium
                hover:bg-white
                transition
              "
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div
        className="
          rounded-3xl
          bg-white/55 backdrop-blur-xl
          border border-slate-200/60
          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          p-4 sm:p-6
        "
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Usuarios</h3>
          <span className="text-sm text-slate-500">{usuarios.length} total</span>
        </div>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />

        {loadingUsers ? (
          <div className="text-slate-500 mt-4">Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className="text-slate-500 mt-4">No hay usuarios.</div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-3 px-3 border-b border-slate-200/70">ID</th>
                  <th className="py-3 px-3 border-b border-slate-200/70">Username</th>
                  <th className="py-3 px-3 border-b border-slate-200/70">Rol</th>
                  <th className="py-3 px-3 border-b border-slate-200/70 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-white/60 transition"
                  >
                    <td className="py-3 px-3 border-b border-slate-200/60 text-slate-700">
                      {u.id}
                    </td>
                    <td className="py-3 px-3 border-b border-slate-200/60 font-medium text-slate-900">
                      {u.username}
                    </td>
                    <td className="py-3 px-3 border-b border-slate-200/60">
                      <span
                        className={[
                          "inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium border",
                          u.role === "admin"
                            ? "bg-amber-50/80 text-amber-800 border-amber-200/60"
                            : "bg-sky-50/80 text-sky-800 border-sky-200/60",
                        ].join(" ")}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 border-b border-slate-200/60">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEditUser(u)}
                          className="
                            px-3 py-2 rounded-xl
                            bg-white/70
                            border border-slate-200/70
                            text-slate-700 text-sm font-medium
                            hover:bg-white
                            transition
                          "
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className="
                            px-3 py-2 rounded-xl
                            bg-red-600/90
                            text-white text-sm font-medium
                            shadow-sm
                            hover:bg-red-700
                            transition
                            disabled:opacity-50 disabled:cursor-not-allowed
                          "
                        >
                          {deletingId === u.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  function startEditUser(u: Usuario) {
    startEdit(u);
  }
}
