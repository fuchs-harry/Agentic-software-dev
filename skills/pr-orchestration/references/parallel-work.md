# Running more than one thing at once

Parallel work is not free. It is a trade: wall-clock time against the risk of
two branches discovering, at merge, that they disagreed all along.

The trade is worth it when the pieces touch different files. It is a bad trade
otherwise, and no amount of coordination fixes that.

---

## Conflict domains

Before starting anything in parallel, name the places where only one branch may
be active. These serialize:

| Domain | Why |
|---|---|
| **Database migrations** | Order matters. Two written in parallel apply in an order neither author assumed |
| **Shared types / schemas / contracts** | Everything imports them; one change touches every branch |
| **Dependencies and lockfiles** | Conflicts here are painful and easy to resolve wrongly |
| **Routing / navigation config** | One file, edited by every feature |
| **Global styles, theme, design tokens** | Same |
| **CI configuration** | Two branches changing the pipeline is a pipeline nobody understands |

Everything else runs in parallel happily: separate screens, separate endpoints,
separate tests, separate documentation.

**If two pieces of work both need a serialized domain: land the shared part
first, backwards compatible, then parallelise on top of it.** That is the whole
technique. Trying to coordinate two live branches inside the migrations folder
does not work; it just moves the conflict to a worse moment.

---

## Worktrees — one checkout per branch

Switching branches back and forth loses your place, invalidates your build, and
eventually you commit to the wrong one. A worktree gives each branch its own
folder, sharing one git history:

```bash
git worktree add ../app-cancel -b feat/cancel origin/main
git worktree add ../app-search -b feat/search origin/main

cd ../app-cancel     # its own node_modules, its own dev server, its own state
```

When done:

```bash
git worktree remove ../app-cancel
```

Each folder is independent: separate install, separate port, separate terminal.
That independence is exactly the point — no shared build state to be stale.

---

## Several agents in one repository

The rules that keep it from turning into cleanup work:

1. **One agent, one issue, one branch, one worktree.** No exceptions; the
   exception is where the collision happens.
2. **Claim before starting.** Assign the issue, comment that work has begun.
   If it is already claimed, do not start — ask.
3. **Conflict domains are exclusive.** One agent in migrations at a time. This
   is a scheduling decision made before starting, not a conflict resolved after.
4. **Nobody merges.** Agents open pull requests. A human merges. Two agents
   merging independently into `main` produces a state neither one tested.
5. **Rebase on fresh `main` before opening the pull request.** Not at the start
   of work — at the end, when it is known what everyone else actually landed.

---

## Sequencing several plan nodes

Before starting, lay the nodes out and mark the real dependencies:

```
node A  bookings table + policies         (migrations — serialized)
node B  create a booking                  needs A
node C  cancel a booking                  needs A
node D  guest list screen                 needs A
```

A lands alone. Then B, C and D run in parallel — they touch different files and
share only a table that already exists.

Write the dependency into each node's **Preconditions**. "Needs node A merged"
is a real precondition, and a node with an unmet precondition does not start.

---

## Keeping branches from drifting

Every day a branch spends away from `main` makes the merge worse. Two habits:

```bash
git fetch origin && git rebase origin/main     # daily, on your own branch
```

and: **land something every day, even if small.** A branch that lives a week is
a branch that will conflict; a branch that lives an afternoon usually will not.

If a branch cannot land in a day, it is probably two branches.

---

## When two branches conflict badly

A large structural conflict is not a git problem. It means both branches were
working the same ground, which is a planning failure that git is now reporting.

The fix is to serialize retroactively:

1. Pick which lands first — usually the one that is further along
2. Land it
3. The other rebases onto the new `main` and resolves once, against a settled base

Do **not** try to resolve a large conflict in both directions at once. You will
be reconciling two moving targets, and the result compiles without either
author's intent surviving intact.

---

## Cost of parallel work, honestly

| Pieces at once | Realistic outcome |
|---|---|
| 1 | Simplest. Often fastest overall for small work |
| 2–3 | Good, if the conflict domains are separated |
| 4+ | Coordination and rebasing eat the gain; review becomes the bottleneck |

The bottleneck is almost never the building. It is review and merge. Five
branches finishing at once means five pull requests queued behind one human,
each getting staler while it waits.
