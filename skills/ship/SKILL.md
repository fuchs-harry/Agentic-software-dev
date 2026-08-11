---
name: ship
description: >-
  The delivery loop for building software with an agent: scope it, plan it as a written
  node, get a human to approve, build on a branch, prove it in CI, ship it as a pull
  request. Effort and human checkpoints are dials you set per task, not fixed ceremony.
  Load this BEFORE the first edit — it is the order of work, not a style guide. Trigger
  on any request that would lead to a change: "build X", "add Y", "fix Z", "can you make
  the app do…", "continue", "keep going", "let's start the project". Also load when asked
  to plan, scope, estimate or split work, when resuming half-finished work, when a change
  turned out bigger than expected, or when CI is red. If you are about to call Write or
  Edit on source code and no plan exists, you are in the wrong phase — load this first.
---

# The loop

> **No code without a plan.** The order is the method, not the ceremony.

```
0 · SCOPE    what are we building — and what are we deliberately not
1 · PLAN     docs/plans/<slug>/README.md        → a human reads it and approves
2 · BRIEF    docs/plans/<slug>/brief.md         → the plan, made executable
3 · BUILD    one branch, small commits, local check before push
4 · PROVE    CI is the gate — your terminal is an opinion
5 · SHIP     green → pull request. Never merge your own work unreviewed.
```

Between **1** and **2** sits a human. That is the point where a wrong plan costs
ten minutes. After it, a wrong plan costs a branch, a review and a rollback.

This skill says **when** things happen. What to actually build is elsewhere:
[`web-app`](../web-app/SKILL.md), [`supabase-db`](../supabase-db/SKILL.md),
[`testing-and-ci`](../testing-and-ci/SKILL.md), [`deployment`](../deployment/SKILL.md).
Starting from nothing: [`project-start`](../project-start/SKILL.md).
Never used git: [`github-basics`](../github-basics/SKILL.md).

---

## Two dials

Not every change deserves the same machinery. A typo and a payment flow both go
through the loop — but not at the same depth. Two dials decide how heavy it gets.

**`effort`** — how hard the agent works before it believes itself.

| | plan | build loops | verification passes | independent review | typical work |
|---|---|---|---|---|---|
| `quick` | one paragraph | 1 | tests pass | none | copy change, one file, a typo |
| `standard` | full plan node | 1–2 | tests + self-review against the plan | 1 pass | a feature, a screen, an endpoint |
| `deep` | plan + rejected alternatives | 2–3 | tests + adversarial review + integration check | 3 distinct lenses | auth, schema change, anything with money |
| `max` | plan + written trade-off record | until two rounds find nothing new | judge panel, majority must agree | 5, must vote | data migration, security boundary, going live |

**`gates`** — how often the agent stops and waits for a human.

| | stops at |
|---|---|
| `minimal` | before the pull request only |
| `standard` | after the plan · before the pull request |
| `strict` | after the plan · before anything irreversible · before the pull request · before deploy |

Default when nobody says otherwise: **`effort: standard`, `gates: standard`**.

### Picking the dial without being told

The user usually will not say "deep". Choose from **blast radius**, and say out
loud which you chose and why — one line, not a paragraph.

| Ask | If yes |
|---|---|
| Can this lose, expose or corrupt someone's data? | `deep` minimum, `gates: strict` |
| Does it touch money, login, or permissions? | `deep` minimum, `gates: strict` |
| Does it change the database shape? | `deep`, and the change must be reversible |
| Does it go to real users immediately? | `gates: strict` regardless of effort |
| Is one `git revert` enough to undo it completely? | `quick` or `standard` is fine |

> Escalating mid-run is normal and cheap. **De-escalating is not** — once you
> are at `deep` because the work touches auth, discovering it is "simpler than
> expected" does not lower the dial. The blast radius did not change.

Full model, including what each verification pass actually does and how loops
terminate: **[`references/effort-model.md`](references/effort-model.md)**.

---

## Phase 0 · Scope

Before planning, one exchange to make sure you are building the right thing.
Non-coders describe outcomes ("customers should be able to book"), not systems.
Your job is to turn that into a boundary.

Write down three things and show them:

- **Done looks like** — one sentence, observable by a person clicking around
- **Not in this** — the two or three nearest things you are deliberately excluding
- **Unknowns** — what you would have to guess, and what you will assume instead

If the unknowns would change the shape of the work, ask. If they would only
change a detail, state your assumption and keep going.

Scope for a whole new project instead of one change:
[`project-start`](../project-start/SKILL.md).

---

## Phase 1 · Plan

Every unit of work gets a written node at `docs/plans/<slug>/README.md`. It is
not a formality: it is the artifact a human approves, and later the record of
why the code looks the way it does.

