# Design that does not read as a default

Most software built by an agent looks assembled rather than designed: eleven
font sizes, four shades of grey nobody chose, a shadow on everything. Not
because any single decision was wrong — because no decision was *made*, and the
defaults accumulated.

The fix is not taste. It is **deciding once, then stopping**. Every value in the
interface should be one you could defend.

> Drawn from Apple's design talks — *The Details of UI Typography* (WWDC 2020)
> and *Principles of Great Design* — translated to the web. Motion lives in
> [`motion.md`](motion.md); it is half of this and it is the half people skip.

---

## The eight principles, as names you can argue with

You need vocabulary before you need rules. When something feels wrong, one of
these is usually the reason.

1. **Purpose** — every feature spends the user's time, attention and trust.
   Deciding what *not* to build is the design work.
2. **Agency** — offer choices, do not force one path. Back it with forgiveness:
   easy undo for slips, a confirmation only for the genuinely irreversible.
3. **Responsibility** — anticipate misuse and harm. Ask for data at the right
   moment, only what is needed. Cut a feature whose risk outweighs its value.
4. **Familiarity** — build on what people already know, and honour the metaphor's
   physics. Things that look the same must behave the same and live in the same
   place. Break a familiar pattern only if you can *prove* it is better.
5. **Flexibility** — adapt to the device, the situation, and the full range of
   abilities. When no single layout fits everyone, let people personalise.
6. **Simplicity, not minimalism** — strip the unnecessary so the purpose shows.
   Burying everything behind one button looks minimal and is not simple.
   Sometimes *adding* context simplifies: a scrubber showing time remaining.
7. **Craft** — nothing is random. Every spacing, timing and alignment value is a
   choice you can defend. Jittery scroll and misaligned icons read as
   carelessness, and users generalise from them to the whole product.
8. **Delight** — the result of the other seven, not confetti on top.

---

## Type

**Pick four or five sizes and stop.** A scale, not a set of guesses:

```css
--text-xs:  0.75rem;
--text-sm:  0.875rem;
--text-base: 1rem;
--text-lg:  1.25rem;
--text-xl:  2rem;
```

Anything at `13px` because it looked right is the thing that makes an interface
read as accidental.

**Tracking is size-specific — never one value for everything.** As type grows,
the letters read as too far apart; as it shrinks, too close. So:

| Size | `letter-spacing` |
|---|---|
| Display / large headings | negative — around `-0.02em`, more as it grows |
| Body | `0` |
| Small caps, labels, 12px and below | slightly positive — `0.01em` |

A single fixed `letter-spacing` across the app is wrong somewhere by
construction.

**Leading moves inversely with size.** Tight on big headings (`1.05`), loose on
body copy (`1.5`–`1.6`). Dense information UI can go tighter; text in scripts
with tall ascenders needs more.

**Build hierarchy from weight + size + leading together**, not size alone.
Weight adds presence without taking more space, which is why it is the right
tool in a dense layout.

**Respect the user's text-size setting.** Spacing in `rem`/`em`, not fixed
pixels, so a larger font scales the layout with it instead of breaking it.

**Default to the system font stack** unless you have a reason. It already ships
optical sizing, tracking tables and legibility tuning that a webfont usually
does not.

```css
:root { font: 100%/1.5 system-ui, sans-serif; }

.display {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-optical-sizing: auto;
}
```

---

## Colour

**One accent. A neutral ramp. Semantic colours for success, warning, error.**
A second accent is almost always a mistake — it competes with the first, and now
neither means anything.

- **Neutrals do the work.** Most of a good interface is greys and one accent used
  sparingly. If everything is coloured, colour has stopped being a signal.
- **Contrast at least 4.5:1 for body text**, 3:1 for large text and meaningful
  icons. Grey-on-white at 3:1 is a preference that costs you readers over forty
  and everyone outdoors.
- **Never colour alone.** An error that is only a red border is invisible to
  colour-blind users and to screen readers. Colour plus text, plus an icon.
