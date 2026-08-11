---
description: Execute an approved plan on a branch, one commit per task
argument-hint: "[plan slug] [--effort quick|standard|deep|max] [--gates minimal|standard|strict]"
---

Build an approved plan.

Target: **$ARGUMENTS** (if empty, use the most recently approved plan node and
say which one you picked).

Load the `ship` skill, plus whichever domain skills the work needs:
`web-app`, `supabase-db`, `testing-and-ci`, `deployment`.

**Refuse to start if:**
- the plan node does not exist → run `/plan` instead
- its status is not `approved` → ask for approval first
- a precondition is unchecked → say which one, and stop

Then:

1. **Derive the brief.** `docs/plans/<slug>/brief.md` from
   `skills/ship/assets/brief-template.md`. Derived from the plan, not
   reinvented — if it drifts, the plan is wrong and you go back.

2. **Branch.** `git fetch origin && git switch -c feat/<slug> origin/main`.

3. **Task by task.** One commit per task, Conventional Commits, message says
   *why*. **Never a `Co-Authored-By` trailer.** After each task, demonstrate its
   acceptance criterion — do not assume it.

4. **Tests as you go**, not at the end. Watch each new test fail before the
   code makes it pass. Permissions get tested from the wrong side.

5. **Stop at every gate the dial requires.** G2 fires regardless of the dial:
   before anything irreversible — dropped columns, deleted data, rotated keys,
   outbound messages, force-pushes, spending money.

6. **Stop if it grows.** Past ~400 changed lines, or a third failed attempt at
   the same problem: stop, write down where you are, and ask. Do not push
   through.

7. **Local check** before pushing, then push and let CI decide.

Report at the end: what was built, what each acceptance criterion showed, what
you did not do, and what is still open.
