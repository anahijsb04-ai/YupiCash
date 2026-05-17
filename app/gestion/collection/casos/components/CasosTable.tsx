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
  liga_pago: string | null;
  token: string;
};

type User = {
  id: number;
  username: string;
};

function money(
  n: number | null | undefined
) {
  if (
    n === null ||
    typeof n === "undefined"
  ) {
    return "—";
  }

  return `$${Number(
    n
  ).toLocaleString()}`;
}

export default function CasosTable({
  role,
  filters,
}: {
  role: "admin" | "user";
  filters: CasosFilters;
}) {
  const [data, setData] = useState<
    Caso[]
  >([]);

  const [users, setUsers] = useState<
    User[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState<
      Record<string, boolean>
    >({});

  const [
    prorrogaLoading,
    setProrrogaLoading,
  ] = useState<
    Record<string, boolean>
  >({});

  const [resegLoading, setResegLoading] =
    useState(false);

  const [
    changingPago,
    setChangingPago,
  ] = useState<
    Record<string, boolean>
  >({});

  const [
    openingLiga,
    setOpeningLiga,
  ] = useState<
    Record<string, boolean>
  >({});

  async function load() {
    setLoading(true);

    try {
      const r = await fetch(
        "/api/collection/casos",
        {
          cache: "no-store",
        }
      );

      const j = await r.json();

      if (
        j?.ok &&
        Array.isArray(j.data)
      ) {
        setData(j.data);
      }

      if (role === "admin") {
        const ru = await fetch(
          "/api/collection/assignable-users",
          {
            cache: "no-store",
          }
        );

        const ju = await ru.json();

        if (
          ju?.ok &&
          Array.isArray(ju.users)
        ) {
          setUsers(
            ju.users
              .map((u: any) => ({
                id: Number(u.id),
                username: String(
                  u.username ?? ""
                ),
              }))
              .filter(
                (u: any) =>
                  Number.isFinite(u.id) &&
                  u.username
              )
          );
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const handler = () => load();

    window.addEventListener(
      "casos:reload",
      handler
    );

    return () =>
      window.removeEventListener(
        "casos:reload",
        handler
      );
  }, [role]);

  async function patchCaso(
    numero_prestamo: string,
    body: any
  ) {
    const res = await fetch(
      `/api/collection/casos/${numero_prestamo}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const j = await res.json();

    if (!j.ok) {
      throw new Error(
        j.error ||
          "Error guardando"
      );
    }

    setData((prev) =>
      prev.map((x) =>
        x.numero_prestamo ===
        numero_prestamo
          ? j.data
          : x
      )
    );

    return j.data;
  }

  async function obtenerUltimaLiga(
    numero_prestamo: string
  ) {
    const res = await fetch(
      `/api/collection/casos/${encodeURIComponent(
        numero_prestamo
      )}`,
      {
        cache: "no-store",
      }
    );

    const j = await res
      .json()
      .catch(() => null);

    if (!res.ok || !j?.ok) {
      throw new Error(
        j?.error ||
          "No se pudo obtener el caso"
      );
    }

    const liga =
      j?.data?.liga_pago ||
      j?.liga_pago ||
      null;

    if (!liga) {
      throw new Error(
        "Este cliente no tiene una liga de pago generada"
      );
    }

    return liga as string;
  }

  async function cambiarEstadoPago(
    row: Caso
  ) {
    if (role !== "admin") return;

    const key =
      row.numero_prestamo;

    const nuevoEstado =
      row.estado_pago ===
      "pagado"
        ? "pendiente"
        : "pagado";

    try {
      setChangingPago((p) => ({
        ...p,
        [key]: true,
      }));

      await patchCaso(
        row.numero_prestamo,
        {
          estado_pago:
            nuevoEstado,
        }
      );

      await load();
    } catch (e: any) {
      alert(
        e?.message ||
          "Error actualizando estado"
      );

      await load();
    } finally {
      setChangingPago((p) => ({
        ...p,
        [key]: false,
      }));
    }
  }

  async function entrarUltimaLiga(
    row: Caso
  ) {
    const key =
      row.numero_prestamo;

    try {
      setOpeningLiga((p) => ({
        ...p,
        [key]: true,
      }));

      const liga =
        await obtenerUltimaLiga(
          row.numero_prestamo
        );

      window.open(
        liga,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (e: any) {
      alert(
        e?.message ||
          "Error obteniendo liga"
      );
    } finally {
      setOpeningLiga((p) => ({
        ...p,
        [key]: false,
      }));
    }
  }

  async function resegmentar() {
    try {
      setResegLoading(true);

      const res = await fetch(
        "/api/collection/casos/resegment",
        {
          method: "POST",
        }
      );

      const j = await res.json();

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error ||
            "Error resegmentando"
        );
      }

      alert(
        `✅ Actualizados: ${j.updated}`
      );

      window.dispatchEvent(
        new Event("casos:reload")
      );
    } catch (e: any) {
      alert(
        e?.message || "Error"
      );
    } finally {
      setResegLoading(false);
    }
  }

  async function generarLiga(
    row: Caso
  ) {
    const key =
      row.numero_prestamo;

    try {
      setGenerating((p) => ({
        ...p,
        [key]: true,
      }));

      const res = await fetch(
        `/api/collection/casos/${encodeURIComponent(
          key
        )}/generar-liga`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            overwrite: true,
          }),
        }
      );

      const j = await res.json();

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error ||
            "Error generando"
        );
      }

      await load();

      const finalLink =
        j.link ||
        j.liga_pago ||
        j.data?.liga_pago ||
        null;

      if (finalLink) {
        window.open(
          finalLink,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (e: any) {
      alert(
        e?.message || "Error"
      );
    } finally {
      setGenerating((p) => ({
        ...p,
        [key]: false,
      }));
    }
  }

  async function generarProrroga(
    row: Caso
  ) {
    const key =
      row.numero_prestamo;

    try {
      setProrrogaLoading((p) => ({
        ...p,
        [key]: true,
      }));

      const res = await fetch(
        `/api/collection/casos/${encodeURIComponent(
          key
        )}/generar-prorroga`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            overwrite: true,
          }),
        }
      );

      const j = await res.json();

      if (!res.ok || !j?.ok) {
        throw new Error(
          j?.error ||
            "Error generando"
        );
      }

      await load();

      const finalLink =
        j.link ||
        j.liga_pago ||
        j.data?.liga_pago ||
        null;

      if (finalLink) {
        window.open(
          finalLink,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (e: any) {
      alert(
        e?.message || "Error"
      );
    } finally {
      setProrrogaLoading((p) => ({
        ...p,
        [key]: false,
      }));
    }
  }

  function normalizarTelefono(
    raw:
      | string
      | null
      | undefined
  ) {
    return String(
      raw ?? ""
    ).replace(/\D/g, "");
  }

  function abrirWhatsApp(
    row: Caso
  ) {
    const phone =
      normalizarTelefono(
        row.telefono_cliente
      );

    if (!phone) {
      alert(
        "Este cliente no tiene teléfono válido"
      );

      return;
    }

    const cleanPhone = String(
      phone || ""
    )
      .replace(/\D/g, "")
      .replace(/^52/, "");

    window.open(
      `https://wa.me/52${cleanPhone}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function abrirTelegram(
    row: Caso
  ) {
    const phone =
      normalizarTelefono(
        row.telefono_cliente
      );

    if (!phone) {
      alert(
        "Este cliente no tiene teléfono válido"
      );

      return;
    }

    window.open(
      `https://t.me/+52${phone}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const filtered = useMemo(() => {
    const s = (v: any) =>
      String(v ?? "")
        .toLowerCase()
        .trim();

    const onlyDigits = (
      v: any
    ) =>
      String(v ?? "").replace(
        /\D/g,
        ""
      );

    return data.filter((r) => {
      if (
        filters.numero_prestamo &&
        !s(
          r.numero_prestamo
        ).includes(
          s(
            filters.numero_prestamo
          )
        )
      ) {
        return false;
      }

      if (
        filters.nombre_cliente &&
        !s(
          r.nombre_cliente
        ).includes(
          s(
            filters.nombre_cliente
          )
        )
      ) {
        return false;
      }

      if (
        filters.telefono_cliente
      ) {
        if (
          !onlyDigits(
            r.telefono_cliente
          ).includes(
            onlyDigits(
              filters.telefono_cliente
            )
          )
        ) {
          return false;
        }
      }

      if (
        filters.producto &&
        !s(r.producto).includes(
          s(filters.producto)
        )
      ) {
        return false;
      }

      if (
        filters.estado_pago &&
        r.estado_pago !==
          filters.estado_pago
      ) {
        return false;
      }

      if (
        filters.collection_account
      ) {
        if (
          !s(
            r.collection_account
          ).includes(
            s(
              filters.collection_account
            )
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Cargando casos…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ACTION BAR */}
      <div className="flex justify-end">
        <button
          onClick={resegmentar}
          disabled={resegLoading}
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
          {resegLoading
            ? "Procesando..."
            : "Resegmentar casos"}
        </button>
      </div>

      {/* TABLE CARD */}
      <div
        className="
          rounded-[30px]
          border border-slate-200
          bg-white
          shadow-[0_10px_35px_rgba(15,23,42,0.05)]
          overflow-hidden
        "
      >
        {/* TOP */}
        <div
          className="
            flex flex-col sm:flex-row
            sm:items-center
            justify-between
            gap-3
            px-6 py-5
            border-b border-slate-200
            bg-slate-50/60
          "
        >
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Casos registrados
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Mostrando{" "}
              <b>
                {filtered.length}
              </b>{" "}
              de{" "}
              <b>{data.length}</b>
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "Acciones",
                  "N° Préstamo",
                  "Cliente",
                  "Teléfono",
                  "Importe",
                  "Recaudado",
                  "Producto",
                  "Segmento",
                  "Fecha",
                  "Estado",
                  "Collection",
                  "Operar",
                ].map((h) => (
                  <th
                    key={h}
                    className="
                      px-5 py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                      whitespace-nowrap
                    "
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (row, idx) => (
                  <tr
                    key={
                      row.numero_prestamo
                    }
                    className={[
                      "border-b border-slate-100",
                      idx %
                        2 ===
                      0
                        ? "bg-white"
                        : "bg-slate-50/30",
                    ].join(" ")}
                  >
                    {/* ACCIONES */}
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2 min-w-[200px]">
                        <button
                          onClick={() =>
                            abrirWhatsApp(
                              row
                            )
                          }
                          className="
                            rounded-full
                            bg-emerald-100
                            hover:bg-emerald-200
                            px-3 py-1.5
                            text-xs font-semibold
                            text-emerald-700
                            transition
                          "
                        >
                          WhatsApp
                        </button>

                        <button
                          onClick={() =>
                            abrirTelegram(
                              row
                            )
                          }
                          className="
                            rounded-full
                            bg-sky-100
                            hover:bg-sky-200
                            px-3 py-1.5
                            text-xs font-semibold
                            text-sky-700
                            transition
                          "
                        >
                          Telegram
                        </button>

                        <button
                          disabled
                          className="
                            rounded-full
                            bg-slate-100
                            px-3 py-1.5
                            text-xs font-semibold
                            text-slate-400
                          "
                        >
                          Llamar
                        </button>
                      </div>
                    </td>

                    {/* PRESTAMO */}
                    <td className="px-5 py-5 font-semibold text-slate-900 whitespace-nowrap">
                      {
                        row.numero_prestamo
                      }
                    </td>

                    {/* CLIENTE */}
                    <td className="px-5 py-5 min-w-[240px] text-slate-700">
                      {
                        row.nombre_cliente
                      }
                    </td>

                    {/* TELEFONO */}
                    <td className="px-5 py-5 whitespace-nowrap text-slate-700">
                      {
                        row.telefono_cliente
                      }
                    </td>

                    {/* IMPORTE */}
                    <td className="px-5 py-5 whitespace-nowrap font-semibold text-slate-800">
                      {money(
                        row.valor_deuda
                      )}
                    </td>

                    {/* RECAUDADO */}
                    <td className="px-5 py-5">
                      {role ===
                      "admin" ? (
                        <InputEnterSave
                          initial={
                            row.valor_recaudado ??
                            0
                          }
                          onEnter={async (
                            val
                          ) =>
                            patchCaso(
                              row.numero_prestamo,
                              {
                                valor_recaudado:
                                  val,
                              }
                            )
                          }
                        />
                      ) : (
                        <span>
                          {money(
                            row.valor_recaudado
                          )}
                        </span>
                      )}
                    </td>

                    {/* PRODUCTO */}
                    <td className="px-5 py-5 whitespace-nowrap text-slate-700">
                      {
                        row.producto
                      }
                    </td>

                    {/* SEGMENTO */}
                    <td className="px-5 py-5 whitespace-nowrap text-slate-700">
                      {row.segmento ??
                        "—"}
                    </td>

                    {/* FECHA */}
                    <td className="px-5 py-5 whitespace-nowrap text-slate-700">
                      {new Date(
                        row.fecha_cobro
                      ).toLocaleDateString()}
                    </td>

                    {/* ESTADO */}
                    <td className="px-5 py-5">
                      <button
                        disabled={
                          role !==
                            "admin" ||
                          changingPago[
                            row
                              .numero_prestamo
                          ]
                        }
                        onClick={() =>
                          cambiarEstadoPago(
                            row
                          )
                        }
                        className={[
                          `
                            px-3 py-1.5
                            rounded-full
                            text-xs font-semibold
                            transition
                          `,
                          row.estado_pago ===
                          "pagado"
                            ? `
                              bg-emerald-100
                              text-emerald-700
                              hover:bg-emerald-200
                            `
                            : `
                              bg-amber-100
                              text-amber-700
                              hover:bg-amber-200
                            `,
                        ].join(" ")}
                      >
                        {changingPago[
                          row
                            .numero_prestamo
                        ]
                          ? "guardando..."
                          : row.estado_pago}
                      </button>
                    </td>

                    {/* COLLECTION */}
                    <td className="px-5 py-5 min-w-[240px]">
                      {role ===
                      "admin" ? (
                        <select
                          className="
                            w-full
                            rounded-2xl
                            border border-slate-200
                            bg-white
                            px-4 py-2.5
                            text-sm text-slate-700
                            outline-none
                            focus:ring-4
                            focus:ring-slate-900/5
                          "
                          value={
                            row.collection_account ??
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            patchCaso(
                              row.numero_prestamo,
                              {
                                collection_account:
                                  e
                                    .target
                                    .value
                                    ? Number(
                                        e
                                          .target
                                          .value
                                      )
                                    : null,
                              }
                            )
                          }
                        >
                          <option value="">
                            — Sin asignar —
                          </option>

                          {users.map(
                            (u) => (
                              <option
                                key={
                                  u.id
                                }
                                value={
                                  u.id
                                }
                              >
                                {
                                  u.username
                                }
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        row.collection_account ??
                        "—"
                      )}
                    </td>

                    {/* OPERAR */}
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap justify-center gap-2 min-w-[220px]">
                        <button
                          disabled={
                            generating[
                              row
                                .numero_prestamo
                            ]
                          }
                          onClick={() =>
                            generarLiga(
                              row
                            )
                          }
                          className="
                            rounded-full
                            bg-sky-100
                            hover:bg-sky-200
                            px-3.5 py-1.5
                            text-xs font-semibold
                            text-sky-700
                            transition
                          "
                        >
                          {generating[
                            row
                              .numero_prestamo
                          ]
                            ? "Generando..."
                            : "Generar"}
                        </button>

                        <button
                          disabled={
                            prorrogaLoading[
                              row
                                .numero_prestamo
                            ]
                          }
                          onClick={() =>
                            generarProrroga(
                              row
                            )
                          }
                          className="
                            rounded-full
                            bg-violet-100
                            hover:bg-violet-200
                            px-3.5 py-1.5
                            text-xs font-semibold
                            text-violet-700
                            transition
                          "
                        >
                          {prorrogaLoading[
                            row
                              .numero_prestamo
                          ]
                            ? "Generando..."
                            : "Prórroga"}
                        </button>

                        <button
                          disabled={
                            openingLiga[
                              row
                                .numero_prestamo
                            ]
                          }
                          onClick={() =>
                            entrarUltimaLiga(
                              row
                            )
                          }
                          className="
                            rounded-full
                            bg-emerald-100
                            hover:bg-emerald-200
                            px-3.5 py-1.5
                            text-xs font-semibold
                            text-emerald-700
                            transition
                          "
                        >
                          {openingLiga[
                            row
                              .numero_prestamo
                          ]
                            ? "Abriendo..."
                            : "Entrar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {filtered.length ===
                0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="
                      px-6 py-16
                      text-center
                      text-sm text-slate-500
                    "
                  >
                    No se encontraron
                    casos con los filtros
                    actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InputEnterSave({
  initial,
  onEnter,
}: {
  initial: number;
  onEnter: (
    value: number
  ) => Promise<void>;
}) {
  const [val, setVal] =
    useState(String(initial));

  const [saving, setSaving] =
    useState(false);

  return (
    <div className="flex items-center gap-2 min-w-[150px]">
      <input
        value={val}
        onChange={(e) =>
          setVal(e.target.value)
        }
        onKeyDown={async (e) => {
          if (
            e.key !== "Enter"
          )
            return;

          const num = Number(
            String(val).replace(
              /[^\d.-]/g,
              ""
            )
          );

          if (
            !Number.isFinite(num)
          )
            return;

          setSaving(true);

          try {
            await onEnter(num);
          } finally {
            setSaving(false);
          }
        }}
        className="
          w-32
          rounded-2xl
          border border-slate-200
          bg-white
          px-3 py-2.5
          text-sm text-slate-700
          outline-none
          focus:ring-4
          focus:ring-slate-900/5
        "
      />

      <span className="text-xs text-slate-400 whitespace-nowrap">
        {saving
          ? "guardando..."
          : "ENTER"}
      </span>
    </div>
  );
}