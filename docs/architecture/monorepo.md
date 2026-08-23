# Monorepo Architecture

`jd-saas-kit` preserves three deployment and ownership boundaries.

## User application

`apps/user-application` is the TanStack Start application and Cloudflare Worker named `jd-start-app`. It owns browser UI, server functions, authentication-facing behavior, payments, and transactions initiated by users. Its custom `src/server.ts` initializes the shared database and auth layers before handing requests to TanStack Start.

## Data service

`apps/data-service` is the independent Cloudflare Worker named `jd-data-service`. It is intentionally separate so APIs, background jobs, future queues, Durable Objects, Workflows, and long-running work do not accumulate inside the user-facing application.

## Shared data layer

`packages/data-ops` is published inside the workspace as `@repo/data-ops`. It contains Drizzle schemas and database clients, Better Auth setup, reusable queries, and shared Zod contracts.

## Default database path

The default runtime path is Neon → PostgreSQL → Drizzle ORM → `drizzle-orm/neon-http` → Better Auth's PostgreSQL adapter. PlanetScale, Supabase, Cloudflare D1, SQLite-compatible, and other relational examples are alternative provider paths, not simultaneously active infrastructure.
