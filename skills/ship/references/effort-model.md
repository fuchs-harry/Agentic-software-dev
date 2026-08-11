# The effort model

Two dials, set per unit of work, stated out loud before Phase 1 begins:

```
effort: quick | standard | deep | max      how hard the agent works before believing itself
gates:  minimal | standard | strict        how often it stops and waits for a person
```

They are independent. `quick` + `strict` is a real combination — a tiny change
to a live payment page. So is `deep` + `minimal` — a gnarly refactor in a
sandbox nobody can reach.

---

## What each effort level actually costs you

### `quick`

- Plan: one paragraph in the conversation, no folder
- Build: one pass
- Verify: the existing test suite passes
- Review: none
- Ends when: tests are green

For work where being wrong is visible immediately and costs one revert. Copy
changes, a colour, a label, a single-file fix with an obvious cause.

**Not for**: anything you cannot check by looking at it.

### `standard`

- Plan: a full plan node with tasks and acceptance criteria
- Build: one or two passes — build, then re-read the diff against the plan
- Verify: tests pass **and** each acceptance criterion is checked off individually
- Review: one pass, asking "does this do what the plan said, and nothing else?"
- Ends when: every acceptance criterion is demonstrated, not assumed

The default. A feature, a screen, an endpoint, a bug with a known cause.

### `deep`

- Plan: plan node plus the alternatives you rejected and why
- Build: two or three passes — the second is allowed to throw away the first
- Verify: three passes, each with a **different question**:
  1. *Correctness* — does it do the right thing on the happy path?
  2. *Adversarial* — what input, order or timing breaks it? Try to make it fail.
  3. *Integration* — what else in the system now behaves differently?
- Review: three independent looks, each with its own lens (correctness,
  security, "does this actually reproduce"), not three identical re-reads
- Ends when: all three verification passes come back clean **in the same run**.
  A fix in pass 3 invalidates passes 1 and 2 — run them again.

For auth, permissions, money, schema changes, anything touching other people's
data, and anything you cannot easily undo.

### `max`

- Plan: plan node plus a written trade-off record — what was considered, what
  was chosen, what that choice costs
- Build: iterate until **two consecutive rounds surface nothing new**. Counting
  rounds ("I'll do three passes") misses the tail; going until dry does not.
- Verify: a panel — several independent checks, each told to *refute* the work
  rather than confirm it, and defaulting to "refuted" when unsure. The work
  survives on a majority.
- Review: five, and they vote
- Ends when: two dry rounds **and** the panel majority says it holds

For data migrations, security boundaries, the first deploy to real users, and
anything where the failure mode is "we cannot get the data back".

`max` is expensive. Using it on a button colour is not thoroughness, it is
theatre — and it trains the person you are working with to stop reading your
output.

---

## How loops terminate

The failure mode of an agent loop is not stopping too early. It is **not
stopping at all** — polishing, re-reading, finding one more nit.

| Level | Termination rule |
|---|---|
| `quick` | tests green |
| `standard` | every acceptance criterion demonstrated once |
| `deep` | three differently-aimed passes clean **in the same run** |
| `max` | two consecutive rounds find nothing new, and the panel majority holds |

Two hard stops that override all of the above:

1. **Nothing new in two rounds = done.** Even at `max`. If two full passes
   change nothing, further passes are not finding bugs, they are inventing work.
2. **Three failed attempts at the same problem = stop and ask.** Not a fourth
   attempt with a bigger prompt. Write down what you tried, what happened each
   time, and what you now think is actually wrong. This is a gate, not a defeat.

---

## Escalating mid-run

You will discover things. Escalate immediately and say so in one line:

> "Raising this to `deep` — the fix touches the session table, so it can affect
> logged-in users."

| Discovery | New floor |
|---|---|
| It turns out to touch auth, permissions or money | `deep` + `gates: strict` |
| A database change is needed after all | `deep`, and the migration must be reversible |
| The change is not revertible | `gates: strict` |
| The diff passed ~400 lines | stop, split it — see [`pr-orchestration`](../../pr-orchestration/SKILL.md) |
| Third failed attempt at the same thing | stop, hand it to a human |

**De-escalation is not symmetric.** "This was easier than I thought" is not a
reason to drop from `deep` to `standard`. The dial was set by blast radius, and
the blast radius has not changed. The only thing that lowers a dial is the
scope genuinely shrinking — and that is a plan change, so it goes past a human.

---

## Announcing the dial

One line, before Phase 1, in plain language. Not a table, not a justification
essay:

> "Setting this to **deep / strict**: it changes who can see a booking, so
> getting it wrong exposes other people's data. I'll stop for your OK after
> the plan and again before the migration runs."

The person you are working with needs to know two things: **how long this will
take** and **when you will interrupt them**. Both are in that sentence.

---

## When the user sets the dial themselves

They may say "just do it quickly" or "be really thorough". Take it — with one
exception: a user's `quick` does not override the blast-radius floor. If they
ask for quick on something that can expose data, say so once, plainly, and
build at the floor:

> "I'll keep this small, but I'm not skipping the review step — this one
> controls who can read the bookings."

If they hear that and still say skip it, that is their call. Do it, and note in
the pull request that the review step was waived on request.
