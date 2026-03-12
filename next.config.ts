import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin/:path*",
        destination: "/dashboard/:path*",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
