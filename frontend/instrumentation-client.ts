import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring — capture 20% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session Replay — capture 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment tag
  environment: process.env.NODE_ENV || "development",

  // Filter out noisy non-actionable errors
  ignoreErrors: [
    // Browser extensions & third-party scripts
    "ResizeObserver loop",
    "Non-Error promise rejection captured",
    // Network glitches (Firebase offline is expected)
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // Tawk.to chat widget noise
    "tawk",
  ],

  // Don't send PII by default
  sendDefaultPii: false,

  // Tag the release with the build ID
  release: `fbp-frontend@${process.env.npm_package_version || "1.0.0"}`,
});
