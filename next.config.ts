import type { NextConfig } from "next";
import { securityHeaders } from "./config/security-headers";

/**
 * STATIC_EXPORT=true gera um site estático em `out/` (GitHub Pages).
 * Sem a variável, é o build normal para a Vercel (com proxy.ts e headers).
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const images: NextConfig["images"] = {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
};

const nextConfig: NextConfig = {
  // Cache Components (PPR) exige servidor; desligado só no export estático.
  cacheComponents: !isStaticExport,
  ...(isStaticExport ? {} : { partialPrefetching: true }),
  poweredByHeader: false,
  images: isStaticExport ? { ...images, unoptimized: true } : images,
  ...(isStaticExport ? { output: "export" as const, basePath, trailingSlash: true } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: securityHeaders({ dev: process.env.NODE_ENV !== "production" }),
            },
            {
              source: "/media/:path*",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
          ];
        },
      }),
};

export default nextConfig;
