"use client";

import type { ListKey } from "../types";
import { LISTS } from "../types";

export default function AplicacionesTabs({
  value,
  onChange,
}: {
  value: ListKey;
  onChange: (k: ListKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {LISTS.map((l) => (
        <button
          key={l.key}
          onClick={() => onChange(l.key)}
          className={[
            "px-3 py-2 rounded-xl border text-sm transition",
            value === l.key
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white/70 border-slate-200/70 hover:bg-white",
          ].join(" ")}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
