import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Relax CSP for Next.js dev (react-refresh uses eval and inline scripts). Keep strict in prod.
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.sentry.io challenges.cloudflare.com https://api.stripe.com https://maps.googleapis.com https://*.js.stripe.com https://js.stripe.com",
  "connect-src 'self' ws: wss: cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.sentry.io challenges.cloudflare.com https://api.stripe.com https://maps.googleapis.com https://*.js.stripe.com https://js.stripe.com",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-src https://js.stripe.com https://*.js.stripe.com",
].join("; ");

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self' cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.sentry.io challenges.cloudflare.com https://api.stripe.com https://maps.googleapis.com https://*.js.stripe.com https://js.stripe.com",
  "connect-src 'self' cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.sentry.io challenges.cloudflare.com https://api.stripe.com https://maps.googleapis.com https://*.js.stripe.com https://js.stripe.com",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-src https://js.stripe.com https://*.js.stripe.com",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: isDev ? DEV_CSP : PROD_CSP,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
