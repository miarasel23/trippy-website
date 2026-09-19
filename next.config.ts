import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apitrippy.online',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '3.209.161.158',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
