---
name: nextjs-supabase-security
description: >-
  Security guardrails for Next.js (App Router) + Supabase, caught while the code is being
  written rather than months later in an audit. Use WHENEVER writing or reviewing any of:
  Server Actions, Route Handlers, middleware or proxy config, RLS policies, SQL migrations,
  tables/views/functions, authentication or authorization logic, client components that
  fetch or receive data, file uploads and storage buckets, LLM or AI endpoints, or
  next.config. Also use before merging any pull request that touches data access, auth or
  the database. Trigger even if nobody says the word "security" — any change to how data is
  read, written or authorized consults this first. When in doubt, load it.
---

# Next.js + Supabase — security guardrails

The aim is to catch the mistakes that happen in ordinary daily development, at
the moment they are being made. Not an audit methodology — a set of checks you
run while typing.

This skill is the *how*. [`supabase-db`](../supabase-db/SKILL.md) covers data
modelling and migrations; [`ship`](../ship/SKILL.md) sets the dial — anything in
this skill is `effort: deep`, `gates: strict` by default.

Depth: **[`references/nextjs.md`](references/nextjs.md)** (DAL, Server Actions,
the CVE record, headers) · **[`references/supabase.md`](references/supabase.md)**
(policy semantics, the Advisor lint map, auth hardening, storage).
Copy into the PR: [`assets/pre-merge-checklist.md`](assets/pre-merge-checklist.md).

---

## Golden rules

1. **Two independent layers must agree.** App-layer authorization in a
   server-only Data Access Layer, **and** database RLS. Either alone is a single
   point of failure.
2. **Middleware / `proxy.ts` is not a security boundary.** It is routing. Real
   CVEs have bypassed it entirely — a spoofed `x-middleware-subrequest` header
   (CVE-2025-29927, CVSS 9.1), and later a Turbopack + legacy middleware + i18n
   variant. Never let it be the only thing between a user and data.
3. **Everything from the client is untrusted** — form data, `searchParams`,
   `[param]` segments, headers, cookies, and LLM output. Validate with Zod at
   every entry point.
4. **Authentication is not authorization.** "Logged in" never means "allowed to
   touch *this* row". Check ownership on every mutation and every sensitive
   read. This is IDOR, and it is the most common serious bug in small apps.
5. **The publishable/anon key is public and that is fine — only because RLS is
   on.** The service-role key bypasses RLS and must never reach the client, a
   `NEXT_PUBLIC_*` variable, a log, or an error response.
6. **Every database change is a versioned migration.** RLS, policies, grants,
   functions. Never a one-off dashboard edit — the migrations are the audit
   trail, and a dashboard change exists in exactly one place.
7. **Framework currency is a security control, not hygiene.** Next.js ships
   monthly security releases; unpatched minors and the 13.x/14.x lines get no
   fixes. `npm audit` plus a version check belongs in every review.

---

## Writing a Server Action (`"use server"`)

Every exported action is a **public POST endpoint**, reachable directly even if
the UI never calls it. A page-level auth check does not extend into it.

Five things, every time:

- ✅ Arguments validated with Zod `safeParse` — not `parse`, which throws a
  stack trace to the caller
- ✅ User re-authenticated **inside** the action: `supabase.auth.getUser()`,
  not `getSession()`
- ✅ Ownership of the specific resource checked — the row belongs to this user
- ✅ Return value is a minimal DTO (`{ success: true }`), never a raw DB record
- ✅ Database access delegated to a `server-only` module

**The tenant or org id comes from the session, never from the request body.**
A body field named `orgId` is a request, not a fact.

Code template and what Next.js gives you for free (encrypted action ids, CSRF
origin check, closure encryption): [`references/nextjs.md`](references/nextjs.md).

## Writing an RLS policy

- ✅ `TO authenticated` (or the correct role) — an unscoped policy also runs for `anon`
- ✅ Not `USING (true)` / `WITH CHECK (true)` — identical to having no RLS
- ✅ UPDATE has **both** `using` and `with check`, and the table also has a
  SELECT policy
- ✅ Null-guarded: `auth.uid() is not null and auth.uid() = user_id`. For an
  anonymous request `auth.uid()` is `null`, and `null = user_id` is always
  false — a silent pass that looks like a working policy
- ✅ Authorization reads `app_metadata` / `raw_app_meta_data`, **never**
  `user_metadata` — the user can edit their own `user_metadata` and grant
  themselves whatever it checks
- ✅ Wrapped as `(select auth.uid())` for the initplan cache; policy columns indexed

Then prove it — the honest test, per table:

```bash
curl "$SUPABASE_URL/rest/v1/<table>?select=*" -H "apikey: $PUBLISHABLE_KEY"
# expect: []
```

