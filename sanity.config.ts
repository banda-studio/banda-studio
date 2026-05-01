import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "@/lib/sanity/env";
import { schemaTypes } from "@/sanity/schemas";

export default defineConfig({
  name: "banda-studio",
  title: "Banda Studio",

  projectId,
  dataset,

  // Studio embebido: se monta en /studio (ver app/studio/[[...tool]]/page.tsx)
  basePath: "/studio",

  schema: { types: schemaTypes },

  plugins: [
    // Singleton trick: forzamos un único documento de tipo siteSettings con
    // ID fijo. El resto de los tipos aparece como lista normal.
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
            S.divider(),
            S.documentTypeListItem("service").title("Services"),
            S.documentTypeListItem("project").title("Projects"),
          ]),
    }),
    // Vision: panel para correr GROQ contra el dataset desde el Studio.
    // Útil en dev — en prod no hace daño tampoco.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
