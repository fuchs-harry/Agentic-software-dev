# Keeping the graph true

Documentation does not become wrong all at once. It becomes wrong one merged
pull request at a time, and each one individually looked too small to bother
with.

The whole discipline is one rule:

> **A change that makes a document wrong fixes it in the same pull request.**

Not a follow-up issue. Not a docs sprint. The same pull request, because that is
the only moment when someone knows exactly which nodes went stale.

---

## The trigger table

Read this as: *I changed the thing on the left, so these nodes are now suspect.*

| Changed | Now check |
|---|---|
| A table, column, constraint or policy | the schema `reference` node · every `feature` node describing that data · the RLS notes |
| An API route, Server Action or contract | the reference node for that surface · any feature node that calls it |
| What a feature does or does not do | its `feature` node · `CHARTER.md` if the scope moved · the plan node that delivered it |
| A decision you had recorded | **write a new decision** that `supersedes` the old one; set the old one to `superseded` and link forward. Never edit the old one to reflect a new opinion |
| A deploy, migration or operational step | the `runbook` · and **time it again** — an untimed runbook is a guess |
| A command, path or rule named in `CLAUDE.md` | `CLAUDE.md` first. It is what an agent reads first and trusts most; a stale line there causes confident work on assumptions that stopped being true |
| Environment variables | `.env.example` · the deployment node |
| Delivering a plan | the plan node: `status: superseded`, the PR number, and **what actually shipped versus what was planned** |
| Abandoning work | the plan node: `status: abandoned`, and why. It stays |
| Adding or removing a dependency | the stack decision, if it changes what that decision claimed |

The row people skip is `CLAUDE.md`. It is also the one with the highest cost,
because it is read at the start of every session by something that will act on
it without checking.

---

## Staleness

Every `current` node carries an `updated` date, and the check fails when it is
older than the project's limit — 180 days is a reasonable default.

That is deliberately annoying, and the annoyance is the mechanism: it forces
someone to look at the node and choose.

Three legitimate responses, and none of them is ignoring it:

1. **It is still true** — re-date it. Ten seconds, and now the date means
   something.
2. **It is wrong** — fix it. This is why the check exists.
3. **It no longer matters** — `status: superseded` or `abandoned`, with a
   sentence saying why, and a link forward if something replaced it.

**Never bump the date without reading the node.** That converts the whole
mechanism into a lie with a fresh timestamp, and it is worse than having no
dates at all.

---

## Superseding, not deleting

```yaml
# decisions/0002-single-tenant.md
status: superseded
updated: 2026-08-11
---
> Superseded by [[0007-organisations]] — we took on a customer with three
> properties and two staff, which this decision explicitly assumed away.
```

The old node stays. Someone will propose single-tenant again, for the same
sensible-sounding reasons, and the two minutes it takes to read why it was
dropped is the entire return on keeping it.

Same for abandoned plans. `abandoned` with a reason is a real, useful outcome;
a deleted plan is a hole where an argument used to be.

---

## What to delete

Almost nothing. Real candidates:

- A node that duplicates another — merge it, and leave a `superseded` stub
  pointing at the survivor, so old links still land somewhere
- A node that was never true — a draft of something that was not built. Delete
  it and remove it from the index in the same commit
- Generated content committed by accident

Everything else gets a status, not a deletion.

---

## The periodic pass

Monthly, or when the graph feels wrong. Fifteen minutes.

1. **Run the check.** Fix what it reports.
2. **Open the graph view.** Look for isolated dots — orphans nobody can find —
   and for two clusters with no bridge between them. That missing bridge is
   usually the most interesting undocumented thing in the project.
3. **Read the three oldest `current` nodes.** Update, re-date, or supersede.
4. **Read `CLAUDE.md` as if you had never seen the project.** Is the "current
   state" section still honest? This one catches the most.

Fifteen minutes a month is the difference between documentation people trust and
documentation people have learned to route around.

---

## When the agent should update docs unprompted

Without being asked, when:

- a change made an existing node factually wrong — that is not optional work,
  it is part of the change
- a decision got made in conversation and is about to be implemented. It goes in
  `decisions/` **before** the code, or it will exist only in a chat log
- a plan shipped — its node gets `superseded`, the PR number, and what actually
  shipped versus what was planned

And it should **ask** before: creating a new top-level area, superseding a
decision somebody else wrote, or deleting anything. Those change the shape of
the graph rather than its contents, and the shape is a shared thing.
