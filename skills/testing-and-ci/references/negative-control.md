# The negative control

Borrowed from the lab, where it is not optional: if your assay reports a
positive on a sample that contains nothing, the assay is broken — and every
result you have ever produced with it is worthless.

Same idea. **A test that cannot fail is not evidence.**

---

## The procedure

Thirty seconds per test that matters.

```
1. The test is green.
2. Break the thing it is supposed to be testing:
     – delete the line that implements the rule, or
     – invert the condition, or
     – return null / an empty list from the function.
3. Run the test.
     → It fails.  Good. The test is real.
     → It passes. The test is decoration. Fix the test, not the code.
4. Restore the code. Green again.
```

Write the result into the pull request, one line:

> Negative control: removed the 24h window check → `rejects cancellation inside
> 24h` failed as expected → restored.

That line is worth more than the test count. It is the only part of the
evidence that could not have been produced by a test that does nothing.

---

## The four ways a test fakes it

### 1 · It asserts nothing

```js
it('cancels a booking', async () => {
  await cancelBooking(id)          // if this throws, the test fails
})                                 // if it silently does nothing, the test passes
```

Passes whether the booking was cancelled, ignored, or duplicated. Very common,
because it *feels* like a test while being written.

### 2 · It mocks the thing under test

```js
vi.mock('./booking', () => ({ cancelBooking: () => ({ ok: true }) }))
it('cancels a booking', async () => {
  expect((await cancelBooking(id)).ok).toBe(true)   // tests the mock
})
```

Mock the *outside* — the payment provider, the email service, the clock. Never
mock the thing whose behaviour you are asserting.

### 3 · It checks a value it set itself

```js
const booking = { status: 'cancelled' }
expect(booking.status).toBe('cancelled')      // proves the language works
```

Reads as a test. Contains no product code at all.

### 4 · It only tests the happy path

```js
it('owner can see their booking', ...)        // passes even if EVERYONE can see it
```

This is the dangerous one, because it is a real test that runs real code — and
it stays green through the exact bug you most need to catch. Every permission
rule needs its mirror:

```js
it('a different user cannot see it', ...)     // this is the one that matters
```

**Almost every data-exposure bug passes the positive test.**

---

## When the negative control is hard

Sometimes breaking the code on purpose is awkward — the logic is spread out, or
the thing is a migration you cannot un-run. Options, in order of preference:

1. **Break the input instead of the code.** Feed it a value that should be
   rejected. The test must fail if it is accepted.
2. **Move the boundary.** If the rule is "24 hours", test 23:59 and 24:01. A
   test that only checks 3 days out would pass with no rule at all.
3. **Write the test first, run it, watch it fail.** This *is* the negative
   control, performed before the fix rather than after. It is the strongest
   form, because the code that would have faked it does not exist yet.

Option 3 is the reason for "write the failing test first". Not ideology —
it is the cheapest possible negative control.

---

## Boundaries are where the control lives

Any rule with a threshold has three interesting inputs, and one of them is
almost always missing:

| Rule: "cancel up to 24h before arrival" | |
|---|---|
| 25 hours before | allowed |
| **exactly 24 hours before** | ← decide, write it down, test it |
| 23 hours before | rejected |

A test at "3 days before" and "1 hour before" passes with a rule of 12 hours,
36 hours, or no rule at all. The boundary is the only place the test can tell
the difference — and "exactly at the boundary" is where the actual bugs are.

---

## Applying it to a whole suite

If you inherit a suite you do not trust, you do not need to audit every test.
Break one central thing — a core function, a permission check — and see how
many tests notice.

```
Deleted the ownership check in getBooking().
Expected: several failures.
Got: 1 failure out of 214 tests.
```

That result tells you exactly how much of the green wall was real. It is a
half-hour of work and it is the most informative half-hour available.

---

## Where this connects

- The negative control is a required line in the pull request template
  ([`ship`](../../ship/SKILL.md) → `assets/pr-body.md`)
- It is required at `effort: standard` and above
- At `effort: max`, someone additionally tries to break the feature *without*
  the tests as a guide, and writes down what they tried — including what did
  not work
