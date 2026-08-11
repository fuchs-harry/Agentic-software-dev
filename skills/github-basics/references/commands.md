# The commands worth knowing

Fifteen commands cover almost everything. Each one below says what it *actually*
does, not just what it is for.

---

## Looking around — always safe

```bash
git status                  # what has changed, what is staged, which branch
git log --oneline -10       # the last ten snapshots, one line each
git diff                    # what I changed but have not staged
git diff --staged           # what is about to go into the next commit
git branch --show-current   # which branch am I on (the answer to many problems)
```

None of these change anything. Run them freely — particularly `git status`,
which answers "where is my work" most of the time it gets asked.

---

## The daily loop

```bash
git switch -c feat/add-cancel-button
```
Creates a branch **and** moves onto it. Name it after the outcome, prefixed by
type: `feat/`, `fix/`, `docs/`, `chore/`.

```bash
git add -A
```
Puts every change on the shortlist for the next snapshot. Convenient and
slightly dangerous: it takes *everything*, including files you did not mean to
commit. Run `git status` first and actually read it — this is how `.env` files
end up in history.

```bash
git add src/booking.ts
```
Safer: stage specific files.

```bash
git commit -m "feat: guests can cancel a booking up to 24h before arrival"
```
Takes the snapshot. It exists now; it is very hard to lose from here.

```bash
git push -u origin feat/add-cancel-button
```
Sends it to GitHub. `-u` links your local branch to the remote one, so
afterwards plain `git push` is enough.

```bash
gh pr create --fill
```
Opens the pull request from the current branch, filling the title and body from
your commits. `--fill` is fine for small work; for anything real, write the body
properly with evidence in it.

---

## Staying up to date

```bash
git fetch origin            # what's new on GitHub? changes nothing of mine
git switch main
git pull                    # bring main up to date
git switch feat/my-branch
git rebase origin/main      # replay my work on top of the newer main
```

Rebase your own branch to keep the history straight. Never rebase a branch
someone else has already pulled — you would be rewriting history under them.

---

## Undoing, from gentlest to sharpest

```bash
git restore src/booking.ts
```
Throw away changes to one file since the last commit. **Not recoverable** — the
changes were never committed.

```bash
git restore --staged src/booking.ts
```
Take a file off the shortlist. Your edits are untouched; it just will not be in
the next snapshot.

```bash
git commit --amend -m "better message"
```
Rewrite the most recent commit. Fine before pushing. After pushing it rewrites
published history, which needs a force-push — a gate.

```bash
git reset --soft HEAD~1
```
Undo the last commit but keep every change, staged. Useful when you committed
too early or bundled two things together.

```bash
git revert <commit-sha>
```
The safe undo: creates a **new** commit that reverses an old one. Nothing is
erased, and it works on commits that are already pushed. This is what to use in
production.

```bash
git reset --hard        # ⚠ destroys uncommitted work, no undo
git clean -fd           # ⚠ deletes untracked files, no undo
git push --force        # ⚠ can erase other people's work on the remote
```
Three commands that genuinely lose things. An agent stops and asks before any
of them, every time.

---

## GitHub from the terminal

```bash
gh repo create my-app --private --source=. --remote=origin --push
gh run watch                          # follow the CI run live
gh run list --branch feat/my-branch   # did my checks pass?
gh pr create --base main --fill --body-file PR_BODY.md
gh pr view --web                      # open it in the browser
gh pr checks                          # the status of every check
gh issue create --title "..." --body "..."
```

`gh run watch` is the one to know. It is the difference between "I think it
worked" and knowing.

---

## Finding out what happened

```bash
git log --oneline --graph --all -20   # the shape of the branches
git log -p src/booking.ts             # every change to one file, with diffs
git blame src/booking.ts              # who last touched each line, and in which commit
git show <sha>                        # everything about one commit
git reflog                            # every position HEAD has been in — the safety net
```

`git reflog` is how "lost" commits get found. If you committed it and then lost
it, it is almost certainly listed there.

---

## Two habits

**Before anything risky:**
```bash
git status && git branch --show-current
```
Most git disasters are a powerful command run on the wrong branch.

**When confused:**
```bash
git fetch origin && git status && git log --oneline --graph --all -10
```
Fetch is safe, and this tells you where everyone actually is before you decide
anything.
