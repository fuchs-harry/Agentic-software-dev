# Links are the structure

A folder tree says one thing about each file: where somebody filed it. A graph
says what a subject is *connected to*, which is the thing you actually want to
know.

---

## Wikilinks

```markdown
[[bookings-schema]]                       the node's filename, without .md
[[bookings-schema|the tables involved]]   with display text
![[cancellation-diagram.png]]             an embed
```

Default to these, for three reasons: they survive a file being moved, they are
short enough that people write them without thinking, and they are what
Obsidian's graph view reads.

**The honest trade-off: GitHub renders `[[…]]` as plain text.** If browsing on
github.com matters more than the graph view, use relative markdown links
instead — Obsidian indexes those in its graph too, so you keep most of the
benefit and lose the rename-resilience.

Pick one per project. Write the choice in `CLAUDE.md`. Do not mix — a graph
where half the edges are one syntax and half are another cannot be validated,
and it will not be.

---

## When to link

**Link where a reader would need it.** Not at every occurrence of a word.

```markdown
✓  Cancellation is refused inside 24 hours, a limit set in
   [[0004-cancellation-policy]].

✗  A [[booking]] can be [[cancelled]] by a [[guest]] if the [[booking]] is
   more than 24 hours from [[arrival]].
```

The second is a graph in which everything connects to everything, which conveys
exactly as much as a graph in which nothing does.

Rule of thumb: **once per node per target**, at the place where a reader would
first want to go there.

---

## Link to nodes, not into headings

`[[bookings-schema]]`, not `[[bookings-schema#the-cancelled-at-column]]`.

Headings get renamed during ordinary editing, and nothing warns you. Nodes are
stable, and if a heading genuinely deserves to be a link target, it deserves to
be its own node.

---

## Links to nodes that do not exist yet

Fine, and useful. `[[refund-policy]]` written before that node exists marks
something worth writing, and Obsidian shows it as an unresolved link — a visible
to-do inside the graph.

The one requirement: **declare it as planned in the index.** The validator
distinguishes *planned* from *broken*; without the declaration, the two are
indistinguishable and the check becomes noise people learn to ignore.

```markdown
## Planned

- `refund-policy` — linked from [[guest-can-cancel-booking]], not written yet
```

---

## Hub nodes

When a subject grows past two screens, it usually wants to become a hub plus
children rather than a longer file:

```
bookings.md                 the hub — what this area is, and the map
├── bookings-schema.md
├── bookings-cancellation.md
└── bookings-availability.md
```

The hub is short: what this area is, and links to the children with a line each
saying what is in them. It is the thing a newcomer reads.

The children link **back** to the hub in their `Related` section. That is what
keeps the graph navigable in both directions — Obsidian shows backlinks
automatically, but only if the edge exists.

---

## Backlinks

Obsidian computes backlinks for free. That does not make outgoing links
optional: **a backlink only exists because someone wrote the forward link.**

The habit that matters: when you create a node, immediately add it to the
`Related` section of the one or two nodes a reader would arrive from. A node
with no incoming links is an orphan — technically present, functionally missing.

---

## What the graph should look like

Open `docs/` in Obsidian and look at the graph view. The shape tells you things
no file listing does:

| What you see | What it means |
|---|---|
| Dense clusters | Areas of real, connected work. Healthy |
| Isolated dots | Orphans. Nobody can find these, so nobody maintains them |
| One node everything connects to | Either a good hub, or a file doing four jobs — check which |
| Two clusters with no bridge | Two subsystems nobody has written down the relationship between. Usually the most interesting gap in the whole project |
| A long chain with no branches | A hierarchy wearing a graph's clothes. Probably fine, probably a folder |

The last two are worth looking for deliberately, perhaps monthly. A missing
bridge between two clusters is where integration bugs come from, and the graph
shows it before the bugs do.

---

## Keeping it from becoming a hairball

Three limits, applied loosely:

1. **Around five to nine outgoing links per node.** More usually means the node
   is a hub (fine — say so) or it is doing several jobs (not fine).
2. **No link with no reason.** Every entry in `Related` says why in a few words.
   If you cannot say why, the edge is decorative.
3. **Prefer one hop.** If A needs B needs C to make sense, the graph is telling
   you that B should probably be part of A.
