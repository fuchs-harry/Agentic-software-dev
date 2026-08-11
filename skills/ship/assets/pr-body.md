## What this does

<One or two sentences, in the words the person who asked for it would use.>

Plan: `docs/plans/<slug>/README.md`
Closes #<issue>

## Why

<The reason, not the diff. What was wrong or missing before.>

## Evidence

How I know it works — not "tested locally":

- [ ] `<test command>` — <N> passing, including `<the test that covers this change>`
- [ ] Negative control: broke `<X>` on purpose → `<test>` failed as expected → reverted
- [ ] Click path: <step> → <observed result>
- [ ] Error case: <what I did wrong on purpose> → <what the user sees>

<Screenshot or log output for anything visual.>

## Risk and rollback

Blast radius: <what breaks if this is wrong>
Rollback: revert-safe / revert-plus-a-step / not revertible — <if not, the forward fix>

## Checked before requesting review

- [ ] CI green — all jobs
- [ ] No secrets, keys or personal data in the diff, the commits or the logs
- [ ] Under ~400 changed lines (if not: why this could not be split)
- [ ] Docs and plan node updated
- [ ] Conventional Commits, no `Co-Authored-By` trailer
