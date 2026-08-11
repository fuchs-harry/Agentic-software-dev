# Anatomy of a plan node

A plan node is a folder, not a file:

```
docs/plans/<slug>/
├── README.md     the plan   — written for the human who approves it
└── brief.md      the brief  — written for whoever builds it (Phase 2)
```

`<slug>` is short, lowercase, hyphenated, and describes the *outcome*:
`guest-can-cancel-booking`, not `fix-stuff` and not `sprint-3`.

Every node is listed in `docs/plans/README.md`. A plan nobody can find is a
plan nobody approved.

---

## The sections, and what each is really for

### Status

One line at the top, and it is maintained, not written once:

```
Status: draft | awaiting approval | approved | in progress | shipped (#42) | abandoned
```

`abandoned` is a real outcome. Delete a plan and you delete the reason it was a
bad idea, and someone proposes it again in four months.

### Goal · Non-goal

The goal is **one sentence a non-technical person could verify by clicking**.
"Guests can cancel a booking up to 24 hours before arrival and see it disappear
from their list."

Not: "Implement cancellation logic." That is a task, not a goal — nobody can
tell you whether it is done.

The non-goals matter more than they look. They are where scope creep gets
stopped in writing, before it costs anything. Name the two or three nearest
things you are *not* doing — the ones a reasonable person would assume are
included.

> "Refunds are not in this. Cancellation marks the booking cancelled; money
> movement is a separate node."

### Context

What this rests on. Links, not summaries: the decision record, the existing
file, the issue, the earlier plan this continues. If the work depends on a
decision that is still *proposed* rather than settled, say so here explicitly —
a proposal may carry weight, but visibly, not disguised as settled fact.

### Preconditions

What must be true before the first commit. This is the section that saves
whole afternoons, and the one most often left empty.

Typical real preconditions:

- a decision that is still open and blocks a task here
- a migration that must land first
- access, an account, an API key that does not exist yet
- another plan node that has to ship before this one can start

**A node with an unmet precondition does not enter Phase 2.** That rule is the
entire value of the section.

### Tasks

Each task is **one commit** with **one acceptance criterion**. Write them so
that failure is visible:

```markdown
1. Add `cancelled_at` to the bookings table (migration + rollback)
   ✔ done when: the migration applies to a fresh database and reverts cleanly

2. Cancel endpoint rejects bookings inside the 24h window
   ✔ done when: a test posts a cancellation 2h before arrival and gets 409

3. Booking list hides cancelled bookings
   ✔ done when: cancelling one in the UI removes it without a page reload
```

If a task's acceptance criterion is "it works", the task is not finished being
thought about. Ask: *what would I click, run or query to see this fail?*

### Verification

How the whole thing is **proven**, not inspected. Distinguish:

| Not verification | Verification |
|---|---|
| "looks right" | a test that fails without the change |
| "I clicked through it" | a written click-path with the expected result at each step |
| "no errors in the console" | the error case triggered on purpose, handled visibly |

At `deep` and `max`, verification also names the **negative control**: the exact
thing you will break to confirm the test can actually go red. See
[`testing-and-ci`](../../testing-and-ci/SKILL.md).

### Rollback

What happens if this is wrong once it is live. Three levels, be honest about
which one applies:

1. **Revert-safe** — one `git revert`, nothing else. Most UI work.
2. **Revert plus a step** — revert, then re-run something, or flip a flag off.
3. **Not revertible** — data was changed, deleted or migrated. Then this section
   must contain the *forward* fix, because there is no back. Anything in this
   category forces `gates: strict` regardless of the effort dial.

### Open

Questions that are genuinely unresolved, each with an owner and what unblocks
it. An open question with no owner is a wish.

Open questions do **not** get answered quietly in code. If a task needs an
answer that is not there, that is a precondition, not an improvisation.

---

## Two failure modes

**Too coarse.** "Build the booking system." Not approvable — a human cannot tell
what they are agreeing to — and not verifiable. Split until each node is one
pull request of roughly 400 lines or less.

**Too fine.** A node per file. The overhead exceeds the work, and the plans stop
being read, which is worse than not having them. A node is a *unit of value*,
not a unit of typing.

The test for both: **could one person approve this in two minutes, and could a
different person tell afterwards whether it was delivered?**

---

## Plans written after the fact

Sometimes code exists first — usually because a question sounded like an
instruction. Do not keep building and do not throw it away. Write the node as it
should have looked, label it honestly, and get approval before continuing:

```
Status: written retroactively on 2026-08-11, covers commits abc1234..def5678
```

A retroactive plan is honest. A missing one means the reason for the change
exists only in a chat log that nobody will ever read again.

Full procedure: [`recovery.md`](recovery.md).
