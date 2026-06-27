import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring — capture all transactions in admin (low traffic)
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment tag
  environment: process.env.NODE_ENV || "development",

  // Filter out noisy non-actionable errors
  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection captured",
    "Failed to fetch",
    "Load failed",
    "NetworkError",
  ],

  // Don't send PII by default
  sendDefaultPii: false,

  // Tag the release
  release: `fbp-admin@${process.env.npm_package_version || "1.0.0"}`,
});
