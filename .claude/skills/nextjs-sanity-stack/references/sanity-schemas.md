# Sanity schemas — banda-web

Schemas completos de los tres documentos del proyecto. Todos viven en `sanity/schemas/`.

## Convenciones generales

- **Un archivo por documento**, nombre singular (`project.ts`, no `projects.ts`).
- Exportar default el resultado de `defineType(...)` de `sanity`.
- Indexar todos en `sanity/schemas/index.ts` y referenciarlos desde `sanity.config.ts`.
- Validaciones explícitas con `Rule => Rule.required()` para campos no opcionales.
- Imágenes con `options: { hotspot: true }` siempre — permite recortes responsive.
- Slugs con `source` apuntando al campo padre.
- Para reordenar manualmente listas (servicios, proyectos), usar el plugin `@sanity/orderable-document-list` con campo `orderRank`.

---

## `service.ts`

Cada servicio del estudio (3D, 2D Motion, VFX, etc.).

```ts
// sanity/schemas/service.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Aparece en la lista de servicios y en la cabecera de la página interna.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      description: 'Proyectos asociados a este servicio. El orden en el array define el orden en la página.',
    }),
    defineField({
      name: 'orderRank',
      title: 'Order',
      type: 'string',
      hidden: true,  // gestionado por orderable-document-list
    }),
  ],
  preview: {
    select: { title: 'name', media: 'heroImage' },
  },
})
```

---

## `project.ts`

Cada trabajo individual del portfolio.

```ts
// sanity/schemas/project.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.min(2000).max(2100).integer(),
    }),
    defineField({
      name: 'service',
      title: 'Primary service',
      type: 'reference',
      to: [{ type: 'service' }],
      description: 'El servicio principal bajo el que cae este proyecto.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube o Vimeo. La detección de plataforma es automática.',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] }).custom((url) => {
          if (!url) return true
          const isValid = /youtube\.com|youtu\.be|vimeo\.com/.test(url)
          return isValid || 'Solo se admiten URLs de YouTube o Vimeo.'
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
      description: 'Se muestra en la grilla antes de cargar el video.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Portable Text. Renderizar con @portabletext/react.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'client', media: 'thumbnail' },
  },
})
```

### Helper: detectar plataforma del videoUrl

Va en `lib/utils/parseVideoUrl.ts`. La skill referencia este helper para no duplicar lógica.

```ts
// lib/utils/parseVideoUrl.ts
export type VideoPlatform = 'youtube' | 'vimeo' | 'unknown'

export interface ParsedVideo {
  platform: VideoPlatform
  id: string | null
  embedUrl: string | null
}

export function parseVideoUrl(url: string): ParsedVideo {
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) {
    const id = yt[1]
    return {
      platform: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&showinfo=0`,
    }
  }

  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) {
    const id = vm[1]
    return {
      platform: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
    }
  }

  return { platform: 'unknown', id: null, embedUrl: null }
}
```

---

## `siteSettings.ts` (singleton)

Datos globales del sitio. Documento único — un solo registro editable.

```ts
// sanity/schemas/siteSettings.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton: ver más abajo cómo restringir a un solo documento.
  fields: [
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'social',
      title: 'Social links',
      type: 'object',
      fields: [
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'vimeo', type: 'url', title: 'Vimeo' },
        { name: 'behance', type: 'url', title: 'Behance' },
      ],
    }),
    defineField({
      name: 'heroBadge',
      title: 'Hero badge text',
      type: 'string',
      initialValue: 'High-End',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero title',
      type: 'string',
      initialValue: 'Digital Creative Studio',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero subtitle',
      type: 'string',
      initialValue: 'We bring technical precision to your creative vision',
    }),
    defineField({
      name: 'heroCta',
      title: 'Hero CTA label',
      type: 'string',
      initialValue: "Let's work together!",
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
```

### Restringir el singleton a un solo documento

En `sanity.config.ts`, configurar el structure tool para que solo permita un único `siteSettings`:

```ts
// sanity.config.ts (extracto)
import { structureTool } from 'sanity/structure'

export default defineConfig({
  // ...
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document().schemaType('siteSettings').documentId('siteSettings')
              ),
            S.divider(),
            S.documentTypeListItem('service').title('Services'),
            S.documentTypeListItem('project').title('Projects'),
          ]),
    }),
  ],
})
```

Esto fuerza `documentId: 'siteSettings'`, evitando que se creen múltiples.

---

## `index.ts` — registrar todos los schemas

```ts
// sanity/schemas/index.ts
import service from './service'
import project from './project'
import siteSettings from './siteSettings'

export const schemaTypes = [service, project, siteSettings]
```

```ts
// sanity.config.ts (extracto)
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  // ...
  schema: { types: schemaTypes },
})
```

---

## Después de crear o modificar un schema

1. Reiniciar el dev server si está corriendo (los schemas se cargan al inicio).
2. Regenerar tipos: `pnpm sanity typegen generate`.
3. Verificar que `lib/sanity/types.ts` ahora tiene los tipos nuevos.
4. Si hubo cambios breaking en una query, ajustar `lib/sanity/queries.ts`.
