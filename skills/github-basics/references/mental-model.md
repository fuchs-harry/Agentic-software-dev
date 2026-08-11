# The mental model

Enough to stop being afraid of it. Not a git course.

---

## Four places your work can be

At any moment, a change you made is in exactly one of these:

```
1  WORKING FILES   what you see in the editor. Not recorded. Losable.
2  STAGED          on the shortlist for the next snapshot. git add put it here.
3  COMMITTED       snapshotted, on your computer. Very hard to lose.
4  PUSHED          also on GitHub. Now other people and CI can see it.
```

`git status` tells you which. That single command answers "where is my work"
almost every time it is asked.

The important line: **the danger zone is 1.** Everything from 3 onwards is
recoverable, usually easily. This is why "commit often" is not discipline for
its own sake — it is moving work out of the only place it can vanish from.

---

## Why branches exist

Imagine one shared document that everyone edits at once, live. That is a
project without branches. It works until two people disagree, and then it
works for nobody.

A branch is a **copy of the timeline that only you are writing in.**

```
main       A───B───C─────────────────F      the version that works
                    \               /
feat/cancel          D───E─────────        your parallel line
```

- `main` keeps working the entire time you build `D` and `E`
- if `D` and `E` turn out wrong, delete the branch — `main` never knew
- when they are right, `F` is the merge: your line joins the main one

`main` is not sacred because of a rule. It is sacred because it is the version
you would deploy right now if you had to.

---

## What a pull request really is

The name is confusing. A pull request is not a request to pull anything. It is:

> "Here is a branch. Here is what it does and why. The tests ran. Please look
> before it joins `main`."

It exists to create the moment where a second pair of eyes is *structurally*
required, rather than depending on someone remembering to ask.

Three things happen on a pull request, and all three matter:

1. **CI runs.** Automatically, on a clean machine. Green means it works
   somewhere that is not your laptop.
2. **A human reads it.** They can comment on individual lines, and the
   conversation stays attached to those lines forever.
3. **It gets a number.** `#42`. Now the change has an address you can point at
   from an issue, a plan, or a bug report a year later.

---

## Remote and local

`origin` is a nickname for "the copy on GitHub". Your computer and GitHub each
hold a full copy of the history; neither is automatically aware of the other's
new commits.

```
git fetch    "tell me what's new on GitHub" — changes nothing of yours
git pull     fetch, then merge it into what I have
git push     send my commits to GitHub
```

`git fetch` is always safe. It only updates your knowledge, never your files.
When unsure what is going on, fetch first and look.

---

## Merge and rebase, in one paragraph each

**Merge** joins two lines and records that they met. The history shows a fork
and a join. Honest, occasionally messy to read.

**Rebase** replays your commits on top of the newer `main`, as if you had
started from there. The history reads as a straight line. Tidier — but it
*rewrites* your commits, which is fine on your own branch and a problem on a
shared one.

The safe default: **rebase your own branch, never rebase anything someone else
has pulled.**

```bash
git fetch origin
git rebase origin/main
```

---

## Conflicts

A conflict is git refusing to guess. Two branches changed the same lines, and
git will not decide which is right — correctly, because it does not know.

It marks the file:

```
<<<<<<< HEAD
the version already on main
=======
your version
>>>>>>> your-branch
```

You delete the markers and leave the correct result — which may be either side,
or a combination. Then `git add` the file and continue.

If you cannot tell which side is right, **stop and ask**. The other side was
written by someone with context you do not have. Guessing here silently deletes
someone's work, and it looks like a successful merge.

---

## What is genuinely unrecoverable

Short list. Everything else has a way back.

| | |
|---|---|
| Uncommitted changes after `git reset --hard` | Gone. No undo. |
| Untracked files after `git clean -fd` | Gone. Git never had them. |
| Someone else's commits after your `git push --force` | Gone from the remote. |
| A secret you committed | Not "gone" — permanently exposed. Rotate it, do not just delete it. |

Notice that three of the four are commands you had to type deliberately. Git
does not lose your work on its own.

---

## The one habit worth building

Before anything that feels risky:

```bash
git status && git log --oneline -5
```

Two seconds, and it tells you what state you are in and what the last five
things were. Almost every git disaster involves someone running a powerful
command while wrong about which branch they were on.
