import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },

  allowedDevOrigins: ["192.168.31.50"],

  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination:
          "https://affectionate-learning-production-84bc.up.railway.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;