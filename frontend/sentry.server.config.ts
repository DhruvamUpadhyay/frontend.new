import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Environment tag
  environment: process.env.NODE_ENV || "development",

  // Release tag
  release: `fbp-frontend@${process.env.npm_package_version || "1.0.0"}`,
});
