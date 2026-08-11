---
title: The loop, and what each step buys
type: reference
status: current
updated: 2026-08-11
tags: [guide, method]
---

# The loop, and what each step buys

```
0 · SCOPE    what are we building — and what are we deliberately not
1 · PLAN     written down, and a human approves it
2 · BRIEF    the plan, made executable
3 · BUILD    one branch, small commits
4 · PROVE    the checks run on a machine that is not yours
5 · SHIP     a pull request. Someone else merges.
```

Six steps looks like ceremony. Each one exists because of a specific, common
way that agent-built software goes wrong.

---

## Why scope comes before planning

An agent will build what you said, not what you meant, and it will do it well
enough that the gap is not obvious for days.

Scope is one exchange that forces the gap into the open:

> Building: guests can cancel up to 24 hours before arrival.
> Not building: refunds. Cancelling marks it cancelled; money is separate.
> Assuming: the 24-hour window is the same for every property.

Three lines. If the assumption is wrong, you find out now for the price of one
sentence. It is the highest-return thirty seconds in the whole loop.

---

## Why the plan is a file, not a conversation

Three reasons, and the third is the one people underestimate.

1. **You can approve a file.** You cannot approve a chat message you skimmed.
2. **It survives.** Long sessions get compacted; conversation is lost.
   The plan on disk is what the agent returns to when it loses the thread.
3. **It records why.** In eight months, when someone asks why the code looks
   like this, the answer is a file rather than a chat log nobody kept.

The approval between planning and building is the cheapest moment in the
project. Before it, a wrong direction costs a sentence. After it, it costs a
branch, a review and a rollback.

---

## Why one branch per piece of work

A branch is a parallel copy of the project that only this work is writing in.
The working version keeps working the whole time.

That means a wrong direction has a cost of zero: delete the branch. Without
branches, every experiment is performed on the thing people are using.

---

## Why the checks decide, not your laptop

Your machine has your cache, your installed packages, and an environment
variable you set in March and forgot. It is the one computer where the software
is most likely to work by accident.

CI runs on a clean machine every time. Green there means: **it works somewhere
that is not yours.** That is a genuinely different claim, and it is the only
one worth making.

---

## Why a green test is not enough

The most common failure in agent-written tests is a test that cannot fail. It
asserts nothing, or it mocks away the thing it is supposed to check, or it
verifies a value it set itself. It reports success forever, including through
the bug you most needed to catch.

So the loop requires a **negative control**: break the thing on purpose, watch
the test go red, put it back.

```
Removed the 24-hour check → "rejects late cancellation" failed → restored.
```

Thirty seconds. It is the difference between a test suite and a wall of green
ticks, and it is the single most useful sentence in a pull request.

---

## Why someone else merges

The pull request exists to create a moment where a second pair of eyes is
*structurally* required, rather than depending on someone remembering to ask.

An agent approving its own work removes the only mechanism. So: the agent opens
the pull request and reports what it did and — importantly — what it did not
cover. A human decides.

If you are working alone, you are that human. Read the evidence, click through
the change, then merge. It takes two minutes and it is the two minutes that
catch "this is not what I meant".

---

## What the loop does not do

It does not make the agent smarter, and it does not prevent bugs. It changes
**when you find out**:

| Without the loop | With it |
|---|---|
| Wrong product, discovered in week three | Wrong charter, discovered in minute fifteen |
| Wrong approach, discovered at review | Wrong plan, discovered before any code |
| Broken build, discovered by a user | Red check, discovered before merge |
| Untested code that reports green | Negative control, before the pull request |
| Data exposed, discovered by whoever found it | Permission tested from the wrong side |

Every row moves a discovery earlier, where it is cheap. That is the whole
mechanism.

---

## When to skip it

Genuinely fine to skip the plan for: a typo, a colour, a one-line fix with an
obvious cause, a change entirely inside documentation, or pure investigation
where nothing is edited.

Not fine to skip for: anything touching the database, permissions, money, or
other people's data — no matter how small it looks. Small changes cause most
outages, precisely because they skip the loop.

The dial for saying how careful to be: [dials.md](dials.md).

---

## Related

- [Effort and gates](dials.md) — how deep each pass of the loop goes
- [The first hour](first-hour.md) — the loop, walked through end to end
- [The ship skill](../skills/ship/SKILL.md) — the version the agent reads
