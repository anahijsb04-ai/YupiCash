"use client";

import { useMemo, useState } from "react";
import type { AnyItem, ListKey } from "../types";

type ProductItem = { id: number; name?: string | null; url?: string | null };

function isProductos(listKey: ListKey) {
  return listKey === "producto_mexico" || listKey === "producto_colombia";
}

function isLikelyImageUrl(url: string) {
  const u = String(url || "").trim().toLowerCase();
  if (!u) return false;
  if (u.startsWith("data:image/")) return true;
  return (
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(u) ||
    u.includes("cdn") ||
    u.includes("image")
  );
}

export default function AplicacionesList({
  items,
  loading,
  listKey,
  onRemove,
  onEdit,
}: {
  items: AnyItem[];
  loading: boolean;
  listKey: ListKey;
  onRemove: (id: number) => void;
  onEdit: (id: number, payload: any) => Promise<void>;
}) {
  const canEditProduct = useMemo(() => isProductos(listKey), [listKey]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  function startEditProduct(it: ProductItem) {
    setEditingId(it.id);
    setDraftName(it.name ?? "");
    setDraftUrl(it.url ?? "");
  }

  function cancel() {
    setEditingId(null);
    setDraftName("");
    setDraftUrl("");
  }

  async function save(id: number) {
    await onEdit(id, { name: draftName.trim(), url: draftUrl.trim() });
    cancel();
  }

  return (
    <div className="divide-y divide-slate-200/60">
      {items.map((it: any) => {
        const editing = editingId === it.id;

        if (canEditProduct) {
          const pit = it as ProductItem;
          const url = String(pit.url ?? "");
          const preview = isLikelyImageUrl(url);

          return (
            <div key={pit.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl border border-slate-200/70 bg-white/70 overflow-hidden shrink-0 flex items-center justify-center">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400">IMG</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {!editing ? (
                    <>
                      <div className="text-sm font-medium text-slate-900 break-words">
                        {pit.name}
                      </div>
                      <div className="text-xs text-slate-500 break-all">{url}</div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"
                        placeholder="Nombre…"
                        autoFocus
                      />
                      <input
                        value={draftUrl}
                        onChange={(e) => setDraftUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") save(pit.id);
                          if (e.key === "Escape") cancel();
                        }}
                        className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"
                        placeholder="URL de imagen…"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!editing ? (
                  <button
                    onClick={() => startEditProduct(pit)}
                    disabled={loading}
                    className="text-sm text-slate-700 hover:underline"
                  >
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => save(pit.id)}
                      disabled={loading}
                      className="text-sm text-emerald-700 hover:underline"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancel}
                      disabled={loading}
                      className="text-sm text-slate-500 hover:underline"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                <button
                  onClick={() => onRemove(pit.id)}
                  disabled={loading}
                  className="text-sm text-rose-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        }

        return (
          <div key={it.id} className="px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-800 break-words">{it.value}</div>
            <button
              onClick={() => onRemove(it.id)}
              disabled={loading}
              className="text-sm text-rose-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        );
      })}

      {!loading && items.length === 0 && (
        <div className="px-4 py-10 text-sm text-slate-500">Sin items aún.</div>
      )}
    </div>
  );
}
