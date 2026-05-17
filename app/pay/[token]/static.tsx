"use client";

import { useEffect, useMemo, useState } from "react";
import Plantilla1StaticImport from "./plantillas/Plantilla1Static";
import Plantilla2StaticImport from "./plantillas/Plantilla2Static";
import Plantilla3StaticImport from "./plantillas/Plantilla3Static";
import Plantilla4StaticImport from "./plantillas/Plantilla4Static";
import Plantilla5StaticImport from "./plantillas/Plantilla5Static";
import Plantilla6StaticImport from "./plantillas/Plantilla6Static";
import Plantilla7StaticImport from "./plantillas/Plantilla7Static";
import Plantilla8StaticImport from "./plantillas/Plantilla8Static";
import Plantilla9StaticImport from "./plantillas/Plantilla9Static";

type StaticTemplateProps = {
  data: any;
  origin: string;
  copied: boolean;
  onCopy: (text: string) => Promise<void>;
};

const Plantilla1Static =
  Plantilla1StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla2Static =
  Plantilla2StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla3Static =
  Plantilla3StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla4Static =
  Plantilla4StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla5Static =
  Plantilla5StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla6Static =
  Plantilla6StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla7Static =
  Plantilla7StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla8Static =
  Plantilla8StaticImport as React.ComponentType<StaticTemplateProps>;
const Plantilla9Static =
  Plantilla9StaticImport as React.ComponentType<StaticTemplateProps>;

export default function PagoFastCashStatic({
  token,
  tipoPlantilla,
}: {
  token: string;
  tipoPlantilla?: string | number;
}) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setError("No se pudo copiar");
    }
  }

  useEffect(() => {
    if (!token) {
      setError("Token no recibido");
      return;
    }

    let cancel = false;

    (async () => {
      try {
        setError(null);

        const res = await fetch(`/api/plantillas-temporales-3/${token}`, {
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);
        const payload = json?.data ?? json;

        if (!cancel) {
          setData(payload);
        }
      } catch {
        if (!cancel) {
          setError("Error cargando datos");
        }
      }
    })();

    return () => {
      cancel = true;
    };
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-xl">
          Cargando...
        </div>
      </div>
    );
  }

  const props: StaticTemplateProps = {
    data,
    origin,
    copied,
    onCopy: copyToClipboard,
  };

  const plantillaFinal = String(
    tipoPlantilla ?? data?.tipo_plantilla ?? "1"
  ).trim();

  console.log("tipoPlantilla prop:", tipoPlantilla);
  console.log("data.tipo_plantilla:", data?.tipo_plantilla);
  console.log("plantillaFinal:", plantillaFinal);

  switch (plantillaFinal) {
    case "2":
      return <Plantilla2Static {...props} />;
    case "3":
      return <Plantilla3Static {...props} />;
    case "4":
      return <Plantilla4Static {...props} />;
    case "5":
      return <Plantilla5Static {...props} />;
    case "6":
      return <Plantilla6Static {...props} />;
    case "7":
      return <Plantilla7Static {...props} />;
    case "8":
      return <Plantilla8Static {...props} />;
    case "9":
      return <Plantilla9Static {...props} />;
    case "1":
    default:
      return <Plantilla1Static {...props} />;
  }
}