- **Define both themes as tokens from the start.** Retrofitting dark mode means
  hunting every hard-coded value in the codebase.

---

## Space

**One spacing scale, multiples of 4 or 8.** Nothing at 13px, nothing at 27px.

Spacing is how grouping is communicated, and it is stronger than any border:
**related things are close, unrelated things are far.** If you need a line to
separate two groups, the spacing is probably wrong first.

The most common failure: uniform spacing everywhere, so nothing is grouped and
the eye has no path through the screen.

---

## Depth and materials

Depth communicates hierarchy — what floats above what. Used without a system it
communicates only that shadows exist.

- **One radius, one shadow depth**, as tokens. Mixing them is what makes a page
  feel assembled from parts of other pages.
- **Translucent chrome, not opaque strips.** A nav bar or sheet with
  `backdrop-filter` and content scrolling underneath keeps the sense of a
  continuous surface. An opaque bar consumes a fixed band of the screen.
- **Bigger surfaces read as thicker**: stronger blur, deeper shadow than a small
  chip. A modal and a tooltip should not share a shadow.
- **Never stack a light translucent surface on another.** Legibility collapses.
- **Dim to focus, separate to keep flow.** A blocking, modal task pairs the
  surface with a dimming scrim. A parallel, non-blocking panel uses translucency
  and offset *without* a scrim, so the flow is not interrupted.
- **Vibrancy over translucency**: flat grey text on a blurred surface disappears
  as the background changes. Use higher contrast and slightly heavier weight;
  put colour on a solid layer, not the translucent foreground.
- **Fade at the edge, do not draw a line.** Where content meets floating chrome,
  a small gradient mask reads better than a 1px divider — and only where the
  chrome actually overlaps content.

```css
.toolbar {
  background: rgb(255 255 255 / 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgb(255 255 255 / 0.4);
}

@media (prefers-reduced-transparency: reduce) {
  .toolbar { background: white; backdrop-filter: none; }
}
```

---

## Feedback, wayfinding, mapping

Three tactical rules that fix most "it feels confusing" reports.

**Feedback comes in four kinds** — status, completion, warning, error. Confirm
meaningful actions, expose ongoing status, warn *before* a problem rather than
reporting it after, and validate inline rather than on submit.

**Every screen answers four questions**: Where am I? Where can I go? What is
there? How do I get out? A screen that fails the fourth is a trap, and it is the
most common one.

**Proximity implies relationship, and controls go near what they affect.**
Arrange controls to mirror what they change. *If you need a label to explain a
control, the mapping is weak* — that is a layout problem wearing a copy problem's
clothes.

**Direct labels beat safe generic ones.** Name things for their contents —
"Bookings", "Availability" — not "Home", "More", "Manage". Specificity is what
makes an interface predictable.

---

## Mobile first, and what it is actually for

Not a doctrine about screen sizes. It is a forcing function: **when only one
thing fits, which one is it?** Answer that, and the desktop layout is the same
answer with room to breathe. Start wide and you will never be made to rank
anything.

Also: on a phone the primary action must be reachable with a thumb, and
everything tappable needs about 44px of target even if it looks smaller.

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| Eleven font sizes | Reads as accidental, because it was |
| One `letter-spacing` for every size | Wrong somewhere by construction |
| A second accent colour | Two things shouting; neither is emphasis anymore |
| Shadows on everything | Depth stops meaning anything |
| Uniform spacing everywhere | Nothing is grouped; the eye has no path |
| Dividers instead of space | A line where whitespace would have been quieter and clearer |
| Colour as the only signal | Invisible to colour-blind and screen-reader users |
| Dark mode added later | Every hard-coded value is now a hunt |
| A component library imported for one button | A megabyte for a rounded rectangle |
| "Home", "More", "Manage" | Names that describe nothing are unpredictable to navigate |
| Placeholder copy shipped | It happens far more than anyone expects. Write the real words |
