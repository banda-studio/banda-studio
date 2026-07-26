import { ImageResponse } from "next/og";

import { serviceDetails, type ServiceSlug } from "@/lib/services";

/**
 * OG image por servicio (1200×630). Igual estética que la del sitio
 * (`app/opengraph-image.tsx`) pero con el nombre del servicio como titular,
 * así al compartir `/services/vfx` el preview dice "VFX" en vez del genérico.
 *
 * `generateStaticParams` la pre-genera para cada slug con contenido, alineado
 * con la `page.tsx` del mismo segmento.
 */
export const alt = "Banda Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return Object.keys(serviceDetails).map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceDetails[slug as ServiceSlug];
  const name = service?.name ?? "Banda Studio";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          backgroundColor: "#0A0A0A",
          backgroundImage:
            "radial-gradient(900px 500px at 15% 0%, rgba(112,190,250,0.22), transparent 60%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#70BEFA",
            fontWeight: 600,
          }}
        >
          Banda Studio
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 128,
            lineHeight: 1.02,
            fontWeight: 700,
          }}
        >
          {name}
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Digital Creative Studio
        </div>
      </div>
    ),
    size,
  );
}
