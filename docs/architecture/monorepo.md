# Monorepo Architecture

`jd-saas-kit-convex` has two deployment and ownership boundaries.

## User application

`apps/user-application` is the TanStack Start application and Cloudflare Worker named `jd-start-app`. It owns browser UI, SSR, static assets, framework-owned Server Functions, the public Better Auth proxy, and the existing billing screens.

## Convex backend

`packages/backend` is the Convex project published inside the workspace as `@repo/backend`. It owns application data, queries, mutations, actions, HTTP Actions, Better Auth persistence, Polar webhook synchronization, and future scheduled work.

The browser connects to Convex through the official TanStack Query adapter. TanStack Start preloads queries during SSR, then the browser resumes live subscriptions.

## Runtime path

The runtime path is Browser → Cloudflare and TanStack Start → Convex. This variant intentionally has no PostgreSQL, Drizzle, or separate data-service fallback.
