"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      className="
        h-screen
        overflow-hidden
        relative
        flex
        items-center
        justify-center
        bg-[#08111f]
      "
    >
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
      <div className="absolute inset-0 bg-[#08111f]/65 backdrop-blur-[2px]" />

      {/* GLOW TOP */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-cyan-400/20 blur-3xl rounded-full" />

      {/* GLOW BOTTOM */}
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-blue-500/20 blur-3xl rounded-full" />

      {/* CONTENIDO */}
      <section className="relative z-10 w-full max-w-[1250px] px-6 lg:px-10">
        {/* TITULO */}
        <div className="text-center mb-14">
          <p className="text-cyan-300 tracking-[0.35em] text-sm uppercase">
            Welcome
          </p>

          <h1 className="mt-4 text-white text-5xl lg:text-7xl font-bold tracking-wide">
            YopiCash
          </h1>

          <p className="mt-6 text-white/65 text-base lg:text-lg max-w-[620px] mx-auto leading-7">
            Plataforma moderna de acceso administrativo y gestión de asesores.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7">
          {/* ADMIN */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-white/15
              bg-white/10
              backdrop-blur-2xl
              p-8
              min-h-[360px]
              flex
              flex-col
              justify-between
              shadow-[0_25px_80px_rgba(0,0,0,0.55)]
            "
          >
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-blue-500/20 blur-3xl rounded-full" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-white/15 flex items-center justify-center text-3xl">
                👑
              </div>

              <h2 className="mt-8 text-white text-3xl font-bold tracking-wide">
                Admin
              </h2>

              <p className="mt-5 text-white/70 leading-7 text-[15px]">
                Acceso completo al sistema, paneles de control y configuración.
              </p>
            </div>

            <Link
              href="/admin"
              className="
                relative
                mt-10
                h-[56px]
                rounded-2xl
                bg-gradient-to-r
                from-blue-600
                to-cyan-400
                flex
                items-center
                justify-center
                text-white
                text-lg
                font-semibold
                shadow-lg
                hover:scale-[1.02]
                transition
              "
            >
              Ingresar
            </Link>
          </div>

          {/* ASESOR */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-white/15
              bg-white/15
              backdrop-blur-2xl
              p-8
              min-h-[360px]
              flex
              flex-col
              justify-between
              shadow-[0_25px_80px_rgba(0,0,0,0.55)]
            "
          >
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-cyan-400/20 blur-3xl rounded-full" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-400/20 border border-white/15 flex items-center justify-center text-3xl">
                💼
              </div>

              <h2 className="mt-8 text-white text-3xl font-bold tracking-wide">
                Asesor
              </h2>

              <p className="mt-5 text-white/70 leading-7 text-[15px]">
                Gestión rápida de clientes y operaciones del sistema.
              </p>
            </div>

            <Link
              href="/asesor"
              className="
                relative
                mt-10
                h-[56px]
                rounded-2xl
                bg-white
                flex
                items-center
                justify-center
                text-[#08111f]
                text-lg
                font-semibold
                shadow-lg
                hover:bg-cyan-100
                hover:scale-[1.02]
                transition
              "
            >
              Entrar
            </Link>
          </div>

          {/* DESCARGAR APP */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-white/15
              bg-white/10
              backdrop-blur-2xl
              p-8
              min-h-[360px]
              flex
              flex-col
              justify-between
              shadow-[0_25px_80px_rgba(0,0,0,0.55)]
            "
          >
            <div className="absolute -top-20 left-[-40px] w-56 h-56 bg-emerald-400/20 blur-3xl rounded-full" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-400/20 border border-white/15 flex items-center justify-center text-3xl">
                📱
              </div>

              <h2 className="mt-8 text-white text-3xl font-bold tracking-wide">
                Aplicativo
              </h2>

              <p className="mt-5 text-white/70 leading-7 text-[15px]">
                Descarga la aplicación oficial para clientes y asesores.
              </p>
            </div>

            <a
              href="https://collection-yupicash.vercel.app"
              download
              className="
                relative
                mt-10
                h-[56px]
                rounded-2xl
                bg-gradient-to-r
                from-emerald-500
                to-green-400
                flex
                items-center
                justify-center
                text-white
                text-lg
                font-semibold
                shadow-lg
                hover:scale-[1.02]
                transition
              "
            >
              Descargar
            </a>
          </div>

          {/* LANDING */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-white/15
              bg-white/15
              backdrop-blur-2xl
              p-8
              min-h-[360px]
              flex
              flex-col
              justify-between
              shadow-[0_25px_80px_rgba(0,0,0,0.55)]
            "
          >
            <div className="absolute -bottom-20 right-[-40px] w-56 h-56 bg-purple-400/20 blur-3xl rounded-full" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-purple-400/20 border border-white/15 flex items-center justify-center text-3xl">
                🌐
              </div>

              <h2 className="mt-8 text-white text-3xl font-bold tracking-wide">
                Landing
              </h2>

              <p className="mt-5 text-white/70 leading-7 text-[15px]">
                Visualiza la landing pública e información del sistema.
              </p>
            </div>

            <Link
              href="https://yupicash.vercel.app"
              className="
                relative
                mt-10
                h-[56px]
                rounded-2xl
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-400
                flex
                items-center
                justify-center
                text-white
                text-lg
                font-semibold
                shadow-lg
                hover:scale-[1.02]
                transition
              "
            >
              Abrir
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}