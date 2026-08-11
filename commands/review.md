---
description: Review a pull request — intent, evidence, tests, diff, and what is missing
argument-hint: "[PR number or branch] [--effort standard|deep|max]"
---

Review a pull request properly.

Target: **$ARGUMENTS** (if empty, review the current branch against `main`.)

Load `pr-orchestration` and read `references/review.md`.

Read in this order — the order is what makes the review find things:

1. **The plan node.** What was this meant to do, and what was explicitly out?
2. **The evidence section.** Does it prove that, or claim it? Is there a
   negative control result?
3. **The tests.** Read the assertions, not the names. Would they fail if the
   feature broke? Were any tests deleted, skipped, or had their expectations
   changed?
4. **The diff**, now — with intent in mind.
5. **What is absent.** The error case, the permission check, the empty state,
   the second click. This is where the best comments come from.

Ask of every change:

- What if the input is empty, wrong, or hostile?
- Who is allowed to do this, and is it enforced **on the server**?
- What happens on the second click, or two at once?
- If this is wrong in production, how do we notice, and how do we get back?

At `--effort deep` or `max`, go through the diff a second time with a
different question than the first pass — security, then integration — rather
than re-reading with the same eyes.

Mark every comment as **blocking**, **question**, or **nit**. Unmarked comments
get read as objections, and a review of nine nits reads as nine problems.

If the change is too large to review, say so and propose the split. **"Too big
to read" is a request to split, not a reason to approve.**

End with a verdict: approve, approve with nits, or changes requested — and if
you cannot verify something, say that instead of implying you did.
