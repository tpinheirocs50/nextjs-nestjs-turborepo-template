import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared-types", "@repo/api-client"],
};

export default nextConfig;
