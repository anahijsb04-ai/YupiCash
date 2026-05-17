"use client";

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";

/* =====================
   TIPOS
===================== */
type Lista = {
  id: number;
  nombre: string;
  tipo: string;
};

type Item = {
  id: number;
  label: string;
  value?: string;
  url_imagen?: string | null;
  origen?: string | null;
};

export default function BaseDatosPage() {
  const [listas, setListas] = useState<Lista[]>([]);
  const [listaActiva, setListaActiva] = useState<Lista | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [nombreLista, setNombreLista] = useState("");
  const [tipoLista, setTipoLista] = useState("subproducto");
  const [nuevoItem, setNuevoItem] = useState("");
  const [urlImagen, setUrlImagen] = useState("");

  /* =====================
     LOADERS
  ===================== */
  async function loadListas() {
    const res = await fetch("/api/listas", { cache: "no-store" });
    setListas(await res.json());
  }

  async function loadItems(lista: Lista) {
    const qs = `?origen=${encodeURIComponent(lista.nombre)}`;
    const res = await fetch(`/api/listas/${lista.id}/items${qs}`, {
      cache: "no-store",
    });
    setItems(await res.json());
  }

  useEffect(() => {
    loadListas();
  }, []);

  /* =====================
     CREAR
  ===================== */
  async function crearLista() {
    if (!nombreLista.trim()) return;

    await fetch("/api/listas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreLista, tipo: tipoLista }),
    });

    setNombreLista("");
    loadListas();
  }

  async function crearItem() {
    if (!listaActiva || !nuevoItem.trim()) return;

    await fetch(`/api/listas/${listaActiva.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: nuevoItem,
        value: nuevoItem,
        url_imagen: listaActiva.tipo === "producto" ? urlImagen : null,
        origen: listaActiva.nombre, // ✅ AUTOMÁTICO
      }),
    });

    setNuevoItem("");
    setUrlImagen("");
    loadItems(listaActiva);
  }

  /* =====================
     BORRAR
  ===================== */
  async function borrarLista(id: number) {
    if (!confirm("¿Eliminar esta lista y sus items?")) return;

    await fetch(`/api/listas/${id}`, { method: "DELETE" });

    if (listaActiva?.id === id) {
      setListaActiva(null);
      setItems([]);
    }

    loadListas();
  }

  async function borrarItem(itemId: number) {
    if (!listaActiva) return;
    if (!confirm("¿Eliminar este item?")) return;

    await fetch(`/api/listas/${listaActiva.id}/items/${itemId}`, {
      method: "DELETE",
    });

    loadItems(listaActiva);
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen text-slate-900">
      <Sidebar />

      <main
        className="
          min-h-screen
          px-6 sm:px-10
          py-8 sm:py-10
          bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100
        "
        style={{ paddingLeft: "min(var(--sidebar-w), 88px)" }}
      >
        <h1 className="text-3xl sm:text-4xl font-semibold">
          Base de datos
        </h1>
        <p className="text-slate-500 mt-2">
          Administración de listas dinámicas
        </p>

        <div className="mt-8 border-t border-slate-200/70" />

        <section className="mt-8 rounded-3xl bg-white/60 p-6 border border-slate-200">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

            {/* NUEVA LISTA */}
            <div className="bg-white rounded-2xl p-6 border space-y-4">
              <h2 className="font-semibold text-lg">Nueva lista</h2>

              <input
                value={nombreLista}
                onChange={(e) => setNombreLista(e.target.value)}
                placeholder="Nombre de la lista"
                className="w-full px-4 py-2 border rounded-xl"
              />

              <select
                value={tipoLista}
                onChange={(e) => setTipoLista(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="liga_pago">Liga de pago</option>
                <option value="subproducto">Subproducto</option>
                <option value="metodo_pago">Método de pago</option>
                <option value="producto">Producto (imagen)</option>
              </select>

              <button
                onClick={crearLista}
                className="w-full bg-blue-600 text-white py-2 rounded-xl"
              >
                Agregar BD
              </button>
            </div>

            {/* LISTAS + ITEMS */}
            <div className="xl:col-span-3 bg-white rounded-2xl p-6 border">
              <div className="grid grid-cols-3 gap-6">

                {/* LISTAS */}
                <aside className="space-y-2">
                  {listas.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setListaActiva(l);
                        loadItems(l);
                      }}
                      className="group w-full flex justify-between items-start px-4 py-3 border rounded-xl hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-medium">{l.nombre}</div>
                        <div className="text-xs text-slate-500">{l.tipo}</div>
                      </div>

                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          borrarLista(l.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500"
                      >
                        🗑️
                      </span>
                    </button>
                  ))}
                </aside>

                {/* ITEMS */}
                <div className="col-span-2">
                  {listaActiva ? (
                    <>
                      <h3 className="font-semibold mb-4">
                        {listaActiva.nombre}
                      </h3>

                      <div className="flex gap-3 mb-4">
                        <input
                          value={nuevoItem}
                          onChange={(e) => setNuevoItem(e.target.value)}
                          placeholder="Nuevo item"
                          className="flex-1 px-4 py-2 border rounded-xl"
                        />

                        {listaActiva.tipo === "producto" && (
                          <input
                            value={urlImagen}
                            onChange={(e) => setUrlImagen(e.target.value)}
                            placeholder="URL imagen"
                            className="flex-1 px-4 py-2 border rounded-xl"
                          />
                        )}

                        <button
                          onClick={crearItem}
                          className="bg-emerald-600 text-white px-4 rounded-xl"
                        >
                          +
                        </button>
                      </div>

                      <ul className="space-y-2">
                        {items.map((i) => (
                          <li
                            key={i.id}
                            className="group flex justify-between items-center p-3 border rounded-xl"
                          >
                            <div className="flex items-center gap-4">
                              {i.url_imagen && (
                                <img
                                  src={i.url_imagen}
                                  className="w-10 h-10 rounded-lg"
                                />
                              )}
                              <span>{i.label}</span>
                            </div>

                            <span
                              onClick={() => borrarItem(i.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500"
                            >
                              🗑️
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-slate-500">
                      Selecciona una lista
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
