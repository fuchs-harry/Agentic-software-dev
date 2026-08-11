---
name: deployment
description: >-
  Getting software onto the internet and keeping it there: environments that differ only
  in data, secrets that live outside the repository, a deploy that can be undone in two
  minutes, a domain and its certificate, and knowing something is broken before a user
  tells you. Use when asked to "put it online", "deploy this", "make it live", "set up the
  domain", "why is production broken", or when setting up environment variables, hosting,
  or a release process. Going live for the first time is a `gates: strict` action — a
  human approves it.
---

# Getting it live, and keeping it there

Deployment is not the end of building. It is the beginning of the part where
being wrong affects people who did not consent to your afternoon.

```
LOCAL        your machine. Fake data. Break it freely.
PREVIEW      one per pull request, automatic. Real code, fake data.
PRODUCTION   real users, real data. Only reached through a merged PR.
```

The rule that makes this work: **the three differ only in data and
configuration, never in code paths.** The moment you write
`if (isProduction) …` around behaviour, you have a fourth environment that
nobody has ever tested — the one your users are in.

---

## Environments

| | Data | Deployed from | Who sees it |
|---|---|---|---|
| Local | seeded, fake | your working tree | you |
| Preview | a test database | every pull request branch | reviewers |
| Production | real | `main`, after merge | everyone |

Preview environments are the highest-value thing on this page. A reviewer can
**click the change** instead of imagining it from a diff, and a non-technical
person can approve something they have actually seen. Vercel, Netlify and
Cloudflare do this per pull request by default; turn it on.

Preview must **never** point at the production database. Every automated test
that ever runs against a preview will eventually run a destructive one.

Details, including seed data and per-environment configuration:
**[`references/environments.md`](references/environments.md)**.

---

## Secrets

```
.env              your machine only, in .gitignore from commit one
.env.example      committed — the KEYS with empty values, so others know what is needed
hosting dashboard the real values for preview and production
GitHub Secrets    the values CI needs
```

Rules:

- **Never in the repository.** Not once, not temporarily. A secret is
  compromised the moment it is committed, and deleting it next commit does not
  help — it is in the history.
- **Never in a client-visible variable.** `NEXT_PUBLIC_*` and `VITE_*` are
  compiled into the bundle. Anything there is public, permanently.
- **Never in a log.** Not even truncated.
- **Different values per environment.** A single key shared by preview and
  production means a test run can act on real data.
- **Rotate on exposure, before cleanup.** The rotation ends the exposure in
  seconds; the history cleanup takes twenty minutes and protects nothing while
  the key is still valid.

---

## The deploy itself

```
merge to main → CI runs → build → deploy → verify
```

Deployment is automatic **from `main` only**. No deploying from a laptop, no
deploying a branch, no manual upload. A deploy that can only happen one way is
a deploy that always happened the way you think it did.

Two properties matter more than speed:

1. **You can undo it in two minutes.** Redeploying the previous version, one
   click or one command. Test this once, deliberately, before you need it.
2. **You know it worked.** Not "the deploy succeeded" — the *application*
   works. Open it. Do the charter moment. Look at the error log.

The first deploy is a **G2/G4 gate** ([`ship`](../ship/SKILL.md) → gates): a
human says go, having been told what happens if it is wrong and how long the
way back takes.

---

## First launch

Order matters — each step makes the next one safe rather than exciting.

1. Deploy to production with **nobody looking**. Just the URL, not announced.
2. Do the charter moment yourself, as a real user, on a phone.
3. Check the error log. Not "no errors reported" — actually open it.
4. Confirm the way back works: deploy the previous version, then deploy forward
   again. Time it.
5. Now tell one person. Watch what they do.
6. Then everyone else.

Steps 4 and 5 are the two people skip, and they are the two that make the
difference between a launch and an incident.

Full checklist including domain, certificate, backups and the day-one
monitoring: **[`references/going-live.md`](references/going-live.md)**.

---

## Domain and certificate

- Buy the domain somewhere you can also manage DNS
- Point it at the host; HTTPS certificates are automatic and free everywhere
  worth using — if a host wants money for one, use a different host
- **Redirect `www` to the bare domain, or the reverse.** Pick one. Both working
  independently splits your links, your analytics and your cookies
- DNS changes take up to a day to propagate. Do them before launch day, not on it
- Set a calendar reminder for the domain renewal. Expired domains are a
  surprisingly common cause of "the site is gone"

---

## Knowing it is broken

You will not be watching when it breaks. Something must tell you.

| Need | Minimum |
|---|---|
| **Errors** | error tracking (Sentry or equivalent) that emails you |
| **Is it up** | an uptime check every few minutes on the real page, not `/health` |
| **Did the deploy work** | the host's own notification, on failure |
| **Database** | backups on, and a restore you have actually performed once |

That is enough for a small application, and it is enormously better than
nothing. Do not build dashboards. Build the four alerts.

**A backup you have never restored is not a backup.** Restore one, once,
deliberately, to a scratch environment. The first attempt always reveals a step
nobody wrote down.

---

## When production breaks

Order is not negotiable:

1. **Restore service.** Roll back to the last good version. Do not debug first
   — understanding can wait, users cannot.
2. **Capture** what happened: the error, the time, what was deployed.
3. **Find the cause** on a branch, with a test that reproduces it.
4. **Ship the fix through the normal loop.** An emergency is not a reason to
   skip the plan — it is the situation where an unreviewed second mistake hurts
   most.

If a rollback is impossible because data changed, that is the forward fix from
the plan node's Rollback section. This is exactly why "not revertible" forces
`gates: strict` before the change ever ships.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Deploying from a laptop | Nobody can reproduce what is actually live |
| `if (isProduction)` around behaviour | An environment nobody has tested — the one users are in |
| Preview pointing at the production database | A test run will eventually delete something real |
| One secret shared across environments | A test acts on real data |
| Launching without testing the rollback | Discovering the way back does not work, while it is on fire |
| No error tracking | Your users are your monitoring, and they mostly just leave |
| Backups configured, never restored | Discovering they were empty during the incident |
| "It's just a small fix, straight to production" | Small fixes cause most outages, precisely because they skip the loop |

---

## Done means

- [ ] Three environments; they differ only in data and configuration
- [ ] Preview deploys per pull request, on a test database
- [ ] Secrets outside the repository, different per environment, none in the bundle
- [ ] Deploy happens only from `main`, automatically
- [ ] Rollback **performed once** and timed
- [ ] Error tracking, uptime check, deploy notification, database backups on
- [ ] A backup actually restored, once
- [ ] Domain, HTTPS and the `www` redirect settled
- [ ] The charter moment done by a human on the live site
