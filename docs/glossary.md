# Glossary

Every word this repository uses that you might not know, in the order you will
meet them.

---

## Working with the agent

**Skill** — a set of instructions Claude loads when it notices a situation
applies. You do not invoke them; they trigger themselves.

**Command** — something you type, starting with `/`. `/plan`, `/build`.

**Agent (subagent)** — a separate Claude, given one job and its own attention.
`verifier` tries to break things; `reviewer` reads a change critically.

**Charter** — one page saying who the software is for, what it does, and what
it deliberately does not do. Written in your words, not technical ones.

**Plan node** — the written plan for one piece of work: goal, non-goals, tasks,
how it will be proven, how to undo it. A folder under `docs/plans/`.

**Brief** — the plan turned into instructions for whoever builds it.

**Gate** — a point where the agent stops and waits for you. Named G0 to G4.

**Effort / gates dial** — how careful to be, and how often to be interrupted.
See [dials.md](dials.md).

**Blast radius** — how much damage this could do if it is wrong. What sets the
dials.

**Negative control** — breaking something on purpose to confirm the test
notices. A green test that cannot go red proves nothing.

**Acceptance criterion** — the observable thing that shows a task is done.
"A cancellation two hours before arrival is refused with a message", not "it
works".

---

## Git

**Git** — records versions of your files, on your computer. Works offline.

**GitHub** — a website that stores a copy so others, and the automatic checks,
can see it.

**Repository (repo)** — the project folder, with its full history.

**Commit** — a labelled snapshot of the project at one moment. Once committed,
work is very hard to lose.

**Branch** — a parallel line of snapshots, so you can try things without
touching the working version.

**`main`** — the branch that works. The version you would put live right now.

**Push** — send your snapshots to GitHub.

**Pull / fetch** — get other people's snapshots. `fetch` only looks; `pull`
also merges.

**Pull request (PR)** — "here is my branch, please look before it joins
`main`". Where review happens.

**Merge** — accept a branch into `main`.

**Rebase** — replay your commits on top of a newer `main`, so the history reads
as a straight line.

**Conflict** — two branches changed the same lines and git refuses to guess.
You decide.

**Revert** — a new commit that undoes an old one. The safe undo; nothing is
erased.

**Force-push** — overwrite history on GitHub. Can delete other people's work.
Always a gate.

**Worktree** — a second folder for a second branch, sharing one history. Lets
you work on two things without switching.

---

## Building and shipping

**CI (continuous integration)** — robots that run your checks on a clean
machine every time you push. The green tick.

**Lint** — a check that the code is written the way this project writes things.

**Typecheck** — a check that the pieces fit together as declared.

**Unit test** — checks one rule, in milliseconds.

**Integration test** — checks that several pieces agree, against a real
database.

**End-to-end (e2e) test** — a robot clicking through a real browser.

**Flaky test** — one that passes sometimes. Worse than no test: it teaches
everyone to ignore red.

**Coverage** — how much of the code ran during the tests. Measures which lines
ran, not whether anything was checked.

**Environment** — a place the software runs: local (your machine), preview
(one per pull request), production (real users).

**Preview deployment** — a working copy of your change, at its own URL, so
someone can click it instead of imagining it from the code.

**Deploy** — put a version live.

**Rollback** — put the previous version back.

**Migration** — a file that changes the shape of the database, applied the same
way in every environment.

**Rollback (of a migration)** — the instructions to undo it. Sometimes there
are none, and then it is a gate.

---

## Data and safety

**Database** — where the information lives.

**Schema** — the shape of the database: which tables, which columns.

**Row-level security (RLS)** — the database itself enforcing which rows each
person may see. The only kind of permission that cannot be bypassed by editing
the request.

**Policy** — one rule inside row-level security. "You may read rows where you
are the owner."

**`anon` / publishable key** — the key in your website's code. Public by
design; safe **only** because policies exist.

**`service_role` / secret key** — a key that ignores every policy. Server-side
only. In a browser it is a full handle on your database for anyone who looks.

**Secret** — any value that must not be public: a key, a password, a token.
Never in the repository, never in a log.

**Rotate** — replace a secret with a new one, invalidating the old. What you do
first, immediately, if one is ever exposed.

**Personal data** — anything identifying a person. Comes with obligations:
secure it, export it on request, delete it on request.

**Backup** — a copy of the data. Not a backup until you have restored one.

---

## Words this repository uses in a specific way

**Proven** — there is a check that fails when this breaks. Not "I tested it".

**Evidence** — an observation, with what was done and what happened.
"Tested locally" is a claim, not evidence.

**Vertical slice** — one small capability, all the way through, working. As
opposed to building all the database, then all the screens.

**Conflict domain** — an area where only one branch may be active at a time,
because parallel changes there collide. Migrations, shared types, config.

**Point of no return** — an action that cannot be undone in five minutes
without anyone noticing. Always a gate, at every setting.
