## What this does

<One or two sentences, in the words the person who asked for it would use.>

Plan: `docs/plans/<slug>/README.md`
Closes #<issue>

## Why

<The reason, not the diff. What was wrong or missing before.>

## Evidence

How I know it works — "tested locally" is a claim, not evidence:

- [ ] `<test command>` — <N> passing, including `<the test covering this change>`
- [ ] **Negative control**: broke `<X>` on purpose → `<test>` failed as expected → restored
- [ ] Click path: <step> → <observed result>
- [ ] Error case: <what I did wrong on purpose> → <what the user sees>
- [ ] Permissions (if touched): a different user gets nothing; anonymous gets nothing

<Screenshot or log output for anything visual.>

## Not covered

<What this deliberately does not handle, and where it is tracked. A pull
request that only reports success is an announcement, not a review request.>

## Risk and rollback

Blast radius: <what breaks if this is wrong>
Rollback: revert-safe / revert-plus-a-step / not revertible
<If not revertible: the forward fix.>

## Checked

- [ ] CI green — every job
- [ ] No secrets, keys or personal data in the diff, the commits or the logs
- [ ] Under ~400 changed lines (if not: why it could not be split)
- [ ] Docs and the plan node updated in this PR
- [ ] Conventional Commits, no `Co-Authored-By` trailer
- [ ] Migrations (if any) have a rollback note and ship with the code that needs them
