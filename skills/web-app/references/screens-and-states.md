# Screens, states and forms

---

## The four states, concretely

```
LOADING   → a skeleton in the shape of the content, not a centred spinner
EMPTY     → what this is, why it is empty, and the one action that fills it
ERROR     → what went wrong in human words, and a way to retry
CONTENT   → the thing
```

**Loading.** A skeleton in the shape of the incoming content keeps the layout
from jumping when data arrives. A spinner in the middle of the page tells the
person nothing and moves everything twice.

If the load is usually under ~200ms, show nothing at all. A flash of skeleton
is worse than a brief pause.

**Empty is not an error.** It is the first thing a new user sees, and it is the
best onboarding you will ever build:

```
No bookings yet.
When someone books one of your flats, it appears here.
[ Add a booking manually ]
```

Not: an empty table with headers and nothing under them.

**Error says what and what next.** Three things: what failed, whether it was
their fault, and what they can do.

```
Could not load your bookings — the connection dropped.
[ Try again ]
```

Not: "Error: 500". Not: a blank screen. Not a toast that vanishes in three
seconds carrying the only copy of the information.

**Distinguish empty from failed.** Showing "no bookings" when the request
actually failed tells the person their data is gone. That is a genuinely
alarming bug and it comes from treating an error as an empty array.

---

## Lists

- **Empty**, **loading**, **error** — as above
- **Long**: paginate or virtualise. A thousand rows in the DOM makes the page
  feel broken on a phone
- **Sorting and filtering belong in the URL** so a refresh does not lose them
- **Each row's action is reachable by keyboard**
- **Deleting from a list**: remove it optimistically, but keep an undo. A
  confirmation dialog for everything trains people to click through dialogs

---

## Forms, in detail

### Structure

```html
<label for="arrival">Arrival date</label>
<input
  id="arrival"
  name="arrival"
  type="date"
  aria-describedby="arrival-error"
  aria-invalid="true"
/>
<p id="arrival-error">Choose a date after today.</p>
```

The `for`/`id` pair makes the label clickable and announces the field. The
`aria-describedby` connects the error to the input, so a screen reader reads
them together instead of announcing an unexplained "invalid".

### When to validate

| Moment | What to do |
|---|---|
| While typing | nothing — except stripping obviously invalid characters |
| On blur | validate that field, show its error |
| On submit | validate everything, focus the **first** field with an error |
| On the server | validate everything again, always |

Focusing the first invalid field on submit is the detail that makes long forms
usable: without it, the error is often scrolled off-screen and the form appears
to do nothing.

### Submitting

```
1. Disable the button and change its label — "Saving…"
2. Send
3a. Success → say so, then navigate or update the list
3b. Failure → re-enable, show the error, KEEP EVERY VALUE
```

Step 3b is the one that gets skipped, and it is the one people remember. A form
that clears itself on a failed submit is worse than a form that never worked.

Guard against double submission on the server too, not just by disabling the
button. Two tabs, a retry, a slow network — the button is not a lock.

---

## Confirmation and destruction

- **Reversible actions do not need a dialog.** Delete it and offer an undo.
- **Irreversible actions do.** And the dialog must say what will be lost, not
  "Are you sure?".
- **Never make the destructive button the default.** Not focused, not primary,
  not on the right where the eye lands.

```
Delete "Beach flat"?
This also deletes 14 bookings. It cannot be undone.
[ Cancel ]  [ Delete flat and bookings ]
```

The button says what it does. "OK" tells nobody anything.

---

## Navigation

- The person always knows **where they are** — a title, a highlighted nav item
- The back button works, always. Breaking it breaks the one control every user
  understands
- Deep links work: a URL should be sendable and land in the same place
- On mobile, the primary action is reachable with a thumb

---

## Optimistic updates

Updating the interface before the server confirms makes an application feel
instant. It needs two things or it makes it feel broken:

1. **A way back** — if the server rejects it, put the old state back *and* say
   so. Silently reverting is worse than waiting.
2. **Only where failure is rare and cheap.** Toggling a checkbox: yes. Taking a
   payment: absolutely not.

---

## Copy

The words in the interface are part of the build, not a decoration applied
afterwards.

- Use the vocabulary from the intake interview. If they say "flat", the button
  does not say "property entity"
- Buttons are verbs: "Block these nights", not "Submit"
- Errors say what to do: "Choose a date after today", not "Invalid date"
- No blame: "That email is already registered", not "You entered a bad email"
- No dead ends: every error state offers a next step

Placeholder copy — "Lorem ipsum", "TODO", "Coming soon" — ships more often than
anyone expects. Write the real words, or leave the screen out.
