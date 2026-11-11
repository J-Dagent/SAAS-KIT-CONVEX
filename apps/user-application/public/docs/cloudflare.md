# Cloudflare Worker

## Responsibility

The `jd-convex-start-app` Worker serves TanStack Start SSR, static assets, public pages, and the Better Auth proxy route. Convex owns the database and backend functions.

The application creates one passive Convex client at the root. Public pages make no request until a component calls a public Convex function. Better Auth and token retrieval remain limited to `/app` and `/api/auth/*`.

## Configuration

The tracked Worker configuration lives in `apps/user-application/wrangler.jsonc`. It contains the Worker name and non-secret runtime settings. Do not write credentials or deployment URLs into that file.

```json
{
  "name": "jd-convex-start-app",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { "enabled": true }
}
```

Wrangler reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the CI environment. Developers may use their local Wrangler login for a manual deployment.

## Production build guard

Run the guarded deployment from the repository root:

```bash
pnpm run deploy:user-application
```

The command validates both Convex Cloud URLs before Vite builds the Worker. A local Convex URL stops the command before Wrangler uploads anything.

## Troubleshooting

- A 500 on every route usually means the public Convex URL is missing from the production build or auth work escaped the `/app` boundary.
- A 500 only under `/app` usually means the Convex Cloud URLs, deployment, or Better Auth environment is missing.
- An OAuth callback error usually means `SITE_URL` and the Google authorized redirect URI do not match the Worker origin.
- Inspect runtime failures with `wrangler tail jd-convex-start-app`.
