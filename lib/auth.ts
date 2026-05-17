import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido");
}

/* =====================
   Password
===================== */
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/* =====================
   JWT
===================== */

// Firmar token
export function signToken<T extends object>(payload: T): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
}

// Verificar token (GENÉRICO + SIN null)
export function verifyToken<T extends object>(token: string): T {
  // jwt.verify lanza error si es inválido o expirado
  const decoded = jwt.verify(token, JWT_SECRET);

  // jwt puede devolver string | JwtPayload → forzamos objeto
  if (!decoded || typeof decoded !== "object") {
    throw new Error("Token inválido");
  }

  return decoded as T;
}
