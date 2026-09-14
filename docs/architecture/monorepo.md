# Monorepo Architecture

`jd-saas-kit-convex` has two deployment and ownership boundaries.

## User application

`apps/user-application` is the TanStack Start application and Cloudflare Worker named `jd-convex-start-app`. It owns browser UI, SSR, static assets, framework-owned Server Functions, the public Better Auth proxy, and the existing billing screens.

## Convex backend

`packages/backend` is the Convex project published inside the workspace as `@repo/backend`. It owns application data, queries, mutations, actions, HTTP Actions, Better Auth persistence, Polar webhook synchronization, and future scheduled work.

The public route tree creates only a plain TanStack Query client. It does not initialize Convex or request a Better Auth session. An anonymous feature may mount the public Convex provider inside that feature only and call rate-limited public functions. The private `/_auth` layout behind `/app` connects the official Convex TanStack Query adapter, reads the server token, and mounts the authenticated provider. Private loaders check authentication before preloading data, and Convex functions enforce identity again on the backend.

## Runtime path

Ordinary public requests follow Browser → Cloudflare. Anonymous Convex features add an unauthenticated, rate-limited Cloudflare → Convex Cloud path. Private requests add token-bearing Convex access. Local Convex loopback URLs are limited to development and cannot pass the production deployment guard. This variant intentionally has no PostgreSQL, Drizzle, or separate data-service fallback.
