---
name: nextjs-sanity-stack
description: Convenciones de Next.js App Router + Sanity CMS específicas del proyecto banda-web. Usá esta skill SIEMPRE que toques código de la app, incluso si el usuario no lo pide explícitamente: cuando crees o modifiques un Server Component o Client Component; cuando escribas o ajustes una query GROQ; cuando definas, edites o uses un schema de Sanity; cuando configures el Studio embebido en /studio; cuando agregues una ruta nueva (page.tsx, layout.tsx, loading.tsx) o trabajes en /, /about, /services/[slug], /work/[slug]; cuando regeneres tipos con @sanity/typegen; cuando tomes decisiones de fetching, caching, ISR, o revalidación. También activá si el usuario menciona "Server Component", "Client Component", "use client", "GROQ", "Sanity", "schema", "Studio", "revalidación", "ISR", "fetch", "client", "queries", o el alias `@/`. Es el comportamiento default cada vez que se escribe código TS/TSX en este repo.
---

# banda-web — Next.js + Sanity stack

> Convenciones específicas del proyecto. La fuente de verdad operativa es esta skill; CLAUDE.md (secciones 2, 4, 6, 7) tiene el resumen de alto nivel.

> **⚠️ Versión de Next.js: 16.x.** Hay APIs y convenciones que cambiaron respecto de Next 13/14. **Antes de usar features de caching, route handlers, middleware, params dinámicos, o cualquier API que no recuerdes con 100% de certeza, leé las docs locales en `node_modules/next/dist/docs/`.** El archivo `AGENTS.md` en la raíz del repo lo recuerda explícitamente. Si algo en esta skill se contradice con las docs locales, **ganan las docs**.

## Por qué importa

App Router es nuevo y muchas convenciones todavía no son obvias. Next 16 además trajo cambios respecto de versiones anteriores. Sanity es flexible y se puede usar mal con facilidad. Este archivo encapsula las decisiones ya tomadas para que no las re-pensemos en cada feature, y para que el código del repo sea predecible.

## Stack confirmado

- **Next.js 16 (App Router)** — Pages Router está prohibido. Si ves `/pages/`, está mal. Turbopack default en dev.
- **TypeScript strict** — nada de `any`. Tipos de Sanity se autogeneran con `@sanity/typegen` en `lib/sanity/types.ts`.
- **pnpm** — el lockfile es `pnpm-lock.yaml`. No mezclar con npm/yarn.
- **Sanity** — Studio embebido en `/studio`. No usamos Payload, Contentful, ni headless WordPress.
- **Tailwind v4** — config CSS-first en `app/globals.css` (no hay `tailwind.config.ts`). Para tokens y estilos visuales, ver skill `banda-design-system`.

### Lo que NO usamos (no lo sugieras)

- `getServerSideProps`, `getStaticProps`, `getInitialProps` — son de Pages Router.
- `useEffect` para fetchear data en mount — usá Server Components o Server Actions.
- `axios`, `swr`, `react-query` para data del CMS — el `fetch` nativo de Next.js ya tiene caching.
- Librerías de routing externas (`react-router`) — App Router lo cubre.

## Server vs Client Components — la decisión más importante

**Default a Server Component.** No marques `'use client'` salvo que tengas una razón concreta de las de abajo:

- State (`useState`, `useReducer`).
- Effects (`useEffect`, `useLayoutEffect`).
- Event handlers (`onClick`, `onChange`, etc.).
- Browser APIs (`window`, `localStorage`, `IntersectionObserver`).
- Framer Motion (todos los componentes que usan `motion.*`).
- Spline (`@splinetool/react-spline`).
- Hooks de cliente (`usePathname`, `useRouter`, `useSearchParams`).

### Patrón clave: Server wrapper + Client island

Si una sección es mayormente estática pero tiene una pieza interactiva, **no** marques toda la sección como Client. Hacé que el padre sea Server Component y aislá la pieza interactiva en un componente hijo `'use client'`. Pasale los datos ya fetcheados como props.

```tsx
// ❌ Mal — toda la sección es Client por una animación
'use client'
export function ServicesList({ services }) {
  return <motion.div>...</motion.div>
}

// ✅ Bien — Server fetcheaste, Client anima
// app/(site)/page.tsx (Server Component)
const services = await client.fetch(servicesQuery)
return <ServicesList services={services} />

// components/sections/ServicesList.tsx ('use client')
'use client'
export function ServicesList({ services }: { services: Service[] }) {
  return <motion.div>...</motion.div>
}
```

Más detalle y árbol de decisión: `references/server-vs-client.md`.

## Estructura de rutas

| Ruta | Archivo | Tipo |
|---|---|---|
| `/` | `app/(site)/page.tsx` | Home — Server Component, fetch de servicios destacados |
| `/about` | `app/(site)/about/page.tsx` | Estática — copy hardcoded |
| `/services/[slug]` | `app/(site)/services/[slug]/page.tsx` | Dinámica con `generateStaticParams` |
| `/work/[slug]` | `app/(site)/work/[slug]/page.tsx` | Dinámica (futura, definir si hace falta) |
| `/studio/*` | `app/studio/[[...tool]]/page.tsx` | Studio embebido de Sanity |

El grupo `(site)` agrupa las rutas públicas con layout compartido. Studio queda fuera para tener su propio layout sin header/footer del sitio.

### Generar params estáticos para slugs

Para `/services/[slug]` y `/work/[slug]`, usar `generateStaticParams` para que Next.js los pre-genere en build:

```tsx
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(`*[_type == "service"].slug.current`)
  return slugs.map((slug) => ({ slug }))
}
```

## Sanity — setup mínimo

Tres archivos viven en `lib/sanity/`:

