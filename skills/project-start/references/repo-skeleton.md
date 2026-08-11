# The repository skeleton

Everything here goes in **before** the first feature. Each item is listed with
the reason it cannot sensibly be added later.

Ready-made versions: [`../../../templates/`](../../../templates/).

```
README.md                      what this is · how to run it · how to contribute
CLAUDE.md                      the rules an agent must follow in this repo
LICENSE
.gitignore                     .env is in here from commit one
.gitattributes                 line endings normalised, so history is portable
docs/
  CHARTER.md                   who it is for and what it does not do
  decisions/0001-stack.md      what was chosen and why
  plans/README.md              index of plan nodes — empty is fine, missing is not
.github/
  workflows/ci.yml             runs on every push and pull request
  PULL_REQUEST_TEMPLATE.md     forces evidence, not "tested locally"
  ISSUE_TEMPLATE/              so a request arrives with enough to act on
src/ or app/                   the actual thing
tests/                         with one real test that already passes
```

---

## Why each one has to be there from the start

**`.gitignore` with `.env` in it.** A secret is compromised the moment it is
committed — deleting it in the next commit does not help, it is in the history.
Adding `.gitignore` after the first `.env` is added is already too late.

**CI on the first push.** A pipeline you first exercise when you also have real
code cannot tell you which of the two is broken. Push the empty scaffold, watch
it go green, and from then on red always means *you*.

**One real test in the scaffold.** Not a placeholder that asserts `true`. One
test that touches something real, so the test *runner* is proven wired up. The
first time you need a test, you should be writing a test, not fighting a config.

**`docs/plans/README.md`, even empty.** The folder existing is what makes
writing a plan feel like following the path rather than inventing procedure.

**`CLAUDE.md` before the agent writes anything.** It is the constitution: what
the agent may not do, which commands to run, what "done" means here. Written
after a few sessions, it is a list of regrets. Written first, it prevents them.

**`PULL_REQUEST_TEMPLATE.md`.** A template with an Evidence section is the
cheapest quality mechanism that exists. It makes "tested locally" visibly
insufficient without anyone having to say so.

---

## What `CLAUDE.md` must contain

Short, specific, enforceable. Nobody follows a philosophy essay.

```markdown
# CLAUDE.md

## What this is
<One paragraph: what the product is, who it serves, what stack.>

## Commands
```bash
pnpm install
pnpm dev
pnpm lint && pnpm typecheck && pnpm test
```
All of these must pass before any pull request. CI runs the same set.

## Hard rules
1. No code without a plan node in `docs/plans/`. Load the `ship` skill first.
2. Never push to `main`. Never merge your own pull request.
3. Secrets never enter the repo, a log, or a commit message. Environment only.
4. Database changes are migration files in the same pull request, with a
   rollback note. Never change the production database by hand.
5. Every new table gets row-level security and a policy in the same migration.
6. Conventional Commits. Never a `Co-Authored-By` trailer.
7. When in doubt about something destructive or irreversible: stop and ask.

## Current state
<What works today, what is half-built, what is deliberately missing.>
```

Keep the "Current state" section honest. It is what an agent reads first and
trusts most, and a stale one causes confident work on assumptions that stopped
being true weeks ago.

---

## The first three commits

Make them separately. The history is a document, and this is its first page.

```bash
git init -b main
# 1 — the empty shell
git add . && git commit -m "chore: initialize repository with license and ignore rules"
# 2 — what we are building and why
git add docs/ && git commit -m "docs: charter and stack decision"
# 3 — the pipeline, before there is anything to break
git add .github/ && git commit -m "ci: lint, typecheck and test on every push"
```

Then push and **watch it go green** before writing a single feature:

```bash
gh repo create <name> --private --source=. --remote=origin --push
gh run watch
```

Never used these commands: [`github-basics`](../../github-basics/SKILL.md).

---

## Private or public

Private is the sensible default for something with real users' data in its
future. But make it a decision, not a delay — "private until it's good enough"
usually means the repository never gets the review habits, and those are the
hardest thing to add retroactively.

If it is public from day one: assume every commit is scraped. `.gitignore`
before the first `.env`, always.
