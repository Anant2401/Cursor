import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /** Deployed beside main site as /Tools/parents-guide/ so JS/CSS load from the same folder. */
  basePath: "/Tools/parents-guide",
  images: { unoptimized: true },
};

export default nextConfig;
