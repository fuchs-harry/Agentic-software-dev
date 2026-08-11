---
title: <A sentence, not a label. "Guests can cancel a booking", not "Cancellation">
type: <charter | decision | plan | feature | runbook | reference | note>
status: <draft | current | superseded | abandoned>
updated: <YYYY-MM-DD>
tags: [<small, consistent vocabulary>]
---

# <Title>

<One paragraph: what this is, in the words a user would use. Someone should be
able to tell from this paragraph alone whether this is the node they need.>

## How it works

<The mechanism, at the level of detail someone would need in order to change it.
Not a code walkthrough — the code is the truth about *what*. This is *why*.>

## Constraints

<What must remain true. The thresholds. Who is allowed. What it must not do.
This is the section a future change gets checked against.>

## Open

| Question | Owner | Unblocked by |
|---|---|---|
| <…> | <who> | <what has to happen> |

<An open question with no owner is a wish. And it does not get quietly answered
in code — if a task needs the answer, that is a blocking precondition.>

## Related

- [[<node>]] — <why a reader would go there, in a few words>
- [[<node>]] — <why>

<Every edge says why. A bare list of links is a graph with no information on
its edges.>
