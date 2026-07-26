import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { ServicePageHero } from "@/components/sections/ServicePageHero";
import { ServiceProjectGrid } from "@/components/sections/ServiceProjectGrid";
import { serviceDetails, type ServiceSlug } from "@/lib/services";

type Params = { slug: string };

/**
 * Páginas internas de servicios: `/services/3d-modeling`, `/services/2d-motion`,
 * `/services/vfx`, etc.
 *
 * Layout (matchea el frame "Interna" del Figma):
 * 1. Header sticky.
 * 2. Hero — imagen de fondo + card centrada con título + descripción + CTA.
 * 3. Grid asimétrico 2×2 de proyectos seleccionados.
 * 4. CTA final "Have an idea?" (reuso del componente de la home).
 *
 * Server Component. `generateStaticParams` pre-genera todos los slugs al
 * build → SEO máximo + cero latency en producción. Cuando migremos a Sanity
 * va a quedar igual, solo cambia de dónde se leen los datos.
 */
export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = serviceDetails[slug as ServiceSlug];
  if (!service) notFound();

  // El aspect ratio de cada proyecto está hardcodeado en `serviceDetails`
  // (ver comentario allá). Ya no scrapeamos YouTube en runtime.
  const projects = service.projects;

  // Video del hero: si el servicio define `heroVideoId` (pieza dedicada,
  // separada del grid) se usa esa; si no, cae al primer proyecto.
  const heroVideoId =
    "heroVideoId" in service ? service.heroVideoId : service.projects[0].videoId;

  // Si el servicio define un `customLayout`, lo resolvemos a `rows` con los
  // proyectos completos (con aspect detectado). Si no, el grid auto-
  // distribuye en columnas según aspect ratio.
  const projectMap = new Map(projects.map((p) => [p.videoId, p]));
  const customLayout =
    "customLayout" in service ? service.customLayout : undefined;
  const rows = customLayout
    ? customLayout.map((rowIds) =>
        rowIds
          .map((id) => projectMap.get(id))
          .filter((p): p is (typeof projects)[number] => !!p),
      )
    : undefined;

  return (
    <>
      <Header />
      <main className="flex-1">
        <ServicePageHero
          name={service.name}
          description={service.description}
          // `heroVideoId` dedicado si existe (ej: 2D Motion); si no, el primer
          // proyecto — mismo que se ve en el showcase de la home.
          heroVideoId={heroVideoId}
        />
        <ServiceProjectGrid projects={projects} rows={rows} />
        <ContactCTA />
      </main>
    </>
  );
}

export function generateStaticParams(): Params[] {
  return Object.keys(serviceDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceDetails[slug as ServiceSlug];
  if (!service) return {};

  return {
    // Solo el nombre: el template del root layout agrega "— Banda Studio".
    title: service.name,
    description: service.description,
    alternates: { canonical: `/services/${slug}` },
  };
}
