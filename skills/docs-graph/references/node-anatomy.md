# Anatomy of a node

One file. One subject. Something you could name in four words.

---

## Frontmatter

```yaml
---
title: Guests can cancel a booking
type: feature
status: current
updated: 2026-08-11
tags: [bookings, guest]
supersedes: 0001-single-tenant      # only on decisions that replace one
---
```

### `title`

A sentence, not a label. "Guests can cancel a booking" rather than
"Cancellation". The title is what appears in the index and in Obsidian's graph,
and a reader should be able to tell from it alone whether this node is what they
need.

### `type` — what kind of claim the file makes

| Type | Claim | Changes |
|---|---|---|
| `charter` | who this is for and what it does not do | rarely, and visibly |
| `decision` | this was chosen, for these reasons | never — you write a new one that supersedes it |
| `plan` | this is what we are about to build | to `superseded` when it ships |
| `feature` | this is what the software does today | whenever the software does |
| `runbook` | this is how you perform this operation | when the operation changes |
| `reference` | this is a stable fact — the schema, the glossary | when the fact does |
| `note` | somebody thought this. Not binding | freely |

**Confusing `note` with `decision` is the expensive mistake.** A note that gets
treated as a decision means an architecture chosen in a passing thought, and
nobody can point at when it was agreed.

### `status`

```
draft        being written; do not rely on it
current      true today
superseded   replaced — points at what replaced it
abandoned    we decided not to; kept for the reason
```

`superseded` and `abandoned` nodes **stay in the graph**. Deleting one deletes
the reason, and the same proposal returns in four months with nobody able to say
why it was dropped last time.

### `updated`

The date this node was last checked against reality — not the last time a typo
was fixed. It is the only defence against confidently stale documentation, and
the validator uses it: a `current` node past the staleness limit fails the build
until someone looks at it and either updates it or re-dates it deliberately.

### `tags`

Cross-cutting membership that a folder cannot express. A node about cancellation
policy is `[bookings, guest, money]` — three contexts, one file, no duplication.

Keep the vocabulary small. Twenty tags used consistently beat two hundred used
once each; at that point the tag is just a word that happened to be typed.

---

## Body

```markdown
# Guests can cancel a booking

<One paragraph: what this is, in the words a user would use.>

## How it works

<The mechanism, at the level of detail someone would need to change it.
Not a code walkthrough — the code is the truth about *what*. This is *why*.>

## Constraints

<What must remain true. The 24-hour window. Who is allowed. What it must not do.>

## Open

| Question | Owner | Unblocked by |
|---|---|---|

## Related

- [[bookings-schema]] — the tables this reads and writes
- [[0004-cancellation-policy]] — the decision that set the 24-hour window
- [[runbook-refund]] — what a human does afterwards
```

Two sections earn their place every time:

**`Open`** — questions that are genuinely unresolved, each with an owner. An
open question with no owner is a wish. And an open question does not get quietly
answered in code: if a task needs the answer, that is a blocking precondition,
not an improvisation.

**`Related`** — the node's outgoing edges, each saying *why*. A bare list of
links is a graph with no information on its edges.

---

## Naming

Filenames are the node's identity, so they are stable and predictable:

```
kebab-case.md                    guest-can-cancel-booking.md
decisions get a number           0004-cancellation-policy.md
no dates in the name             ✗ 2026-08-11-notes.md
no spaces, no capitals           ✗ Booking Flow.md
```

Names describe the **subject**, not the moment: `bookings-schema.md`, not
`meeting-notes-august.md`. A file named after a date is a file nobody will ever
look for on purpose.

Decisions are numbered and append-only. `0004` supersedes `0002`; `0002` is
updated to `status: superseded` and gains a link to `0004`. The history of what
you believed and when is worth more than a tidy folder.

---

## One subject per node

The test: **can you name what this file is about in four words?** If the honest
answer is "booking and also pricing and some notes about emails", it is three
nodes.

Split when:

- the title needs an "and"
- two sections have different `updated` realities — one changes weekly, one
  annually
- a reader would want to link to *part* of it (they will link to the heading,
  and headings move)

Do **not** split when the result would be three nodes that are only ever read
together. Then it is one node with three headings, and splitting it just adds
navigation.

---

## Length

A node someone will actually read: roughly one to two screens. Past that, it is
usually a hub node plus its children — see
[`linking.md`](linking.md).

The failure mode is not a long node. It is a long node with no `Related`
section, because that is a node that has quietly become an island.
