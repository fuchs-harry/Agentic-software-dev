# Choosing a stack, and recording why

The goal is not the best stack. It is a stack you can **state a reason for**,
and that an agent has seen ten thousand examples of.

---

## Defaults that are right often enough

| Need | Default | When it is wrong |
|---|---|---|
| A website with pages and forms | **Next.js + TypeScript + Tailwind** | Static marketing-only site → Astro. Nothing dynamic → plain HTML is not an embarrassment |
| Database + login + file storage | **Supabase** (Postgres) | Enterprise SSO requirements; or you already run Postgres somewhere |
| Hosting | **Vercel** for Next.js, **Netlify/Cloudflare** for static | Data must stay in a specific country → check the region before committing |
| Tests | **Vitest** (unit) + **Playwright** (click-through) | Nothing — this default has no good exception |
| Package manager | **pnpm** | A team already standardised on something else |
| Phone app | **a good mobile web app first** | Push notifications, camera or offline are core → React Native |
| Background jobs / scheduling | the platform's own (Supabase cron, Vercel cron) | Long-running work → a queue, and that is a real decision, record it |

**Boring beats clever, and it is not close.** An agent writing Next.js is
drawing on an enormous amount of examples. The same agent writing your
favourite three-month-old framework is guessing with confidence, which is worse
than guessing.

---

## The four questions that actually decide it

1. **What has the most examples in the world?** This is the single strongest
   predictor of how fast you get unstuck — for a human and for an agent.
2. **What can one person run without a platform team?** Managed beats
   self-hosted for anything you do not want to be woken up by.
3. **How do I get my data out?** Ask before you put data in. If there is no
   clear export, you have accepted a lock-in you never discussed.
4. **Where does the data physically live?** If there are legal constraints
   (EU personal data is the common one), this is a hard filter, not a
   preference — apply it before comparing anything else.

---

## Writing the decision down

`docs/decisions/0001-stack.md`. Short. Four sections:

```markdown
# 0001 · Stack

Status: accepted
Date: 2026-08-11

## Context

One person maintaining it, no ops experience. Guest names and addresses are
stored, so the data must stay in the EU. Roughly 50 bookings a month —
performance is not a constraint. Must work well on a phone.

## Decision

Next.js + TypeScript on Vercel, Supabase (EU region) for database, auth and
storage, Vitest and Playwright for tests, pnpm.

## Consequences

- Database and auth come as one thing — less to wire, more vendor concentration
- Postgres row-level security is now load-bearing: every table needs a policy
  from the day it is created, not later
- Vercel's free tier is enough at this size; the first real cost is at ~100k
  requests a month
- Getting out means exporting Postgres (straightforward) and rewriting the
  auth layer (not straightforward). Accepted.

## Rejected

- **Firebase** — data location harder to guarantee for EU personal data
- **A spreadsheet plus a form tool** — genuinely considered; rejected because
  double bookings are the exact problem to solve and it cannot prevent them
- **Self-hosted Postgres on a VPS** — nobody here wants to run backups
```

The **Rejected** section is the one that pays off. Six months later somebody
asks "why aren't we on Firebase?" and the answer takes ten seconds instead of
an afternoon.

---

## Numbering and later decisions

Decisions are numbered and append-only: `0001-stack.md`, `0002-…`. You do not
edit an old decision to reflect a new opinion — you write a new one that says
`Supersedes 0001` and set the old one's status to `superseded by 0004`.

The history of what you believed and when is worth more than a tidy folder.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Choosing by what is trending | Trending means few examples and unstable APIs |
| Three databases "for different purposes" | Three ways to be down, three backup schemes |
| Microservices at the start | Distributed systems problems before you have users |
| No decision record | The same debate every six weeks, from zero |
| Picking a stack the agent has barely seen | You will be reviewing confident fiction |
| Deciding the stack before the charter | You are optimising for a product nobody has described yet |
