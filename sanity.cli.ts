import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "@/lib/sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  // Auto-updates del Studio embebido cuando se publica una nueva versión.
  autoUpdates: true,
  // Config de typegen (reemplaza al sanity-typegen.json deprecated).
  typegen: {
    path: "./lib/sanity/queries.ts",
    schema: "./schema.json",
    generates: "./lib/sanity/types.ts",
  },
});
