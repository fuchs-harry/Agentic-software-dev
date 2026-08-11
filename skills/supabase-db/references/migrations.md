# Migrations

A migration is a schema change written as a file in the repository, applied the
same way to every environment, in the same order, forever.

The alternative — changing the database by hand in a dashboard — produces a
production schema that exists in exactly one place and can be reproduced
nowhere. Every environment drifts, and the drift is discovered during an
incident.

---

## The shape

```
supabase/migrations/
  20260811142300_create_bookings.sql
  20260811160000_add_cancelled_at_to_bookings.sql
  20260812091500_backfill_owner_on_messages.sql
```

`YYYYMMDDHHMMSS_snake_case_description.sql`. The timestamp is the order, and
the order is not negotiable — two people writing migrations on the same
afternoon must not be able to produce an ambiguous sequence.

**An applied migration is never edited.** Not to fix a typo, not to add a
column you forgot. The fix is always a new migration. Editing one that has run
means environments now differ by an amount nobody can measure.

---

## Every migration answers three questions

Put them in the file, as comments. They cost nothing and they are what the
reviewer reads first.

```sql
-- What: adds cancelled_at to bookings so a cancellation can be recorded
--       without deleting the row.
-- Rollback: alter table bookings drop column cancelled_at;
--           Reversible — no existing data is read or changed.
-- Blast radius: none until the application writes to it. Adding a nullable
--       column does not lock the table meaningfully at this size.

alter table bookings
  add column cancelled_at timestamptz;
```

---

## The three categories

| | Example | What it needs |
|---|---|---|
| **Reversible** | add a table, a column, an index, a policy | a rollback line in the note |
| **Reversible with care** | rename, type change, adding `not null` | expand-and-contract (below) |
| **Not reversible** | drop a column, delete rows, destructive transform | a **G2 gate**, a verified backup, and a written forward fix |

The third category is where a bad afternoon becomes a bad quarter. Stop, state
plainly what will be lost and whether it is recoverable, confirm the backup
exists and that someone has actually restored one before, and get an explicit
yes. See [`ship`](../../ship/SKILL.md) → gates.

---

## Expand and contract

Anything that would break running code if it happened instantly gets split
across three deploys. Renaming a column is the canonical example:

```
1 · EXPAND    add the new column. Write to both. Old code still works.
              → deploy, verify
2 · MIGRATE   backfill the new column from the old. Read from the new.
              → deploy, verify, let it run for a while
3 · CONTRACT  drop the old column.
              → deploy
```

Slower, and it is the difference between a rename and an outage. Between step 1
and step 3 you can stop at any point without anything being broken — which is
the property you are buying.

At small scale you may collapse this into one step during a planned pause. Do
that deliberately, write it in the plan, and know that you have chosen speed
over the ability to abort halfway.

---

## Backfills

Changing existing rows is a different risk from changing the schema.

- **Write it as its own migration**, separate from the schema change. Two
  things that can fail should be able to fail separately.
- **In batches** if the table is large, so it does not lock everything at once.
- **Idempotent**: running it twice must be harmless. It will be run twice.
- **Count first.** `select count(*) from … where <the condition>` before, so
  you know what you are about to touch. A backfill that reports "12,000 rows
  updated" when you expected 40 is a stopped deploy, not a shrug.

---

## Local first

```bash
supabase start                     # a real Postgres, locally
supabase migration new add_cancelled_at
# write the SQL
supabase db reset                  # replay EVERY migration from scratch
```

`db reset` is the important one. It proves the whole sequence applies to an
empty database — which is what a new environment, and CI, will do. A migration
that works only against your current state is a migration that fails on the
next machine.

Then, and only then, push it through the normal loop: branch, pull request, CI,
review, merge. The migration reaches production the same way code does.

---

## The ledger

Supabase tracks which migrations have run. Two things break it:

1. **Applying a migration outside the file flow** — through the dashboard, or
   an MCP tool, or a direct SQL run. The database now has the change with a
   different version identifier than the file, and the file looks pending
   forever. Correct the ledger entry to match the filename immediately.
2. **Editing an applied migration.** The ledger says it ran; the file now says
   something else. Nothing will warn you.

Both are recoverable if caught the same day and archaeology if not.

---

## Reviewing a migration

- Is RLS enabled on every new table, **in this file**?
- Is there a policy for each operation that should be allowed?
- Is there an index on every column a policy filters by?
- Are the `on delete` behaviours on foreign keys deliberate?
- Is the rollback line real, or wishful?
- Does anything here read or change existing rows? If so, how many?
- Could this lock a table for a noticeable time?
- Does the application code that needs this ship in the same pull request?

That last one matters: a migration merged without its code, or code merged
without its migration, leaves `main` broken between the two merges. They travel
together — this is one of the few cases where exceeding the size limit is
correct.
