# What to test, and what to leave alone

A test suite has a cost: every test is code someone maintains, and every slow
test is friction on every change forever. Spend the budget where being wrong
hurts.

---

## The three layers

```
END-TO-END     a browser, clicking          "can a person actually do this?"
    ▲          slow, occasionally flaky      → a handful, from the charter
INTEGRATION    real database, no browser    "do the pieces agree?"
    ▲          seconds                       → the important paths
UNIT           one function, in memory      "is this rule right?"
               milliseconds                  → most of them
```

Many fast tests, few slow ones. Inverted — mostly browser tests — the suite
takes twenty minutes, fails randomly, and people stop trusting it. A suite
nobody trusts is a suite nobody runs, and you are paying for nothing.

---

## Worth it

**Rules with an edge.** "Up to 24 hours before." "Maximum five guests." "Only
on weekdays." Test at the boundary and one step either side. The boundary is
where the bugs are, and a test three days away from it would pass with no rule
at all.

**Money and quantities.** Prices, totals, discounts, stock, rounding. Rounding
in particular: it is boring, it is wrong more often than anyone expects, and
being wrong is visible to customers.

**Permissions — from the wrong side.** Not "the owner can see their booking".
That test passes when *everyone* can see it. Test that a different user gets
nothing. This single habit prevents the most common serious bug in small
applications.

**Anything that already broke once.** A bug that happened can happen again, and
its test is the only thing that will notice. Write the test before the fix,
watch it fail, then fix.

**Data round-trips.** Save it, load it, is it the same? Especially dates,
time zones, decimals and anything with an accent or an emoji in it.

**The unhappy path.** Empty input, wrong type, expired session, double click,
network gone, the third-party service returning a 500. The happy path is what
you built; the unhappy path is what your users will find.

---

## Not worth it

**That a button renders.** If it did not, you would notice within seconds.

**Styling, colours, spacing.** Tests here fail on every legitimate change and
get updated without being read, which trains people to update failures blindly.

**Third-party libraries.** They have their own tests. Test *your* use of them.

**Getters, pass-throughs, one-line wrappers.** No logic, nothing to be wrong.

**Exact wording of labels.** They change for good reasons. Test that the error
*appears*, not that it says a specific sentence.

**Framework behaviour.** You are not testing your code, you are testing React.

---

## The suspicious middle

| | Test it if | Skip it if |
|---|---|---|
| Forms | there is validation logic | it is a plain text field |
| Lists and sorting | ordering is a rule someone specified | the database does it |
| Dates | time zones, "days until", business days | it is just displayed |
| Search | there is filtering or ranking logic | it is a `LIKE` query |
| Uploads | type, size or content is checked | it is straight to storage |

---

## One test, one thing

```js
// bad — when this fails, you learn "something about booking is wrong"
it('booking works', async () => { /* 40 lines, 12 assertions */ })

// good — when this fails, you know exactly what
it('rejects a cancellation less than 24h before arrival', ...)
it('allows a cancellation exactly 24h before arrival', ...)
it('hides a cancelled booking from the guest list', ...)
```

The test name is a sentence about the product, and the suite output is a
readable specification of what the software promises. That is a second, free
benefit of naming them properly.

---

## Test data

Use data that looks like reality, not `foo` and `test1`. Real names have
apostrophes and umlauts, real addresses have line breaks, real inputs have
trailing spaces and pasted formatting.

But: **never real users' data in tests.** Made-up data that is *shaped* like
real data. Copying a production row into a fixture puts personal data into the
repository permanently.

---

## How many is enough

Not a coverage percentage. Coverage measures which lines ran, not whether
anything was checked — a suite that runs every line and asserts nothing reports
100%.

Better questions:

1. If I broke each rule in the charter, would a test fail? (Try it — see
   [`negative-control.md`](negative-control.md).)
2. If a stranger changed this code, would the tests stop them shipping the
   wrong thing?
3. Does every bug we have fixed have a test with its name on it?

Three yeses is enough. Ninety percent coverage with three noes is not.