Any table without RLS *is* a public API, and that command returns every row.

## Adding a table, view, function or migration

- ✅ `alter table … enable row level security` on every new table in an exposed
  schema, plus least-privilege `grant`s. Table-Editor tables get RLS
  automatically; **SQL-created tables do not**
- ✅ Every view created `with (security_invoker = true)` — **views bypass RLS by
  default**, because they are created by `postgres` and are implicitly
  `security definer`
- ✅ `security definer` functions live in a non-exposed schema, pin
  `set search_path = ''`, and are not callable by `anon` unless intended
- ✅ Run the **Supabase Security Advisor** — a free database linter that flags
  RLS-off tables, RLS-without-policy, definer views, mutable `search_path`,
  exposed sensitive columns, `user_metadata` in policies, public buckets. It is
  the fastest first pass. Lint map: [`references/supabase.md`](references/supabase.md)

## Writing client / UI code

- ✅ `"use client"` prop types are narrow — never `user: User`; pass only the
  fields actually rendered
- ✅ `process.env` is read **only** in the data layer, never in a client
  component. This one is grep-enforceable, which is why it catches so much
- ✅ `searchParams` and `[param]` are never an authorization source
- ✅ `dangerouslySetInnerHTML`, rendered markdown and LLM output go through
  DOMPurify
- ✅ No mutations during render — no cookie writes or revalidation in a
  component body

## Calling an LLM

- ✅ User or document content is never concatenated into the system prompt; it
  stays in a user message
- ✅ LLM output is untrusted: no raw HTML, no query, path or command built from it
- ✅ Rate limit per user **and** per org; enforce `max_tokens` and a timeout;
  add cost alerting
- ✅ Model region and prompt/response retention documented, if personal data
  can reach it

## Touching config

- ✅ Security headers: nonce-based CSP, HSTS, `X-Frame-Options: DENY`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy`
- ✅ No CORS `*` on authenticated endpoints
- ✅ `images.remotePatterns` has no broad wildcards — a self-hosted image
  optimizer is an SSRF and DoS surface
- ✅ Disable the Supabase Data API entirely if the app only reaches the database
  server-side. Strongest single lockdown available
- ✅ Defense in depth: strip `x-middleware-subrequest` at the proxy or WAF

---

## The one test that matters most

An **RLS negative test**: a second user must not be able to read, update or
delete the first user's rows.

```ts
const alice = await signInAs('alice@test.dev')
const bob   = await signInAs('bob@test.dev')

const { data: row } = await bob.from('docs').insert({ /* … */ }).select().single()

expect((await alice.from('docs').select().eq('id', row.id)).data).toHaveLength(0)
await alice.from('docs').delete().eq('id', row.id)
expect((await bob.from('docs').select().eq('id', row.id)).data).toHaveLength(1)
```

Written against the client SDK with **two real sessions**, and run in CI. The
SQL editor bypasses RLS, so testing there proves nothing at all.

Then the negative control ([`testing-and-ci`](../testing-and-ci/SKILL.md)): drop
the policy, watch the test fail, restore it. If it stays green with the policy
gone, the test is not reaching the database.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Auth check in middleware only | Bypassed by real, published CVEs |
| `getSession()` inside a Server Action | Does not re-verify; `getUser()` does |
| Org id read from the request body | The caller chooses their own tenant |
| `USING (true)` | Identical to no RLS, while looking like a policy |
| A view over an RLS table, no `security_invoker` | Returns every row to everybody |
| `user_metadata` in a policy | The user can edit it and grant themselves access |
| Policy without `TO authenticated` | Also runs for anonymous requests |
| `parse` instead of `safeParse` | Throws a stack trace to the caller |
| Raw DB record returned from an action | Serialized straight to the client |
| `process.env` in a client component | The classic route for a secret into the bundle |
| Testing RLS in the SQL editor | The editor bypasses RLS. Proves nothing |
| "We'll run the Advisor before launch" | It takes thirty seconds. Run it every release |

---

## Done means

- [ ] Both layers present: server-side ownership check **and** an RLS policy
- [ ] Every touched policy: `TO` role · not `true` · UPDATE has both clauses ·
      null-guarded · no `user_metadata` · `(select auth.uid())` · columns indexed
- [ ] New views `security_invoker = true`; definer functions pin `search_path`
- [ ] Security Advisor run, no new criticals
- [ ] Every new Server Action: Zod `safeParse` · re-auth inside · ownership ·
      DTO return · via the data layer
- [ ] No `process.env` or service key outside the data layer — grep is clean,
      and so is a grep of the built bundle
- [ ] RLS negative test added and passing in CI, with its negative control
- [ ] `npm audit` clean at high; framework on a patched minor
