import { redirect } from "next/navigation";
import { getSession, requireRole } from "@/lib/checkSession";
import Sidebar from "./components/Sidebar"; // ajusta el path

export default async function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // 🔐 Auth
  if (!session) {
    redirect("/admin?redirectTo=/gestion");
  }

  if (!requireRole(session, ["admin"])) {
    redirect("/403");
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Sidebar fija */}


      {/* Contenido principal */}
      <main
        className="
          min-h-screen
          transition-all duration-300
        "
        style={{
          paddingLeft: "var(--sidebar-w)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
