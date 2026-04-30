# GROQ queries — banda-web

Patrones de queries reales del proyecto. Todas viven en `lib/sanity/queries.ts` y se exportan como constantes nombradas.

## Reglas comunes

- Usar `groq` de `next-sanity` (o `@sanity/client`) — habilita autocompletado en VS Code y typegen.
- Filtrar por `_type` siempre como primer paso: `*[_type == "X"]`.
- Proyectar **solo lo que necesitás**. No traer el documento entero "por si acaso".
- Renombrar `slug.current` → `"slug": slug.current` para aplanar el shape en cliente.
- Para references, dereferenciar con `->` y proyectar los campos del documento referenciado.
- `[0]` al final cuando esperás un único resultado (ej: por slug).

---

## Lista de servicios (home)

```ts
export const allServicesQuery = groq`
  *[_type == "service"] | order(orderRank asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    heroImage
  }
`
```

Uso:

```tsx
const services = await client.fetch(allServicesQuery)
```

---

## Servicio por slug + proyectos referenciados

```ts
export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    name,
    description,
    heroImage,
    "projects": projects[]-> {
      _id,
      title,
      "slug": slug.current,
      client,
      year,
      videoUrl,
      thumbnail,
      tags
    }
  }
`
```

Uso:

```tsx
const service = await client.fetch(serviceBySlugQuery, { slug: 'three-d' })
```

El operador `->` dereferencia las referencias del array `projects[]`. Sin él, te llegan los `_ref` y tenés que hacer un round-trip extra.

---

## Site settings (singleton)

```ts
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    contactEmail,
    social,
    heroBadge,
    heroTitle,
    heroSubtitle,
    heroCta
  }
`
```

Como es un singleton (`documentId: 'siteSettings'`), siempre hay 0 o 1 resultado. El `[0]` te da el documento o `null`.

---

## Slugs de servicios para `generateStaticParams`

```ts
export const allServiceSlugsQuery = groq`
  *[_type == "service" && defined(slug.current)][].slug.current
`
```

Esto te devuelve un `string[]` directo. Útil para:

```tsx
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(allServiceSlugsQuery)
  return slugs.map((slug) => ({ slug }))
}
```

---

## Proyectos por servicio (cuando exista `/work/[slug]`)

Reverse lookup — buscar proyectos cuyo campo `service` referencia a un servicio dado:

```ts
export const projectsByServiceQuery = groq`
  *[_type == "project" && service._ref == $serviceId] | order(year desc) {
    _id,
    title,
    "slug": slug.current,
    client,
    year,
    videoUrl,
    thumbnail
  }
`
```

Uso:

```tsx
const projects = await client.fetch(projectsByServiceQuery, { serviceId: service._id })
```

---

## Paginación

```ts
export const paginatedProjectsQuery = groq`
  *[_type == "project"] | order(year desc) [$start...$end] {
    _id,
    title,
    "slug": slug.current,
    thumbnail
  }
`
```

`[$start...$end]` toma una slice exclusiva-end. Para 12 ítems por página, página 2: `$start = 12, $end = 24`.

Para saber el total (sin traerlos):

```ts
export const projectsCountQuery = groq`count(*[_type == "project"])`
```

---

## Filtros condicionales

A veces querés filtrar por tag opcionalmente. GROQ no tiene "if", pero `select` o lógica booleana en el filtro funcionan:

```ts
export const filteredProjectsQuery = groq`
  *[_type == "project" && (
    !defined($tag) || $tag in tags
  )] | order(year desc) {
    _id,
    title,
    tags
  }
`
```

Uso:

```tsx
// Sin filtro
const all = await client.fetch(filteredProjectsQuery, { tag: null })

// Con filtro
const filtered = await client.fetch(filteredProjectsQuery, { tag: '3d' })
```

---

## `coalesce` y `select` para defaults

Si un campo puede estar vacío y querés un fallback:

```ts
groq`
  *[_type == "project"][0] {
    title,
    "displayClient": coalesce(client, "Personal project"),
    "type": select(
      defined(videoUrl) => "video",
      defined(thumbnail) => "image",
      "text"
    )
  }
`
```

- `coalesce(a, b, c)` devuelve el primer no-null.
- `select(cond1 => val1, cond2 => val2, default)` es un switch.

---

## Anti-patrones

### ❌ No proyectar (traer todo)

```ts
// ❌ Mal — trae todo el documento, incluyendo campos que no usás
groq`*[_type == "project"]`

// ✅ Bien — proyectar solo lo necesario
groq`*[_type == "project"] { _id, title, thumbnail }`
```

Importa especialmente cuando un campo es `array of block` (Portable Text), que puede pesar varios KB.

### ❌ Inline GROQ en el componente

```tsx
// ❌ Mal — query embebida, no reutilizable, no tipada
const data = await client.fetch(`*[_type == "service"]{...}`)

// ✅ Bien — query nombrada en lib/sanity/queries.ts
import { allServicesQuery } from '@/lib/sanity/queries'
const data = await client.fetch(allServicesQuery)
```

### ❌ Resolver references en código en vez de en GROQ

```tsx
// ❌ Mal — round-trip extra por cada proyecto
const service = await client.fetch(`*[_type == "service" && slug.current == $slug][0]`, { slug })
const projects = await Promise.all(
  service.projects.map((ref) => client.fetch(`*[_id == $id][0]`, { id: ref._ref }))
)

// ✅ Bien — un solo fetch con dereferencia
const service = await client.fetch(serviceBySlugQuery, { slug })
// service.projects ya viene resuelto
```

---

## Tipar el resultado

Después de definir o cambiar una query, regenerar tipos:

```bash
pnpm sanity typegen generate
```

Y usar el tipo:

```ts
import type { AllServicesQueryResult } from '@/lib/sanity/types'

const services = await client.fetch<AllServicesQueryResult>(allServicesQuery)
```

`@sanity/typegen` infiere el tipo del **resultado de la query** (incluyendo proyecciones), no solo del schema. Eso significa que si proyectás `{ _id, name }`, el tipo solo tendrá `_id` y `name`, no todo el doc.
