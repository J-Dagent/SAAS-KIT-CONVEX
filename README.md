# jd-saas-kit-convex

A Convex-native variant of the JD SaaS Kit. It keeps the TanStack Start and Cloudflare frontend while Convex owns backend data, authentication persistence, billing synchronization, and realtime updates.

## Architecture

- `apps/user-application` (`jd-convex-start-app`): TanStack Start UI and SSR on Cloudflare, existing authentication UX, billing screens, and framework-owned Server Functions.
- `packages/backend` (`@repo/backend`): Convex schema, queries, mutations, actions, HTTP Actions, Better Auth component, and Polar component.

Cloudflare owns the frontend worker and static assets. Convex is the only application database and backend platform in this variant.

Public routes require neither Better Auth nor a Convex token. A public feature can opt into the lazy anonymous Convex provider without changing the root route. The private `/app` boundary owns authenticated Convex access.

## Setup

```bash
pnpm run setup
pnpm skills:sync
```

This installs dependencies, configures a local Convex development deployment, and creates the frontend `.env.local` with local Convex URLs when it does not already exist. Existing local environment files are never overwritten. Local loopback URLs are never used by a production build.

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

The frontend tests cover the local and production Convex URL boundary and private route guards.

## Deployment

GitHub Actions is the sole production deployer. Run the manual `Deploy` workflow after configuring its `production` environment. Local deploy scripts stop before contacting Convex or Cloudflare. See [AGENTS.md](AGENTS.md) for engineering conventions and [`apps/user-application/public/docs/deployment.md`](apps/user-application/public/docs/deployment.md) for the required GitHub environment configuration.