- `client.ts` — el `createClient` con `projectId`, `dataset`, `apiVersion`, `useCdn`.
- `queries.ts` — todas las queries GROQ exportadas como constantes con tipos.
- `types.ts` — **autogenerado**. No editar a mano.

Schemas viven en `sanity/schemas/` y se importan desde `sanity.config.ts`.

### Cliente Sanity — patrón

```ts
// lib/sanity/client.ts
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: true,  // CDN para reads en producción
})
```

`useCdn: true` para producción (cache de Sanity, ~free). Si necesitás data fresca (preview, drafts), usar un cliente separado con `useCdn: false` y token.

### Schemas — convenciones

- **Un archivo por schema**, nombre singular: `project.ts`, `service.ts`, `siteSettings.ts`.
- Exportar por default el schema, e indexar todos en `sanity/schemas/index.ts`.
- Campos opcionales explícitos con `validation: Rule => Rule.required()` cuando aplique.
- Para imágenes, siempre con `options: { hotspot: true }`.
- Para slugs, usar el tipo `slug` con `source` apuntando al campo padre.

Ejemplos completos de schemas (project, service, siteSettings): `references/sanity-schemas.md`.

### Tipos autogenerados

Después de cambiar un schema o una query, regenerar tipos:

```bash
pnpm sanity typegen generate
```

Esto actualiza `lib/sanity/types.ts`. **Nunca editar ese archivo a mano** — el próximo regen lo pisa.

Si la generación falla, normalmente es porque una query GROQ tiene una proyección que no matchea ningún campo. Revisá la query antes de tocar el schema.

## GROQ — patrones

Las queries van en `lib/sanity/queries.ts` como constantes con su nombre semántico:

```ts
// lib/sanity/queries.ts
import { groq } from 'next-sanity'

export const allServicesQuery = groq`
  *[_type == "service"] | order(orderRank asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    heroImage
  }
`

export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    name,
    description,
    "projects": projects[]-> {
      _id,
      title,
      client,
      year,
      videoUrl,
      thumbnail
    }
  }
`
```

Reglas:
- Usar `"slug": slug.current` en la proyección — evita el wrapping `{ current: '...' }` en el cliente.
- Para referencias, dereferenciar con `->` y proyectar solo lo que necesitás.
- Filtros de tipo siempre como primer paso: `*[_type == "service" && ...]`.
- `[0]` al final cuando esperás un único resultado.

Más patrones (paginación, filtros condicionales, joins indirectos): `references/groq-queries.md`.

## Data fetching desde Server Components

Patrón estándar:

```tsx
// app/(site)/services/[slug]/page.tsx
import { client } from '@/lib/sanity/client'
import { serviceBySlugQuery } from '@/lib/sanity/queries'
import type { Service } from '@/lib/sanity/types'
import { notFound } from 'next/navigation'

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await client.fetch<Service | null>(
    serviceBySlugQuery,
    { slug },
    { next: { revalidate: 60, tags: [`service:${slug}`] } }
  )

  if (!service) notFound()

  return <ServiceDetail service={service} />
}
```

Notas:
- `params` es `Promise` en Next 15+. Hay que `await`-earlo.
- El tercer argumento de `fetch` es donde va la config de caching/revalidación.
- `revalidate: 60` = ISR cada 60s. Para revalidación on-demand, usar `tags`.

Detalle de revalidación + estrategia (webhook vs ISR vs tag-based): `references/data-fetching.md`.

## Estructura de carpetas (resumen)

Ver CLAUDE.md sección 6 para el árbol completo. Lo crítico:

- `app/` — solo rutas y layouts. **Cero lógica de negocio acá**.
- `components/ui/` — atómicos (Button, Pill, ServiceChip, Badge).
- `components/sections/` — secciones de página (Hero, ServicesList, CTA).
- `components/layout/` — Header, Footer, Nav.
- `lib/sanity/` — cliente, queries, tipos generados.
- `lib/utils/` — helpers genéricos (`cn`, formatters, parsers).
- `sanity/` — schemas + `sanity.config.ts`.

## Naming e imports

- Componentes: `PascalCase.tsx`.
- Hooks: `useCamelCase.ts`.
- Utils: `camelCase.ts`.
- Schemas: singular en kebab/camel (`project.ts`, no `projects.ts`).
- Imports absolutos siempre con `@/` desde root:

```ts
import { Button } from '@/components/ui/Button'
import { client } from '@/lib/sanity/client'
import { allServicesQuery } from '@/lib/sanity/queries'
import type { Service } from '@/lib/sanity/types'
```

Nada de `../../components/...`. Si lo ves, refactorizalo a `@/`.

## Checklist mental al escribir/editar código TS

1. ¿Este componente realmente necesita ser Client? Si no hay state/effects/listeners, sacá `'use client'`.
2. ¿La query GROQ está en `lib/sanity/queries.ts` con un nombre semántico, o la estoy inline-ando en el page?
3. ¿Estoy importando con `@/` o con paths relativos?
4. ¿El tipo viene de `@/lib/sanity/types` (autogenerado), o lo estoy escribiendo a mano?
5. ¿El fetch tiene config de revalidación apropiada (`revalidate` o `tags`)?
6. Si toqué un schema o una query, ¿corrí `pnpm sanity typegen generate`?

Si alguna respuesta es "no" o "no sé", parate y reconsiderá.

## Cuándo profundizar en references

- **Estoy decidiendo Server vs Client en un caso ambiguo** → `references/server-vs-client.md`.
- **Voy a crear o modificar un schema** → `references/sanity-schemas.md`.
- **Necesito una query GROQ no trivial** (paginación, joins, filtros condicionales) → `references/groq-queries.md`.
- **Estoy configurando revalidación o un webhook** → `references/data-fetching.md`.
