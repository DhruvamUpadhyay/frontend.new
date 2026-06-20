import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/:path*`,
      },
      {
        source: '/robots.ts',
        destination: '/robots.txt',
      },
      {
        source: '/sitemap.ts',
        destination: '/sitemap.xml',
      },
    ];
  },
};

export default nextConfig;
