# Supabase security

Source of truth: the official *Securing your data*, *Row Level Security*,
*Database Advisors* and *Production Checklist* docs. Read alongside
[`nextjs.md`](nextjs.md).

Data modelling and migration mechanics live in
[`supabase-db`](../../supabase-db/SKILL.md); this is the security layer over
them.

---

## 1 · Keys and access models

- **Publishable key** (formerly `anon`) — safe in the browser, **only because
  RLS is on**. It ships in the JS bundle by design; with RLS enforced, every
  request is checked against the user's JWT.
- **Secret / service-role key** — bypasses RLS entirely. Never in the client, a
  `NEXT_PUBLIC_*` variable, a boot log, or an Edge Function error response. If
  it ever leaked: rotate immediately, *then* clean up, and audit
  `pg_stat_statements` for queries your application would not make.

Three ways to reach the database, each with its own model: the **Data API**
(client libraries, REST, GraphQL — protected by RLS plus grants), **Edge
Functions** (server-side secrets; verify the JWT), and **direct connections**
(keep the connection string secret).

**If the app only reaches the database server-side, disable the Data API.** It
is the strongest single lockdown available and it costs nothing.

## 2 · RLS is mandatory

RLS must be on for every table in an exposed schema (default `public`). Tables
created through the Table Editor get it automatically; **tables created by SQL
do not.** Enabling RLS defaults to deny-all until policies exist.

```sql
grant select on public.docs to anon;
grant select, insert, update, delete on public.docs to authenticated;
alter table public.docs enable row level security;
```

Consider an event trigger that auto-enables RLS on future tables — it prevents
the single most common regression, a new table shipped without it. Existing
tables still need it enabled by hand.

Any table without RLS **is** a public API:

```bash
curl "$SUPABASE_URL/rest/v1/<table>" -H "apikey: $PUBLISHABLE_KEY"   # returns every row
```

## 3 · Policy semantics and the trap list

| Operation | Clause needed |
|---|---|
| SELECT | `using` |
| INSERT | `with check` |
| UPDATE | `using` **and** `with check` |
| DELETE | `using` |

Traps that silently break isolation while looking like working policies:

- 🔴 **`USING (true)` / `WITH CHECK (true)`** — identical to no RLS. Scope it:
  `using ((select auth.uid()) = user_id)`.
- 🔴 **Views bypass RLS by default.** A view is created by the `postgres` user
  and is implicitly `security definer`, ignoring the underlying tables'
  policies. Fix on PG15+: `create view v with (security_invoker = true) as …`.
  On older versions: revoke from `anon`/`authenticated`, or put the view in an
  unexposed schema.
- 🔴 **`user_metadata` in a policy.** `raw_user_meta_data` is user-editable via
  `supabase.auth.update()` — a user can grant themselves whatever it checks.
  Authorization data belongs in `raw_app_meta_data`. Note the JWT is not always
  fresh: removing someone from a team in `app_metadata` takes effect only after
  a token refresh.
- **UPDATE without `with check`** — the `using` expression gets reused, which
  lets a user rewrite a row they can see so that it belongs to someone else.
- **UPDATE without a SELECT policy** — UPDATE will not behave as expected.
- **Missing null-guard** — for an unauthenticated request `auth.uid()` is
  `null`, and `null = user_id` is always false. That is a silent pass. Be
  explicit: `using (auth.uid() is not null and auth.uid() = user_id)`.
- **No `TO` clause** — the policy also runs for `anon`. Set `to authenticated`.

## 4 · The Security Advisor lint map — run this first

The dashboard **Security Advisor** is a free database linter and the fastest
first pass there is. What each relevant lint means:

| Lint | Meaning → action |
|---|---|
| 0002 auth users exposed | `auth.users` reachable via the API → restrict or wrap |
| 0003 auth rls initplan | policy calls `auth.*` per row → wrap as `(select auth.uid())` |
| 0007 policy exists, RLS disabled | policies written but RLS off → enable it |
| 0008 RLS enabled, no policy | table returns nothing → add policies, or confirm it is intended |
| 0010 security definer view | view bypasses RLS → `security_invoker = true` |
| 0011 function search_path mutable | injection via a mutable path → pin `set search_path = ''` |
| 0012 allow anonymous sign-ins | anonymous users assume `authenticated` → confirm intended |
| 0013 RLS disabled in public | the table is a public API → enable RLS |
| 0014 extension in public | move extensions out of `public` |
| 0015 RLS references user_metadata | user-editable authorization → move to `app_metadata` |
| 0016 materialized view in api | exposed via the API → restrict |
| 0019 insecure queue exposed | pgmq queue reachable → restrict |
| 0023 sensitive columns exposed | PII reachable via the API → column-level security, or drop from the view |
| 0024 permissive rls policy | a `true`-style policy → scope it |
| 0025 public bucket allows listing | bucket contents enumerable → make it private |
| 0026 / 0027 pg_graphql table exposed | exposed to anon/authenticated via GraphQL → RLS and grants |
| 0028 / 0029 definer fn executable | anon/authenticated can call a definer function → revoke or guard |

