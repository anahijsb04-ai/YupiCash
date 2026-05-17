import { redirect } from "next/navigation";
import { getSession, requireRole } from "@/lib/checkSession";

export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const isLoginPage = (typeof window !== "undefined"
    ? window.location.pathname === "/asesor"
    : false);

  // No proteger la pantalla de login
  if (isLoginPage) return <>{children}</>;

  // Si no hay sesión, mandar a login de asesor
  if (!session) redirect("/asesor");

  // Validar rol
  if (!requireRole(session, ["asesor"])) redirect("/");

  return <>{children}</>;
}
