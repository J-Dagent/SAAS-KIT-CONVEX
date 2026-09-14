# Convex backend

## What Convex owns

Convex is the primary backend and data platform for this template variant. It owns application data, reactive functions, Better Auth persistence, Polar synchronization, HTTP Actions, and future scheduled work. Cloudflare still runs the TanStack Start frontend and SSR worker.

Backend code lives in `packages/backend/convex/`.

## Convex Database

Convex stores JSON-like documents in tables. Every document receives `_id` and `_creationTime` system fields. The application schema is declared in `packages/backend/convex/schema.ts`.

The Better Auth and Polar components keep their own isolated tables. Do not duplicate those tables in the application schema.

## Schema and validators

Use `defineSchema`, `defineTable`, and validators from `convex/values`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  realtimeNotes: defineTable({
    text: v.string(),
    authorName: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_updated_at", ["updatedAt"]),
});
```

Every public or internal function must validate its arguments. Keep application rules, such as text length, in the function handler as well.

## Queries

Queries are read-only, deterministic functions. The client subscribes to their results.

```ts
export const listNotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("realtimeNotes")
      .withIndex("by_updated_at")
      .order("desc")
      .take(10);
  },
});
```

Bound result sets with `take()` or pagination. Do not scan an unbounded table with `collect()`.

## Mutations

Mutations update the database transactionally. The teaching demo inserts one shared note:

```ts
export const addNote = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    return await ctx.db.insert("realtimeNotes", {
      text: text.trim(),
      updatedAt: Date.now(),
    });
  },
});
```

When the mutation commits, every client subscribed to the affected query receives the new result automatically.

## Actions

Actions can call external APIs and can run longer than queries or mutations. They cannot access `ctx.db` directly. Use them for work such as generating a Polar checkout URL. Call an internal query or mutation when an action needs database data or writes.

## Indexes

Declare indexes beside their tables and name every indexed field, such as `by_updated_at`. Query indexes with `withIndex()` in the declared field order. Add an index only for a real access pattern.

## Realtime subscriptions

`@convex-dev/react-query` connects Convex subscriptions to TanStack Query. A component subscribes with:

```ts
const notes = useQuery(convexQuery(api.demo.listNotes, {}));
```

This is a pushed subscription over the Convex client connection. It does not poll and does not require `invalidateQueries()` after a Convex mutation.

The example at `/app` is designed for a two-tab check. Add a note in one tab and watch it appear in the other. Both the query and mutation resolve the Better Auth user on the backend. Each user sees only notes indexed by their own component user ID.

## Scheduled functions and cron

Use `ctx.scheduler.runAfter()` or `ctx.scheduler.runAt()` for durable one-off work. Define recurring work in `convex/crons.ts` with Convex cron jobs. Add these only when the product has a concrete delayed or recurring task.

## Local development

Run the initial setup once:

```bash
pnpm run setup
```

Then run the frontend and Convex together:

```bash
pnpm dev
```

Run them separately when debugging one side:

```bash
pnpm dev:user-application
pnpm dev:backend
```

`convex dev` creates or selects a development deployment, generates `convex/_generated/`, pushes backend functions, and watches for changes. Commit generated API types, but never commit `.env.local`.

## Production deployment

GitHub Actions owns the production release. It validates configuration, builds once, configures and deploys Convex Cloud, then deploys the verified Worker artifact. Local deploy scripts reject execution. See [Environments](/docs/environments) and [Deployment](/docs/deployment).

## TanStack Start connection

`router.tsx` creates a plain TanStack `QueryClient` for every route. The `/_auth` layout connects a `ConvexQueryClient` only when `/app` is entered. Private route loaders use `convexQuery(...)` to preload data during SSR. The browser hydrates that data and resumes the same live subscription without adding a second data layer.

TanStack Server Functions remain appropriate for logic owned by the Cloudflare/TanStack server layer. Do not wrap ordinary Convex queries, mutations, or actions in Server Functions.

## Anonymous Convex on public routes

Public routes never require Better Auth or a Convex token. When one public feature needs Convex, mount `PublicConvexProvider` around that feature instead of changing `__root`:

```tsx
<PublicConvexProvider>
  <ContactForm />
</PublicConvexProvider>
```

The provider creates an unauthenticated `ConvexReactClient` only when React mounts it. Other landing and documentation routes remain independent from Convex availability.

Anonymous functions belong in `packages/backend/convex/public.ts`. `submitAnonymousRequest` demonstrates the contract: Convex validates the arguments and business limits, then applies a per-client token bucket and a global fixed-window limit before writing. The function exposes no read API for submitted content.

Generate the anonymous identifier in the browser with `crypto.randomUUID()` and keep it in local storage. This identifier improves fairness but is not an identity or authorization credential. Expensive operations such as an AI action should also verify Cloudflare Turnstile before paying for external model usage.

`VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` are public deployment endpoints. Browser bundles must contain them, so store them as GitHub variables. Credentials such as `CONVEX_DEPLOY_KEY`, OAuth client secrets, Better Auth secrets, and Polar tokens remain secrets.
