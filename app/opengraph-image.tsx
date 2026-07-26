import { ImageResponse } from "next/og";

/**
 * OG image dinámica del sitio (1200×630). Next la detecta por convención de
 * nombre (`opengraph-image`) y la inyecta como `og:image` + `twitter:image`
 * en todas las páginas que no definan la suya propia. Es la imagen que se ve
 * al compartir un link de banda.studio en WhatsApp, Instagram, X, Slack, etc.
 *
 * Se genera con Satori (next/og) usando la fuente default del runtime — no
 * carga Mona Sans para mantenerlo simple y sin fetch de fuentes en build.
 * Paleta alineada a los tokens: surface #0A0A0A, accent #70BEFA.
 */
export const alt = "Banda Studio — Digital Creative Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          // Glow celeste sutil arriba a la izquierda, como el hero.
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
            marginTop: 28,
            fontSize: 104,
            lineHeight: 1.05,
            fontWeight: 700,
            maxWidth: 900,
          }}
        >
          Digital Creative Studio
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 820,
          }}
        >
          We bring technical precision to your creative vision.
        </div>
      </div>
    ),
    size,
  );
}
