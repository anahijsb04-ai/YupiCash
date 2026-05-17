"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.trim().length > 0 && !loading,
    [username, password, loading]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Error desconocido");
        setLoading(false);
        return;
      }

      router.push("/gestion");
    } catch {
      setError("No se pudo conectar con el servidor");
      setLoading(false);
    }
  }

  return (
    <main
      className={`${inter.variable} min-h-screen flex items-center justify-center bg-[#e0ccb1] px-4`}
    >
      <section
        className="relative w-[980px] max-w-[96vw] h-[560px] rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.75)]"
        style={{
          backgroundImage: "url(/fondo.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* overlay leve para legibilidad */}
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 h-full">
          {/* IZQUIERDA: ADMIN */}
          <div className="relative flex items-center justify-center px-10 md:px-12">
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative w-full max-w-md text-white">
              <h1 className="font-[var(--font-inter)] font-semibold tracking-wide text-[34px]">
                Administrador
              </h1>

              <form onSubmit={handleSubmit} className="mt-12 space-y-10">
                {error && (
                  <div className="rounded-xl bg-red-500/20 border border-red-200/20 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {/* Usuario */}
                <div>
                  <label className="block text-white/90 text-[16px] mb-2">
                    Usuario
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    className="
                      w-full
                      bg-transparent
                      border-0
                      border-b
                      border-white/90
                      rounded-none
                      px-0
                      py-2
                      text-white
                      text-[16px]
                      outline-none
                      focus:border-white
                      focus:ring-0
                    "
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-white/90 text-[16px] mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="
                      w-full
                      bg-transparent
                      border-0
                      border-b
                      border-white/90
                      rounded-none
                      px-0
                      py-2
                      text-white
                      text-[16px]
                      outline-none
                      focus:border-white
                      focus:ring-0
                    "
                  />
                </div>

                <button
                  disabled={!canSubmit}
                  className="
                    w-full mt-2
                    rounded-2xl
                    py-4
                    text-[18px]
                    font-medium
                    text-white
                    bg-white/35
                    hover:bg-white/45
                    active:scale-[0.99]
                    transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {loading ? "Entrando..." : "Ingresar"}
                </button>

                <p className="text-xs text-white/70">Acceso administrativo</p>
              </form>
            </div>
          </div>

          {/* DERECHA: ASESOR (OPCIÓN 2) */}
          <div className="relative flex items-center justify-center px-10 md:px-12">
            <div className="absolute inset-0 bg-white/25" />

            <div className="relative w-full max-w-md text-center text-white">
              <p className="text-[34px] font-semibold tracking-wide">
                ¿Eres asesor?
              </p>

              <p className="mt-10 text-[22px] text-white/90">Ingresa aquí</p>

              <Link
                href="/asesor"
                className="
                  inline-flex items-center justify-center
                  w-full mt-12
                  rounded-2xl
                  py-4
                  text-[18px]
                  font-medium
                  text-white
                  bg-black/35
                  hover:bg-black/45
                  active:scale-[0.99]
                  transition
                "
              >
                Presiona aquí
              </Link>

              <p className="mt-4 text-xs text-white/80">Acceso para asesores</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
