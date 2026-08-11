# Environments

Three, and the discipline is that they differ **only** in data and
configuration.

```
LOCAL        seeded fake data     your working tree      you
PREVIEW      a test database      every PR branch        reviewers
PRODUCTION   real data            main, after merge      everyone
```

---

## Why "only data and configuration"

The moment behaviour branches on the environment, you have created a code path
that nobody has ever exercised — and it is the one your users run.

```js
// ✗ production now behaves in a way no test has ever covered
if (process.env.NODE_ENV === 'production') {
  sendRealEmail(to, body)
} else {
  console.log('would send', to)
}

// ✓ same code path everywhere; the difference is which implementation is injected
const mailer = createMailer(config.mail)   // console driver locally, SMTP in production
await mailer.send(to, body)
```

The second version runs identical logic in all three environments. The seam is
configuration, and configuration is testable.

---

## Preview environments

The highest-value item on this page, and usually one checkbox.

Vercel, Netlify and Cloudflare Pages build a URL per pull request
automatically. What that buys:

- A reviewer **clicks the change** instead of imagining it from a diff
- A non-technical person approves something they have actually used
- End-to-end tests run against a real deployment, not a dev server
- "Works on my machine" stops being a sentence anyone can say

Two conditions:

1. **Never the production database.** Every automated test that runs against a
   preview will eventually run a destructive one. Use a separate Supabase
   project or a branch database.
2. **Not indexed, not public if the data is sensitive.** Preview URLs are
   guessable and get shared. Password-protect them if the test data is anything
   more than obvious nonsense.

---

## Configuration

One place that reads the environment, validates it, and hands out typed values.
Never `process.env.WHATEVER` scattered through the code.

```ts
// lib/config.ts
import { z } from 'zod'

const Env = z.object({
  DATABASE_URL:            z.string().url(),
  SUPABASE_URL:            z.string().url(),
  SUPABASE_ANON_KEY:       z.string().min(1),
  SUPABASE_SERVICE_KEY:    z.string().min(1),   // server only — never imported client-side
  APP_URL:                 z.string().url(),
})

export const config = Env.parse(process.env)    // fails at boot, loudly, with the missing name
```

The value here is the failure mode. A missing variable stops the application at
startup with a message naming it — instead of surfacing three days later as a
mysterious `undefined` in a code path nobody visits often.

Keep the parse in a module that is never imported by client code, or split it
into a public and a server config. A schema containing the service key that
gets imported into a component ships the key to the browser.

---

## `.env.example`

Committed, and it holds the **keys with empty values**:

```bash
# Copy to .env and fill in. Values come from the Supabase dashboard.
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
APP_URL=http://localhost:3000
```

It is documentation that cannot go stale silently: if someone adds a variable
without adding it here, the next person's application fails at boot with the
name of what is missing.

---

## Seed data

Local development needs data that looks real:

```
2 users, one of whom owns nothing (this account finds the empty states)
3 properties with names of realistic length, including one very long
40 bookings across past, present and future
1 cancelled booking
1 booking with an apostrophe and an umlaut in the guest name
```

Deliberately awkward data catches layout and encoding bugs before a user does.
The account that owns nothing is the most useful one — it is the only way the
empty states get looked at regularly.

**Never seed from production.** Copying real rows into a fixture puts personal
data into the repository permanently, and every developer's laptop now holds a
copy of your users.

---

## Which database per environment

| Environment | Database |
|---|---|
| Local | local Postgres (`supabase start`), or a personal project |
| Preview | one shared test project, or a Supabase branch per PR |
| Production | its own project, nothing else touches it |

The rule that must never bend: **nothing except production points at
production.** Not a preview, not a local `.env` you edited "just to check
something", not a CI job. The single most common cause of destroyed production
data is a test suite run against the wrong URL.

Make it structurally hard: keep the production credentials only in the
production host's dashboard. If they are not in any developer's `.env`, they
cannot end up in the wrong one.
