import { YouTubeLoopVideo } from "@/components/ui/YouTubeLoopVideo";

interface Project {
  title: string;
  videoId: string;
  aspectRatio: string;
  column?: "left" | "right";
}

interface ServiceProjectGridProps {
  projects: readonly Project[];
  /**
   * Layout manual por filas. Si está presente, override completo del
   * auto-distribute por columnas. Cada sub-array es una fila; los items
   * comparten width proporcional al aspect ratio para quedar a la misma
   * altura.
   */
  rows?: Project[][];
}

function parseRatio(ar: string): number {
  const [w, h] = ar.split("/").map(Number);
  return w && h ? w / h : 16 / 9;
}

function heightInColumn(ar: string, colWidth: number): number {
  return colWidth / parseRatio(ar);
}

function distributeProjects(projects: readonly Project[]) {
  const LW = 16;
  const RW = 9;

  const left: Project[] = [];
  const right: Project[] = [];
  let leftH = 0;
  let rightH = 0;
  const squares: Project[] = [];

  for (const p of projects) {
    if (p.column === "left") {
      left.push(p);
      leftH += heightInColumn(p.aspectRatio, LW);
      continue;
    }
    if (p.column === "right") {
      right.push(p);
      rightH += heightInColumn(p.aspectRatio, RW);
      continue;
    }

    const r = parseRatio(p.aspectRatio);
    if (r > 1.2) {
      left.push(p);
      leftH += heightInColumn(p.aspectRatio, LW);
    } else if (r < 0.85) {
      right.push(p);
      rightH += heightInColumn(p.aspectRatio, RW);
    } else {
      squares.push(p);
    }
  }

  for (const sq of squares) {
    const hL = heightInColumn(sq.aspectRatio, LW);
    const hR = heightInColumn(sq.aspectRatio, RW);
    const diffIfLeft = Math.abs(leftH + hL - rightH);
    const diffIfRight = Math.abs(leftH - (rightH + hR));
    if (diffIfLeft <= diffIfRight) {
      left.push(sq);
      leftH += hL;
    } else {
      right.push(sq);
      rightH += hR;
    }
  }

  return { left, right };
}

/**
 * Grid de proyectos del servicio.
 *
 * Dos modos:
 * - **Rows manual** (cuando `rows` está presente): cada fila es un array de
 *   proyectos. Dentro de una fila los items se reparten el width
 *   proporcionalmente al aspect ratio del video → todos quedan a la misma
 *   altura. Útil cuando querés controlar exactamente el orden y
 *   agrupamiento (ej: 2D Motion).
 * - **Auto-distribuido** (default): dos columnas (16fr / 9fr) con
 *   landscape→izq, portrait→der, squares balanceando heights.
 */
export function ServiceProjectGrid({
  projects,
  rows,
}: ServiceProjectGridProps) {
  if (projects.length === 0) return null;

  return (
    <section
      aria-label="Selected work"
      className="bg-surface-primary py-16 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-40">
        {rows ? <RowsLayout rows={rows} /> : <ColumnsLayout projects={projects} />}
      </div>
    </section>
  );
}

/**
 * Layout custom por filas. Items dentro de cada fila usan `flex` con
 * grow proporcional al aspect ratio (`flex: AR 1 0`) — heights matchean
 * sin gaps ni recortes.
 *
 * Mobile (< lg): cada fila se apila vertical, items full-width.
 * Desktop (lg+): fila flex-row con items proporcionales.
 */
function RowsLayout({ rows }: { rows: Project[][] }) {
  return (
    <div className="flex flex-col gap-6 lg:gap-12">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-col gap-6 lg:flex-row lg:gap-8"
        >
          {row.map((p) => {
            const [w, h] = p.aspectRatio.split("/").map(Number);
            // El flex shorthand `AR 1 0` (grow=AR, shrink=1, basis=0) sólo
            // aplica en lg+ vía el arbitrary class `lg:[flex:var(--proj-flex)]`.
            // En mobile el container es flex-col y los items toman su
            // altura natural del aspect-ratio CSS.
            const flexValue = w && h ? `${w / h} 1 0` : "1 1 0";
            return (
              <ProjectTile
                key={p.videoId}
                project={p}
                style={
                  {
                    aspectRatio: p.aspectRatio,
                    ["--proj-flex" as never]: flexValue,
                  } as React.CSSProperties
                }
                className="lg:[flex:var(--proj-flex)]"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Layout auto-distribuido en 2 columnas (16fr / 9fr).
 */
function ColumnsLayout({ projects }: { projects: readonly Project[] }) {
  const { left, right } = distributeProjects(projects);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16fr_9fr] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-6 lg:gap-8">
        {left.map((p) => (
          <ProjectTile
            key={p.videoId}
            project={p}
            style={{ aspectRatio: p.aspectRatio }}
          />
        ))}
      </div>
      {right.length > 0 && (
        <div className="flex flex-col gap-6 lg:gap-8">
          {right.map((p) => (
            <ProjectTile
              key={p.videoId}
              project={p}
              style={{ aspectRatio: p.aspectRatio }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectTile({
  project,
  style,
  className,
}: {
  project: Project;
  style: React.CSSProperties;
  className?: string;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-surface-secondary ${className ?? ""}`}
      style={style}
    >
      <YouTubeLoopVideo
        videoId={project.videoId}
        title={project.title}
        className="pointer-events-none absolute top-[-15%] left-[-15%] h-[130%] w-[130%] border-0"
      />
      <div aria-hidden="true" className="absolute inset-0" />
      <span className="sr-only">{project.title}</span>
    </article>
  );
}
