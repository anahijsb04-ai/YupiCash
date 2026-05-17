"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function NewTemplateForm({ onCreated }: { onCreated?: () => void }) {
  const [cuentaBancaria, setCuentaBancaria] = useState("");
  const [subproducto, setSubproducto] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isValidHttpUrl = useMemo(() => {
    const v = imagenUrl.trim();
    if (!v) return false;
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, [imagenUrl]);

  // Preview: usamos la misma URL si es válida
  useEffect(() => {
    if (isValidHttpUrl) {
      setPreviewUrl(imagenUrl.trim());
    } else {
      setPreviewUrl(null);
    }
  }, [imagenUrl, isValidHttpUrl]);

  function clearForm() {
    setCuentaBancaria("");
    setSubproducto("");
    setImagenUrl("");
    setMessage(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!cuentaBancaria.trim() || !subproducto.trim()) {
      setMessage("Completa número de cuenta y subproducto.");
      return;
    }

    if (!isValidHttpUrl) {
      setMessage("Ingresa una URL válida (http:// o https://).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/plantillas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuenta_bancaria: cuentaBancaria.trim(),
          subproducto: subproducto.trim(),
          url: imagenUrl.trim(), // ✅ URL externa
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Error al crear plantilla");
        return;
      }

      setMessage("Plantilla creada ✔");
      clearForm();
      onCreated?.();
    } catch (err) {
      console.error(err);
      setMessage("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        rounded-3xl
        bg-white/55 backdrop-blur-xl
        border border-slate-200/60
        shadow-[0_8px_30px_rgba(15,23,42,0.06)]
        p-5 sm:p-6
        space-y-4
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Nueva plantilla</h3>
          <p className="text-sm text-slate-500 mt-1">
            Completa los datos y pega la URL de la imagen.
          </p>
        </div>

        <span
          className="
            hidden sm:inline-flex
            text-xs text-slate-600
            px-3 py-1.5 rounded-2xl
            bg-white/60 border border-slate-200/60
            shadow-sm
          "
        >
          Plantillas
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Cuenta bancaria</label>
          <input
            value={cuentaBancaria}
            onChange={(e) => setCuentaBancaria(e.target.value)}
            name="cuenta_bancaria"
            placeholder="Número de cuenta"
            className="
              w-full
              rounded-2xl
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
          <label className="text-xs font-medium text-slate-600">Subproducto</label>
          <input
            value={subproducto}
            onChange={(e) => setSubproducto(e.target.value)}
            name="subproducto"
            placeholder="Subproducto"
            className="
              w-full
              rounded-2xl
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
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">URL de la imagen</label>
        <input
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          name="url"
          placeholder="https://..."
          className="
            w-full
            rounded-2xl
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

        {imagenUrl.trim() && !isValidHttpUrl && (
          <p className="text-xs text-red-600">
            URL inválida. Debe empezar con http:// o https://
          </p>
        )}

        <p className="text-xs text-slate-500">
          Pega un link directo a imagen (JPG/PNG). Ej: Cloudinary, S3, etc.
        </p>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div
          className="
            rounded-3xl
            bg-white/45
            border border-slate-200/60
            p-3
            shadow-sm
          "
        >
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full max-w-md h-48 object-cover rounded-2xl border border-slate-200/60"
            onError={() => setMessage("No se pudo cargar la imagen. Verifica que la URL sea directa a una imagen.")}
          />
        </div>
      )}

      {/* Actions */}
      <div className="text-black flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="
            px-4 py-3
            rounded-2xl
            bg-gradient-to-r from-sky-700 to-slate-800
            text-white font-semibold
            shadow-sm
            hover:from-sky-800 hover:to-slate-900
            transition
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? "Creando..." : "Crear plantilla"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          className="
            px-4 py-3
            rounded-2xl
            bg-white/60
            border border-slate-200/70
            text-slate-700 font-medium
            hover:bg-white
            transition
          "
        >
          Limpiar
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className="
            rounded-2xl
            bg-white/60
            border border-slate-200/60
            px-4 py-3
            text-sm
            text-slate-700
          "
        >
          {message}
        </div>
      )}
    </form>
  );
}
