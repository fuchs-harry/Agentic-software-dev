# Where to put the cut

Four lines you can cut along. They are not equally good, and the order below is
the order to try them in.

---

## 1 · Vertical slice — prefer this

One small capability, all the way through, working.

```
PR 1: one property, hardcoded, form saves a booking, list shows it
PR 2: multiple properties, chosen from a dropdown
PR 3: cancellation
PR 4: the 24-hour rule on cancellation
```

Each one is demonstrable. Each one can be *disproven* — someone can click it
and say "no, not like that" — which is the entire value.

The first slice will be ugly: hardcoded values, no styling, no edge cases. That
is correct. Ugly-but-real beats complete-but-invisible, because ugly-but-real
generates feedback.

---

## 2 · Foundation first, deliberately

Sometimes two slices genuinely share something that must exist first: a table,
a shared type, an auth helper.

```
PR 1: add the bookings table + policies   (nothing uses it yet)
PR 2: create a booking                    (uses it)
PR 3: cancel a booking                    (uses it)
```

Two conditions make this legitimate rather than a horizontal split in disguise:

- **It is backwards compatible.** Landing it changes nothing observable. Add
  columns, do not rename them. Add functions, do not change signatures.
- **It is genuinely shared.** Two or more slices need it. A "foundation" with
  exactly one consumer is just the first half of that consumer.

---

## 3 · Behaviour, then polish

```
PR 1: it works — plain, unstyled, correct
PR 2: it looks right
```

Excellent for review, because the two require completely different attention.
Nobody can review logic and visual design in the same pass; the eye goes to the
colours and the off-by-one survives.

---

## 4 · Refactor, then change — never both

This one is a rule, not a preference.

```
PR 1: move the code, rename things — behaviour identical, tests unchanged
PR 2: change the behaviour — small, readable diff
```

A pull request that both moves 600 lines and changes what they do is
unreviewable. The reviewer cannot tell which changes were the move and which
were the *change*, so they read neither. This is how behaviour changes ship
unnoticed inside "just a refactor".

If PR 1 needs a single test to change, it was not a pure refactor. Stop and
look at what you actually did.

---

## The horizontal split, and why to avoid it

```
PR 1: all the database tables
PR 2: all the API endpoints
PR 3: all the screens
```

It feels organised. It fails for three reasons:

1. **Nothing works until PR 3.** No feedback for however long that takes.
2. **PR 1 and 2 cannot be tested meaningfully.** You can test that a table
   exists. You cannot test that it is the right table.
3. **A wrong design is discovered last**, when it is expensive — after both
   the schema and the endpoints are built on it.

The one time it is right: when the horizontal piece is genuinely shared
infrastructure, backwards compatible, and lands as case 2 above.

---

## Splitting a branch that already grew

You are at 700 lines and it keeps growing. Do not push through.

```bash
git switch feat/big-thing
git log --oneline                 # find the last commit that was coherent on its own

# Branch off at that point — that is PR 1
git switch -c feat/part-one <sha-of-that-commit>
git push -u origin feat/part-one
gh pr create --base main

# The rest stays where it is, retargeted at part one
git switch feat/big-thing
gh pr create --base feat/part-one
```

If the work is not cleanly divided by commit, use the working tree instead:
commit the coherent half on a new branch, `git stash` the rest, and bring it
back on the second branch. Slower, but it does not require the history to have
been tidy in advance.

The lesson is upstream, and worth writing into the plan node: the plan cut too
coarsely. Note it there so the next node is cut smaller.

---

## What must never be split apart

Some things break if separated, and no size limit justifies it:

| Keep together | Why |
|---|---|
| A migration and the code that needs it | Between the two merges, `main` is broken |
| A permission change and its test | Merging the change alone ships an unverified permission |
| A rename and every call site | A half-renamed codebase does not compile |
| A bug fix and its regression test | The fix without the test invites the bug back |

If keeping them together exceeds 400 lines, that is fine. **The size limit is a
heuristic; a broken `main` is a fact.** Say in the pull request why it could
not be split.
