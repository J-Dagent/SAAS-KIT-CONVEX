# SaaS Kit integration map

Always read the repository's `AGENTS.md` before choosing files.

## Known Neon baseline
- `apps/user-application/src/routes/**` — TanStack file routes;
- `apps/user-application/src/components/**` — React UI;
- `apps/user-application/src/server/functions/**` — server functions;
- `apps/user-application/src/lib/validation/**` — client/server validation seams when present;
- `apps/user-application/src/lib/tracking/**` — attribution, consent and pixel helpers when present;
- `packages/data-ops/**` — Drizzle schema/query/client layer;
- Cloudflare Worker runtime provides trusted server request context.

The supplied handoff demonstrates reusable Guide, Quiz and Programme form patterns. Treat observed component trees as reference patterns, never mandatory target component names.

## Convex variant
Inspect the repo. Prefer its existing backend package (typically `packages/backend` with `convex/`) and generated API. Do not recreate `packages/data-ops` in a Convex-only variant.

## Composition with project skills
Use when available:
- `<frontend_skill>` (resolve from the existing repository/project context, rules, `AGENTS.md`, PRD/spec, and available skills) and `shadcn` for component/UI work;
- `agent-browser` for form interaction and browser state;
- `blast-radius` before deleting/replacing shared form or tracking infrastructure;
- `code-review` for final review;
- `web-quality-audit` for page quality;
- `diagnosing-bugs` for failures.

## Do not over-constrain frontend
Inspect current code first. A new client may have a different component architecture. Preserve data contracts while adapting implementation to local conventions.
