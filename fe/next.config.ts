import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.sentry.io challenges.cloudflare.com https://api.stripe.com https://maps.googleapis.com https://*.js.stripe.com https://js.stripe.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.sentry.io challenges.cloudflare.com https://api.stripe.com https://maps.googleapis.com https://*.js.stripe.com https://js.stripe.com; worker-src 'self' blob:;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
