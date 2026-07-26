import { Footer } from "@/components/layout/Footer";

/**
 * Layout del grupo de rutas públicas `(site)`: home, about, contact y
 * services. Agrega el `Footer` (crédito) al pie de cada una. El Studio de
 * Sanity (`/studio`) queda fuera de este grupo, así que no lo hereda.
 *
 * El `Header` se sigue componiendo dentro de cada página (no acá) para no
 * cambiar el patrón existente del repo.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
