# Better Auth with Convex

## Architecture

The browser still signs in through Better Auth at `/api/auth/*`. TanStack Start proxies that public route to the Convex HTTP Action registered by `@convex-dev/better-auth`.

```text
Google button
  -> /api/auth/* on TanStack Start
  -> Better Auth HTTP Action on Convex
  -> Google OAuth
  -> Better Auth session stored by the Convex component
  -> authenticated Convex client
```

The visible login, account, and logout flows match the relational template. Convex replaces the Drizzle database adapter and owns the session data.

## Required environment variables

`pnpm run setup` creates `apps/user-application/.env.local` with the local Convex URLs when that file does not already exist. It never overwrites an existing local environment file. For a manual or production configuration, set:

```bash
# apps/user-application/.env.local
VITE_CONVEX_URL="https://your-deployment.convex.cloud"
VITE_CONVEX_SITE_URL="https://your-deployment.convex.site"
VITE_SITE_URL="http://localhost:3000"
```

Set secrets on the Convex development deployment. Do not put their real values in repository files.

```bash
pnpm --filter @repo/backend exec convex env set SITE_URL http://localhost:3000
pnpm --filter @repo/backend exec convex env set BETTER_AUTH_SECRET your-secret
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_ID your-client-id
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_SECRET your-client-secret
```

Generate a Better Auth secret with `openssl rand -base64 32`.

## Google OAuth

Add this redirect URI to the Google OAuth client for local development:

```text
http://localhost:3000/api/auth/callback/google
```

For production, replace the origin with the application domain:

```text
https://your-domain.com/api/auth/callback/google
```

The callback stays on the application domain because TanStack Start keeps `/api/auth/$` as the public proxy. No Convex site URL needs to be exposed as the Google callback.

## Backend files

- `packages/backend/convex/auth.config.ts` registers Better Auth as a Convex authentication provider.
- `packages/backend/convex/auth.ts` creates Better Auth with the Convex adapter and Google provider.
- `packages/backend/convex/http.ts` registers the Better Auth HTTP routes.
- `apps/user-application/src/lib/auth-server.ts` provides the TanStack Start proxy and authenticated server helpers.
- `apps/user-application/src/lib/auth-client.ts` adds the Better Auth Convex client plugin.

## Public and private route boundary

The root route does not import Better Auth or create a Convex client. Public pages therefore render even when the private backend is unavailable. A public feature that needs anonymous Convex mounts its own lazy provider and never requests an auth token.

The `/_auth` layout owns the private boundary behind `/app`. It creates the Convex client, reads the Better Auth token during SSR, assigns that token to the Convex HTTP client, and mounts `ConvexBetterAuthProvider` for its children only.

Use `useConvexAuth()`, `Authenticated`, or `Unauthenticated` before calling protected Convex functions. A Better Auth browser session can exist briefly before the Convex client has validated its token.

The application reloads after sign-out. This clears authenticated query state and follows the current Convex Better Auth recommendation for authenticated SSR.

## Client integration

The Better Auth client keeps the established React API and adds the Convex token plugin:

```ts
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [convexClient()],
});
```

Start Google OAuth from the existing application origin. Better Auth returns through the proxy route and redirects to the protected application:

```ts
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/app",
});
```

`AccountDialog` reads `authClient.useSession()` for the name, email, and avatar. Its sign-out callback reloads the document after Better Auth clears the session so no authenticated Convex cache survives into the signed-out UI.

## Protecting application UI and loaders

The `_auth` layout waits for both systems:

```ts
const session = authClient.useSession();
const convexAuth = useConvexAuth();

if (session.isPending || convexAuth.isLoading) {
  return <LoadingScreen />;
}

if (!session.data || !convexAuth.isAuthenticated) {
  return <GoogleLogin />;
}

return <Outlet />;
```

This avoids rendering protected Convex queries in the short interval between the browser session loading and the Convex client accepting its JWT.

UI gates are not authorization. Every Convex function that reads private user data or performs a user-owned write must resolve the user from the authenticated backend context. Never accept a trusted user ID from browser arguments.

Private route loaders call `requireAuthenticatedRoute()` before preloading Convex data. This prevents unauthenticated loaders from starting behind a component-level login screen. Convex functions repeat the identity check because route guards are navigation controls, not security boundaries.

## Server-side access

Use the helpers exported by `apps/user-application/src/lib/auth-server.ts` when a TanStack loader, Server Function, or server route genuinely owns the workflow:

- `fetchAuthQuery` for an authenticated Convex query;
- `fetchAuthMutation` for an authenticated Convex mutation;
- `fetchAuthAction` for an authenticated Convex action;
- `getToken` for SSR authentication state;
- `handler` for the `/api/auth/*` proxy.

Ordinary client-side Convex operations should use `convexQuery`, `useConvexMutation`, or `useConvexAction` directly rather than adding a Server Function wrapper.

## Troubleshooting

- A Google provider warning means `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is missing on the active Convex deployment.
- A callback mismatch means the Google console URI does not exactly match the application-domain `/api/auth/callback/google` URL.
- A browser session with failed Convex queries usually means the Convex token has not loaded or the frontend points at a different deployment.
- A proxy error usually means `VITE_CONVEX_SITE_URL` is missing or uses the `.convex.cloud` URL instead of `.convex.site`.

## Local verification

```bash
pnpm run setup
pnpm dev
```

Verify Google sign-in, `/app` access, account details, sign-out, and a protected Convex query. External Google and Convex credentials are required for the complete OAuth flow.
