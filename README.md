# jd-saas-kit

A reusable pnpm monorepo SaaS template for Cloudflare, built around clear application, service, and data-layer boundaries.

## Architecture

- `apps/user-application` (`jd-start-app`): TanStack Start UI, server functions, authentication-facing logic, and user-triggered transactions.
- `apps/data-service` (`jd-data-service`): Cloudflare Worker APIs and the home for background, queue, Durable Object, Workflow, and long-running workloads.
- `packages/data-ops` (`@repo/data-ops`): shared Drizzle schemas, Neon database access, Better Auth setup, queries, and Zod schemas.

The default database path is Neon PostgreSQL through Drizzle's `neon-http` driver. Alternative relational provider examples remain intentional reference material.

## Setup

```bash
pnpm run setup
pnpm skills:sync
```

This installs all dependencies and builds required packages.

## Development

### All applications
```bash
pnpm dev
```

### User Application
```bash
pnpm run dev:user-application
```

### Data Service
```bash
pnpm run dev:data-service
```

## Validation

```bash
pnpm typecheck
pnpm build
pnpm test
```

No automated test suite is configured yet; `pnpm test` reports that fact explicitly.

## Database helpers

```bash
pnpm pull-drizzle-schema
pnpm generate-auth-drizzle-schema
pnpm generate-drizzle-sql-output
```

Review generated schema and SQL artifacts. Apply database migrations manually.

## Deployment

### User Application (Cloudflare)
```bash
pnpm run deploy:user-application
```

### Data Service
```bash
pnpm run deploy:data-service
```

See [AGENTS.md](AGENTS.md) for engineering conventions and [`.agents/project-setup-guide.md`](.agents/project-setup-guide.md) for provider setup.
