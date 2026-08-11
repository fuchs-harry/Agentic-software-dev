---
name: project-start
description: >-
  Turn an idea into a working repository: interview the person until the idea has a
  boundary, write it down as a charter, choose a stack for reasons that can be stated,
  scaffold the repo with CI and a plan folder from commit one, and prove the empty app
  runs. Use whenever there is no repository yet, or the repository is empty — "I want to
  build an app", "I have an idea for a tool", "let's start a new project", "how do I even
  begin". Also use when an existing project has no README, no CI and no plan folder, and
  needs to be brought onto the rails. Do NOT use for a change inside an existing, healthy
  project — that is the `ship` skill.
---

# From idea to first commit

Most projects are not lost at the end. They are lost in the first hour, by
starting to build before anyone wrote down what "finished" means.

```
1 · INTAKE     ask until the idea has an edge          → 20 minutes, no code
2 · CHARTER    write it down                           → docs/CHARTER.md, human approves
3 · STACK      choose, and record why                  → docs/decisions/0001-stack.md
4 · SCAFFOLD   repo, CI, plan folder, first commit     → the empty thing runs
5 · SLICE ONE  the smallest thing worth showing        → hand off to `ship`
```

The end of this skill is the beginning of [`ship`](../ship/SKILL.md). Everything
after slice one goes through that loop.

---

## Phase 1 · Intake

Do not accept the first description of the idea. Nobody's first description has
an edge — that is not a failure of the person, it is how ideas arrive.

Ask about **the person, the moment, and the outcome**, then stop:

1. **Who is it for?** Not "everyone". One person you could name.
2. **What are they doing right now instead?** A spreadsheet, WhatsApp, paper,
   a competitor, nothing. This tells you what "better" has to beat.
3. **What is the single moment it has to nail?** The one screen or action that,
   if it works, makes the thing worth using.
4. **What does it not do?** Ask directly. Then ask again in a week's time — the
   answer is different and both answers are useful.
5. **How would you know it worked?** Push past "people like it" to something
   countable.

Full question set, including the ones that expose hidden requirements before
they become a rewrite: **[`references/intake-interview.md`](references/intake-interview.md)**.

Two things to listen for specifically, because they change the whole shape of
the project and are almost never volunteered:

- **"…and then it sends them a message."** Any outbound channel — email, SMS,
  WhatsApp — is a third-party account, a deliverability problem and a consent
  question. It is never a small feature.
- **"…so they can log in and see their own."** Accounts mean permissions mean
  one person seeing another person's data if you get it wrong. That is
  `effort: deep` for the rest of the project's life.

---

## Phase 2 · Charter

One page, `docs/CHARTER.md`, written in the person's own words, not in
technical vocabulary. Template: [`assets/charter-template.md`](assets/charter-template.md).

It answers five things:

| | |
|---|---|
| **For whom** | one named kind of person |
| **Instead of what** | what they do today |
| **The moment** | the one interaction that must be good |
| **Not this** | three things deliberately excluded |
| **Worked means** | something countable |

**This is a gate (G0).** Read it back and get a yes before choosing a stack.
Someone who cannot code can absolutely tell you that the charter describes the
wrong product — and this is the last cheap moment to find that out.

The charter is not frozen. It is *versioned*: when it changes, the change is
visible in the git history, with a reason. A charter that quietly drifts is
just as bad as no charter.

---

## Phase 3 · Stack

Choose deliberately, write down why, and never revisit it by accident.

The decision goes in `docs/decisions/0001-stack.md` — a short record with
Context, Decision, Consequences and Rejected alternatives. It is not
bureaucracy: it is the thing that stops the same argument happening every six
weeks with nobody remembering the reasons.

Defaults that are right often enough to be the starting point, and the
conditions under which they are wrong:
**[`references/stack-choice.md`](references/stack-choice.md)**.

Three rules that matter more than which framework wins:

1. **Boring beats clever.** The stack with more Stack Overflow answers is the
   stack where an agent — and you — will get unstuck faster.
2. **One database, one hosting provider, one language.** Every additional
   moving part is a place where things break at 11pm.
3. **Choose what you can leave.** Ask how you would get your data *out*. If the
   answer is unclear, that is a lock-in you did not agree to.

For anything involving users, logins or stored personal data, the database
choice comes with security obligations from day one, not later:
[`supabase-db`](../supabase-db/SKILL.md).

---

## Phase 4 · Scaffold

The repository gets its shape in the **first** commit, not once it hurts. What
goes in, and why each item is there rather than added later:
**[`references/repo-skeleton.md`](references/repo-skeleton.md)**.

```
README.md              what this is, how to run it — for a stranger
CLAUDE.md              the rules the agent must follow in this repo
LICENSE
.gitignore             .env is in here from commit one
docs/
  INDEX.md             the hub of the knowledge graph — nothing escapes it
  CHARTER.md
  decisions/0001-stack.md
  plans/README.md      the index of plan nodes, empty for now
scripts/
  check-docs.mjs       validates the docs graph; runs in CI
.github/
  workflows/ci.yml     runs on every push, from the first push
  PULL_REQUEST_TEMPLATE.md
src/ (or app/)         the actual thing
tests/                 with one real test in it already
```

Documentation is a **graph from the first commit**, not a folder that fills up:
every node carries `title`, `type`, `status` and `updated`, ends with its
`Related` links, and is reachable from `docs/INDEX.md`. Open `docs/` in Obsidian
and the graph view is the real shape of the project. See
[`docs-graph`](../docs-graph/SKILL.md) — the structure is nearly free now and
expensive to impose on forty existing files later.

Ready-made versions of these files: [`../../templates/`](../../templates/).

**The empty app must run and be proven to run before slice one starts.** Push
the scaffold, watch CI go green, open the app, see the page. A pipeline you
first exercise when you also have real code cannot tell you which of the two
is broken.

Never worked with git or GitHub: [`github-basics`](../github-basics/SKILL.md).
Getting it onto the internet: [`deployment`](../deployment/SKILL.md).

---

## Phase 5 · Slice one

The first slice is not "the login" and not "the database schema". It is the
**thinnest vertical cut through the whole thing that a person could look at**.

For a booking tool: one property, hardcoded, with a form that saves a booking
and shows it in a list. No accounts. No email. No payments. It is not the
product — it is proof that the pieces connect.

Why vertical rather than horizontal: a horizontal slice ("build all the
database tables first") is invisible for weeks and cannot be wrong out loud.
A vertical slice is wrong immediately and cheaply, which is the point.

Slice one becomes the first plan node and goes through [`ship`](../ship/SKILL.md)
like everything after it.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Building before the charter | You find out in week three that you built the wrong thing |
| "We'll add tests later" | Later never has a date. The first test goes in the scaffold |
| Choosing a stack because it is new | An agent is only as good as the training data about your stack |
| Accounts and logins in slice one | The hardest part, built before anything is validated |
| A private repo "until it's good" | CI, history and review habits are hardest to add retroactively |
| `.env` added to git "just for now" | The secret is compromised the moment it is committed |
| Skipping the empty-app run | When it breaks later, you cannot tell which half broke |

---

## Done means

- [ ] Charter written, read back, and **approved by the person whose idea it is**
- [ ] Stack decision recorded with rejected alternatives
- [ ] Repository exists with README, CLAUDE.md, LICENSE, `.gitignore`, `docs/`, CI
- [ ] `docs/INDEX.md` exists and the docs check runs in the pipeline
- [ ] First push done, **CI observed green**
- [ ] The empty app runs — someone looked at it
- [ ] One real test exists and passes
- [ ] Slice one written as the first plan node in `docs/plans/`
