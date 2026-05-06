import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@repo/shared-types", "@repo/api-client"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
