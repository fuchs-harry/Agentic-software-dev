---
name: github-basics
description: >-
  Git and GitHub explained for someone who has never used them, and the fifteen commands
  that cover almost everything — plus how to undo each mistake. Use when the person you
  are working with does not know what a branch, commit, pull request or merge is, when
  they ask "what does this command do", "did I break it", "where did my changes go",
  "what is a PR", or when they are visibly nervous about running something. Also use when
  explaining what you just did in git, or before asking them to run a command that
  changes history. Load this to teach — the mechanics of the delivery loop itself live
  in the `ship` skill.
---

# Git and GitHub, for people who have not used them

Two different things with confusingly similar names:

- **Git** is on your computer. It records versions of your files. It works with
  no internet and no account.
- **GitHub** is a website. It stores a copy of that history so other people —
  and the robots that run your tests — can see it.

You can use git alone. You cannot use GitHub without git.

---

## The mental model

Git is not a backup. It is a **chain of labelled snapshots you chose to take.**

```
your files          →  you edit freely, nothing is recorded
  ↓  git add           you point at what belongs in the next snapshot
the staging area    →  a shortlist
  ↓  git commit        the snapshot is taken and labelled, permanently
the history         →  a chain of snapshots, each with a message saying why
  ↓  git push          the chain is copied to GitHub
GitHub              →  everyone (and CI) can see it
```

The one thing worth internalising: **once you have committed, your work is very
hard to lose.** Almost every git horror story is about work that was never
committed. Commit often — a commit is not a promise, it is a save point.

The full picture, including branches and why they exist:
**[`references/mental-model.md`](references/mental-model.md)**.

---

## The five words

| Word | What it actually means |
|---|---|
| **commit** | a labelled snapshot of your project at one moment |
| **branch** | a parallel line of snapshots, so you can try things without touching the working version |
| **push** | send your snapshots to GitHub |
| **pull request** (PR) | "here are my snapshots — please look before they join the main version" |
| **merge** | accept them into the main version |

A branch is the single most useful idea here. `main` is the version that works.
You never edit it directly. You make a branch, break things freely, and if it
goes badly you delete the branch and `main` never knew.

---

## The loop you will actually run

```bash
git switch -c feat/add-cancel-button   # 1 · new branch off the working version
#   ... make changes ...
git add -A                             # 2 · everything I changed goes in the snapshot
git commit -m "feat: guests can cancel a booking"
git push -u origin feat/add-cancel-button   # 3 · send it to GitHub
gh pr create --fill                    # 4 · ask for it to be reviewed
```

That is the whole job, most days. Every command explained line by line, plus
the ten others worth knowing: **[`references/commands.md`](references/commands.md)**.

---

## Reading a commit message

The message is written for the person who, in eight months, is trying to work
out why this line exists. That person is usually you.

```
feat: guests can cancel a booking up to 24h before arrival
^     ^
type  what changed, from the user's point of view — not "updated file"
```

Types worth using: `feat` (new capability), `fix` (something was broken),
`docs`, `refactor` (same behaviour, different code), `test`, `chore` (tooling),
`ci`. This is [Conventional Commits](https://www.conventionalcommits.org/); the
value is not the format, it is that it forces you to say *what kind* of change
this is.

The diff already says *what* changed. Use the message to say **why**.

---

## Things that feel dangerous but are not

| | |
|---|---|
| Making a branch | Free. Costs nothing, changes nothing, delete it whenever |
| Committing "too often" | There is no such thing. Small commits are easier to undo |
| Pushing a branch that is not finished | Normal. That is what branches are for |
| Opening a pull request early | Useful — it shows the direction before the work is deep |
| Getting a red X from CI | That is CI doing its job. It cost you nothing |

## Things that actually are dangerous

| | Why |
|---|---|
| `git push --force` | Can erase other people's work on the remote |
| `git reset --hard` | Deletes uncommitted changes with no undo |
| `git clean -fd` | Deletes untracked files with no undo — including ones git never knew about |
| Committing a `.env` file | The secret is exposed permanently, even if you delete it next commit |
| Editing `main` directly | The working version becomes broken with no branch to abandon |

An agent must treat all five as a stop-and-ask point. See
[`ship`](../ship/SKILL.md) → gates, G2.

---

## "I think I broke it"

Almost certainly not. Nearly every state is recoverable, and the first move is
always the same:

```bash
git status              # what does git think is going on
git log --oneline -5    # the last five snapshots
```

Recipes for each specific "oh no": **[`references/undo.md`](references/undo.md)**.

The genuinely unrecoverable list is short: uncommitted changes destroyed by
`reset --hard` or `clean -fd`, and a force-push over someone else's work. Both
are why those commands are a gate.

---

## How to explain what you did

When you have just run git commands for someone who does not read them, say it
in their terms — what state their work is in now, and what happens next:

> "I put the cancel button on its own branch, took three snapshots along the
> way, and sent it to GitHub. The automatic checks are running now — about two
> minutes. Nothing has changed in the working version yet; that only happens
> when you merge the pull request."

Not: "pushed feat/cancel, rebased on main, CI pending."

---

## GitHub, the website, in four places

| Where | What it is for |
|---|---|
| **Code** | the files, on whichever branch you pick from the dropdown |
| **Issues** | one per thing that needs doing. A to-do list with a discussion attached |
| **Pull requests** | proposed changes, with line-by-line comments and the CI result |
| **Actions** | the robots that run your tests on every push. Green tick or red X |

The green tick is the point of all of this. It means: *on a clean machine that
is not yours, this still works.*

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| One commit at the end of the day | Nothing to go back to when the afternoon was wrong |
| `git commit -m "update"` | Useless in eight months, which is when you need it |
| Working directly on `main` | No way to abandon a bad direction |
| Branches that live for weeks | Every day apart makes merging harder |
| Committing everything with `git add -A` without looking | This is how `.env` files get committed |
| "I'll just force-push, it's easier" | It is easier right up until it deletes someone's work |
