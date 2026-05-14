/**
 * Strip de logos de clientes para el /about. Una sola imagen con fondo
 * off-white bakeado — el wrapper toma el mismo color para que el borde
 * de la imagen se funda con la sección y queden rounded corners limpias.
 *
 * El color hex del bg matchea el fondo de `/public/about/clients.png`. Si
 * la imagen cambia, ajustar `bg-[#DADADA]` al nuevo tono (sample con
 * eyedropper sobre el archivo final).
 *
 * Estado actual: placeholder visible hasta que se suba la imagen. Cuando
 * esté lista, descomentar el bloque `<Image />` y borrar el placeholder.
 *
 * Server Component.
 */
export function ClientsStrip() {
  return (
    <section
      aria-label="Brands we've worked with"
      className="bg-surface-primary px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="overflow-hidden rounded-section bg-[#DADADA]">
          {/*
            PLACEHOLDER — reemplazar por <Image /> apenas se suba la imagen
            a /public/about/clients.png:

            <Image
              src="/about/clients.png"
              alt="Brands we've worked with: Cabify, Cartoon Network, Coca-Cola, DoorDash, Revolut, hims & hers"
              width={1440}
              height={200}
              sizes="(min-width: 1440px) 1440px, 100vw"
              className="h-auto w-full"
            />
          */}
          <div
            aria-hidden="true"
            className="flex h-[140px] items-center justify-center text-caption font-medium text-ink-on-chip/40 sm:h-[180px] lg:h-[220px]"
          >
            clients.png goes here
          </div>
        </div>
      </div>
    </section>
  );
}
