# Acadelead user application

`jd-start-app` is the customer-facing TanStack Start application. It runs on
Cloudflare Workers and uses the shared `@repo/data-ops` package for Drizzle and
Better Auth integration.

Run workspace commands from the repository root:

```bash
pnpm dev:user
pnpm build:user
pnpm typecheck
pnpm cf-typegen:user
```

The application uses React 19, TanStack Router and Query, Tailwind CSS v4,
shadcn/ui, Better Auth, Polar, and PostHog. Routes live in `src/routes`; server
functions and middleware live in `src/core`.

Cloudflare configuration is in `wrangler.jsonc`. The worker name is
`jd-start-app`. Environment values are managed outside source control: never
copy secrets into documentation, and do not run deployment or database
migration commands as part of routine validation.

See the root `README.md`, `AGENTS.md`, and `docs/architecture/monorepo.md` for
the complete workspace workflow and architecture.
