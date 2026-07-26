import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * Bundle analyzer: se activa solo cuando `ANALYZE=true`. Correr con
 * `pnpm analyze` abre un treemap del bundle en el browser al terminar el
 * build. En un build normal (`pnpm build`) es un no-op, no agrega peso.
 */
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
