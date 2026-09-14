# Repository Instructions

## Branch and PR Workflow

Use `staging` as the integration branch. Start feature branches from the latest `staging`; isolated worktrees may live under `.worktrees/<branch-name>`. Keep PRs small and reviewable, target `staging`, and keep unrelated features on separate branches. After a dependency merges, update active branches from `staging`. Promote `staging` to `main` only for releases.

## Repository Architecture

This is a pnpm monorepo with two intentional boundaries:

- `apps/user-application`: `jd-convex-start-app`, the TanStack Start user-facing application deployed on Cloudflare. It owns UI, SSR, TanStack Server Functions, authentication-facing application logic, and the existing billing experience.
- `packages/backend`: `@repo/backend`, the Convex backend. It owns the database, queries, mutations, actions, HTTP Actions, Better Auth persistence, Polar synchronization, and scheduled or asynchronous backend work.

Public routes stay independent from Better Auth and Convex tokens. A public feature may mount `PublicConvexProvider` inside its own route or component and call only anonymous-safe Convex functions with server validation and rate limiting. Keep this provider out of `__root`.

Demo and example files are intentional teaching/reference material in the template. Do not remove them unless explicitly requested.

Downstream applications created from this template may remove demo UI and examples once equivalent production implementations exist.

## Commands

Run commands from the repository root unless stated otherwise.

```bash
pnpm run setup
pnpm run dev:user-application
pnpm run dev:backend
pnpm run deploy:user-application
pnpm run deploy:backend

pnpm dev
pnpm build
pnpm typecheck
pnpm test

pnpm skills:sync
```

`pnpm test` runs the repository's automated checks. Production releases must have one designated owner: a CI/CD pipeline or an explicitly initiated manual release, never two competing deployment systems.

## Convex

Convex is the single primary backend and data platform in this variant. Do not add PostgreSQL, Drizzle, or another fallback data layer. Read `packages/backend/convex/_generated/ai/guidelines.md` before changing Convex functions. Run `pnpm dev:backend` for development code generation. Run `pnpm deploy:backend` only when deployment is explicitly requested.

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
