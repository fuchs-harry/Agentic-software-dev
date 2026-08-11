# Next.js (App Router) security

Source of truth: the official *How to think about data security in Next.js*
guide, plus the 2025–2026 CVE record. Read alongside
[`supabase.md`](supabase.md) — most real applications combine both.

---

## 1 · The Data Access Layer

The official recommendation for new projects: a `data/` library that runs only
on the server, performs the authorization checks, and returns minimal DTOs
rather than raw database rows.

**Pick one data-fetching pattern for the whole project** — DAL, external HTTP
API, or component-level — and do not mix them. Mixing makes both development and
audit intractable, because there is no single place where "is this allowed?"
lives.

```ts
// data/auth.ts
import { cache } from 'react'
import { cookies } from 'next/headers'

// cache() lets every server component read the same user without passing it
// around — passing it around is exactly how it leaks to the client.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get('AUTH_TOKEN')
  const decoded = await decryptAndValidate(token)
  return new User(decoded.id)     // a class cannot be serialized to a client component
})
```

```ts
// data/user-dto.ts
import 'server-only'

export async function getProfileDTO(slug: string) {
  const [rows] = await sql`select * from users where slug = ${slug}`
  const viewer = await getCurrentUser()
  return {                                    // only the fields the caller may see
    username: rows[0].username,
    phone: canSeePhone(viewer, rows[0].team) ? rows[0].phone : null,
  }
}
```

**The rule that catches the most leaks: only the data layer reads
`process.env`.** It is grep-enforceable, which is why it works:

```bash
grep -rn "process\.env" app components lib hooks | grep -v "^data/"   # expect empty
```

## 2 · `server-only`

```ts
import 'server-only'    // top of every module that touches secrets
```

Turns "this leaked to the browser" from a runtime surprise into a build error.
`npm install server-only`. One line, and it is the cheapest guarantee available.

## 3 · Server Actions

**What Next.js gives you already:**

- Encrypted, non-deterministic action ids, recalculated between builds
- Dead-code elimination — an unused action gets no public endpoint
- CSRF defense — POST-only, plus `Origin` compared against `Host` /
  `X-Forwarded-Host`; a mismatch aborts
- Closure encryption — variables an action closes over are encrypted, with a new
  key per build

**What you still must do.** The documentation is explicit: every exported action
is reachable via a direct POST even if it is never imported anywhere, and a
page-level auth check does **not** extend into it.

```ts
// data/posts.ts
import 'server-only'
import { z } from 'zod'

const Input = z.object({ postId: z.string().uuid() })   // no ownerId — that comes from the session

export async function deletePost(raw: unknown) {
  const parsed = Input.safeParse(raw)
  if (!parsed.success) throw new Error('Invalid input')

  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const post = await db.post.findUnique({ where: { id: parsed.data.postId } })
  if (post?.authorId !== user.id) throw new Error('Forbidden')   // ownership = authorization

  await db.post.delete({ where: { id: parsed.data.postId } })
}
```

```ts
// app/actions.ts — a thin wrapper
'use server'
import { deletePost } from '@/data/posts'

export async function deletePostAction(input: unknown) {
  await deletePost(input)        // auth and authorization happen in the data layer
  revalidatePath('/posts')
  return { success: true }       // never the raw record
}
```

Behind a reverse proxy or on a different domain, set
`serverActions.allowedOrigins` or the Origin/Host check aborts legitimate
requests. Self-hosted across several instances: set
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` so closure keys are stable between them.

## 4 · Authentication is not authorization

Insecure Direct Object Reference: logged in is not the same as allowed to act on
*this* object. Fetch the resource and compare ownership before mutating or
returning it — the `post.authorId` check above is the whole pattern.

It is the most common serious bug in small applications, and it passes every
test written from the owner's point of view.

## 5 · Return values and client props

- Server Action return values are serialized to the client. Return DTOs.
- A `"use client"` prop typed `user: User` is a design smell: it invites passing
  the whole object down, and one day someone renders it. Type props to exactly
  the fields rendered.

## 6 · Untrusted inputs

```tsx
// ✗ trusting the client
if ((await searchParams).isAdmin === 'true') return <AdminPanel />

// ✓ re-verify on the server
if (await verifyAdmin(await cookies())) return <AdminPanel />
```

Bracket folders (`/[param]/`) are user input. Validate them.

## 7 · No mutations during render

No cookie writes, cache revalidation or database writes in a component body.
Next.js blocks the obvious cases; keep mutations in Server Actions (POST) so a
GET cannot be turned into a CSRF.

## 8 · Framework currency is a security control

Next.js middleware and Server Actions have a substantial recent CVE history.
Patching is the only complete mitigation, and unpatched minors plus the 13.x and
14.x lines receive no fixes at all.

Know the *shapes*, not the numbers:

- **Middleware auth bypass** — a spoofed `x-middleware-subrequest` header skips
  middleware entirely (CVE-2025-29927, CVSS 9.1). Self-hosted `next start` with
  `output: standalone` was most exposed. A later variant bypassed via Turbopack +
  legacy `middleware.ts` + single-locale i18n (CVE-2026-64642). **This is the
  CVE record proving golden rule 2.**
- **SSRF** — attacker-controlled destination hostname in `rewrites()` /
  `redirects()`; Server Actions on custom Node servers redirecting outbound
  requests; WebSocket-upgrade SSRF; an older middleware SSRF that chained to RCE.
- **Cache poisoning** — RSC responses shared between users under shared caches
  with insufficient partitioning, leaking POST-response data across requests.
  Be deliberate with CDNs in front of authenticated responses.
- **DoS** — unbounded Server Action payloads; image-optimizer SVG CPU exhaustion
  on self-hosted instances with allowed remote images.
- **Info disclosure** — internal Server Function endpoint ids exposed to
  unauthenticated users.
- **XSS** — App Router apps using CSP nonces, and `beforeInteractive` scripts
  consuming untrusted input.

Daily takeaways: `npm audit` and a version check are part of every review, not a
quarterly chore. Strip `x-middleware-subrequest` at the proxy as defense in
depth. Never rely on middleware alone for authorization.

## 9 · Image optimizer, caching, CSP nonces

- `images.remotePatterns` with broad wildcards on a self-hosted optimizer is an
  SSRF and DoS surface. Prefer tight patterns, a custom loader, or
  `images.unoptimized` where appropriate.
- If a CDN or cache sits in front of authenticated responses, verify per-user
  partitioning so one user's response cannot be served to another.
- Building a CSP nonce from or near untrusted input reintroduces XSS. Keep nonce
  generation isolated from user data.

## 10 · Security headers

In `next.config` or the proxy:

- `Content-Security-Policy` — nonce-based. Highest value, most effort
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disable the browser APIs you do not use

Verify against securityheaders.com after deploying. It takes a minute and it is
the only way to know the headers actually survived the hosting layer.
