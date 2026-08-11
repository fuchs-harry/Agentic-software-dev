# The pipeline

CI exists for one reason: to run your checks on a machine that has none of your
assumptions on it. No cache, no `node_modules`, no environment variable you set
in March and forgot about.

Green in CI means: **it works somewhere that is not your laptop.**

---

## What belongs in it

In order of how fast they fail, because fast failures are cheap:

| Job | Answers | Typical time |
|---|---|---|
| **lint** | is it written the way this project writes things? | seconds |
| **typecheck** | do the types actually line up? | seconds |
| **unit tests** | are the rules right? | seconds |
| **build** | does it compile into something deployable? | a minute |
| **integration** | do the pieces agree, against a real database? | a minute |
| **end-to-end** | can a person do the thing in a browser? | minutes |

Run the first three on every push. Run the slow ones on pull requests and on
`main`. Waiting four minutes for a typo to be caught trains people to stop
watching the run, and then CI is a badge again.

Ready-made workflow: [`../assets/ci-workflow.yml`](../assets/ci-workflow.yml).

---

## Branch protection — the part that makes it real

CI that can be ignored is decoration. Turn it into a gate on GitHub:

**Settings → Branches → Add rule** for `main`:

- ☑ Require a pull request before merging
- ☑ Require status checks to pass — select the jobs by name
- ☑ Require branches to be up to date before merging
- ☑ Do not allow bypassing the above settings

Do this **on day one**, while the repository is empty. Adding it later means
arguing with habits that have already formed, and there is always a reason why
this one PR should be the exception.

---

## Secrets

Never in the repository. Never in a log. GitHub Actions reads them from
**Settings → Secrets and variables → Actions**:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Two things that catch people out:

- **Secrets are not available to pull requests from forks.** Deliberate — a
  stranger's PR must not be able to print your keys. If a job needs a secret,
  it cannot run on fork PRs, and you plan around that rather than working
  around it.
- **Anything printed is public** if the repository is. Never `echo` a value you
  are not comfortable putting on a billboard. GitHub masks known secrets in
  logs, but only the exact string — a transformed or partial value leaks.

Use a separate test database or project. Never point CI at production.

---

## Caching

Without a cache, every run reinstalls everything: three minutes of nothing.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: pnpm
```

That is usually the whole caching story for a small project. Do not build an
elaborate cache scheme — a cache that goes stale produces failures that make no
sense and cost more than they ever saved.

---

## Reading a failure

```bash
gh run list --branch feat/my-branch --limit 3
gh run view --log-failed
```

`--log-failed` gives the failing job's real output rather than a summary. The
first error is the one that matters; everything below it is usually
consequence.

Then the triage from [`ship`](../../ship/SKILL.md) → recovery:

- **main green, your branch red** → yours. Fix as a new commit on the branch.
- **main red too** → not yours. Say so; do not fix someone else's breakage
  inside your branch.
- **red only sometimes** → flaky. Do not re-run until green.

---

## Flaky tests

A test that passes 80% of the time is worse than no test: it teaches the whole
team that red does not necessarily mean broken, and after that, real failures
get re-run too.

Usual causes, in the order they turn out to be true:

1. **Timing** — waiting for a fixed number of milliseconds instead of for a
   condition. Wait for the thing, not for a duration.
2. **Shared state** — tests that pass alone and fail together. Each test creates
   and cleans up its own data.
3. **Real time** — a test that behaves differently at midnight, or on a Monday,
   or across a daylight-saving boundary. Freeze the clock.
4. **Order dependence** — test B only passes because test A ran first. Run the
   suite in a random order occasionally and find out.

Fix it, or delete the test deliberately with a written reason. `.skip` with no
date attached is just a slower deletion that still costs you time on every run.

---

## Keeping it fast

- Run the fastest jobs first, and let them fail the run early
- Run jobs in parallel where they do not depend on each other
- Only run end-to-end tests where they earn the minutes — on PRs and `main`
- Cancel superseded runs when a branch is pushed again:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

A pipeline over ten minutes stops being a gate people wait for and becomes a
thing people work around. Speed is not a nicety here; it is what keeps the gate
real.
