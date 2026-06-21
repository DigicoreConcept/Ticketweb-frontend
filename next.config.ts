import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8005",
        pathname: "/static/**",
      },
      // Keep your wildcard for production/other sources if needed
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8005";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`, // Proxy to Backend API
      },
      {
        source: "/static/:path*",
        destination: `${BACKEND_URL}/static/:path*`, // Proxy to Backend Static Files
      },
    ];
  },
};

export default nextConfig;
