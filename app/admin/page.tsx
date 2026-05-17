"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

type Phase = "login" | "otp";

export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [phase, setPhase] = useState<Phase>("login");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const router = useRouter();

  const canSubmitLogin = useMemo(
    () =>
      username.trim().length > 0 &&
      password.trim().length > 0 &&
      !loading,
    [username, password, loading]
  );

  const canSubmitOtp = useMemo(() => {
    const clean = otp.replace(/\D/g, "");
    return clean.length === 6 && !loading;
  }, [otp, loading]);

  async function handleSubmitLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!canSubmitLogin) return;

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: "include",
      });

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setError(
          data?.error ||
            "Error desconocido"
        );
        setLoading(false);
        return;
      }

      if (!data?.requiresOtp) {
        router.push("/gestion");
        return;
      }

      const loginTimeISO =
        new Date().toISOString();

      const sendRes = await fetch(
        "/api/otp/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username,
            loginTimeISO,
          }),
          credentials: "include",
        }
      );

      const sendData =
        await sendRes
          .json()
          .catch(() => ({}));

      if (!sendRes.ok) {
        setError(
          sendData?.error ||
            "No se pudo enviar el OTP"
        );
        setLoading(false);
        return;
      }

      setPhase("otp");

      setInfo(
        "Se envió un código OTP. Revisa tu correo."
      );

      setLoading(false);
    } catch {
      setError(
        "No se pudo conectar con el servidor"
      );

      setLoading(false);
    }
  }

  async function handleSubmitOtp(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!canSubmitOtp) return;

    setLoading(true);
    setError("");
    setInfo("");

    const cleanOtp = otp
      .replace(/\D/g, "")
      .slice(0, 6);

    try {
      const res = await fetch(
        "/api/otp/verify",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username,
            otp: cleanOtp,
          }),
          credentials: "include",
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setError(
          data?.error ||
            "OTP inválido"
        );

        setLoading(false);
        return;
      }

      router.push("/gestion");
    } catch {
      setError(
        "No se pudo conectar con el servidor"
      );

      setLoading(false);
    }
  }

  function backToLogin() {
    setPhase("login");
    setOtp("");
    setError("");
    setInfo("");
    setLoading(false);
  }

  return (
    <main
      className={`${inter.variable} h-screen overflow-hidden relative flex flex-col bg-[#08111f]`}
    >
      {/* FONDO */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(/fondo.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
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
          <button
            onClick={backToLogin}
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
            Admin
          </button>

          <Link
            href="/asesor"
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
            Asesor
          </Link>
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
              Login
            </h2>

            {phase === "login" ? (
              <form
                onSubmit={
                  handleSubmitLogin
                }
                className="mt-10 space-y-7"
              >
                {error && (
                  <div className="rounded-xl bg-red-500/20 border border-red-300/20 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {info && (
                  <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm">
                    {info}
                  </div>
                )}

                {/* USER */}
                <div>
                  <label className="block text-white/85 text-sm mb-3">
                    Usuario
                  </label>

                  <input
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
                  />
                </div>

                <button
                  disabled={
                    !canSubmitLogin
                  }
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
                    disabled:opacity-50
                  "
                >
                  {loading
                    ? "Entrando..."
                    : "Ingresar"}
                </button>

                <p className="text-center text-sm text-white/70">
                  Acceso administrativo
                </p>
              </form>
            ) : (
              <form
                onSubmit={
                  handleSubmitOtp
                }
                className="mt-10 space-y-7"
              >
                {error && (
                  <div className="rounded-xl bg-red-500/20 border border-red-300/20 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {info && (
                  <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm">
                    {info}
                  </div>
                )}

                {/* OTP */}
                <div>
                  <label className="block text-white/85 text-sm mb-3">
                    Código OTP
                  </label>

                  <input
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 6)
                      )
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="••••••"
                    className="
                      w-full
                      bg-transparent
                      border-0
                      border-b
                      border-white/55
                      py-3
                      px-0
                      text-white
                      text-center
                      tracking-[0.45em]
                      outline-none
                      focus:border-white
                      transition
                    "
                  />
                </div>

                <button
                  disabled={
                    !canSubmitOtp
                  }
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
                    disabled:opacity-50
                  "
                >
                  {loading
                    ? "Verificando..."
                    : "Verificar OTP"}
                </button>

                <button
                  type="button"
                  onClick={
                    backToLogin
                  }
                  className="
                    w-full
                    text-sm
                    text-white/70
                    hover:text-white
                    transition
                  "
                >
                  Volver
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}