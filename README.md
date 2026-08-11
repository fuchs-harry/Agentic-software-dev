# Agentic Software Development

A Claude Code plugin that gives an AI agent — and the person directing it — a
**method** for building real software: scope it, plan it in writing, get a human
to approve, build on a branch, prove it works, ship it through a pull request.

Built for two people. The one who can describe what they want but has never
opened a terminal. And the one who writes code and is tired of agents producing
a thousand lines nobody asked for.

```
/plugin marketplace add fuchs-harry/Agentic-software-dev
/plugin install agentic-software-dev
```

Then: **[docs/first-hour.md](docs/first-hour.md)** — a complete walkthrough from
idea to live site, with the actual words you type.

---

## The problem it solves

An agent will build the wrong thing quickly, confidently, and with a green test
suite. Every part of that sentence is a separate failure, and each one gets its
own mechanism here:

| Failure | Mechanism |
|---|---|
| Builds what you said, not what you meant | **Scope and charter**, approved before any code |
| Confident about work it has not checked | **An effort dial** — how hard it works before believing itself |
| Barrels through something irreversible | **Named gates** where it stops and waits |
| Tests that report green and check nothing | **A negative control** — the test must be watched failing |
| A pull request too big to review | **~400 lines**, one outcome, one plan node |
| Approves its own work | **A human merges.** Always |

---

## The loop

```
0 · SCOPE    what are we building — and what are we deliberately not
1 · PLAN     docs/plans/<slug>/README.md        → a human reads it and approves
2 · BRIEF    docs/plans/<slug>/brief.md         → the plan, made executable
3 · BUILD    one branch, small commits, local check before push
4 · PROVE    CI is the gate — your terminal is an opinion
5 · SHIP     green → pull request. Never merge your own work unreviewed.
```

Between 1 and 2 sits a human. That is where a wrong plan costs ten minutes.
After it, a wrong plan costs a branch, a review and a rollback.

Why each step exists: **[docs/the-loop.md](docs/the-loop.md)**.

---

## Two dials, not fixed ceremony

A typo and a payment flow both go through the loop — at different depths.

```
effort: quick | standard | deep | max      how hard it works before believing itself
gates:  minimal | standard | strict        how often it stops and asks you
```

You rarely set them. Claude picks from **blast radius** and says which and why
in one sentence. The floors it applies unasked: anything touching
authentication, permissions, money, other people's data or the database shape is
`deep` + `strict`, however fast you asked it to go.

One gate fires at every setting and cannot be turned off: **before anything
irreversible**. Deleting data, rotating a key, sending real messages, spending
money. The test is *can this be undone in five minutes without anyone
noticing?*

Worked examples: **[docs/dials.md](docs/dials.md)** ·
Full model: [`skills/ship/references/effort-model.md`](skills/ship/references/effort-model.md)

---

## What is in the box

**Eight skills.** They load themselves when relevant — you do not invoke them.

| | |
|---|---|
| [`ship`](skills/ship/SKILL.md) | The loop. The dials. The gates. What to do when it goes sideways |
| [`project-start`](skills/project-start/SKILL.md) | Idea → interview → charter → stack → scaffold → first slice |
| [`github-basics`](skills/github-basics/SKILL.md) | Git for people who have never used it, and how to undo each mistake |
| [`testing-and-ci`](skills/testing-and-ci/SKILL.md) | What is worth testing, the negative control, CI as a gate |
| [`pr-orchestration`](skills/pr-orchestration/SKILL.md) | Cutting, stacking, parallel branches, reviewing so the review finds something |
| [`web-app`](skills/web-app/SKILL.md) | Four states per screen, forms that keep what was typed, accessibility that costs nothing |
| [`supabase-db`](skills/supabase-db/SKILL.md) | Row-level security in the same migration, never later |
| [`deployment`](skills/deployment/SKILL.md) | Environments, secrets, and a rollback you have actually tested |

**Seven commands.** `/start` · `/plan` · `/build` · `/check` · `/ship` ·
`/review` · `/status`

**Four agents.** `planner` · `verifier` · `reviewer` · `security-auditor`

**Templates** for a new project's first commit — CLAUDE.md, CI, PR and issue
templates, `.gitignore` with `.env` already in it: [`templates/`](templates/)

---

## The one idea worth stealing

> **A green test that cannot go red proves nothing.**

The most common failure in agent-written tests is a test that asserts nothing,
or mocks away the thing under test, or checks a value it set itself. It reports
success forever — including through the exact bug you needed it to catch.

So: after a test passes, break the code on purpose and confirm the test fails.

```
Removed the 24-hour window check
  → "rejects cancellation inside 24h" failed as expected
  → restored. Green again.
```

Thirty seconds. It is the difference between a test suite and a wall of green
ticks, and it is the most useful sentence in any pull request.

**This repository does it too.** Its validator checks skill frontmatter,
manifest agreement, orphan references and every relative link — and each of
those checks is proven twice: once against this repository, and once against a
fixture broken on purpose that it must reject. See
[`scripts/validate.test.mjs`](scripts/validate.test.mjs).

---

## Documentation

| | |
|---|---|
| [docs/install.md](docs/install.md) | Getting it running. Five minutes |
| [docs/first-hour.md](docs/first-hour.md) | Idea to live site, with the words you type |
| [docs/the-loop.md](docs/the-loop.md) | Why the order is what it is |
| [docs/dials.md](docs/dials.md) | Effort and gates, with worked examples |
| [docs/glossary.md](docs/glossary.md) | Every term, in the order you meet them |

---

## Contributing

Gaps are the most useful thing you can report — a situation where the skills
gave no guidance, or the wrong guidance. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

MIT. See [LICENSE](LICENSE).
