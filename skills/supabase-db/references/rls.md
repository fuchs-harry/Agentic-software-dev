# Row-level security in practice

The mental model: **RLS turns every query into "…and only the rows this user is
allowed to see."** Postgres adds the condition; the client cannot remove it.

That is why it works and client-side filtering does not. A client filter is a
request. A policy is a rule enforced by the database.

---

## The four operations

| Operation | `using` | `with check` |
|---|---|---|
| `select` | which rows are visible | — |
| `insert` | — | which rows may be created |
| `update` | which rows may be touched | what they may become |
| `delete` | which rows may be removed | — |

`update` needs both. With only `using`, a user can take a row they own and
update `owner_id` to someone else's — or to nobody's, which loses it entirely.

```sql
create policy "owners update their own bookings"
  on bookings for update
  using       ((select auth.uid()) = owner_id)   -- may touch this row
  with check  ((select auth.uid()) = owner_id);  -- and it must still be theirs after
```

---

## Why `(select auth.uid())` and not `auth.uid()`

Wrapping it in a `select` lets the planner evaluate it once for the statement
instead of once per row. On a table of any size the difference is dramatic —
this is the single most common cause of "RLS made everything slow".

```sql
using ((select auth.uid()) = owner_id)     -- evaluated once
using (auth.uid() = owner_id)              -- potentially per row
```

And index the column the policy filters on:

```sql
create index on bookings (owner_id);
```

A policy is a `WHERE` clause. An unindexed `WHERE` clause is a full table scan
on every request.

---

## Ownership through a join

When the table does not hold the owner directly, reach it through the parent —
but keep it a single subquery rather than a correlated lookup per row:

```sql
create policy "owners read messages on their bookings"
  on messages for select
  using (
    booking_id in (
      select id from bookings where owner_id = (select auth.uid())
    )
  );
```

If the chain is three tables deep, stop. Either denormalise the owner onto the
child table, or accept a `security definer` helper function written carefully
(below). A policy nobody can read is a policy nobody can verify.

---

## `security definer` — the sharp edge

A `security definer` function runs with the **privileges of its owner**, which
means it bypasses RLS. That is occasionally necessary and it is a privilege
escalation if written carelessly.

If you must:

```sql
create function current_user_is_owner_of(p_booking uuid)
returns boolean
language sql
stable
security definer
set search_path = ''                   -- ← not optional
as $$
  select exists (
    select 1 from public.bookings
    where id = p_booking and owner_id = auth.uid()
  );
$$;
```

Three requirements, all of them:

1. **`set search_path = ''`** and fully-qualified table names. Without it, a
   user who can create a schema can shadow your table names and make your
   function read theirs instead.
2. **It takes parameters and returns a decision** — never "give me the rows".
   A definer function that returns data is a hole shaped like a function.
3. **It does not accept a user id as a parameter.** It reads `auth.uid()`
   itself. A function taking `p_user_id` is one the caller can lie to.

---

## Views bypass policies by default

A view runs as its **owner** unless you say otherwise. A view over an RLS
protected table, created by `postgres`, returns every row to everybody.

```sql
create view booking_summary
with (security_invoker = on)      -- ← run as the caller, so policies apply
as select id, arrival, guests from bookings;
```

Same for materialised views — except they cannot enforce RLS at all, because
the rows were computed once, in advance, by someone else. Do not put
user-scoped data in a materialised view.

---

## The service key ignores everything

```
anon / publishable key   → RLS applies. Safe in a browser.
service_role key         → RLS does not apply. Server only. Never in a bundle.
```

Under the service key `auth.uid()` is `null`, so any policy comparing against
it matches nothing — which is why service-key code must do its own filtering,
explicitly, in every query. There is no safety net there. That is the point of
the key, and the reason to use it as rarely as possible.

Never in: the repository, a `NEXT_PUBLIC_*` or `VITE_*` variable, a log line, a
client component, an error message. If it is ever committed: **rotate first,
clean the history second.**

---

## Testing a policy

The only test that matters is the one from the wrong side.

```
1. As user A: create a row.
2. As user B: select it        → expect ZERO ROWS (not an error)
3. As user B: update it        → expect refused, or zero rows affected
4. As user B: delete it        → expect refused, or zero rows affected
5. With no session at all      → expect nothing
6. As user A: select it        → expect one row (the positive case, last)
```

Steps 2 to 5 are the test. Step 6 is the one everybody writes, and it passes
even when the table is world-readable.

Then the negative control: drop the policy, re-run, watch step 2 return a row,
restore the policy. If step 2 stays empty with the policy dropped, your test is
not reaching the database — something is mocked and you have no coverage at all.

To check a policy directly in SQL:

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"<user-b-uuid>","role":"authenticated"}';
select * from bookings;    -- should return only user B's rows
reset role;
```

---

## Two failure modes that look alike

**Everything returns empty.** Usually RLS is enabled with no matching policy —
which is the safe failure, and correct behaviour. Add the policy. Do **not**
disable RLS to "unblock" development; that change reaches production more often
than anyone admits.

**Everything returns everything.** RLS was never enabled on that table, or the
query is running under the service key, or it is going through a view without
`security_invoker`. Check in that order.

Supabase's advisors will tell you about tables without RLS. Run them before
every release, not once at the start.

---

## Storage

Storage buckets have their own policies, and the same rules apply.

- Private by default. A public bucket is a public URL — no expiry, no auth,
  shareable forever
- Path convention `{user_id}/{filename}` so a policy can check the prefix
- Signed URLs for temporary access, with the shortest expiry that works
- Validate type and size **server-side**. The browser's `accept` attribute is a
  hint, not a check
- Never trust an uploaded filename. Generate your own
