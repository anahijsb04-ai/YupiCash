"use client";

import {
  useState,
  useEffect,
} from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

export default function AsesorLoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    try {
      const res = await fetch(
        "/api/auth/login-asesor",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message ||
            "Error de login"
        );
        return;
      }

      localStorage.setItem(
        "username",
        username
      );

      router.push(
        "/asesor/collection/casos"
      );
    } catch {
      setError(
        "Error de conexión. Intenta nuevamente."
      );
    }
  };

  return (
    <main className="h-screen overflow-hidden relative flex flex-col bg-[#08111f]">
      {/* FONDO */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(/fondo.jpeg)",
          backgroundSize: "cover",
          backgroundPosition:
            "center",
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-[#08111f]/55" />

      {/* NAVBAR */}
      <header className="relative z-20 flex items-center justify-between px-8 lg:px-16 py-6">
        <h1 className="text-white text-3xl lg:text-4xl font-bold tracking-wide">
          YopiCash
        </h1>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="
              px-6
              py-2.5
              rounded-xl
              border
              border-white/30
              bg-black/25
              text-white
              backdrop-blur-md
              hover:bg-black/40
              transition
            "
          >
            Admin
          </Link>

          <button
            className="
              px-6
              py-2.5
              rounded-xl
              border
              border-white/30
              bg-white/15
              text-white
              backdrop-blur-md
              hover:bg-white/25
              transition
            "
          >
            Asesor
          </button>
        </div>
      </header>

      {/* LOGIN */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10">
        <div
          className="
            w-full
            max-w-[420px]
            rounded-[34px]
            border
            border-white/35
            bg-white/20
            backdrop-blur-2xl
            shadow-[0_25px_90px_rgba(0,0,0,0.65)]
            px-8
            py-8
            text-white
            relative
          "
        >
          {/* GLOW */}
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-cyan-300/20 blur-3xl rounded-full" />

          <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-blue-500/20 blur-3xl rounded-full" />

          <div className="relative">
            <h2 className="text-center text-4xl font-bold tracking-wide">
              Asesor
            </h2>

            {error && (
              <div className="mt-8 rounded-xl bg-red-500/20 border border-red-300/20 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="mt-10 space-y-7"
            >
              {/* USER */}
              <div>
                <label className="block text-white/85 text-sm mb-3">
                  Usuario
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  autoComplete="off"
                  className="
                    w-full
                    bg-transparent
                    border-0
                    border-b
                    border-white/55
                    py-3
                    px-0
                    text-white
                    outline-none
                    focus:border-white
                    transition
                  "
                  required
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-white/85 text-sm mb-3">
                  Contraseña
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  className="
                    w-full
                    bg-transparent
                    border-0
                    border-b
                    border-white/55
                    py-3
                    px-0
                    text-white
                    outline-none
                    focus:border-white
                    transition
                  "
                  required
                />
              </div>

              <button
                type="submit"
                className="
                  w-full
                  mt-2
                  rounded-2xl
                  py-4
                  text-lg
                  font-semibold
                  text-white
                  bg-[#07192d]
                  hover:bg-[#0d2745]
                  border
                  border-white/15
                  transition
                "
              >
                Ingresar
              </button>

              <p className="text-center text-sm text-white/70">
                Acceso para asesores
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}