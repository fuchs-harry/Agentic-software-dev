---
name: supabase-db
description: >-
  Database work on Supabase or plain Postgres, where getting it wrong means one person
  reading another person's data. Covers row-level security as the default rather than an
  afterthought, migrations that can be rolled back, data modelling for ownership, auth,
  storage, and the keys that must never reach a browser. Use for any change to a table,
  column, policy, index, view, database function, trigger, storage bucket or auth setting,
  and whenever asked to "save this", "store that", "add a field", "let users log in", or
  "make this only visible to the owner". Effort is `deep` here by default — this is where
  data gets exposed.
---

# The database

Everything else in an application can be rebuilt. The data cannot. And unlike
the interface, a mistake here is invisible — nobody sees the extra rows they
were never supposed to receive.

Two rules, and they are the whole skill:

> **1. Every table gets row-level security in the same migration that creates it.**
> **2. Every permission is tested from the wrong side — that a stranger gets nothing.**

Default dial for anything in this skill: **`effort: deep`, `gates: strict`**
([`ship`](../ship/SKILL.md)). Not caution for its own sake — this is the layer
where being wrong exposes other people's data.

---

## Row-level security, in one page

Without RLS, anyone holding your public key can read every row in the table.
That key is in your JavaScript bundle. It is meant to be public. The security
is not the key — **the security is the policy.**

```sql
create table bookings (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  arrival     date not null,
  created_at  timestamptz not null default now()
);

-- Same migration. Not later. Enabling RLS with no policy denies everything,
-- which is the correct place to start.
alter table bookings enable row level security;

create policy "owners read their own bookings"
  on bookings for select
  using ((select auth.uid()) = owner_id);

create policy "owners create their own bookings"
  on bookings for insert
  with check ((select auth.uid()) = owner_id);

create policy "owners update their own bookings"
  on bookings for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "owners delete their own bookings"
  on bookings for delete
  using ((select auth.uid()) = owner_id);

-- A policy that filters on a column is a query on that column.
create index on bookings (owner_id);
```

Four operations, four policies. A table with a `select` policy and nothing else
is readable-only by owners and **writable by nobody** — which is safe, and is
also a bug you will spend an hour on if you do not know it.

`using` filters which existing rows the operation can touch. `with check`
validates the rows being written. `update` needs both, or someone can update
their own row into being someone else's.

The traps — `security definer`, views that bypass policies, the service key,
and how to actually test a policy: **[`references/rls.md`](references/rls.md)**.

---

## The keys

| Key | Where it may appear | What it does |
|---|---|---|
| **anon / publishable** | the browser, freely | subject to RLS. Public by design |
| **service_role / secret** | server-side only, from an environment variable | **bypasses RLS entirely** |

The service key ignores every policy you wrote. In a browser bundle it is a
full read-write handle on your database for anyone who opens the network tab.

Rules: it never enters the repository, never a `NEXT_PUBLIC_`/`VITE_` variable,
never a log line. If it is ever committed, **rotate it before cleaning the
history** — it is compromised from the moment of the commit.

---

## Migrations

Every schema change is a file in the repository. Never a change made by hand in
a dashboard — a hand-made change exists in exactly one place, and no other
environment will ever have it.

```
supabase/migrations/
  20260811142300_create_bookings.sql
  20260811160000_add_cancelled_at_to_bookings.sql
```

Timestamp-prefixed, so the order is unambiguous. Applied migrations are
**never edited** — the fix is always a new migration.

Every migration ships with a rollback note in the pull request, and the honest
three categories:

| Category | Meaning |
|---|---|
| **Reversible** | adding a column, a table, an index. The undo is obvious |
| **Reversible with care** | a rename, a type change. Undo exists but needs the same care |
| **Not reversible** | dropping a column, deleting rows, a destructive transform. There is no back — only a forward fix |

Anything in the third category is a **G2 gate** ([`ship`](../ship/SKILL.md) →
gates): stop, state what will be lost, confirm a backup exists, get an explicit
yes.

Writing them safely, including expand-and-contract for changes that cannot
happen atomically: **[`references/migrations.md`](references/migrations.md)**.

---

## Modelling

Defaults that are right almost always:

- **`uuid` primary keys**, `default gen_random_uuid()`. Sequential integers leak
  how many customers you have and make one URL guessable from another
- **`created_at timestamptz not null default now()`** on every table. You will
  want it and cannot add it retroactively with real values
- **`timestamptz`, never `timestamp`.** Storing a time without a zone is a bug
  with a delay fuse
- **An ownership column on every table that holds user data** — usually
  `owner_id`. It is what the policy filters on, and adding it later means
  backfilling
- **Foreign keys with an explicit `on delete`.** Decide, per relation, whether
  the child is cascaded or blocked
- **`not null` by default.** Nullable is a decision, not a default
- **Constraints in the database**, not only in the app. `check (guests > 0)`
  holds even when a script bypasses your code

And one that is not about correctness: **do not store what you do not need.**
Every personal field is something you must later secure, export on request, and
delete on request. The cheapest personal data to protect is the field you never
added.

Ownership shapes, many-to-many, soft deletes and the multi-tenant question:
**[`references/data-modelling.md`](references/data-modelling.md)**.

---

## Auth

Supabase gives you `auth.users`. Do not build your own users table beside it —
create a `profiles` table keyed to `auth.users(id)` for anything extra.

- Never store a password. Supabase handles that
- Server-side, verify the user on every request. A token from a client is a
  claim, not a fact
- `auth.uid()` inside a policy is the authenticated user. Under the service key
  it is `null` — which is why service-key code must do its own filtering
- Email confirmation on. Without it, anyone can register any address
- Test the logged-out case explicitly: an anonymous request should get nothing,
  not an error that leaks whether the row exists

---

## Testing a policy — from the wrong side

This is not optional and it is not covered by any other test.

```
1. Create a row as user A.
2. Sign in as user B.
3. Query the row. Expect: empty. Not an error — empty.
4. Try to update it. Expect: refused or zero rows affected.
5. Try with no session at all. Expect: nothing.
```

**A test that user A can see their own booking passes even when everyone can
see it.** That is the shape of nearly every data-exposure bug: the positive
test is green, and it was the only test written.

Then the negative control ([`testing-and-ci`](../testing-and-ci/SKILL.md)):
drop the policy on purpose, re-run, watch the test fail, put it back.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| "RLS later, once it works" | Later is after the data is real. It is never convenient |
| RLS enabled, policies forgotten | Everything silently returns nothing; then someone "fixes" it by disabling RLS |
| The service key used to "make it work" | Every policy in the database is now decoration |
| Filtering by user in the client query | Anyone can edit the query. It is a suggestion |
| A `security definer` function without a locked `search_path` | Runs as the owner. This is a privilege escalation, not a shortcut |
| A view over an RLS table without `security_invoker` | The view reads as its owner and bypasses the policies |
| Editing a migration that already ran | Environments diverge and nobody can tell how |
| Changing production in the dashboard | Exists in exactly one place, reproducible nowhere |
| Storing personal data "in case we need it" | Every field is a future obligation to secure, export and delete |

---

## Done means

- [ ] RLS enabled on every new table, **in the same migration**
- [ ] A policy for each of select / insert / update / delete that should be allowed
- [ ] An index on every column a policy filters by
- [ ] Access tested **from the wrong side** — other user, and no user
- [ ] Negative control performed on at least one policy
- [ ] Migration reversible, or a written forward fix and a G2 approval
- [ ] No service key outside a server-side environment variable
- [ ] No personal data stored that nothing actually needs
