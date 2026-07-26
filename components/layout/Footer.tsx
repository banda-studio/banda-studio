/**
 * Footer minimal. El "footer" real del sitio es el `ContactCTA` (la card que
 * invita a trabajar juntos con el email). Esto es solo el crédito debajo:
 * gris tenue, una línea, sin adornos.
 *
 * Server Component. El año se resuelve en build — se actualiza solo en cada
 * deploy, sin tocar nada.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-secondary px-6 pb-10 text-center sm:px-10 lg:px-16">
      <p className="text-caption text-white/50">
        Made by Banda Studio · {year}
      </p>
    </footer>
  );
}
