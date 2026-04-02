import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [];

try {
  if (apiBaseUrl) {
    const parsed = new URL(apiBaseUrl.startsWith("http") ? apiBaseUrl : `https://${apiBaseUrl}`);
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      pathname: "/storage/**",
    });
  }
} catch {
  // Ignore invalid env and fall back to default local hosts below.
}

remotePatterns.push(
  { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/storage/**" },
  { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
  { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns,
  },
};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  tunnelRoute: process.env.SENTRY_AUTH_TOKEN ? "/monitoring" : undefined,
  silent: !process.env.CI,
});
