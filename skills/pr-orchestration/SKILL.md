---
name: pr-orchestration
description: >-
  How to cut work into pull requests that can actually be reviewed, run several branches
  at once without them colliding, stack dependent changes, and review a pull request so
  the review finds something. Use when a change is too big for one PR, when planning more
  than one piece of work at a time, when running parallel agents or worktrees, when
  branches keep conflicting, or when asked to review a pull request. Also load when a
  branch passes ~400 changed lines, when someone asks "can we do these two things in
  parallel", or when a PR has been open for days without moving.
---

# Cutting work into pull requests

A pull request is a **unit of review**, not a unit of work. Its size is set by
what a human can actually hold in their head — roughly 400 changed lines, an
hour after lunch.

> Past that size, review quality does not decline gradually. It collapses. A
> 1,400-line pull request does not get reviewed, it gets approved, and those
> are different things.

```
one outcome  →  one plan node  →  one branch  →  one pull request  →  one review
```

If any arrow in that chain is one-to-many, something needs splitting.

---

## When to split

| Signal | What it means |
|---|---|
| Over ~400 changed lines | The plan node was cut too coarsely |
| The PR title needs an "and" | Two changes wearing one coat |
| Touches database **and** UI **and** an integration | Three review skills; nobody has all three at once |
| Some of it is ready and some is not | Ship the ready half now |
| You cannot write the evidence section without a list | Too many claims for one review |

**Do not** finish it "since I'm already here". That instinct is what produced
every unreviewable pull request that has ever existed.

Where the cut goes — the four cutting lines and which to prefer:
**[`references/splitting.md`](references/splitting.md)**.

---

## The default cut: vertical, not horizontal

The tempting split is by layer: database first, then API, then screen. It is
tempting because each piece is homogeneous, and it is usually wrong.

- Nothing is demonstrable until the last piece lands, so nothing can be
  *disproven* either
- The first two pull requests cannot be tested end to end
- If the design is wrong, you learn it three pull requests late

Prefer a **thin vertical slice**: one small capability, all the way through,
working. Ugly but real beats complete but invisible.

The exception that is genuinely horizontal: a shared foundation two slices both
need. Then it is its own pull request, deliberately, first — and it should be
**backwards compatible**, so that landing it changes nothing on its own.

---

## Stacking dependent work

When B genuinely needs A:

```bash
git switch -c feat/a origin/main
# ... build A, push, open PR #1 against main ...

git switch -c feat/b feat/a          # B starts from A, not from main
# ... build B, push, open PR #2 against feat/a ...
```

PR #2 targets `feat/a`, so its diff shows **only B**. Review stays small.

When A merges, retarget #2 to `main` and rebase:

```bash
git fetch origin
git switch feat/b
git rebase --onto origin/main feat/a feat/b
git push --force-with-lease
gh pr edit 2 --base main
```

Keep stacks to two, three at most. A five-deep stack means one review comment
at the bottom rebases everything above it, and a day disappears.

---

## Parallel work without collisions

Two branches at once is fine. Two branches editing the same file is a merge
conflict you scheduled for yourself.

Before starting parallel work, name the **conflict domains** — the areas where
only one branch may be active at a time:

| Domain | Why it serializes |
|---|---|
| Database migrations | Order matters; two migrations written in parallel apply in an order neither expected |
| Shared types / schemas | Everything imports them; a change here touches every branch |
| Config, dependencies, lockfiles | Merge conflicts that are painful and easy to resolve wrongly |
| Routing / navigation | One file, edited by every feature |

Everything else — separate screens, separate endpoints, separate tests — runs
in parallel happily.

If two pieces of work both need a serialized domain: **land the shared part
first**, backwards compatible, then run the rest in parallel on top of it.

Worktrees, agent-per-branch, and how to keep several runs from stepping on each
other: **[`references/parallel-work.md`](references/parallel-work.md)**.

---

## One issue, one branch, one pull request

```
issue #42  ──▶  feat/guest-can-cancel  ──▶  PR "Closes #42"
```

The issue is *why*, the branch is *how*, the pull request is *what*. Keeping
them one-to-one means that in a year, `git blame` leads to a pull request,
which leads to an issue, which contains the conversation about why this exists.

Break the chain and the reason survives only in someone's memory.

When several agents or people work the same repository: claim the issue first —
assign yourself, comment that you are starting. If it is already claimed, do
not start; ask. Two agents on one issue produce two branches that must then be
reconciled by a human who was doing something else.

---

## Reviewing a pull request

A review that only says "looks good" costs the reviewer's time and buys
nothing. Read in this order — it is the order that finds things:

1. **The plan node.** What was this supposed to do?
2. **The evidence section.** Does it prove that, or just claim it?
3. **The tests.** Would they fail if the feature broke? (Read the assertions,
   not the test names.)
4. **The diff.** Now, with the intent in mind.
5. **What is missing.** The error case, the permission check, the empty state.
   The most valuable review comments are almost always about absence.

The four questions worth asking every time:

- What happens if this input is empty, wrong, or hostile?
- Who is allowed to do this, and is that actually enforced here?
- What happens on the second click, or two of these at the same time?
- If this is wrong in production, how do we notice, and how do we get back?

Full method, including how to write a comment that gets acted on:
**[`references/review.md`](references/review.md)**.

---

## Rules that do not bend

- **Never merge your own pull request unreviewed.** The point is the second
  pair of eyes; approving yourself removes the only mechanism.
- **Never push to `main` directly.** Enforce it with branch protection, so it
  is not a rule anyone has to remember.
- **Never merge red.** Not "it's just the flaky one". Fix the flake or remove
  the test deliberately.
- **A stale branch is a liability.** Every day apart from `main` makes the merge
  worse. Rebase daily, or land it.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| One PR per sprint | Unreviewable. The review becomes a formality |
| "Refactor while I'm in here" | Behaviour changes hide inside noise nobody can read |
| Layer-by-layer splitting | Nothing works until the last one lands |
| Five-deep stacks | One comment at the bottom rebases the world |
| Two branches in the migrations folder | Order collision, discovered on deploy |
| Reviewing the diff without the plan | You can only check style, not whether it is right |
| "LGTM" on 900 lines in four minutes | Not a review. A signature |

---

## Done means

- [ ] Each pull request is one outcome, under ~400 changed lines
- [ ] Each links its plan node and closes exactly one issue
- [ ] Dependent work is stacked, not bundled
- [ ] No two open branches are active in the same conflict domain
- [ ] Review looked at intent, evidence and absences — not only the diff
- [ ] Merged by someone other than the author, with CI green
