import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

export default withSentryConfig(nextConfig, {
  org: "forensicsbypriyanshi",
  project: "fbp-frontend", // Leaving this as fbp-frontend unless user says otherwise
  silent: !process.env.CI,

  // Upload source maps for readable stack traces
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,
});

