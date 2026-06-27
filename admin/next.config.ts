import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "forensicsbypriyanshi",
  project: "cms-fsp",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});

