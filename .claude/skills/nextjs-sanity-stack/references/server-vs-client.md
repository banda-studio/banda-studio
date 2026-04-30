# Server vs Client Components — guía detallada

## Árbol de decisión

```
¿El componente necesita...?

├── State (useState, useReducer)                  → 'use client'
├── Effects (useEffect, useLayoutEffect)          → 'use client'
├── Event handlers (onClick, onChange, onSubmit)  → 'use client'
├── Browser APIs (window, document, localStorage) → 'use client'
├── Hooks de Next (usePathname, useRouter)        → 'use client'
├── Framer Motion (motion.*, AnimatePresence)     → 'use client'
├── Spline (@splinetool/react-spline)             → 'use client'
└── Nada de lo anterior                           → Server Component (default)
```

Si la respuesta es "no" a todo, **no marques `'use client'`**. Aunque "no haga daño", limita la optimización del bundle y empuja JS al cliente sin necesidad.

## Qué NO requiere `'use client'`

Estas cosas **se pueden hacer en Server Components** sin problema:

- Renderizar JSX condicional (`{cond && <X />}`).
- Loops (`.map`, `.filter`).
- Imágenes con `next/image`.
- Links con `next/link`.
- `async/await` para fetch de datos.
- Importar tipos, helpers puros, constantes.
- Renderizar Markdown, MDX, Portable Text de Sanity.
- Aplicar clases de Tailwind, condicionales con `clsx`/`cn`.

## Patrones

### 1. Server wrapper + Client island (el más común)

Tu página es Server Component. Una sección interactiva adentro es Client Component, pero los datos vienen ya fetcheados desde el padre.

```tsx
// app/(site)/page.tsx — Server Component
import { client } from '@/lib/sanity/client'
import { allServicesQuery } from '@/lib/sanity/queries'
import { Hero } from '@/components/sections/Hero'
import { ServicesList } from '@/components/sections/ServicesList'

export default async function HomePage() {
  const services = await client.fetch(allServicesQuery)

  return (
    <main>
      <Hero />
      <ServicesList services={services} />
    </main>
  )
}
```

```tsx
// components/sections/ServicesList.tsx — Client Component
'use client'

import { motion } from 'framer-motion'
import type { Service } from '@/lib/sanity/types'

export function ServicesList({ services }: { services: Service[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-4"
    >
      {services.map((s) => (
        <ServiceChip key={s._id} service={s} />
      ))}
    </motion.div>
  )
}
```

### 2. Children prop trick — pasar Server Components a Client Components

A veces necesitás un Client Component que **envuelva** Server Components (ej: un provider de Framer Motion `LayoutGroup`). Pasá los Server Components como `children`:

```tsx
// components/layout/AnimatedShell.tsx
'use client'
import { LayoutGroup } from 'framer-motion'

export function AnimatedShell({ children }: { children: React.ReactNode }) {
  return <LayoutGroup>{children}</LayoutGroup>
}
```

```tsx
// app/(site)/page.tsx (Server Component)
import { AnimatedShell } from '@/components/layout/AnimatedShell'
import { ServerSection } from '@/components/sections/ServerSection'  // Server Component

export default function Page() {
  return (
    <AnimatedShell>
      <ServerSection />  {/* sigue siendo Server */}
    </AnimatedShell>
  )
}
```

Esto funciona porque `children` se renderiza en el servidor antes de pasarlo al Client Component.

### 3. Hooks de cliente aislados

Si necesitás `usePathname` o `useSearchParams` para una sola pieza de UI (ej: highlight del link activo en el nav), **no** marques todo el `<Header>` como Client. Hacé un sub-componente `<NavLink>` que sea Client:

```tsx
// components/layout/Header.tsx — Server Component
import { NavLink } from './NavLink'

export function Header() {
  return (
    <header>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/services">Services</NavLink>
    </header>
  )
}
```

```tsx
// components/layout/NavLink.tsx — Client Component
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function NavLink({ href, children }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)
  return <Link href={href} className={isActive ? 'text-accent' : ''}>{children}</Link>
}
```

## Anti-patrones (no hacer)

### ❌ Marcar todo como Client "por las dudas"

```tsx
// ❌ Mal
'use client'
export default function HomePage() {
  return (
    <main>
      <Hero />
      <ServicesList />
    </main>
  )
}
```

Esto fuerza a todos los hijos a serializar sus props, bloquea el data fetching async directo, y aumenta el JS bundle. **No lo hagas**.

### ❌ Importar Framer Motion en un Server Component

Aunque solo lo importes (sin usarlo aún), Next va a tirar error o a forzar la conversión. Si necesitás `motion.*`, el archivo entero es Client.

### ❌ Fetchear data en `useEffect` desde un Client Component

```tsx
// ❌ Mal
'use client'
export function Services() {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setData)
  }, [])
  return <div>{data.map(...)}</div>
}
```

Genera waterfall de requests, mostrás el loading state innecesariamente, y rompés caching. **Solución:** que el padre Server fetchee y pase los datos como props.

### ❌ Pasar funciones o instancias no serializables como props a Client Components

```tsx
// ❌ Mal — fechas como Date no son serializables limpiamente
<ClientComp createdAt={new Date()} />

// ✅ Bien — string ISO
<ClientComp createdAt={new Date().toISOString()} />
```

Los props de Server → Client viajan serializados. Pasá strings, números, plain objects, arrays. Las `Date` funcionan pero pierden el tipo; mejor ISO string.

## Casos del proyecto banda-web

| Componente | Tipo | Por qué |
|---|---|---|
| `<Hero>` | Client | Spline + Framer Motion |
| `<HeroBadge>` (rotado -3.82deg) | Server o Client | Server si es estático; Client si tiene motion |
| `<ServicesList>` | Client | Animación on-scroll con Framer |
| `<ServiceChip>` | Server | Estático visual, sin interacción |
| `<Header>` | Server | Estructura estática |
| `<NavLink>` (active highlight) | Client | `usePathname` |
| `<Footer>` | Server | Estático |
| Página de servicio (`[slug]/page.tsx`) | Server | Data fetching |
| `<ServiceDetail>` (cuerpo de la página) | Server | Layout estático |
| `<ProjectVideo>` | Client | Probablemente `<iframe>` con state de play |
| `<CTAButton>` (form de contacto) | Client | Form state |

Cuando tengas duda, default Server y subí a Client solo cuando el linter/runtime te lo exija.
