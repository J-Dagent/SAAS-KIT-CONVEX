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

The example at `/app` is designed for a two-tab check. Add a note in one tab and watch it appear in the other.

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

Create or link a Convex project, configure production environment variables in the Convex dashboard, then deploy the backend explicitly:

```bash
pnpm deploy:backend
```

Deploy the Cloudflare frontend separately:

```bash
pnpm deploy:user-application
```

The frontend production environment must point `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` at the production Convex deployment. Deployment commands are never part of routine validation.

## TanStack Start connection

`apps/user-application/src/integrations/tanstack-query/root-provider.tsx` creates one `ConvexQueryClient` and one TanStack `QueryClient`; `router.tsx` receives both through its context. Route loaders use `convexQuery(...)` to preload data during SSR. The browser hydrates that data and resumes the same live subscription without a loading flash or a second data layer.

TanStack Server Functions remain appropriate for logic owned by the Cloudflare/TanStack server layer. Do not wrap ordinary Convex queries, mutations, or actions in Server Functions.
