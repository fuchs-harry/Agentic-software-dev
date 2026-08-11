# CLAUDE.md

The rules for working in this repository. Short and enforceable on purpose —
nobody follows a philosophy essay.

## What this is

<One paragraph: what the product is, who it is for, what it does not do.
Take it from `docs/CHARTER.md` rather than writing it twice.>

Stack: <e.g. Next.js + TypeScript on Vercel, Supabase (EU) for database and auth>
Decisions that are binding: `docs/decisions/`

## Commands

```bash
<pnpm install>
<pnpm dev>
<pnpm lint>
<pnpm typecheck>
<pnpm test>
<pnpm build>
```

**All of them must pass before any pull request.** CI runs the same set.

## Hard rules

1. **No code without a plan node.** Every change follows the loop: plan
   (`docs/plans/<slug>/`) → human approval → brief → branch → CI → pull
   request. Load the `ship` skill before the first edit. Exceptions: pure
   investigation, a one-liner, a change entirely inside `docs/`.
2. **Never push to `main`. Never merge your own pull request.** Branch → PR →
   human review.
3. **One issue → one branch → one pull request** (`Closes #<n>`).
4. **Conventional Commits**, and **never a `Co-Authored-By` trailer** — commits
   carry human authorship.
5. **Secrets never enter the repository, a log, or a commit message.**
   Environment variables only. Never a `NEXT_PUBLIC_*` / `VITE_*` variable for
   anything sensitive.
6. **Schema changes are migration files in the same pull request**, with a
   rollback note. Never change the production database by hand.
7. **Every new table gets row-level security and its policies in the same
   migration.** Permissions are tested from the wrong side — that a stranger
   gets nothing.
8. **Stop before anything irreversible**: dropping data, rotating a key, an
   outbound message, a force-push, spending money. State what it does, what the
   way back is, and wait.
9. **Never make CI green by weakening it.** No `--no-verify`, no skipped tests,
   no adjusted expectations to match a bug.
10. **Documentation is a graph, and a change that makes a node wrong fixes it in
    the same pull request.** Every file under `docs/` has frontmatter
    (`title`, `type`, `status`, `updated`), ends with a `## Related` section, and
    is reachable from `docs/INDEX.md`. `node scripts/check-docs.mjs` enforces it
    and runs in CI. Before creating a new file, ask whether an existing node is
    simply out of date — it usually is. Load the `docs-graph` skill.
11. **When in doubt on something destructive, ask.** Never guess.

## Effort and gates

Default: `effort: standard`, `gates: standard`.

Floors that override any instruction to go faster: anything touching
authentication, permissions, money, other people's data, or the database shape
is `effort: deep` + `gates: strict`.

## Current state

<What works today. What is half-built. What is deliberately missing.
Keep this honest — it is what an agent reads first and trusts most, and a stale
version causes confident work on assumptions that stopped being true weeks ago.>