## 5 · Functions, RPC and `search_path`

`security definer` functions run with the creator's rights and bypass RLS. Put
them in a **non-exposed** schema, pin `set search_path = ''` with
fully-qualified table names, and confirm `anon` cannot call them via PostgREST
unless that is intended (lints 0028/0029).

Used well, a definer helper removes RLS overhead on join and role tables — wrap
the call as `(select private.has_role())` inside the policy.

A definer function should take parameters and **return a decision**, never
return rows. A definer function that returns data is a hole shaped like a
function. And it should read `auth.uid()` itself rather than accepting a user id
the caller can lie about.

## 6 · Storage

- Buckets are private by default, and a private bucket enforces policies on
  every operation including download. Mark one public only for genuinely
  open-web files (lint 0025).
- Storage is governed by RLS on `storage.objects` — the same model as tables.
- Upload paths carry the owner or org id and are **built server-side**, not
  supplied by the client.
- Prefer short-lived signed URLs over public ones. A public URL has no expiry,
  no auth, and is shareable forever.
- Enforce type and size limits server-side. The browser's `accept` attribute is
  a hint. Generate the stored filename; never trust the uploaded one.

## 7 · Realtime

RLS applies to Realtime subscriptions too — a broken policy leaks change
*events*, not only query results. Enable RLS on any table you subscribe to,
configure Realtime authorization, and test subscriptions from a second account
exactly like any other read.

## 8 · Auth hardening

Project settings:

- **Leaked password protection** on — checks against HaveIBeenPwned, which
  blocks credential stuffing
- **Strong password policy** — minimum length ≥ 8, required character classes
- **Email confirmations** on; email-enumeration protection on
- **Anonymous sign-ins** — they assume the `authenticated` role. Disable if
  unused (lint 0012)
- **Auth rate limits** plus CAPTCHA on signup, sign-in and reset. Behind a
  proxy, forward the real client IP or you are rate-limiting your own server
- **Redirect URL allow-list** without wildcards; no `localhost` in production
- **Session lifetime** set deliberately — the defaults are long

Account and organisation: MFA on the Supabase account and enforced org-wide,
multiple org owners, IP allow-list on direct Postgres connections, SSL enforced.
Rotate keys when someone with access leaves.

## 9 · Performance, measured

RLS makes queries slower in specific, fixable ways. From the official docs:

- **Index every column used in a policy** — 171 ms → under 0.1 ms
- **`(select auth.uid())` instead of `auth.uid()`** — the initplan caches it per
  statement: 179 ms → 9 ms, and more for `security definer` calls
- **Duplicate the filter in the query** even though the policy enforces it —
  `.eq('user_id', id)` lets Postgres build a better plan
- **Set `TO authenticated`** so the policy is skipped entirely for `anon` —
  170 ms → under 0.1 ms
- **Avoid joins inside policies.** Select the filter set into an `IN` / `ANY`

"RLS made everything slow" is nearly always one of these five.

## 10 · The exposure test and the required automated test

Per table, with the publishable key:

```bash
curl "$SUPABASE_URL/rest/v1/<table>?select=*" -H "apikey: $PUBLISHABLE_KEY"
# expect: []
```

And the one automated test that is not optional — an RLS **negative** test via
the client SDK with two real sessions:

```ts
const alice = await signInAs('alice@test.dev')
const bob   = await signInAs('bob@test.dev')

const { data: row } = await bob.from('docs').insert({ /* … */ }).select().single()

expect((await alice.from('docs').select().eq('id', row.id)).data).toHaveLength(0)  // cannot read
await alice.from('docs').delete().eq('id', row.id)
expect((await bob.from('docs').select().eq('id', row.id)).data).toHaveLength(1)    // survived
```

Cover every per-user and per-tenant table, and run it in CI. **The SQL editor
bypasses RLS, so testing there proves nothing** — this is the single most common
way a team convinces itself its policies work.
