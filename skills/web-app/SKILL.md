---
name: web-app
description: >-
  Building the part people look at: which screens exist, where state lives, what happens
  while data loads and when it fails, forms that do not lose what someone typed, visual
  design that does not read as a default, and motion that feels physical rather than
  scripted. Use when building or changing any user interface — a page, screen, form,
  component, layout, navigation — or when asked to "build the website", "add a page",
  "make it look better", "fix the layout", "make it feel smoother", "add an animation",
  "the design looks generic". Also load for typography, spacing, colour, dark mode,
  drag/swipe/sheet interactions, spring animation, accessibility or reduced motion. Load
  together with `ship`; this skill says what to build, `ship` says in what order.
---

# The part people look at

Most interface bugs are not visual. They are **states nobody drew**: the list
before it loads, the list that is empty, the list that failed, the button
already pressed once.

```
every screen has four states, not one:

  LOADING     something is coming — say so, do not show a blank
  EMPTY       nothing here yet — say why, and what to do about it
  ERROR       it went wrong — say what, and what the person can do
  CONTENT     the one everybody designs
```

If you only build the fourth, the other three still happen — they just happen
badly, as a blank screen or a spinner forever. **Design all four or you have
designed one and shipped four.**

---

## Start from the moment, not the pages

The charter names one moment that has to be good. Build the screens that moment
needs, and no others.

```
Charter moment: "seeing at a glance which nights are free, blocking one in two taps"

Screens that serves:  a calendar · a block-out sheet
Screens it does not:  settings · profile · reports · onboarding
```

Everything not in the first list is a later decision. Screens added "while we're
at it" are the main way a two-week build becomes a two-month one.

---

## Where state lives

Four places, in order of preference. Reaching for the fourth first is the most
common structural mistake in front-end code.

| Put it | When | Example |
|---|---|---|
| **In the URL** | it should survive a refresh or be shareable | which tab, which filter, which page |
| **On the server** | it is the truth and others must see it | the bookings themselves |
| **In the component** | only this component cares | is this dropdown open |
| **In global state** | genuinely needed in unrelated places | the signed-in user, the theme |

