---
description: Open the pull request once CI is green — with evidence, not claims
argument-hint: "[optional: PR title]"
---

Open the pull request.

Title hint: **$ARGUMENTS**

Load the `ship` skill.

**Refuse if:**
- CI is not green → say which job is red and stop
- the plan node's acceptance criteria are not all demonstrated → run `/check`
- the diff is over ~400 lines → propose a split (`pr-orchestration`) rather than
  opening it anyway

Then:

1. **Write the body** from `skills/ship/assets/pr-body.md`. The Evidence
   section must contain observations, not claims — including the negative
   control result. "Tested locally" is not evidence.

2. **Check the diff for things that should not ship**: secrets, keys, personal
   data, debug output, commented-out code, `TODO` markers nobody will read,
   files you did not mean to add.

3. **Update the docs the change made wrong** — in this pull request, not later.
   Then set the plan node to `Status: shipped` once the number exists.

4. **Open it**: `gh pr create --base main --fill --body-file <body>`.

5. **Stop.** This is gate G3. Report the number, the evidence summary, and —
   explicitly — what is *not* covered. **Do not merge.** A human merges.

If the work needs a deploy afterwards, that is a separate gate (G4) and a
separate conversation. Do not deploy because the PR merged.
