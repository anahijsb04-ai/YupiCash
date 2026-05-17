import { cookies } from "next/headers";

const ADMIN_PASSWORD = "1234";

// ⚠️ DEBE SER async
export async function setAuth() {
  const cookieStore = await cookies();

  cookieStore.set("auth", "ok", {
    httpOnly: true,
    maxAge: 60 * 60, // 1 hora
    path: "/",
  });
}

export async function isLogged() {
  const cookieStore = await cookies();
  return cookieStore.get("auth")?.value === "ok";
}
