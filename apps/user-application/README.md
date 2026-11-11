# Acadelead user application

`jd-convex-start-app` is the customer-facing TanStack Start application. It runs on
Cloudflare Workers and connects to the shared `@repo/backend` Convex package.

Run workspace commands from the repository root:

```bash
pnpm dev:user-application
pnpm build
pnpm typecheck
```

The application uses React 19, TanStack Router and Query, Tailwind CSS v4,
shadcn/ui, Better Auth, Convex, Polar, and PostHog. Routes live in `src/routes`;
TanStack Server Functions and middleware live in `src/core`.

Cloudflare configuration is in `wrangler.jsonc`. The worker name is
`jd-convex-start-app`. Environment values are managed outside source control: never
copy secrets into documentation, and do not run deployment commands as part of
routine validation.

See the root `README.md`, `AGENTS.md`, and `docs/architecture/monorepo.md` for
the complete workspace workflow and architecture.
