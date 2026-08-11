---
description: Prove the change works — acceptance criteria, negative control, CI
argument-hint: "[optional: what to focus on]"
---

Prove the current change actually works. Not "looks right" — proven.

Focus: **$ARGUMENTS** (if empty, verify everything in the current branch's plan
node.)

Load `testing-and-ci`.

1. **Every acceptance criterion, one at a time.** From the plan node. For each:
   what you ran or clicked, and what you observed. Not a checkmark — the
   observation.

2. **The negative control.** For at least the central test: break the thing on
   purpose, run the test, confirm it goes **red**, restore the code, confirm
   green again. Report it as:
   `removed <X> → <test name> failed as expected → restored`.
   If the test stayed green, the test is decoration — fix the test and say so.

3. **The wrong side.** If this touches permissions or ownership: verify that a
   *different* user gets nothing, and that an anonymous request gets nothing.
   The positive test passes even when everything is world-readable.

4. **The unhappy path.** Empty input, wrong input, the second click, the
   expired session, the failed network call. Report what the user sees.

5. **CI.** `gh run watch`. Green means every job, not the fast ones. If red,
   triage first: is `main` also red? Then it is not yours.

Report honestly. If something is unverified, say it is unverified rather than
implying coverage that does not exist. An unverified item named is useful; an
unverified item hidden inside a green summary is a liability.
