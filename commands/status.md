---
description: Where does this project actually stand — branch, plans, CI, open work
---

Report where the project stands. Read state, change nothing.

Gather:

```bash
git status --short
git branch --show-current
git log --oneline -5
gh pr list --state open
gh run list --limit 3
```

Plus: read `docs/plans/README.md` and the status line of each plan node.

Then report, in plain language a non-technical person can act on:

**Where we are**
- Which branch, and whether there is uncommitted work
- What the last few commits actually did

**In flight**
- Open pull requests, with their CI state and how long they have been open
- Plan nodes that are `approved` but not started, or `in progress` but stalled

**Blocked**
- Plan nodes with unmet preconditions — name the precondition, not the node
- Open questions with no owner

**What is red**
- Failing CI, and whether it is this branch's fault or `main` was already broken

**What I would do next**
- One recommendation, with a reason. Not a list of options.

If something looks wrong — a branch far behind `main`, a pull request open for
days, a plan node marked in progress with no commits — say so plainly. That is
the value of this command; a tidy summary that omits the stalled work is worse
than no summary.
