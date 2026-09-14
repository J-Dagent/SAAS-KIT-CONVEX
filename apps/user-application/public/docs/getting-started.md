# Getting started

## What runs where

The workspace has two runtime boundaries:

- `apps/user-application` runs TanStack Start on Cloudflare Workers.
- `packages/backend` runs the Convex database, functions, Better Auth, and Polar integration.

Public pages do not initialize Convex or request an authentication session by default. A form or anonymous agent can mount the dedicated public Convex provider inside that feature only. The private `/app` route creates the authenticated Convex client and checks Better Auth before it renders private data.

## Install

Use Node.js 22 and pnpm 10.14.0, then install from the repository root:

```bash
pnpm install
```

## Start local Convex

The first setup starts a local Convex deployment, generates the typed API, and creates the frontend's local URL file if it does not exist:

```bash
pnpm run setup
```

Keep the local deployment running in one terminal:

```bash
pnpm run dev:backend
```

Start TanStack Start in another terminal:

```bash
pnpm run dev:user-application
```

You can also start both processes together:

```bash
pnpm dev
```

## Configure integrations

Continue with these guides:

1. [Convex](/docs/convex) for the data model and function architecture.
2. [Authentication](/docs/authentication) for Better Auth and Google OAuth.
3. [Polar](/docs/polar) for products, checkout, and webhooks.
4. [Environments](/docs/environments) before creating any cloud deployment.

## Validate a change

```bash
pnpm typecheck
pnpm test
pnpm build
```

The normal production build intentionally works without Convex variables so public routes can still be built and served. The deployment command applies stricter checks and refuses missing or local Convex URLs.