Anatomy and required sections: **[`references/plan-node.md`](references/plan-node.md)** ·
copy-paste template: [`assets/plan-template.md`](assets/plan-template.md).

What a plan must answer:

| Section | The question behind it |
|---|---|
| Goal · Non-goal | How do we know it is finished — and what is explicitly out? |
| Context | Which decisions, docs or existing code does this rest on? |
| Preconditions | What must be true before the first commit? |
| Tasks | Per task: one commit, one acceptance criterion |
| Verification | How is it *proven* to work — not "looks right" |
| Rollback | What happens if this is wrong in production? |
| Open | What is unresolved, and who resolves it? |

**A plan with no task that could fail is not a plan.** If every task reads
"do it properly", it has not been thought through yet.

### When a plan is not needed

- pure investigation, no edit
- a typo, a one-liner, a comment
- a change that stays entirely inside documentation

Everything else gets a node. **When in doubt: node.** A plan that turned out
too small costs ten minutes. A missing one costs a branch.

---

## Phase 2 · Brief

From the approved plan comes exactly **one** executable brief, living next to it:

```
docs/plans/<slug>/README.md    the plan   — for the person who approves
docs/plans/<slug>/brief.md     the brief  — for whoever (or whatever) builds
```

Three parts: where we stand · what to do, task by task · what must be true
afterwards. Template: [`assets/brief-template.md`](assets/brief-template.md).

The brief is **derived, never reinvented**. If it drifts from the plan, the plan
is wrong — go back to Phase 1 rather than building past it.

---

## Phase 3 · Build

One unit of work = one branch = one pull request.

```bash
git fetch origin
git switch -c feat/<slug> origin/main
```

- one commit per task from the plan, in [Conventional Commits](https://www.conventionalcommits.org/) form
- a commit message says *why*, not *what changed* — the diff already says what
- never a `Co-Authored-By` trailer; commits carry the human's authorship
- secrets never enter a commit, a log, or a message

Before pushing, run whatever the project's local check is (`npm test`,
`pnpm lint && pnpm test`, …). That is not verification — that is courtesy to
the CI queue.

Working several branches at once, or splitting work that grew too big:
[`pr-orchestration`](../pr-orchestration/SKILL.md).

---

## Phase 4 · Prove

Your terminal has your cache, your `node_modules`, your environment variables.
It proves nothing. The binding run is the one on GitHub.

```bash
git push -u origin feat/<slug>
gh run watch
```

Red CI means back to Phase 3, with the fix as its own commit on the same branch.
Never `--no-verify`, never disable a check to make it pass, never "but it works
on my machine".

**A green test that cannot go red proves nothing.** Every meaningful test needs
a negative control — break the thing on purpose once and watch the test fail.
The method is in [`testing-and-ci`](../testing-and-ci/SKILL.md).

---

## Phase 5 · Ship

Only once CI is green:

```bash
gh pr create --base main --fill --body-file PR_BODY.md
```

- fill the template completely, evidence included — a screenshot or a test log,
  not "tested locally"
- keep it under ~400 changed lines; bigger means Phase 1 cut too coarsely
- **do not merge your own work unreviewed.** Under `gates: minimal` a human
  merges. Under `strict`, a human merges *and* signs off on the deploy.

Details: [`references/gates.md`](references/gates.md) ·
PR body template: [`assets/pr-body.md`](assets/pr-body.md).

---

## When it goes sideways

Half-built code with no plan, CI red for reasons nobody touched, scope that
tripled mid-branch — all normal, all have a defined move.
**[`references/recovery.md`](references/recovery.md)**.

The one rule that holds in all of them: **stop and write down where you are
before you touch anything else.** Debugging forward from an unknown state is
how a bad afternoon becomes a bad week.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| "I'll start now, the plan comes after" | The plan then only justifies what already exists |
| Plan and build in one pass | The cheap approval between 1 and 2 disappears |
| One giant plan for a whole phase | Not approvable, not verifiable. One node per PR |
| "Works locally, CI is flaky" | CI is the definition. Your machine is an opinion |
| Lowering the dial because it felt easy | Ease is not blast radius |
| Asking the human at every step | `strict` is four stops, not forty. Constant asking is not caution, it is refusing to decide |
| Deleting a failing test to get green | The test was the only thing working |

---

## Done means

- [ ] Scope stated: done-looks-like, non-goals, assumptions
- [ ] Plan node written, linked, **approved by a human**
- [ ] Brief derived from the plan
- [ ] One branch, small Conventional Commits, no `Co-Authored-By`
- [ ] CI green — every job, not just the fast ones
- [ ] PR open with evidence, **not self-merged**
- [ ] Plan node updated to `Status: shipped` with the PR number
- [ ] Documentation that the change made wrong is corrected in the same PR
