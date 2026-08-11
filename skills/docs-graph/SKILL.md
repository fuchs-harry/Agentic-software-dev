---
name: docs-graph
description: >-
  Keep a project's documentation as a maintained knowledge graph rather than a folder that
  fills up — Obsidian-style: one subject per node, typed frontmatter, wikilinks, an index
  nothing escapes, and a validator in CI. Use whenever writing, moving or deleting anything
  under docs/, when a change makes an existing document wrong, when asked "where should
  this go", "update the docs", "what do we have written down", or when documentation has
  become a pile nobody reads. Load BEFORE creating any new file in docs/ — the answer is
  often "an existing node, updated" rather than a new file. Every plan node, decision
  record and charter is a node in this graph.
---

# Documentation as a graph

Documentation does not die from being unwritten. It dies from **accumulating**:
forty files, six of them contradicting each other, none of them dated, and no
way to tell which are still true.

A graph fixes that structurally, not by discipline:

```
one subject per node          → you can tell what a file is for from its name
typed frontmatter             → you can tell what kind of thing it is, and whether it is current
links, not folder hierarchy   → a subject can belong to several contexts at once
an index nothing escapes      → an orphan node is a validation failure, not a discovery
a check in CI                 → the rules survive the week everyone is busy
```

**Obsidian-compatible on purpose.** Open `docs/` as an Obsidian vault and the
graph view is the real structure of the project — clusters where the work is,
isolated dots where documentation has drifted from reality.

Anatomy of a node: **[`references/node-anatomy.md`](references/node-anatomy.md)** ·
linking: **[`references/linking.md`](references/linking.md)** ·
keeping it true: **[`references/maintenance.md`](references/maintenance.md)**.
Copy: [`assets/node-template.md`](assets/node-template.md) ·
[`assets/index-template.md`](assets/index-template.md).

---

## The shape

```
docs/
├── INDEX.md                  the hub. Every node is reachable from here
├── CHARTER.md                who it is for, what it does not do
├── decisions/
│   ├── 0001-stack.md
│   └── 0002-multi-tenant.md
├── plans/
│   ├── README.md
│   └── guest-can-cancel/
│       ├── README.md
│       └── brief.md
├── features/                 what exists today, one node per capability
├── runbooks/                 how to do a recurring operation
└── reference/                stable facts: the schema, the API surface, the glossary
```

Folders are for **coarse type**, nothing more. The real structure is the links.
Do not build `docs/frontend/booking/components/` — that is a hierarchy pretending
to be knowledge, and the first subject that belongs in two places breaks it.

---

## Every node has frontmatter

```markdown
---
title: Guests can cancel a booking
type: feature            # charter · decision · plan · feature · runbook · reference · note
status: current          # draft · current · superseded · abandoned
updated: 2026-08-11
tags: [bookings, guest]
---
```

Four fields carry their weight:

- **`type`** — what kind of claim this file makes. A decision is binding; a note
  is not. Confusing the two is how a passing thought becomes an architecture.
- **`status`** — `superseded` and `abandoned` are real outcomes, and the node
  **stays**. Delete it and you delete the reason something was a bad idea, and
  someone proposes it again in four months.
- **`updated`** — the only defence against confident, stale documentation. A
  node claiming to describe today, last touched eleven months ago, is a trap.
- **`tags`** — cross-cutting membership that folders cannot express.

## Every node ends with its edges

```markdown
## Related

- [[0002-multi-tenant]] — the decision this rests on
- [[bookings-schema]] — the tables involved
- [[runbook-refund]] — what happens after a cancellation
```

Each link says **why**, in a few words. A bare list of links is a graph with no
information on its edges, and it is barely more useful than no links at all.

---

## Linking

**Wikilinks are the default**: `[[node-name]]`, or `[[node-name|shown text]]`.
They survive a file being moved, they are short enough that people actually
write them, and they are what Obsidian's graph view reads.

The honest trade-off: **GitHub renders `[[…]]` as plain text.** If browsing on
github.com matters more than the graph view, use relative markdown links
instead — Obsidian indexes those in the graph too. Pick one per project, write
it in `CLAUDE.md`, and do not mix.

