---
name: testing-and-ci
description: >-
  How to prove software works instead of believing it does: what is worth testing and what
  is not, the negative control that separates a real test from a green decoration, and a
  CI pipeline that is the gate rather than a badge. Use whenever writing or changing tests,
  setting up GitHub Actions, or when asked "is this tested", "why is CI red", "add tests
  for this", "make sure it works". Also load before claiming a change is verified, before
  opening a pull request, and whenever a test is about to be skipped, deleted or its
  expectation changed to make it pass.
---

# Proving it works

Two claims that sound alike and are not:

> "I tested it." — I ran it and nothing looked wrong.
> "It is proven." — there is a check that **fails** when this breaks.

Only the second survives you forgetting about it. A test suite is not a quality
ritual; it is the mechanism that lets someone change this code in a year
without reading all of it first.

```
1 · WRITE THE TEST      it must fail before the fix exists
2 · MAKE IT PASS        the smallest change that does it
3 · NEGATIVE CONTROL    break the thing on purpose — watch the test go red
4 · CI IS THE GATE      green on a machine that is not yours
```

Step 3 is the one everyone skips, and it is the one that makes the other three
mean anything.

---

## The negative control

**A green test that cannot go red proves nothing.**

This is not theoretical. Tests that assert nothing, mock away the thing under
test, or check a value they themselves just set are extremely common — and they
are worse than no test, because they *report* safety.

So: after a test passes, break the code on purpose and confirm the test fails.

```
1. Test is green.
2. Delete the line that makes it work — or invert the condition, or return null.
3. Run the test. It MUST fail. If it stays green, the test is decoration.
4. Put the code back. Test is green again.
```

Thirty seconds. It is the difference between a test suite and a wall of green
ticks. Record it in the pull request: *"removed the 24h check → the test failed
→ restored."*

Full method, the four ways tests fake it, and what to do when the negative
control is hard to perform: **[`references/negative-control.md`](references/negative-control.md)**.

---

## What is worth testing

Testing everything is how test suites become a maintenance tax people
eventually rip out. Test what would actually hurt.

| Test it | Do not bother |
|---|---|
| Rules with an edge — "up to 24 hours before" | That a button renders |
| Anything about money or quantities | Styling, colours, layout |
| **Who is allowed to see or do what** | Third-party libraries — they have their own tests |
| Things that already broke once | Getters, setters, pass-throughs |
| Data going in and coming back out | Exact wording of a label |
| The unhappy path — wrong input, expired session, double click | Whether a framework works |

Two rules that decide most cases:

1. **Every bug gets a test before it gets a fix.** Otherwise it comes back, and
   nobody notices until a user finds it again.
2. **Permissions get tested from the wrong side.** Not "the owner can see their
   booking" — that passes even when *everyone* can see it. Test that **someone
   else cannot**. Almost every data-exposure bug passes the positive test.

More, including the three-layer split and how much of each:
**[`references/what-to-test.md`](references/what-to-test.md)**.

---

## The three kinds, and roughly how many

| Kind | Question it answers | Speed | How many |
|---|---|---|---|
| **Unit** | is this rule right? | milliseconds | most of them |
| **Integration** | do these pieces talk correctly, against a real database? | seconds | the important paths |
| **End-to-end** | can a person actually do the thing in a browser? | tens of seconds | a handful — the moments from the charter |

The shape matters: many fast tests, few slow ones. Inverted — a suite of slow
browser tests — takes twenty minutes, is flaky, and people stop running it,
which returns you to having no tests while paying for them.

---

## CI is the gate, not a badge

```yaml
on: [push, pull_request]
```

Runs on a clean machine, with none of your cache, your `node_modules`, or your
environment variables. That is the entire point: green in CI means it works
somewhere that is not your laptop.

A minimal, real pipeline — lint, typecheck, unit, build, and browser tests only
where they earn their time: [`assets/ci-workflow.yml`](assets/ci-workflow.yml).
Structure, caching, required checks and branch protection:
[`references/ci-pipeline.md`](references/ci-pipeline.md).

Set up **branch protection** on `main` early: no direct pushes, checks must
pass before merge. It converts the whole loop from a rule people remember into
a rule the platform enforces.

---

## When a test fails

In this order, and the order is the point:

1. **Read the actual error.** Not the summary — the real message and the line.
2. **Decide which is wrong: the test or the code.** Genuinely ask. Sometimes the
   test encoded a misunderstanding.
3. **If the code is wrong** — fix the code.
4. **If the test is wrong** — fix the test, and say why in the commit message.
   "Adjusted expectation" with no reason is indistinguishable from cheating.

What is never an option:

- deleting the test to get green
- `.skip` "for now" — there is no date attached to "now"
- changing the expected value to whatever the code currently produces
- retrying until it passes

That last one deserves its own line: **a test that passes 80% of the time is
worse than no test.** It teaches everyone to ignore red. Either fix the
flakiness or delete the test deliberately, in writing, with a reason.

---

## Tests and the effort dial

From [`ship`](../ship/SKILL.md):

| effort | testing expectation |
|---|---|
| `quick` | the existing suite still passes |
| `standard` | a test per acceptance criterion, negative control on the main one |
| `deep` | plus the unhappy paths, plus permissions tested from the wrong side |
| `max` | plus: someone actively tries to break it and writes down what they tried |

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Tests written after the code, from the code | They encode what it does, not what it should do |
| Mocking the thing under test | The test passes, the code was never run |
| One test asserting fifteen things | When it fails you learn nothing about which |
| `expect(true).toBe(true)` | Green, meaningless, and it is in more suites than you would believe |
| Skipping the negative control | The whole suite becomes unverified |
| Snapshot tests everywhere | They fail on every change and get blanket-updated without reading |
| Making CI green by disabling a check | The check was the only thing working |

---

## Done means

- [ ] Every acceptance criterion in the plan has a test
- [ ] Each new test was **watched failing** before the code made it pass
- [ ] Negative control performed and written into the pull request
- [ ] Permission rules tested from the wrong side, not just the right one
- [ ] CI green on GitHub — every job
- [ ] No test skipped, deleted or weakened to get there
