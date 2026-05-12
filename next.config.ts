import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tey8h8kr4bvj5bie.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.buildingapprovals.ae',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
