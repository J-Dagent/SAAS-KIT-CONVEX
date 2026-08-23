# Repository Instructions

## Branch and PR Workflow

Use `staging` as the integration branch. Start feature branches from the latest `staging`; isolated worktrees may live under `.worktrees/<branch-name>`. Keep PRs small and reviewable, target `staging`, and keep unrelated features on separate branches. After a dependency merges, update active branches from `staging`. Promote `staging` to `main` only for releases.

## Repository Architecture

This is a pnpm monorepo with three intentional boundaries:

- `apps/user-application`: `jd-start-app`, the TanStack Start user-facing application. It owns UI, user-triggered transactions, server functions, authentication-facing application logic, and the Polar checkout experience.
- `apps/data-service`: `jd-data-service`, a separate Cloudflare Worker for APIs, background processing, future queues, Durable Objects, Workflows, and long-running or asynchronous workloads. Keep it separate from the user application.
- `packages/data-ops`: `@repo/data-ops`, the reusable data layer. It owns Drizzle schemas, database clients, Better Auth setup, shared queries, and shared Zod schemas.

Demo and example files are intentional teaching/reference material in the template. Do not remove them unless explicitly requested.

Downstream applications created from this template may remove demo UI and examples once equivalent production implementations exist.

## Commands

Run commands from the repository root unless stated otherwise.

```bash
pnpm run setup
pnpm run build:data-ops
pnpm run dev:user-application
pnpm run deploy:user-application
pnpm run dev:data-service
pnpm run deploy:data-service

pnpm dev
pnpm build
pnpm typecheck
pnpm test

pnpm pull-drizzle-schema
pnpm generate-auth-drizzle-schema
pnpm generate-drizzle-sql-output
pnpm skills:sync
```

`pnpm test` reports that no automated suite exists until real tests are added; it must not be treated as a passing test suite. Deployment commands are documented for users but must be run only when deployment is explicitly requested.

## Database

The default path is Neon → PostgreSQL → Drizzle ORM → `drizzle-orm/neon-http` → Better Auth PostgreSQL. Provider flexibility is intentional: documented PlanetScale, Supabase, Cloudflare D1, SQLite-compatible, and other relational paths are alternatives, not simultaneously active defaults. Never run migrations or destructive database operations without explicit authorization.

## Source Inspection

When dependency source inspection is needed, fetch only the relevant package or repository with `npx opensrc`. Do not assume `opensrc/` is populated.

```bash
npx opensrc <package>
npx opensrc pypi:<package>
npx opensrc crates:<package>
npx opensrc <owner>/<repo>
```

## Web Tooling

Use the lightest reliable tool.

- Claude Code: use `WebFetch` for straightforward public page retrieval.
- OpenCode: use `webfetch` for direct public retrieval and `websearch` for search when available.
- Codex: use native `web_search` for web research/search; Codex has no tool named `WebFetch`.
- Cross-platform: use `agent-browser` for dynamic or client-rendered sites, interaction, authentication, stateful navigation, browser workflows, or when native fetch/search is insufficient.

## Documents and PDFs

Use `anydoc` for supported document conversion and creation workflows. For local PDF inspection, run `detect-pdf "<file>" --json`, then use `pdf2md "<file>" --compact` for text-bearing PDFs. Report OCR requirements for scanned pages. Use visual page inspection for charts, diagrams, or layout; use `pdftotext` only as a fallback.

## Task Delegation

Delegate only when context isolation, parallelism, or throughput materially benefit. Choose a lightweight model for mechanical work, a balanced model for scoped research or synthesis, and the strongest reasoning model for difficult tradeoffs. Avoid host-specific model names in durable instructions. The parent owns final synthesis and validation.

## Skill Architecture

`.agents/skills/` is the canonical physical source for project skills. `.claude/skills/` contains relative symlinks only. After adding or removing skills, run `pnpm skills:sync`.

Plans produced by `improve` and `improve-animations` belong in `plans/`. Internal durable knowledge belongs in `docs/`; application-rendered technical documentation belongs in `apps/user-application/public/docs/` and remains in English.

## Definition of Done

Run relevant executable validation: typecheck, build, real tests when they exist, and blast-radius or review checks when appropriate. Preserve existing `.env` files byte-for-byte. Do not claim success from static reasoning when executable checks exist.
