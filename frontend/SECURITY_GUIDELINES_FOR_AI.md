# 🛡️ FBP Security Architecture & Development Guidelines for AI Agents

**Target Audience:** Any AI Assistant (Claude, Cursor, Copilot, etc.) or Human Developer working on the Forensics By Priyanshi (FBP) codebase.
**Purpose:** Ensure all new features, updates, and maintenance tasks strictly adhere to the established security, performance, and monitoring baseline of the project.

---

## 1. 🛑 NEVER Hardcode Secrets (The Golden Rule)

If an attacker gets access to the repository or client-side bundles, they must not find any usable credentials.

- **DO NOT** hardcode API keys, service account credentials, DSNs, or secrets in source code.
- **DO NOT** commit `.env.local` or `.env` files.
- **DO** use `process.env.SECRET_NAME` for server-side secrets.
- **DO** use `process.env.NEXT_PUBLIC_SECRET_NAME` only for keys that are explicitly designed to be public (like Firebase Client config or Sentry DSN).
- **Example:** We load `NEXT_PUBLIC_SENTRY_DSN` from the environment instead of hardcoding it in `sentry.*.config.ts`.

---

## 2. 🌐 API Security & Rate Limiting (OWASP Best Practices)

Every new API route added to `src/app/api/...` MUST implement the following protections:

### A. CSRF Protection (Cross-Site Request Forgery)
Always verify the `Origin` header against an allowed list before processing mutations (`POST`, `PATCH`, `DELETE`).
```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://forensicsbypriyanshi.com',
  'https://www.forensicsbypriyanshi.com',
];

const origin = request.headers.get('origin') || '';
if (origin && !ALLOWED_ORIGINS.includes(origin)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### B. Persistent Rate Limiting
Do not rely on in-memory rate limiting (it resets on serverless cold starts). Use the existing Firestore-backed rate limiting logic found in `api/newsletter/route.ts` or `api/track/route.ts`. Limit based on IP address (`x-forwarded-for` or `x-real-ip`).

### C. Payload Size Validation
Never blindly parse `request.text()` or `request.json()`. Always check the payload size first to prevent memory exhaustion (DoS) attacks.
```typescript
const rawBody = await request.text();
if (rawBody.length > 2000) { // Adjust based on expected payload
  return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
}
```

---

## 3. 📝 Cross-Site Scripting (XSS) Prevention

- **`dangerouslySetInnerHTML`:** Avoid this at all costs. If you MUST use it (e.g., rendering custom Markdown), the input MUST be strictly sanitized first. See `src/components/CustomMarkdown.tsx` for how we sanitize user-provided Markdown before injecting it.
- **Content Security Policy (CSP):** We use a strict CSP in `src/middleware.ts`. If you add a new third-party integration (e.g., a new analytics script or iframe), you MUST update the CSP headers in `middleware.ts` to explicitly allow that domain. Do not simply use `unsafe-inline` or `unsafe-eval` unless strictly isolated.

---

## 4. 🔑 Authentication & Authorization

The admin panel is completely separate from the frontend for security isolation.

- **Admin Verification:** All admin API routes MUST verify the session cookie or Authorization header using `firebase-admin/auth`.
- **Role-Based Access:** Verify the custom claims or Firestore role of the user. Just because someone is authenticated does not mean they have permission to execute an action.
- **Timing Attacks:** When comparing secrets (e.g., in `api/revalidate/route.ts`), always use `crypto.timingSafeEqual` instead of `===`.

---

## 5. 👁️ Monitoring & Logging

- **Sentry Integration:** The codebase is instrumented with Sentry (`@sentry/nextjs`). Do not disable the `withSentryConfig` wrappers in `next.config.ts`.
- **Security Logs:** Important security events (failed logins, rate limit triggers, role changes) should be logged to the `system_logs` collection in Firestore. See `api/newsletter/route.ts` for an example of the `logSecurityEvent` function.

---

## AI Agent Instructions:
When tasked with creating a new feature:
1. Check this document.
2. Build the feature.
3. Review your code against points 1-5 above.
4. If you add a new package or external script, update CSP.
5. If you add a new API, add Rate Limiting, Size Validation, and CSRF Origin Checks.
