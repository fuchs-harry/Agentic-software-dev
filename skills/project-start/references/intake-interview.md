# The intake interview

Twenty minutes of questions saves three weeks of building the wrong thing.

Rules for running it:

- **One question at a time.** A list of six gets one answer.
- **Do not translate into technical language while they talk.** "So you want a
  CRUD interface with role-based access" ends the conversation. They will agree
  because you sound like you know, and you will have lost the actual requirement.
- **Write their words down verbatim.** The charter is built from their
  vocabulary, and later so is the interface copy.
- **Chase the specific.** "Sometimes people want to change the date" → *"Tell
  me about the last time that happened. What did you do?"*

---

## Round 1 · The shape

**Who is this for?**
Push past "small businesses" to one person you could name. "Sabine, who rents
out two holiday flats and answers guests from her phone while at work."

**What do they do right now instead?**
There is always something — a spreadsheet, a notebook, WhatsApp, a competitor,
or nothing at all. This is the bar you have to clear. If the current answer is
"nothing", ask whether the problem is real or just annoying.

**What is the one moment that has to be good?**
Not the feature list. The single screen or action where, if it feels right,
the thing is worth using. Everything else is support for that moment.

**When it works, what changed for them?**
"Two hours a week back." "No more double bookings." Something you could put a
number on, even roughly.

---

## Round 2 · The edges

**What should it deliberately not do?**
If the answer is "I hadn't thought about that" — good, that is what this
question is for. Offer candidates: *"Should it handle payments? Send emails?
Work on a phone? Have multiple users?"* Every "no" is a week you did not spend.

**Who must never see what?**
The first permissions question, asked in human terms. If any answer separates
two people's data, the project is `effort: deep` from now on and needs
[`supabase-db`](../../supabase-db/SKILL.md) from the first table.

**What happens when it goes wrong?**
Double booking, wrong price, a message to the wrong person. Ask what the
consequence is: awkward, expensive, or legally serious. This sets the `gates`
dial for the whole project.

**How many, roughly?**
Ten users or ten thousand. Ten bookings a week or ten thousand a day. Order of
magnitude only — the answer changes the architecture exactly once, at the
boundaries.

---

## Round 3 · The things nobody volunteers

These do not come up unprompted and each one is a rewrite if discovered late.

| Ask | Why it changes everything |
|---|---|
| "Does it need to send anyone anything — email, SMS, WhatsApp?" | Third-party account, deliverability, consent, opt-out. Never small. |
| "Do people log in?" | Accounts, password resets, sessions, permissions. The single biggest cost multiplier. |
| "Does it need to talk to anything you already use?" | An integration is a contract with something you do not control |
| "Is any of this personal data?" | Names, addresses, phone numbers, messages → deletion, export and retention obligations |
| "Does money move?" | A payment provider, its rules, refunds, and a reconciliation problem forever |
| "Will you use it on your phone?" | If yes, it is mobile-first, and that is a layout decision made at the start |
| "Does anyone else need to use it with you?" | Multi-user is not one feature, it is a property of every screen |
| "What must never be lost?" | Sets the backup requirement, and therefore the database choice |

---

## Round 4 · The reality check

**Who maintains this in a year?**
If the honest answer is "nobody", build accordingly: fewer moving parts,
boring stack, managed hosting. This is a legitimate answer and it should shape
the choices rather than be quietly ignored.

**What is the deadline, and what happens if it slips?**
"Nothing" is a fine answer. "The season starts in March" is a different project
with a different first slice.

**What would make you abandon this?**
Uncomfortable, and worth asking. If the answer is "if it takes more than a
month", scope for that instead of discovering it in week five.

---

## Turning it into a charter

Do not paste the transcript. Compress to five answers, in their words:

```
For whom:        Sabine, who rents two holiday flats and replies from her phone
Instead of what: a WhatsApp thread and a paper calendar
The moment:      seeing at a glance which nights are still free, and blocking one in two taps
Not this:        payments, guest logins, more than five properties
Worked means:    no double booking for a whole season, and no calendar on paper
```

Read it back out loud. If they correct you — and they will, once — that
correction is the most valuable output of the entire interview.

---

## Signals to stop the interview and say something

- **Two products in one.** "It manages bookings and does the accounting."
  Name it: those are two projects; which one is first?
- **The problem is a process, not a tool.** Sometimes the honest answer is that
  software will not fix it. Say so once, plainly, and let them decide.
- **They are describing a competitor's feature list.** Go back to *their* moment.
  A feature list is not a product; it is someone else's answer to a question you
  have not asked yet.
