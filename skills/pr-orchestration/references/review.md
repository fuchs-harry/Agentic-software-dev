# Reviewing a pull request

A review that says "looks good" costs the reviewer twenty minutes and buys
nothing. The goal is to find the thing the author could not see — which is
never a style issue, because a linter already found those.

---

## Read in this order

The order matters. Reading the diff first means you can only evaluate style,
because you do not yet know what the change was supposed to achieve.

1. **The plan node.** What was this meant to do, and what was explicitly out?
2. **The evidence section.** Does it prove that, or merely claim it? "Tested
   locally" is a claim. "Broke X, the test failed, restored it" is proof.
3. **The tests.** Read the assertions, not the names. Would they fail if the
   feature broke?
4. **The diff.** Now — with intent in mind, so you can see where the code and
   the plan disagree.
5. **What is absent.** The error case, the permission check, the empty state,
   the second click. The best review comments are almost always about something
   that is not there.

---

## The four questions

Ask these of every pull request. They find more than reading line by line does.

**What if the input is empty, wrong, or hostile?**
No results. A negative number. A 5MB name. Someone else's ID in the URL. Text
that is actually a script.

**Who is allowed to do this, and is it enforced *here*?**
Not "the UI hides the button" — hiding a button is not a permission. Is the
check on the server, on the query, in the policy? The UI is a suggestion.

**What happens on the second click, or two at once?**
Double submission, two tabs, a retry after a timeout. Anything that creates,
charges or sends needs an answer to this.

**If this is wrong in production, how do we find out, and how do we get back?**
If the answer to either half is "we wouldn't", that is the review comment.

---

## Signals worth stopping on

| In the diff | The question |
|---|---|
| A new query with no filter on the current user | Can this return someone else's rows? |
| `catch {}` with an empty body | What error just disappeared? |
| A number written inline — `24`, `5`, `0.19` | What is it, and where else is it written? |
| A test whose expected value was changed | Was the code wrong, or is the test now agreeing with a bug? |
| `any`, `@ts-ignore`, `eslint-disable` | What is being silenced, and why here? |
| A new dependency | What does it do that fifty lines could not? Who maintains it? |
| Anything reaching the network with no timeout | What happens when it hangs? |
| Deleted tests | Why? |

---

## Writing a comment that gets acted on

Say what you observed, why it matters, and what you would do. Three lines, not
a question mark on its own.

> **Not:** "Is this right?"
>
> **Better:** "If `guests` is 0 this divides by zero — line 42. A guard, or is
> 0 already impossible upstream? If it is impossible, worth a comment saying so."

Mark the weight of each comment, because a reviewer's uncertainty is
information the author needs:

- **Blocking** — I believe this is wrong, here is why
- **Question** — I do not understand this; explain and I may be satisfied
- **Nit** — style or taste, take it or leave it, not a reason to hold the merge

Unmarked comments get treated as blocking by cautious authors, and a review of
nine nits reads as nine objections.

---

## When you are reviewing your own agent's work

Same list, one addition: **check for things nobody asked for.** Agents produce
plausible extra work — a helper that is used once, an abstraction for a second
case that does not exist, a config option nobody requested.

Everything in the diff should trace to a task in the plan. If it does not, it
is either scope creep or the plan was wrong. Both need saying out loud.

Second addition: **check that the tests were not written from the code.** A test
written after the fact, by reading the implementation, encodes what the code
does rather than what it should do. Symptom: the test mirrors the code's
structure branch for branch and passes on the first run without ever having
been seen failing.

---

## What not to spend the review on

- Formatting — a formatter's job
- Naming preferences, unless a name is actively misleading
- "I would have done it differently" with no defect behind it
- Architecture debates on a 40-line change. That belongs in the plan, before
  the code existed

A review is not the place to relitigate an approved plan. If the plan was
wrong, say so — and say it as a plan problem, not as a hundred line comments.

---

## Approving

Approve when: it does what the plan said, the evidence supports it, the tests
would catch a regression, and you cannot name a way it breaks.

Not when: it is late, the author is waiting, it is probably fine, or it is too
big to read. **"Too big to read" is a request to split, not a reason to
approve.** That is the single most common way review stops functioning.
