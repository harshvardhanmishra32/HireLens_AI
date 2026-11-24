import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/demo",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/candidate",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/recruiter",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
