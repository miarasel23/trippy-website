import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '3.209.161.158',
        pathname: '/api/assets/uploads/images/**',
      },
    ],
  },
};

export default nextConfig;
