function assertEnv(value: string | undefined, name: string): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local (or Vercel env vars in production).`,
    );
  }
  return value;
}

export const projectId = assertEnv(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const dataset = assertEnv(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET",
);

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";
