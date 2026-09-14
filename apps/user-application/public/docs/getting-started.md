# Getting started

## What runs where

The workspace has two runtime boundaries:

- `apps/user-application` runs TanStack Start on Cloudflare Workers.
- `packages/backend` runs the Convex database, functions, Better Auth, and Polar integration.

The root creates one passive Convex client. Public pages do not request an authentication session or token, and they contact Convex only when a component calls a public function. The private `/app` route adds Better Auth to the same client before it renders private data.

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

Production requires the public Convex Cloud URLs. The deployment command refuses missing or local URLs, and the post-build check rejects leaked loopback URLs or real secret values.
