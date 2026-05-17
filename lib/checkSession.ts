// lib/checkSession.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type Session = { username?: string; role?: string; [k: string]: any } | null;

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as Record<string, any>;

    // normalize: some tokens might use 'rol' or 'role'
    const roleFromToken = decoded.role ?? decoded.rol ?? null;

    const session: Session = {
      ...decoded,
      role: typeof roleFromToken === "string" ? roleFromToken.trim() : roleFromToken,
    };

    return session;
  } catch (err) {
    // token inválido/expirado
    return null;
  }
}

/**
 * requireRole(session, roles)
 * - session: el objeto devuelto por getSession()
 * - roles: array de roles permitidos, por ejemplo ['admin','asesor']
 *
 * Normaliza mayúsculas/minúsculas y espacios.
 */
export function requireRole(session: Session, roles: string[] = []): boolean {
  if (!session) return false;
  const role = (session.role as string) ?? "";
  const normalized = role.toString().trim().toLowerCase();
  return roles.some((r) => r.toString().trim().toLowerCase() === normalized);
}
