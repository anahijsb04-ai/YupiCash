import { redirect } from "next/navigation";
import { getSession, requireRole } from "@/lib/checkSession";
import AsesorSidebar from "@/app/asesor/dashboard/components/AsesorSidebar";

export default async function AsesorProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/asesor");
  if (!requireRole(session, ["asesor"])) redirect("/403");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100 text-slate-900">
      <AsesorSidebar />

      <main
        className="
          min-h-screen
          py-8 sm:py-10
          px-4 sm:px-6
          transition-[padding] duration-300 ease-in-out
        "
        style={{
          /*
            Sidebar abierta (280px):
              clamp -> 0px  → overlay
            Sidebar cerrada (88px):
              clamp -> 88px → mini barra
            + 16px visual de separación (padding interno)
          */
          paddingLeft:
            "calc(clamp(0px, calc(88px - (var(--sidebar-w) - 88px)), 88px) + 16px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
