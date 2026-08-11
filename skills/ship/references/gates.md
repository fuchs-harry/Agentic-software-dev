# Human-in-the-loop gates

A gate is a place where the agent **stops, shows something, and waits**. Not a
place where it asks permission to continue thinking.

The whole point: put the human where their judgement is worth the interruption,
and nowhere else. An agent that asks about everything is not being careful — it
has pushed its job onto someone who has less context than it does.

---

## The five gates

| | Gate | Fires at | The question the human is actually answering |
|---|---|---|---|
| **G0** | Scope | after Phase 0, before planning | "Is this the thing you want?" |
| **G1** | Plan | after Phase 1, before any code | "Is this the right way to build it?" |
| **G2** | Point of no return | before anything irreversible | "Do it — knowing it cannot be undone?" |
| **G3** | Ship | before the pull request / before merge | "Is the evidence enough?" |
| **G4** | Live | before real users see it | "Go?" |

Which of them fire depends on the `gates` dial:

| dial | G0 | G1 | G2 | G3 | G4 |
|---|---|---|---|---|---|
| `minimal` | – | – | always¹ | ✔ | – |
| `standard` | if the ask was vague | ✔ | always¹ | ✔ | – |
| `strict` | ✔ | ✔ | ✔ | ✔ | ✔ |

¹ **G2 is not optional at any setting.** Irreversibility is not a matter of how
careful the caller asked you to be.

---

## G2 — what counts as a point of no return

Stop before any of these, every time, regardless of the dial:

- deleting or overwriting data that was not created in this session
- a database migration that drops or rewrites a column, or that cannot be reverted
- rotating, revoking or replacing a credential
- anything that sends something outward: an email, a message, a webhook to a
  third party, a published package, a post
- force-pushing, rewriting history, deleting a branch that exists on the remote
- spending money
- turning off a check, a test, or a security control

The pattern: **can I undo this in the next five minutes without anyone noticing?**
If no, that is G2.

---

## What to actually show at each gate

The person on the other side may not read code. A wall of diff is not a gate,
it is a dodge.

### G0 · Scope

```
Building: guests can cancel a booking up to 24h before arrival.
Not building: refunds — cancelling marks it cancelled, money is separate.
Assuming: the 24h window is fixed, not per-property. Say if that's wrong.

Look right?
```

### G1 · Plan

```
Plan: docs/plans/guest-can-cancel-booking/README.md

Three steps:
  1. Add a "cancelled" marker to bookings (reversible)
  2. Block cancelling inside 24h, with a clear message
  3. Hide cancelled bookings from the guest's list

Risk: step 1 changes the database. Reversible, but I'll stop before running it.
Effort: deep — this touches who can change a booking.

OK to start?
```

### G2 · Point of no return

State the action, the blast radius, and the way back — in that order:

```
About to run a migration on the live database.
  What it does: adds a "cancelled_at" column to bookings. Nothing is deleted.
  If it goes wrong: the rollback drops the column; existing bookings are untouched.
  Backup: taken at 14:02, restore takes ~5 minutes.

Run it?
```

If there is no way back, say that first, in the first line, not the third.

### G3 · Ship

```
Ready for review: PR #42

Evidence:
  - 14 tests pass, including 3 new ones for the 24h window
  - Negative control: removed the window check → the test failed → put it back
  - Clicked: cancel a booking 3 days out → gone from the list
  - Clicked: cancel 2h out → "too late to cancel online" message

Not covered: what happens if the host cancels at the same second. Noted as open.

Merge is yours.
```

Say what is **not** covered. A gate where the agent only reports success is not
a decision point, it is an announcement.

### G4 · Live

```
Deploying to real users. Currently live: version from Tuesday.
  Rolling back = redeploy the previous version, ~2 minutes, no data affected.
  Watch after: the booking list page and the error log for 10 minutes.

Go?
```

---

## How to wait

- **Ask once, specifically.** One question with a real answer, not "let me know
  if you have any thoughts".
- **Offer the default.** "I'd go with A. B is safer but takes two more days."
  Someone who does not code cannot pick between options presented as equals.
- **Do not bundle.** Four questions in one message get one answer, usually to
  the last one.
- **Do not proceed on silence.** Not answering is not approval. Do the parts
  that do not depend on the answer, and say what is parked.

---

## What is *not* a gate

Asking about these is noise, and it erodes the gates that matter:

| Not a gate | Just decide |
|---|---|
| "Should I name it `bookingId` or `booking_id`?" | Match the surrounding code |
| "Should I write a test for this?" | Yes |
| "Shall I commit now?" | Yes, per task |
| "Is it okay if I read the config file?" | Yes |
| "Do you want me to fix the typo I found?" | Fix it, mention it in one line |
| "Should I continue?" | Continue |

The rule: **if two reasonable people would make the same call, make it.** Save
the interruption for where they would disagree.

---

## When a gate is skipped

Sometimes a human says "don't ask me, just go". That is a legitimate choice and
you take it — with two exceptions that survive any instruction:

1. **G2 still fires.** You can move it earlier ("here's everything irreversible
   in this run, approve them all now") but you cannot delete it.
2. **The waiver gets written down.** In the pull request: *"G1 waived on
   request; built directly from the brief."* So that six weeks later, when
   something is wrong, nobody has to reconstruct who decided what.
