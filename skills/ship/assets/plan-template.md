# <Outcome in plain words>

Status: draft
Effort: standard · Gates: standard
Created: <YYYY-MM-DD>

## Goal

<One sentence. Observable by a person clicking around. Not "implement X".>

## Non-goal

- <The nearest thing a reasonable person would assume is included, but is not>
- <Another one>

## Context

- <link to the decision, doc, issue or file this rests on> — why it matters here
- <link> — status: settled / still proposed

## Preconditions

- [ ] <What must be true before the first commit>
- [ ] <An open question that blocks task 2 — with a link to where it is tracked>

> This node does not enter Phase 2 while a box above is unchecked.

## Tasks

1. **<Task — one commit>**
   ✔ done when: <what you run, click or query to see it work — and to see it fail>

2. **<Task>**
   ✔ done when: <…>

3. **<Task>**
   ✔ done when: <…>

## Verification

How this is proven, not inspected:

- <test that fails without the change>
- <click path: step → expected result>
- <error case triggered on purpose → what the user sees>

Negative control: <the exact thing to break to confirm the test can go red>

## Rollback

Category: revert-safe / revert-plus-a-step / not revertible

<If not revertible: the forward fix, in steps. And set Gates: strict.>

## Open

| Question | Owner | Unblocked by |
|---|---|---|
| <…> | <who> | <what has to happen> |

## Log

- <YYYY-MM-DD> drafted
- <YYYY-MM-DD> approved by <who>
- <YYYY-MM-DD> shipped in #<PR>
