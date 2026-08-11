# When it goes sideways

Every situation below is normal. None of them is a reason to improvise.

The move that comes first in all of them: **write down where you actually are
before touching anything.** Which branch, what is committed, what is not, what
is deployed. Debugging forward from an unknown state is how a bad afternoon
becomes a bad week.

```bash
git status
git log --oneline -5
git branch --show-current
```

---

## Code exists, no plan

Usually because a question sounded like an instruction.

1. **Stop.** Do not add "just one more bit" to justify it.
2. Write the plan node as it *should* have looked, from the code that now exists.
3. Label it honestly: `Status: written retroactively on <date>, covers commits abc1234..def5678`
4. Get approval. Then continue — or throw the code away, which is now a cheap
   decision because the plan made the shape visible.

Do not delete the work to hide the process failure. A retroactive plan is
honest. A missing one means the reason lives only in a chat log.

---

## Scope grew mid-branch

You are at 700 lines and task 3 keeps growing.

1. Stop building.
2. Commit what is coherent and working, right now.
3. Split the plan: what stays in this branch, what becomes a second node.
4. Ship the first half. Open the second node for approval.

**Do not** finish it "since I'm already here". A 1,400-line pull request does
not get reviewed, it gets approved — and those are different things.

Mechanics of splitting and stacking branches:
[`pr-orchestration`](../../pr-orchestration/SKILL.md).

---

## CI is red

First question, always: **did this branch cause it?**

```bash
gh run list --branch main --limit 3     # is main green?
```

- **Main is green, your branch is red** → you caused it. Fix it as its own
  commit on the same branch. Never amend a pushed commit to hide the failure.
- **Main is red too** → you did not cause it. Say so, do not "fix" it inside
  your branch. Your change is now blocked by something else; that is a
  different piece of work.
- **Red only sometimes** → a flaky test. Do not retry until green. A test that
  passes 80% of the time is a test that tells you nothing. Either fix it or
  delete it deliberately, in writing.

Never: `--no-verify`, skipping a job, marking a check non-required, deleting the
failing test. The check was the only thing working.

---

## The same fix fails three times

Hard stop. Not a fourth attempt with a longer prompt.

Write down, in this order:

1. What you tried, each time, in one line each
2. What actually happened each time — the real error, not your summary of it
3. What you *now* believe is wrong, and why the last three attempts assumed
   otherwise

Then hand it over. Three failures in a row usually means the model of the
problem is wrong, and a fourth attempt built on the same wrong model will fail
in the same way with more code.

---

## Merge conflict

```bash
git fetch origin
git rebase origin/main
```

Resolve by understanding both sides. If you cannot tell which side is right,
that is a gate, not a coin flip — the other side was written by someone with
context you do not have.

If the conflict is large and structural, the two branches were working the same
ground. That is a planning failure, not a git problem, and the fix is to
serialize them: land one, rebase the other, resolve once against a settled base.

---

## Something is broken in production

Order matters. Do not debug first.

1. **Restore service.** Revert the deploy, or roll back to the last good
   version. Understanding can wait; users cannot.
2. **Then** capture what happened: the error, the time, what was deployed.
3. **Then** find the cause, on a branch, with a test that reproduces it.
4. The fix ships through the normal loop. An emergency is not a reason to skip
   the plan — it is the situation where an unreviewed second mistake hurts most.

If reverting is not possible because data changed, that is the forward fix
listed in the plan node's Rollback section. This is exactly why that section
exists and why "not revertible" forces `gates: strict`.

---

## The agent lost the thread

Long session, context compacted, and it is now confidently doing something
nobody asked for.

Symptoms: editing files unrelated to the plan, re-implementing something that
already exists, "fixing" tests by changing their expectations.

The reset:

1. Stop. `git status` — see what has actually been touched.
2. Re-read the plan node and the brief. They are the source of truth, not the
   conversation.
3. Discard anything not traceable to a task in the plan (`git checkout -- <path>`).
4. Resume at the last task with a demonstrated acceptance criterion.

This is why the plan lives in a file and not in the chat. The file survives.

---

## A secret got committed

Treat the secret as compromised the moment it is committed — even if you never
pushed, and even if you delete it in the next commit. It is in the history.

1. **Rotate the credential first.** Before cleaning anything. The cleanup takes
   twenty minutes; the exposure ends the second the key is invalid.
2. Then remove it from the history, and force-push — this is a G2 action, so it
   needs a human's explicit go-ahead.
3. Then add it to `.gitignore` and to the environment properly.
4. If the repository is public, assume it was scraped within minutes. Rotate,
   do not hope.

Order is not negotiable. Cleaning the history first while the key is still
valid protects nothing.
