# Monorepo Architecture

`jd-saas-kit-convex` has two deployment and ownership boundaries.

## User application

`apps/user-application` is the TanStack Start application and Cloudflare Worker named `jd-convex-start-app`. It owns browser UI, SSR, static assets, framework-owned Server Functions, the public Better Auth proxy, and the existing billing screens.

## Convex backend

`packages/backend` is the Convex project published inside the workspace as `@repo/backend`. It owns application data, queries, mutations, actions, HTTP Actions, Better Auth persistence, Polar webhook synchronization, and future scheduled work.

The root creates one TanStack Query client and one passive Convex client. Public routes can call public Convex functions directly, but they do not request a Better Auth session or token. The private `/_auth` layout behind `/app` reads the server token and mounts the authenticated provider with the same Convex client. Private loaders check authentication before preloading data, and Convex functions enforce identity again on the backend.

## Runtime path

Ordinary public requests follow Browser → Cloudflare. A public component creates a Convex subscription only when it calls a public function. Private requests add token-bearing Convex access under `/app`. Local Convex loopback URLs are limited to development and cannot pass the production deployment guard.
