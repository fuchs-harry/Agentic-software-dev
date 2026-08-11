# Going live

The first launch is a gate ([`ship`](../../ship/SKILL.md) → G4). Work through
this before asking for the go-ahead, so the person approving it is deciding
with real information.

---

## Before

**Domain and certificate**

- [ ] Domain bought, DNS managed where you can reach it
- [ ] DNS pointed at the host — do this days before, propagation can take 24h
- [ ] HTTPS certificate issued (automatic on any host worth using)
- [ ] `www` redirects to the bare domain, or the reverse — **pick one**
- [ ] Renewal reminder in a calendar

**Data**

- [ ] Production database is separate; nothing else points at it
- [ ] Automated backups on
- [ ] **A backup actually restored, once, to a scratch environment.** Not
      "backups are enabled" — restored. The first attempt always reveals a step
      nobody wrote down
- [ ] RLS enabled on every table, verified from the wrong side
      ([`supabase-db`](../../supabase-db/SKILL.md))
- [ ] Supabase advisors run, findings addressed or consciously accepted

**Secrets**

- [ ] Production values set in the host's dashboard, nowhere else
- [ ] Nothing sensitive in a `NEXT_PUBLIC_*` / `VITE_*` variable
- [ ] Service key server-side only; grep the built bundle for it once, to be sure
- [ ] No key has ever been committed — if one has, it is already rotated

**The application**

- [ ] The charter moment works, on a phone, on a real connection
- [ ] Empty states are correct — a brand-new user is the first person to see them
- [ ] Errors are handled visibly; nothing shows a stack trace
- [ ] The 404 page exists and offers a way back
- [ ] Legal pages if you have users: privacy, imprint where required, terms
- [ ] Cookie/consent handling if you use analytics

**Knowing it broke**

- [ ] Error tracking installed and emailing you
- [ ] Uptime check on the real page, not `/health`
- [ ] Deploy-failure notification on
- [ ] You know where the logs are and have opened them once

**The way back**

- [ ] Rollback **performed once**, and timed. Write the number down
- [ ] You know which commit is currently live
- [ ] You know how to put the site into a holding state if you must

---

## The launch itself

Do it in this order. Each step makes the next one boring instead of exciting.

1. **Deploy quietly.** Nobody told, no announcement. The URL simply works.
2. **Be the first user.** Do the charter moment end to end, on a phone. Not a
   click-through — actually use it.
3. **Read the error log.** Not "no alerts fired" — open it and look.
4. **Roll back, then forward again.** Now, while nothing is wrong. Time it. If
   this does not work you have just discovered it on the cheapest possible day.
5. **One real person.** Watch them use it without helping. This is the most
   informative twenty minutes of the entire project.
6. **Then everyone.**

Choose a launch time you can watch: a weekday morning. Never a Friday
afternoon, and never right before you are unreachable.

---

## The first day

- Check the error log after an hour, after four hours, at the end of the day
- Expect a small pile of harmless errors — bots, scanners, old bookmarks. Learn
  which are noise so real ones stand out later
- Resist fixing everything immediately. Write it down, batch it, ship it through
  the loop tomorrow. Emergency patches on day one cause day two
- Ask the first users one question: *what did you expect to happen that didn't?*

---

## After the first week

- [ ] The noisy alerts tuned so red means something
- [ ] The bugs found batched into plan nodes rather than patched ad hoc
- [ ] Charter revisited: did the moment actually land?
- [ ] A note written down of what the launch got wrong — you will launch again

---

## Being honest about what is not covered

At small scale, some things are legitimately not worth building yet. Decide
them deliberately and write the decision down rather than discovering later
that you assumed:

| Not built | Fine until |
|---|---|
| Staging environment | previews on pull requests stop being enough |
| Zero-downtime deploys | a few seconds of interruption bothers someone |
| Load testing | you have enough traffic for load to be a question |
| Multi-region | latency or data residency becomes a real requirement |
| Runbooks | more than one person is on call |

The ones that are **not** optional at any scale: backups you have restored,
error tracking, a rollback you have tested, and secrets outside the repository.
Everything above can wait. Those four cannot.
