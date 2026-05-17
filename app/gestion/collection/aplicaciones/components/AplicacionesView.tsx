"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnyItem, ListKey } from "../types";
import AplicacionesTabs from "./AplicacionesTabs";
import AplicacionesList from "./AplicacionesList";

export default function AplicacionesView() {
  const [listKey, setListKey] = useState<ListKey>("cuenta_bancaria_mexico");
  const [items, setItems] = useState<AnyItem[]>([]);
  const [value, setValue] = useState(""); // ✅ solo 1 input para listas normales (cuenta/metodo)
  const [name, setName] = useState("");   // productos
  const [url, setUrl] = useState("");     // productos
  const [loading, setLoading] = useState(false);

  const isProductos = useMemo(
    () => listKey === "producto_mexico" || listKey === "producto_colombia",
    [listKey]
  );

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/collection/aplicaciones/${listKey}`, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      setItems(j?.ok ? (j.items ?? []) : []);
      if (!j?.ok) console.log("API error:", j?.error);
    } finally {
      setLoading(false);
    }
  }

  async function resegment() {
    await fetch("/api/collection/casos/resegment", { method: "POST" }).catch(() => null);
    window.dispatchEvent(new Event("casos:reload"));
  }

  useEffect(() => {
    // al cambiar tab, limpio inputs
    setValue("");
    setName("");
    setUrl("");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);

  async function add() {
    setLoading(true);
    try {
      if (isProductos) {
        const n = name.trim();
        const u = url.trim();
        if (!n || !u) return;

        const r = await fetch(`/api/collection/aplicaciones/${listKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: n, url: u }),
        });

        const j = await r.json().catch(() => ({}));
        if (!j?.ok) return alert(j?.error ?? "Error");

        setName("");
        setUrl("");
        await load();
        await resegment();
        return;
      }

      // ✅ Para cuenta/metodo: SOLO value
      const v = value.trim();
      if (!v) return;

      const r = await fetch(`/api/collection/aplicaciones/${listKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: v }), // ✅ aquí estaba el error en metodo_pago_*
      });

      const j = await r.json().catch(() => ({}));
      if (!j?.ok) return alert(j?.error ?? "Error");

      setValue("");
      await load();
      await resegment();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este item?")) return;

    setLoading(true);
    try {
      const r = await fetch(`/api/collection/aplicaciones/${listKey}?id=${id}`, {
        method: "DELETE",
      });
      const j = await r.json().catch(() => ({}));
      if (!j?.ok) return alert(j?.error ?? "Error");

      await load();
      await resegment();
    } finally {
      setLoading(false);
    }
  }

  async function editItem(id: number, payload: any) {
    setLoading(true);
    try {
      // ✅ Para cuenta/metodo: editar con { value }
      // ✅ Para productos: { name, url }
      const r = await fetch(`/api/collection/aplicaciones/${listKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });

      const j = await r.json().catch(() => ({}));
      if (!j?.ok) return alert(j?.error ?? "Error");

      await load();
      await resegment();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Aplicaciones</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isProductos
            ? "En productos guarda: nombre + URL de imagen."
            : "Cuenta bancaria / Método de pago: guarda solo un valor."}
        </p>
      </div>

      <AplicacionesTabs value={listKey} onChange={setListKey} />

      <div
        className="
          overflow-x-auto
          rounded-3xl
          bg-white/55 backdrop-blur-xl
          border border-slate-200/60
          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
        "
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="text-xs text-slate-500">
            Lista actual: <b>{listKey}</b> · Items: <b>{items.length}</b>
          </div>

          {/* Inputs */}
          {isProductos ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"
                placeholder="Nombre del producto…"
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-[2] rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"
                placeholder="URL de imagen…"
              />
              <button
                onClick={add}
                disabled={loading}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Agregar
              </button>
            </div>
          ) : (
            // ✅ SOLO 1 input
            <div className="flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"
                placeholder="Agregar valor…"
              />
              <button
                onClick={add}
                disabled={loading}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Agregar
              </button>
            </div>
          )}
        </div>

        <AplicacionesList
          items={items}
          loading={loading}
          listKey={listKey}
          onRemove={remove}
          onEdit={editItem}
        />
      </div>
    </div>
  );
}