Three rules that keep the graph readable rather than a hairball:

1. **Link where a reader would need it**, not everywhere a word appears. If
   every mention of "booking" is a link, none of them mean anything.
2. **Link to the node, not into a heading.** Headings move; nodes do not.
3. **A link to a node that does not exist yet is fine.** It marks something
   worth writing. The validator reports these as *planned*, not broken — as long
   as they are listed in the index as planned.

More, including hub nodes and when a node should be split:
[`references/linking.md`](references/linking.md).

---

## Nothing escapes the index

`docs/INDEX.md` is the hub, and it is the one file everyone opens first.

**An orphan — a node nothing links to and the index does not list — is a
validation failure.** Not a style preference: a node nobody can find is a node
nobody maintains, and unmaintained documentation is worse than none, because it
is confidently wrong.

The index is generated by hand and kept short: a line per node, with a hook
saying what is in it. Not a file listing — `ls` already does that.

---

## The rule that keeps it true

> **A change that makes a document wrong fixes it in the same pull request.**

Not "we'll update the docs later". Later has no date, and the next person to
read the node will believe it.

The triggers that most often make a node wrong, and what to update:

| When you change | Update |
|---|---|
| The database schema | the schema reference node, and any feature node describing that data |
| A decision you had recorded | write a **new** decision that says `supersedes`; set the old one to `superseded` |
| What a feature does | its feature node, and `CHARTER.md` if the scope moved |
| A deploy or operational step | the runbook, and time it — an untimed runbook is a guess |
| Anything named in `CLAUDE.md` — a command, a path, a rule | `CLAUDE.md` first. It is what an agent reads and trusts most |
| Delivering a plan | its plan node: `status: superseded`, PR number, and what actually shipped versus what was planned |

Full trigger table plus how to retire a node:
[`references/maintenance.md`](references/maintenance.md).

---

## The check in CI

Rules nobody checks are suggestions. The graph gets a job in the pipeline, the
same as the tests:

```bash
node scripts/check-docs.mjs
```

It fails on: missing or malformed frontmatter, an unresolved wikilink that is
not declared planned, an orphan node, a filename that is not kebab-case, and a
`current` node whose `updated` date is older than the staleness limit.

The script is in [`../../templates/scripts/check-docs.mjs`](../../templates/scripts/check-docs.mjs)
— copy it into any project, wire it into the pipeline, and the graph stops
depending on anyone remembering.

---

## When *not* to create a node

The most useful thing this skill does is prevent files.

| Instead of a new node | Do this |
|---|---|
| "Notes on the booking flow" | Update the existing `bookings` feature node |
| A file per meeting | One `decisions/` node for anything that was actually decided; the rest was conversation |
| A README in every folder | One node in the graph, linked from the index |
| Copying an explanation into a second file | Link to the first. Two copies drift, and you will not know which is right |
| A node for something still being argued about | It is an open question on an existing node until it is settled |

**Ask first: is this a new subject, or an existing node that is now out of
date?** It is the second far more often than it feels.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Deep folder hierarchies | The first subject belonging in two places breaks it |
| A node with no `updated` date | Unknowably stale; readers must guess |
| Deleting a superseded decision | The reason it was rejected goes with it |
| "Docs sprint" once a quarter | Everything is wrong for eighty-nine days |
| Documenting what the code says | The code is the truth about *what*. Document *why* |
| An index generated from the file list | Then it is `ls` with extra steps, and it stops being curated |
| Linking every occurrence of a word | Emphasis everywhere is emphasis nowhere |
| Two files explaining the same thing | They drift, and nobody knows which one is current |
| Docs updated in a follow-up PR | The follow-up does not happen |

---

## Done means

- [ ] Every new or changed subject is a node with complete frontmatter
- [ ] `updated` is today's date on every node this change touched
- [ ] Every node has a `## Related` section, and each link says why
- [ ] The node is reachable from `docs/INDEX.md`
- [ ] Superseded nodes are marked, not deleted, and point at what replaced them
- [ ] Documents this change made wrong are fixed **in this pull request**
- [ ] `check-docs` passes in CI
