# jd-saas-kit-convex

A Convex-native variant of the JD SaaS Kit. It keeps the TanStack Start and Cloudflare frontend while Convex owns backend data, authentication persistence, billing synchronization, and realtime updates.

## Architecture

- `apps/user-application` (`jd-start-app`): TanStack Start UI and SSR on Cloudflare, existing authentication UX, billing screens, and framework-owned Server Functions.
- `packages/backend` (`@repo/backend`): Convex schema, queries, mutations, actions, HTTP Actions, Better Auth component, and Polar component.

Cloudflare owns the frontend worker and static assets. Convex is the only application database and backend platform in this variant.

## Setup

```bash
pnpm run setup
pnpm skills:sync
```

This installs dependencies, configures a Convex development deployment, and creates the frontend `.env.local` with local Convex URLs when it does not already exist. Existing local environment files are never overwritten. Set the required Convex, OAuth, and Polar environment variables before exercising authentication or billing.

## Development

### All applications
```bash
pnpm dev
```

### User Application
```bash
pnpm run dev:user-application
```

### Convex backend
```bash
pnpm run dev:backend
```

## Validation

```bash
pnpm typecheck
pnpm build
pnpm test
```

No automated test suite is configured yet; `pnpm test` reports that fact explicitly.

## Deployment

### User Application (Cloudflare)
```bash
pnpm run deploy:user-application
```

### Convex backend
```bash
pnpm run deploy:backend
```

Deployment commands are manual and are not part of routine validation. See [AGENTS.md](AGENTS.md) for engineering conventions and [`apps/user-application/public/docs/convex.md`](apps/user-application/public/docs/convex.md) for setup details.
