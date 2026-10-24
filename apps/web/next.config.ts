import path from "node:path";
import type { NextConfig } from "next";

// `standalone` is for Docker/VPS (apps/web/Dockerfile). Vercel uses its own
// output tracing — enabling standalone there breaks the build (missing nft.json).
const nextConfig: NextConfig = {
  ...(!process.env.VERCEL
    ? {
        output: "standalone" as const,
        outputFileTracingRoot: path.join(process.cwd(), "../.."),
      }
    : {}),
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
