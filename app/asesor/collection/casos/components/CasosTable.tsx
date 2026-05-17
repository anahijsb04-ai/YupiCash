"use client";

import { useEffect, useMemo, useState } from "react";
import type { CasosFilters } from "./CasosToolbar";

type Caso = {
  numero_prestamo: string;
  nombre_cliente: string;
  telefono_cliente: string;
  valor_deuda: number;
  valor_recaudado: number | null;
  producto: string;
  segmento: string | null;
  fecha_cobro: string;
  estado_pago: "pendiente" | "pagado";

  collection_account: number | null;
  collection_username?: string | null;

  liga_pago: string | null;
};

type User = { id: number; username: string };

function money(n: number | null | undefined) {
  if (n === null || typeof n === "undefined") return "—";
  return `$${Number(n).toLocaleString()}`;
}

/** ✅ Convierte ligas viejas /gestion -> /asesor */
function normalizeLiga(link: string | null | undefined) {
  const v = String(link ?? "").trim();
  if (!v) return null;

  if (v.startsWith("/gestion/multas/plantillas/complejas/")) {
    return v.replace(
      "/gestion/multas/plantillas/complejas/",
      "/asesor/multas/plantillas/complejas/"
    );
  }

  return v;
}

export default function CasosTable({
  role,
  filters,
}: {
  role: "admin" | "user";
  filters: CasosFilters;
}) {
  const [data, setData] = useState<Caso[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  const baseApi = role === "user" ? "/api/asesor/casos" : "/api/collection/casos";

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(baseApi, {
        cache: "no-store",
        credentials: "include",
      });

      const j = await r.json().catch(() => null);
      if (j?.ok && Array.isArray(j.data)) setData(j.data);
      else setData([]);

      if (role === "admin") {
        const ru = await fetch("/api/collection/assignable-users", {
          cache: "no-store",
          credentials: "include",
        });
        const ju = await ru.json().catch(() => null);

        if (ju?.ok && Array.isArray(ju.users)) {
          setUsers(
            ju.users
              .map((u: any) => ({ id: Number(u.id), username: String(u.username ?? "") }))
              .filter((u: any) => Number.isFinite(u.id) && u.username)
          );
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setData([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("casos:reload", handler);
    return () => window.removeEventListener("casos:reload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function patchCaso(numero_prestamo: string, body: any) {
    if (role !== "admin") return;

    const res = await fetch(`${baseApi}/${encodeURIComponent(numero_prestamo)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const j = await res.json().catch(() => null);
    if (!j?.ok) throw new Error(j?.error || "Error guardando");

    setData((prev) => prev.map((x) => (x.numero_prestamo === numero_prestamo ? j.data : x)));
  }

  const filtered = useMemo(() => {
    const s = (v: any) => String(v ?? "").toLowerCase().trim();
    const onlyDigits = (v: any) => String(v ?? "").replace(/\D/g, "");

    return data.filter((r) => {
      if (filters.numero_prestamo && !s(r.numero_prestamo).includes(s(filters.numero_prestamo)))
        return false;
      if (filters.nombre_cliente && !s(r.nombre_cliente).includes(s(filters.nombre_cliente)))
        return false;
      if (filters.telefono_cliente) {
        if (!onlyDigits(r.telefono_cliente).includes(onlyDigits(filters.telefono_cliente)))
          return false;
      }
      if (filters.producto && !s(r.producto).includes(s(filters.producto))) return false;
      if (filters.estado_pago && r.estado_pago !== filters.estado_pago) return false;

      if (filters.collection_account) {
        const needle = s(filters.collection_account);
        const byId = s(r.collection_account);
        const byName = s(r.collection_username);
        if (!byId.includes(needle) && !byName.includes(needle)) return false;
      }

      return true;
    });
  }, [data, filters]);

  if (loading) return <div className="p-6 text-sm text-slate-500">Cargando casos…</div>;

  return (
    <div className="overflow-x-auto rounded-3xl bg-white/55 backdrop-blur-xl border border-slate-200/60 shadow">
      <div className="px-4 pt-4 text-xs text-slate-500">
        Mostrando <b>{filtered.length}</b> de <b>{data.length}</b>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-slate-100/70 text-slate-700">
          <tr>
            <th className="th">N° Préstamo</th>
            <th className="th">Cliente</th>
            <th className="th">Teléfono</th>
            <th className="th">Importe Adeudado</th>
            <th className="th">Valor Recaudado</th>
            <th className="th">Producto</th>
            <th className="th">Segmento</th>
            <th className="th">Fecha de Cobro</th>
            <th className="th">Estado de Pago</th>
            <th className="th">Collection Account</th>
            <th className="th text-center">Operar</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((row) => {
            const ligaNormalized = normalizeLiga(row.liga_pago);

            return (
              <tr key={row.numero_prestamo} className="border-t border-slate-200/60">
                <td className="td">{row.numero_prestamo}</td>
                <td className="td">{row.nombre_cliente}</td>
                <td className="td">{row.telefono_cliente}</td>
                <td className="td">{money(row.valor_deuda)}</td>

                <td className="td">
                  {role === "admin" ? (
                    <InputEnterSave
                      initial={row.valor_recaudado ?? 0}
                      onEnter={async (val) => patchCaso(row.numero_prestamo, { valor_recaudado: val })}
                    />
                  ) : (
                    money(row.valor_recaudado)
                  )}
                </td>

                <td className="td">{row.producto}</td>
                <td className="td">{row.segmento ?? "-"}</td>
                <td className="td">{new Date(row.fecha_cobro).toLocaleDateString()}</td>

                <td className="td">
                  <button
                    disabled={role !== "admin"}
                    onClick={() =>
                      role === "admin" &&
                      patchCaso(row.numero_prestamo, {
                        estado_pago: row.estado_pago === "pagado" ? "pendiente" : "pagado",
                      })
                    }
                    className={[
                      "px-2 py-1 rounded-full text-xs font-medium",
                      row.estado_pago === "pagado"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    ].join(" ")}
                  >
                    {row.estado_pago}
                  </button>
                </td>

                <td className="td">
                  {role === "admin" ? (
                    <select
                      className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"
                      value={row.collection_account == null ? "" : String(row.collection_account)}
                      onChange={(e) =>
                        patchCaso(row.numero_prestamo, {
                          collection_account: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    >
                      <option value="">— Sin asignar —</option>
                      {users.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.username}
                        </option>
                      ))}
                    </select>
                  ) : (
                    row.collection_username ?? (row.collection_account ?? "—")
                  )}
                </td>

                <td className="td text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      className="text-sky-700 hover:underline disabled:opacity-50"
                      disabled={!!row.liga_pago || generating[row.numero_prestamo]}
                      onClick={async () => {
                        const key = row.numero_prestamo;
                        try {
                          setGenerating((p) => ({ ...p, [key]: true }));

                          const res = await fetch(
                            `${baseApi}/${encodeURIComponent(key)}/generar-liga`,
                            { method: "POST", credentials: "include" }
                          );

                          const j = await res.json().catch(() => null);
                          if (!res.ok || !j?.ok) throw new Error(j?.error || `Error (${res.status})`);

                          // si backend devuelve /gestion, lo normalizamos igual
                          const link = normalizeLiga(j?.link) || normalizeLiga(j?.data?.liga_pago) || null;

                          window.dispatchEvent(new Event("casos:reload"));
                          if (link) window.open(link, "_blank", "noopener,noreferrer");
                        } catch (e: any) {
                          alert(e?.message || "Error");
                        } finally {
                          setGenerating((p) => ({ ...p, [key]: false }));
                        }
                      }}
                    >
                      {generating[row.numero_prestamo] ? "Generando…" : "Generar"}
                    </button>

                    <button
                      className="text-emerald-700 hover:underline disabled:opacity-50"
                      disabled={!ligaNormalized}
                      onClick={() =>
                        ligaNormalized && window.open(ligaNormalized, "_blank", "noopener,noreferrer")
                      }
                    >
                      Entrar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InputEnterSave({
  initial,
  onEnter,
}: {
  initial: number;
  onEnter: (value: number) => Promise<void>;
}) {
  const [val, setVal] = useState(String(initial));
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key !== "Enter") return;
          const num = Number(String(val).replace(/[^\d.-]/g, ""));
          if (!Number.isFinite(num)) return;
          setSaving(true);
          try {
            await onEnter(num);
          } finally {
            setSaving(false);
          }
        }}
        className="w-32 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"
      />
      <span className="text-xs text-slate-400">{saving ? "guardando…" : "ENTER"}</span>
    </div>
  );
}
