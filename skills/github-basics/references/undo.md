# "I broke it" — recipes

First, always, before anything else:

```bash
git status
git log --oneline -5
git branch --show-current
```

Three commands, no side effects. They will tell you which of the situations
below you are actually in — which is often not the one you think.

---

## I committed to the wrong branch

Your commits are fine. They are just on the wrong line.

```bash
git log --oneline -3                 # note the SHAs of the commits you want to move
git switch -c feat/correct-branch    # new branch — takes the commits with it
git switch main
git reset --hard origin/main         # ⚠ only safe because the work is now on the other branch
```

Do the `switch -c` **first**. Creating the correct branch before cleaning up
means the commits exist in two places for a moment, which is exactly the safety
margin you want.

---

## I committed something I should not have (not a secret)

Not pushed yet:

```bash
git reset --soft HEAD~1   # undo the commit, keep all the changes staged
# remove the file from the shortlist, then commit again
git restore --staged path/to/file
git commit -m "feat: the thing I actually meant"
```

Already pushed:

```bash
git revert <sha>          # a new commit that undoes it — safe on shared history
```

---

## I committed a secret — an API key, a password, an `.env`

**Rotate the credential first.** Before any git cleanup. It is exposed from the
moment it was committed; deleting it later does not un-expose it. Invalidating
the key ends the exposure in seconds. Cleaning the history first, while the key
is still valid, protects nothing.

Then:

1. Add the file to `.gitignore`
2. Remove it from history (`git filter-repo`, or GitHub's documented procedure)
3. Force-push — **this is a stop-and-ask point**, it rewrites published history
4. If the repository is public, assume it was scraped within minutes

Order is not negotiable: rotate, then clean.

---

## I deleted a file / undid something I needed

If it was ever committed, it exists:

```bash
git log --oneline --all -- path/to/file    # find the commit that still has it
git checkout <sha> -- path/to/file         # bring that version back
```

If it was committed and the whole commit seems to have vanished:

```bash
git reflog                 # every position HEAD has been in, including "lost" ones
git switch -c rescue <sha>
```

`git reflog` is the safety net most people do not know exists. Anything
committed in the last ~90 days is in there.

If it was **never committed**, it is gone. This is the entire argument for
committing often.

---

## `git pull` produced a mess

```bash
git merge --abort     # if a merge is in progress
git rebase --abort    # if a rebase is in progress
```

Both put you back exactly where you were before you started. Then work out what
is actually going on with `git fetch` and `git log --graph --all` before trying
again.

---

## There are conflict markers in my file

```
<<<<<<< HEAD
the version already on main
=======
your version
>>>>>>> your-branch
```

Delete the three marker lines, leave the correct content — which may be either
side or a combination. Then:

```bash
git add path/to/file
git rebase --continue      # or: git merge --continue
```

If you cannot tell which side is right, **stop and ask**. Guessing here deletes
someone's work while looking like a clean success.

---

## CI is red and I do not know why

```bash
gh run list --branch main --limit 3   # is main itself green?
gh run view --log-failed              # the failing job's output, not a summary
```

- **main green, your branch red** → you caused it. Fix as a new commit on the
  same branch.
- **main red too** → not yours. Say so; do not "fix" someone else's breakage
  inside your branch.
- **red only sometimes** → a flaky test. Do not re-run until green. A test that
  passes 80% of the time tells you nothing.

---

## I pushed and now I want to change the last commit

```bash
git commit --amend
git push --force-with-lease
```

`--force-with-lease` refuses to push if someone else has pushed to that branch
since you last fetched — the difference between force-pushing and force-pushing
*blindly*. Never use plain `--force` on anything shared.

Still a stop-and-ask point: it rewrites published history.

---

## I have no idea what state I am in

```bash
git fetch origin
git status
git log --oneline --graph --all -20
git stash list        # did I park something and forget?
```

Then say what you see, out loud, before doing anything. Naming the state is
usually enough to reveal the fix — and it prevents the classic failure of
running a powerful command while wrong about which branch you are on.

---

## The genuinely unrecoverable

Four things. Everything else has a way back.

| | |
|---|---|
| Uncommitted changes after `git reset --hard` | gone |
| Untracked files after `git clean -fd` | gone |
| Someone else's commits after your `git push --force` | gone from the remote |
| A committed secret | not "gone" — permanently exposed. Rotate it. |

All four required someone to deliberately type a destructive command. Git does
not lose work on its own.
