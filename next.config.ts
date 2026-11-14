import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverActions: {
    bodySizeLimit: "12mb",
  },
};

export default nextConfig;
