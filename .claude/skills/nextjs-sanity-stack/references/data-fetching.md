# Data fetching y revalidación — banda-web

Cómo fetchear datos de Sanity desde Server Components, qué estrategia de caching usar, y cómo invalidar cuando algo cambia en el CMS.

## Default: ISR con `revalidate`

Para data del CMS que **no cambia con cada request**, el patrón estándar es ISR (Incremental Static Regeneration):

```tsx
// app/(site)/page.tsx
const services = await client.fetch(
  allServicesQuery,
  {},
  { next: { revalidate: 60 } }  // re-genera la página cada 60s en background
)
```

- Primer request post-deploy: genera la página, la cachea.
- Requests siguientes dentro de 60s: sirven la versión cacheada (rápido).
- Después de 60s: el siguiente request dispara una regeneración en background; el usuario sigue viendo la versión vieja hasta que la nueva esté lista.

### Qué `revalidate` poner

| Tipo de página | Revalidate sugerido |
|---|---|
| Home (servicios destacados) | `60` (1 min) |
| Página de servicio | `60` |
| Página de proyecto | `300` (5 min — cambia menos seguido) |
| Site settings (footer, hero copy) | `300` |
| About (estática hardcoded) | n/a (no fetchea) |

Si el usuario edita en Sanity y quiere ver el cambio inmediatamente, hay dos opciones: bajar el `revalidate` (penaliza performance) o usar **revalidación on-demand** (recomendada).

---

## Revalidación on-demand con tags

En lugar de tiempos fijos, etiquetá cada fetch con un tag, y disparalo desde un webhook cuando Sanity cambia.

### 1. Etiquetar los fetches

```tsx
// app/(site)/services/[slug]/page.tsx
const service = await client.fetch(
  serviceBySlugQuery,
  { slug },
  {
    next: {
      revalidate: 3600,           // fallback: revalidar cada hora
      tags: [`service:${slug}`],  // tag específico para invalidar
    },
  }
)
```

### 2. Crear un route handler que reciba el webhook

```ts
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

const SANITY_REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET!

export async function POST(req: NextRequest) {
  const { isValidSignature, body } = await parseBody<{
    _type: string
    slug?: { current?: string }
  }>(req, SANITY_REVALIDATE_SECRET)

  if (!isValidSignature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }

  if (!body?._type) {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 })
  }

  // Invalidar tags relacionados
  if (body._type === 'service' && body.slug?.current) {
    revalidateTag(`service:${body.slug.current}`)
    revalidateTag('all-services')  // home
  }

  if (body._type === 'project') {
    revalidateTag('all-projects')
    // Si conocés el slug del servicio padre, también:
    // revalidateTag(`service:${parentSlug}`)
  }

  if (body._type === 'siteSettings') {
    revalidateTag('site-settings')
  }

  return NextResponse.json({ revalidated: true, type: body._type })
}
```

### 3. Configurar el webhook en Sanity

En `sanity.io/manage` → tu proyecto → API → Webhooks → Create webhook:

- **URL:** `https://banda.studio/api/revalidate`
- **Dataset:** `production`
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type in ["service", "project", "siteSettings"]`
- **Projection:** `{ _type, slug }`
- **Secret:** generar y guardar en `.env.local` como `SANITY_REVALIDATE_SECRET`, y en Vercel env vars.

### Resultado

Cuando un editor publica un cambio en Sanity, el webhook llega a `/api/revalidate`, se invalidan los tags correspondientes, y los próximos requests regeneran las páginas afectadas. Sin esperar el `revalidate` time.

---

## Decisión pendiente del CLAUDE.md sección 9

> "Estrategia de revalidación de Sanity: webhook a Vercel vs. ISR con tag-based revalidation."

**Recomendación:** combinar las dos.

- `revalidate: 60-300` como **fallback** — si el webhook falla o se pierde, igual eventualmente refresca.
- Tags + webhook como **mecanismo principal** — para feedback inmediato cuando se edita en Sanity.

Es lo mejor de los dos mundos. El webhook on-demand es la decisión "default", y el ISR es el cinturón de seguridad.

---

## Draft mode (preview de borradores)

Cuando un editor quiere ver un cambio en el sitio antes de publicarlo (drafts de Sanity), usamos Next.js Draft Mode.

### Cliente con drafts

```ts
// lib/sanity/client.ts
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: true,
})

// Cliente con token para leer drafts
export const previewClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: false,                      // siempre fresh
  perspective: 'previewDrafts',       // incluye documentos draft
  token: process.env.SANITY_API_READ_TOKEN!,
})
```

### Activar/desactivar draft mode

```ts
// app/api/draft/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') ?? '/'

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }

  ;(await draftMode()).enable()
  redirect(slug)
}

// app/api/draft/disable/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  ;(await draftMode()).disable()
  redirect('/')
}
```

### Usar el cliente correcto en cada page

```tsx
import { draftMode } from 'next/headers'
import { client, previewClient } from '@/lib/sanity/client'

export default async function ServicePage({ params }) {
  const { isEnabled: isDraft } = await draftMode()
  const sanity = isDraft ? previewClient : client
  const service = await sanity.fetch(serviceBySlugQuery, { slug: params.slug })
  // ...
}
```

En Sanity Studio, configurar el plugin `@sanity/presentation` para que el botón "Preview" abra `/api/draft?secret=XXX&slug=/services/three-d`.

---

## Caching de imágenes

Las imágenes de Sanity se sirven desde `cdn.sanity.io` con su propio CDN. No es necesario re-cachearlas en Next. Usar `next/image` con `loader` custom o el helper de `@sanity/image-url`:

```ts
// lib/sanity/image.ts
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
```

```tsx
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'

<Image
  src={urlFor(service.heroImage).width(1200).quality(85).url()}
  alt={service.name}
  width={1200}
  height={675}
/>
```

`next/image` aplicará su propia optimización encima (formato WebP/AVIF, responsive srcset).

---

## Anti-patrones

### ❌ Fetchear sin config de revalidación

```tsx
// ❌ Mal — usa el default de Next, que en Next 15 es no-cache
const data = await client.fetch(query)

// ✅ Bien — config explícita
const data = await client.fetch(query, {}, { next: { revalidate: 60, tags: ['x'] } })
```

### ❌ Fetchear data en `loading.tsx` o `error.tsx`

Esos archivos son UI states, no data fetchers. Mantenelos puros.

### ❌ Mezclar `useCdn: true` con preview

Si usás el cliente con `useCdn: true` para fetchear drafts, no vas a ver los cambios. Usá `previewClient` (con `useCdn: false` y `perspective: 'previewDrafts'`).
