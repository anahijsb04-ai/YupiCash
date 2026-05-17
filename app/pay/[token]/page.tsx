import PagoFastCashStatic from "./static";
import { redirect } from "next/navigation";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const r = await pool.query(
    "SELECT pagado FROM plantillas_temporales WHERE token = $1 LIMIT 1",
    [token]
  );

  console.log("VALOR DB:", r.rows[0]?.pagado); // 🔥 DEBUG

  if (r.rows[0]?.pagado === true) {
    redirect("/gracias");
  }

  return <PagoFastCashStatic token={token} />;
}