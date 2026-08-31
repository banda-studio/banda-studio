import Image from "next/image";

/**
 * Strip de logos de clientes. Una sola imagen con logos blancos sobre
 * transparencia (asset en `public/about/clients.avif`, generado a partir de
 * `BRANDS.avif` con los colores invertidos). Flota sobre el `bg-surface-primary`
 * de la sección, sin card ni wrapper.
 *
 * Se usa en dos lugares: en `/about` (con el padding default) y en la home,
 * justo debajo del hero (con un padding más compacto vía `className`).
 *
 * Para regenerar el asset (cambiar set de marcas / recolor):
 *   node_modules/.cache/export-clients.cjs
 *
 * Server Component.
 */
export function ClientsStrip({ className }: { className?: string }) {
  return (
    <section
      aria-label="Brands we've worked with"
      className={
        className ??
        "bg-surface-primary px-6 pt-[30px] pb-24 sm:px-10 lg:px-16 lg:pb-32"
      }
    >
      <div className="mx-auto max-w-[1440px]">
        <Image
          src="/about/clients.avif"
          alt="Brands we've worked with: Cabify, Cartoon Network, Coca-Cola, DoorDash, Revolut, hims & hers"
          width={1551}
          height={78}
          sizes="(min-width: 1440px) 1280px, 100vw"
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
