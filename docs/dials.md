---
title: Effort and gates
type: reference
status: current
updated: 2026-08-11
tags: [guide, method]
---

# Effort and gates

Two dials. They are how you say *how careful to be* and *how often to be
interrupted*, without having to specify either as a procedure.

```
effort: quick | standard | deep | max        how hard it works before believing itself
gates:  minimal | standard | strict          how often it stops and asks you
```

They are independent. `quick` + `strict` is real — a tiny change on a live
payment page. So is `deep` + `minimal` — a difficult refactor in a sandbox
nobody can reach.

---

## Effort, in time you will actually feel

| | What happens | Feels like |
|---|---|---|
| `quick` | builds, runs the tests, done | minutes |
| `standard` | plan, build, then checks every acceptance criterion one by one | the default; most work |
| `deep` | plan with alternatives, may throw away the first attempt, then three checks that each ask a *different* question | noticeably longer, and it finds things |
| `max` | keeps going until two full rounds find nothing new; several independent checks that try to *disprove* the work and vote | for migrations, security, going live |

The `deep` detail that matters: the three checks are not three re-readings.
They are *correctness* ("does it work?"), *adversarial* ("what breaks it?") and
*integration* ("what else moved?"). Three passes with the same question is one
pass done three times.

`max` used on a button colour is not thoroughness. It is theatre, and it trains
you to stop reading the output.

---

## Gates — when you get interrupted

| | Stops at |
|---|---|
| `minimal` | before the pull request |
| `standard` | after the plan · before the pull request |
| `strict` | after the plan · before anything irreversible · before the pull request · before going live |

One gate fires at **every** setting, including `minimal`, and cannot be turned
off: **before anything irreversible.** Deleting data, dropping a database
column, rotating a key, sending a message to real people, spending money,
force-pushing.

The test is: *can this be undone in the next five minutes without anyone
noticing?* If no, you get asked. That is not configurable, because
irreversibility is not a matter of how fast you asked to go.

---

## You usually will not set them

Claude picks from **blast radius** and tells you in one sentence:

> "Setting this to deep / strict — it changes who can see a booking, so getting
> it wrong exposes other people's data. I'll stop for your OK after the plan
> and again before the migration runs."

The floors it applies without being asked:

| If the work… | Floor |
|---|---|
| can lose, expose or corrupt someone's data | `deep` + `strict` |
| touches money, login, or permissions | `deep` + `strict` |
| changes the shape of the database | `deep`, and reversible |
| goes to real users immediately | `strict`, whatever the effort |
| can be undone with one revert | `quick` or `standard` is fine |

---

## Overriding

You can say "just do it quickly". That is taken — with one exception.

If the work can expose data, Claude will say so once, plainly, and keep the
review step:

> "I'll keep this small, but I'm not skipping the permission check — this one
> controls who can read the bookings."

If you hear that and still say skip it, that is your call and it will be done —
and noted in the pull request as waived on request, so that in six weeks nobody
has to reconstruct who decided what.

---

## Escalating, and why it does not go back down

Claude will raise the dial mid-work when it discovers something:

> "Raising this to deep — the fix touches the session table, so it can affect
> people who are logged in."

It will not lower it. "This turned out easier than I thought" is not a reason:
ease is not blast radius, and the thing that made it `deep` has not changed.

The only thing that lowers a dial is the *scope* genuinely shrinking — and that
is a plan change, so it comes back to you.

---

## Worked examples

**"Change the button text from Submit to Block these nights"**
→ `quick` / `minimal`. One file, visible immediately, one revert undoes it.

**"Add a note field to bookings"**
→ `standard` / `standard`. New column, but additive and reversible.

**"Let a second person manage the same flats"**
→ `deep` / `strict`. This is a permissions change. Every existing query now has
a question attached to it, and getting it wrong shows one person another
person's data.

**"We need to merge the duplicate guest records"**
→ `max` / `strict`. Data is rewritten and there is no revert — only a forward
fix. Backup verified first, and a human says go.

**"Put it online for real customers"**
→ whatever effort the change needs, but `gates: strict` regardless. Going live
is its own gate.

---

## Saying it yourself

If you want to set them explicitly:

```
/plan add cancellation --effort deep --gates strict
```

Or just in words — "be really careful with this one", "this is throwaway, go
fast". Both work. The words are easier and they are what most people use.

---

## Related

- [The loop](the-loop.md) — what the dials are turning the depth of
- [The effort model](../skills/ship/references/effort-model.md) — the full model the agent reads
- [Glossary](glossary.md) — blast radius, gate, negative control
