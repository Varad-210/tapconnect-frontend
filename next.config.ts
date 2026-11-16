import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    if (!backendUrl) return [];
    return {
      beforeFiles: [
        { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      ],
    };
  },
};

export default nextConfig;
