# Contributing

This repository follows the method it describes. That is not a stunt — a rule
its own author skips is a rule nobody else will follow either.

---

## The most useful contribution

**A gap.** A real situation where the skills gave you nothing, or gave you the
wrong thing. Open an issue with the
[skill-gap template](.github/ISSUE_TEMPLATE/skill-gap.md).

Worth more than a rewrite, because a gap comes with the one thing this
repository cannot generate for itself: what actually happened when someone used
it.

---

## Before you change anything

```bash
git clone https://github.com/fuchs-harry/Agentic-software-dev
cd Agentic-software-dev
npm run validate     # structure, manifests, frontmatter, every relative link
npm test             # the validator's own tests, including the negative controls
```

Both must pass before a pull request. CI runs the same two commands.

No dependencies to install — Node 20 or newer and nothing else.

---

## How to write here

The skills are opinionated on purpose. Guidance that hedges gets skimmed, and
skimmed guidance changes nobody's behaviour.

**State the rule, then the reason.** Not "consider adding tests" — *"every bug
gets a test before it gets a fix, otherwise it comes back and nobody notices
until a user finds it again."*

**Ground it in a failure that actually happens.** The advice worth writing is
the advice someone learned the hard way. If you cannot name what goes wrong
without it, it is a preference, and preferences do not belong in a skill.

**Be concrete.** "Validate input" is nothing. "Validate on the server too —
anyone can skip the client" is something.

**Keep `SKILL.md` under about 200 lines.** It is what gets loaded; depth goes in
`references/`, which is read on demand. A skill that is too long to read is a
skill that gets skimmed at exactly the moment precision mattered.

**The `description` in the frontmatter is the most important line in the file.**
It decides whether the skill loads at all. Name the situations in the words a
user would actually type — "build X", "why is CI red", "put it online" — not an
abstract summary of the topic.

---

## Adding a skill

```
skills/<name>/
├── SKILL.md          frontmatter with name + description, under ~200 lines
├── references/       depth, loaded on demand
└── assets/           templates to copy
```

Requirements the validator enforces:

- `name` in the frontmatter matches the directory name
- `description` exists and is under 1024 characters
- every file in `references/` is linked from somewhere in the skill — an orphan
  reference will never be read
- every relative link resolves

Link to the other skills where the boundary is. Skills that do not reference
each other become eight documents that each quietly contradict the others.

---

## Adding a check to the validator

Every new check needs a **negative control** in
[`scripts/validate.test.mjs`](scripts/validate.test.mjs): a fixture broken on
purpose, which the check must reject.

A check that has never been seen failing is not a check. It is a line of code
that reports safety.

---

## Commits and pull requests

- [Conventional Commits](https://www.conventionalcommits.org/) —
  `feat(skill): …`, `fix: …`, `docs: …`, `test: …`, `ci: …`
- The message says **why**. The diff already says what
- **Never a `Co-Authored-By` trailer.** Commits carry human authorship
- One outcome per pull request, under ~400 changed lines
- Fill the template, evidence included
- Never merge your own

---

## What will not be merged

- Guidance with no failure behind it — a preference dressed as a rule
- A skill whose `description` does not name the situations that should trigger it
- A new check with no negative control
- Advice copied from elsewhere without the specific reason it is here
- Anything that makes a `SKILL.md` longer without making it more usable
