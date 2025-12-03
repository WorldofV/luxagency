import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "3mmodels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.3mmodels.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
