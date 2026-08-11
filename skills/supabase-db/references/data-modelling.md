# Modelling data

The schema is the hardest thing to change later, because unlike code, it has
data in it. An hour spent here is worth a week spent anywhere else.

---

## Defaults

```sql
create table properties (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

- **`uuid` keys.** Sequential integers leak your row counts and let anyone walk
  from `/booking/41` to `/booking/42`.
- **`timestamptz`, never `timestamp`.** A time without a zone is correct until
  the first daylight-saving change or the first user in another country.
- **`created_at` everywhere.** You will want it, and it cannot be backfilled
  with true values.
- **`not null` unless nullable is meaningful.** "We do not know" and "there is
  none" are different, and a nullable column that means "the code forgot" is a
  bug you cannot query for.
- **Constraints in the database.** `check (guests > 0)` holds even when a
  script, an import or a future developer bypasses your application code.
- **Explicit `on delete`.** `cascade` (delete the children), `restrict` (refuse
  while children exist) or `set null`. Decide per relation — the default is
  rarely what you meant.

---

## Ownership is a schema concern

Every table holding user data needs a column that answers "whose is this?",
because that column is what every policy filters on.

**Direct** — simplest and fastest:

```sql
owner_id uuid not null references auth.users(id)
```

**Through a parent** — normalised, but the policy needs a subquery, and every
extra hop makes it slower and harder to verify:

```
properties.owner_id → bookings.property_id → messages.booking_id
```

Two levels is fine. **Three is a signal to denormalise**: put `owner_id` on the
child too, maintained by a trigger. Duplicated data is a real cost; a policy
nobody can read or index is a bigger one.

Deciding this after the table has rows means a backfill and a migration, which
is why it belongs in the first version of the schema.

---

## Many-to-many

A join table, with its own policy:

```sql
create table property_managers (
  property_id uuid not null references properties(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner', 'manager', 'viewer')),
  created_at  timestamptz not null default now(),
  primary key (property_id, user_id)
);
```

The composite primary key prevents the same person being added twice — a
constraint, not application logic, so it holds under a race.

Note what this table did: it turned "who owns this" into "who has what role
here". That is a much bigger change than it looks, and every policy in the
system now goes through it. Decide it early or not at all.

---

## Roles and permissions

Start with the simplest thing that is true. Most small applications need
exactly two answers: *is this mine* and *am I an admin*.

Do not build a general permission system before you have three concrete roles
that actually differ. A configurable permission model built on speculation is
the most reliable way to make every future policy hard to write and impossible
to verify.

When you do need it: roles live in the database, never in a client-supplied
token you did not verify server-side.

---

## Deleting

Three options, and they are genuinely different:

| | What it means | When |
|---|---|---|
| **Hard delete** | the row is gone | logs, caches, anything with no relationships |
| **Soft delete** (`deleted_at`) | the row stays, hidden | anything a user might undo, or that is referenced elsewhere |
| **Status column** | it is a real state, not a deletion | `cancelled` is not deleted — it is a booking that was cancelled |

Get this right by asking what the *domain* means. A cancelled booking is not a
deleted booking: it happened, it has a history, it may need to appear in a
report. Modelling it as a deletion loses information you will want back.

If you soft-delete, **every policy and every query must filter it** — and the
first one that forgets shows deleted rows to users. Consider a view with
`security_invoker = on` that filters them, and query that instead.

Under GDPR, "delete my account" means actually gone, not `deleted_at`. Plan for
a real deletion path separately from the soft-delete convenience.

---

## Personal data

Every personal field is a future obligation: secure it, export it on request,
delete it on request, and justify keeping it.

- **Do not store what nothing needs.** The cheapest field to protect is the one
  that does not exist.
- **Know where it is.** One list of which tables and columns hold personal
  data. Without it, "delete everything about this person" is a research project.
- **Retention**: decide how long, and enforce it with a scheduled job. "Forever"
  is a decision too, and it should be a deliberate one.
- **Two paths, built once**: export everything about one person, and erase
  everything about one person. Build them early — retrofitting them across
  twelve tables is far worse than adding two rows to a function.
- **Never in logs.** Not names, not addresses, not message contents. Log an id
  and look it up if you need to.

---

## Indexes

Add one where you filter, join or sort:

- every foreign key column
- **every column a policy filters on** — this is the one that gets forgotten,
  and it turns RLS into a table scan on every request
- columns used in `order by` on large tables

Do not index everything. Each index costs write time and space. Start with
foreign keys and policy columns, then add from real slow queries.

---

## What to get right the first time

Ranked by how expensive it is to change once there is data:

1. **Ownership** — which column the policies filter on. Changing it means a
   backfill and rewriting every policy
2. **Key type** — `uuid` vs integer. Changing it rewrites every reference
3. **`timestamptz` vs `timestamp`** — changing it means reinterpreting values
   whose true zone you no longer know
4. **Whether the model is single- or multi-tenant** — retrofitting an
   organisation layer touches every table and every policy in the system

Everything else — a column, an index, a constraint — is a normal migration.
