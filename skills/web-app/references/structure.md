# Structuring the front end

Two ways a front end becomes unmaintainable, and they are opposites:

1. **Everything in one file** — a 2,000-line page nobody can change safely
2. **Everything abstracted** — thirty files to trace one button, each used once

Both come from the same mistake: deciding structure by rule rather than by
what has actually repeated.

---

## Folders by feature, not by kind

```
src/
  features/
    bookings/
      BookingList.tsx
      BookingForm.tsx
      useBookings.ts
      bookings.schema.ts
      bookings.test.ts
    properties/
      ...
  components/          only what is genuinely shared: Button, Input, Dialog
  lib/                 supabase client, date helpers, formatting
  app/ or routes/      pages, thin — they compose features
```

Not `components/`, `hooks/`, `types/`, `utils/` at the top level. Grouping by
kind means every change to one feature touches four folders, and nothing can
ever be deleted with confidence because you cannot see what belongs together.

The test: **can you delete a feature by deleting one folder?** If not, the
structure is working against you.

---

## Extract on the third occurrence

Not the first. Not the second.

- **First time**: write it inline
- **Second time**: copy it. Duplication is cheaper than the wrong abstraction
- **Third time**: now you can see what actually varies — extract

An abstraction built from one example encodes an accident. The classic symptom
is a shared component with eleven boolean props, which is four components
wearing one name.

---

## Component size

Split when there is a **reason**, not at a line count:

- it is used in two places
- it has its own state that nothing else needs
- it has a name that a non-programmer would recognise (`BookingCalendar`)
- it makes the parent readable at a glance

Do not split because a file is 200 lines. A 300-line component that reads
top-to-bottom is easier than five 60-line files you have to hold in your head
at once.

---

## Server data does not live in a store

```
✗  useEffect → fetch → setState → useContext → the data now exists twice
✓  a query library (TanStack Query) or the framework's loader
```

Server data has properties local state does not: it goes stale, it may be
loading, it may have failed, two components may want it at once, and it needs
refetching after a change. Hand-rolling that with `useState` reproduces a cache
badly.

Use the tool. Keep local state for what is genuinely local: is this open, what
is typed in this field, which tab is selected.

---

## Types and validation at the edge

Validate anything that enters your code from outside — the network, a form, a
URL parameter, `localStorage`. TypeScript checks what you wrote; it cannot
check what arrives at runtime.

```ts
const Booking = z.object({
  id: z.string().uuid(),
  arrival: z.coerce.date(),
  guests: z.number().int().min(1).max(12),
})

const booking = Booking.parse(await response.json())   // throws loudly if wrong
```

One schema per shape, used for both the runtime check and the type. Two
definitions of the same shape drift, and the drift is invisible until it is
production data.

---

## Keeping logic out of components

Business rules — "cancellation is allowed up to 24 hours before arrival" —
belong in a plain function that takes values and returns a result. Not inside a
component, not inside a click handler.

```ts
// bookings/rules.ts
export function canCancel(arrival: Date, now: Date): boolean {
  return arrival.getTime() - now.getTime() > 24 * 60 * 60 * 1000
}
```

Three reasons: it is testable in milliseconds with no rendering, the server can
use the same function, and the rule is findable by name when someone asks what
the policy is.

Pass `now` in rather than reading the clock inside. A function that reads the
clock cannot be tested at a boundary — and the boundary is the only interesting
case.

---

## What belongs on the server

Anything the person must not be able to change:

- permission checks
- prices and totals
- availability
- anything used for a decision that costs money or exposes data

The client is a convenience layer. Everything it computes can be edited by
anyone with a browser's developer tools open — including your validation.
