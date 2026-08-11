# The first hour

A complete walkthrough, with the words you actually type. The example is a
booking tool for someone who rents out two holiday flats — substitute your own
idea; the shape does not change.

Nothing here requires you to read code. It requires you to answer questions
honestly and to say no when something is not what you meant.

---

## Minute 0 · Say what you want

```
/start a tool so I can see which nights my two holiday flats are free
       and block one without double-booking
```

Claude will not start building. It will ask questions — one at a time. That is
correct, and it is the most valuable part of the hour.

Expect roughly these:

> Who is this for — you alone, or someone else too?
> What do you use today to keep track?
> When it works, what has changed for you?
> Should it handle payments?
> Does anyone log in?
> Will you use it on your phone?

**Answer specifically.** "A spreadsheet, and I check WhatsApp for requests" is
worth ten times more than "nothing really". The specific answer tells Claude
what "better" has to beat.

**Say no clearly.** Every "no, not that" is a week you do not spend. If you are
unsure, say you are unsure — an unknown that is written down is fine; an
unknown that is assumed is not.

---

## Minute 15 · The charter

Claude writes one page and reads it back:

```
For whom:        you, managing two flats, mostly from your phone
Instead of what: a spreadsheet plus WhatsApp
The moment:      seeing at a glance which nights are free, blocking one in two taps
Not this:        payments, guest logins, more than five flats
Worked means:    no double booking for a whole season, no paper calendar
```

**This is the moment to disagree.** It is much cheaper here than in three
weeks. If a line is wrong, say which and why. If the "moment" is not actually
the thing you care about, say so — that single line steers everything after it.

You do not need to understand any technology to judge this page. That is the
point of writing it in your words.

When you say yes, Claude records a stack decision and builds the repository
skeleton: the folders, the automatic checks, a README. Then it pushes and
**waits for the checks to go green before building anything**. Watch that
happen — from now on, a red mark means something real.

---

## Minute 30 · The first slice

Claude proposes the thinnest thing worth looking at:

> One flat, hardcoded. A form to block nights. A list showing what is blocked.
> No accounts, no second flat, no styling.
> Effort: standard · Gates: standard

It will look disappointingly small. That is deliberate — it is the fastest way
to find out whether the idea works at all, and it is cheap to throw away.

Then it writes a plan and **stops**:

```
Plan: docs/plans/block-nights/README.md

Three steps:
  1. Somewhere to store blocked nights
  2. A form that blocks a range of nights
  3. A list showing what is blocked, newest first

Risk: none — nothing is live yet, and one revert undoes all of it.

OK to start?
```

Read the three steps. If step 2 is not what you pictured, say so **now**. After
you say yes, changing it costs a branch instead of a sentence.

---

## Minute 40 · It builds

Claude works step by step, committing each one. You will see it write tests and
run them.

Somewhere in here it will say something like:

> Negative control: removed the overlap check → the "rejects overlapping
> nights" test failed as expected → restored.

That sentence is the important one. It means the test can actually fail — that
it is checking something rather than decorating the output. A green test that
cannot go red proves nothing, and this is how you know which kind you have.

Then it pushes, and the automatic checks run on GitHub. Green means it works on
a machine that is not yours.

---

## Minute 55 · Look at it

Claude opens a pull request — "here is the change, please look before it joins
the working version" — with evidence:

```
Ready for review: PR #1

  - 6 tests pass, including 2 for overlapping nights
  - Negative control done (above)
  - Clicked: blocked 12–14 August → appears in the list
  - Clicked: blocked 13 August again → "those nights are already blocked"

Not covered: what happens across a month boundary. Noted as open.

Merge is yours.
```

**You merge.** Not Claude. That is the last checkpoint, and it is deliberately
yours.

Then click through it yourself. Not to check the code — to check whether it is
the thing you asked for. This is where you find out that "block nights" should
really have been "block nights and add a note about who".

That discovery, forty-five minutes in, is the entire point of the hour.

---

## What you learned to do

Four things, and they are the whole job:

1. **Answer the interview honestly**, especially the "not this" questions
2. **Read the charter and the plan, and disagree while it is cheap**
3. **Look for the negative control** — it is the difference between tested and
   proven
4. **Merge yourself, then click through it** as a user, not a reviewer

---

## After the first hour

```
/plan add a second flat
```

Same loop, every time. It gets faster because you stop needing to think about
the shape of it, not because any step gets skipped.

When something touches logins, money, or other people's data, Claude will
raise the effort and stop more often — automatically, without being asked. That
is [dials.md](dials.md), and you can override it, but it will tell you what you
are overriding.

---

## Things that will happen, and what to do

| | |
|---|---|
| **The checks go red** | Normal. Claude fixes it as its own step. It cost you nothing |
| **Claude asks something you do not understand** | Say "explain that in plain terms". It will |
| **It built something you did not mean** | Say so. The plan is a file — the fix is to correct the plan, not to argue with the code |
| **It says "this is too big, I want to split it"** | Say yes. It is right |
| **It stops before something irreversible** | Read what it says will be lost. Then decide. This is the gate working |
| **You want to go faster** | Say so. It will tell you which check it will not skip, and why |