Global state that is really server data is the classic error: the data now
exists twice and the copies drift. Server data belongs in something that knows
about caching and refetching (TanStack Query, or your framework's loader), not
in a store you keep in sync by hand.

The URL is underused. If a person filters a list, then refreshes and loses the
filter, the state was in the wrong place.

---

## Forms

Forms are where people put effort in, and where losing it hurts most.

- **Never lose what someone typed.** Not on a failed submit, not on a
  validation error, not on a navigation away. Everything else here is detail.
- **Validate on blur, not on every keystroke.** Telling someone their email is
  invalid while they are typing the third character is hostile.
- **One error, next to the field, in plain language.** "Enter a date after
  today", not "Invalid input: constraint violation".
- **Disable the submit button while it is submitting**, and say what is
  happening. Double submission is the most common bug in a booking flow.
- **Validate on the server too, always.** Client validation is convenience.
  Server validation is the rule. Anyone can skip the client.

Patterns, including the accessible-by-default field structure:
**[`references/screens-and-states.md`](references/screens-and-states.md)**.
Folder layout, where business rules live, and when to extract a component:
**[`references/structure.md`](references/structure.md)**.

---

## Accessibility, the version that costs nothing

Done from the start it is free. Retrofitted it is a project.

- **Real elements.** A `<button>` for actions, an `<a href>` for navigation. A
  clickable `<div>` cannot be reached by keyboard and is not announced.
- **Every input has a `<label>`.** Placeholder text is not a label — it
  disappears exactly when it is needed.
- **Keyboard reaches everything.** Press Tab through your screen once. If you
  cannot complete the task, neither can a chunk of your users.
- **Focus is visible.** Never `outline: none` without something replacing it.
- **Contrast at least 4.5:1** for body text. Grey-on-white at 3:1 is a
  designer's preference that costs you readers over 40 and everyone outdoors.
- **Errors are text**, not just a red border. Colour alone is invisible to
  colour-blind users and to screen readers.

That list covers most of it and takes no extra time when it is how you write in
the first place.

---

## Making it look intentional

Software built by an agent tends to look *assembled* rather than designed:
eleven font sizes, four greys nobody chose, a shadow on everything. Not because
any decision was wrong — because none was made, and the defaults accumulated.

Constraints beat taste. Decide once, then stop deciding:

- **One type scale.** Four or five sizes. And **tracking is size-specific** —
  large text wants negative letter-spacing, small text slightly positive. One
  fixed value across the app is wrong somewhere by construction.
- **One spacing scale.** Multiples of 4 or 8. Nothing at 13px. Spacing is how
  grouping is communicated, and it is stronger than any divider line.
- **One accent colour.** A neutral ramp, plus semantic colours for
  success/warning/error. A second accent means neither is emphasis anymore.
- **One radius, one shadow depth**, as tokens. Mixing them is what makes a page
  feel assembled from parts of other pages.
- **Both themes from the start.** Retrofitting dark mode means hunting every
  hard-coded value in the codebase.

Then **build mobile first** — not as doctrine, but because it forces the
hierarchy question: *when only one thing fits, which one is it?* Start wide and
nothing ever makes you rank anything.

The full set — type, colour, depth and translucent materials, feedback,
wayfinding, and the eight principles to argue with when something feels wrong:
**[`references/design.md`](references/design.md)**.

---

## Motion

Motion is not a layer applied after the pixels. For anything a person can touch,
it *is* the interaction — and it is the half that gets skipped.

The whole idea in one sentence: **motion starts from where things currently are,
inherits the user's velocity, projects momentum forward, and can be grabbed and
reversed at any instant.**

Four rules that cover most of it:

- **Respond on `pointerdown`, not on release**, and keep feedback continuous
  *during* a drag rather than only at the end.
- **Every animation is interruptible.** Never lock out input while animating,
  and always animate from the element's live on-screen value — starting from the
  target value is the classic visible jump.
- **Springs, not CSS transitions, for anything gesture-driven.** Default to
  critically damped (`damping 1.0`, `response 0.3–0.4`). Add bounce *only* when
  the gesture itself carried momentum. CSS transitions stay right for
  non-interactive changes: a hover, a colour, a fade.
- **Hand off the release velocity**, and project where the flick would land
  rather than snapping to the point nearest release.

And: `prefers-reduced-motion` is not optional. For some people this is nausea,
not preference — replace slides and springs with a short cross-fade, keep the
feedback.

Springs, velocity handoff, momentum projection, rubber-banding, haptics and the
concrete values: **[`references/motion.md`](references/motion.md)**.

---

## Performance, the three that matter

Ignore the rest until these are right.

1. **Images.** The single biggest cause of slow pages. Correct dimensions,
   modern format, lazy-loaded below the fold.
2. **Do not block the first paint.** Fonts and scripts that must load before
   anything renders turn a fast connection into a slow one.
3. **A perceived-instant response to every click.** Under ~100ms, or a visible
   acknowledgement. A button that appears to do nothing gets clicked again.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Only the content state built | Blank screens and infinite spinners in production |
| Server data mirrored into a global store | Two copies, which drift, silently |
| A clickable `<div>` | No keyboard, no screen reader, no focus |
| Placeholder used as a label | Disappears exactly when it is needed |
| Errors shown only as a red border | Invisible to colour-blind and screen-reader users |
| Form state lost on a failed submit | The single most enraging bug in any application |
| A component library imported for one button | A megabyte for a rounded rectangle |
| Building settings and profile before the core moment | The moment is what makes it worth using |
| CSS transitions on something draggable | Cannot be grabbed and reversed; it will feel stuck |
| Input disabled while animating | The interface stops listening exactly when the user changed their mind |
| Eleven font sizes and four unplanned greys | Reads as accidental, because it was |

---

## Done means

- [ ] All four states exist for every screen that loads data
- [ ] Nothing typed is ever lost — failed submit, validation error, navigation
- [ ] Server-side validation exists for every client-side rule
- [ ] Tab reaches everything; focus is visible
- [ ] Every input has a real label; errors are text
- [ ] It works on a phone-sized screen
- [ ] Type, spacing, colour and radius come from a scale — no one-off values
- [ ] Anything draggable is interruptible and hands off its release velocity
- [ ] `prefers-reduced-motion` handled, and it degrades to a cross-fade, not to nothing
- [ ] Nothing in the interface is outside the charter moment without a reason
