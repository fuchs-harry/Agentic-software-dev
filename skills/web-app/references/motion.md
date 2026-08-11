# Motion that feels physical

An interface feels alive when motion **starts from where things currently are,
inherits the user's velocity, projects momentum forward, and can be grabbed and
reversed at any instant.**

Everything below follows from that one sentence. Springs are the tool that makes
it natural, because a spring is inherently interruptible and velocity-aware —
which a fixed-duration animation is not, and cannot be made to be.

> From Apple's *Designing Fluid Interfaces* (WWDC 2018) and *Designing
> Audio-Haptic Experiences*, translated to the web: CSS, Pointer Events,
> `requestAnimationFrame`, and a spring library such as Motion / Framer Motion.

---

## 1 · Respond on press, not on release

The moment lag appears, the sense of directness falls off a cliff — and it does
not degrade gradually, it collapses.

- **Highlight on `pointerdown`.** Waiting for the click to show feedback feels
  dead, and the delay is not subtle.
- **Audit every latency on the input path**: debounces, artificial timers,
  "wait for the transition" logic, the legacy 300ms tap delay. Anything there
  that is not essential is a regression.
- **Feedback is continuous *during* the gesture, not only at the end.** For a
  drag, slider or drawer, update 1:1 with the pointer the whole way.

```css
.button:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}
```

---

## 2 · Direct manipulation is 1:1, from where they grabbed it

When someone drags something, it stays glued to the finger — and respects the
offset from **where they grabbed it**. Snapping the element's centre to the
pointer on grab breaks the illusion in the first frame.

```js
el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId)              // tracking survives leaving the bounds
  const grabOffset = e.clientY - el.getBoundingClientRect().top
  // keep a short history of {y, t} from pointermove — you need velocity at release
})
```

Track a small position/time history, not just the current point. The last few
moves are what give you release velocity, and release velocity is what section 5
is about.

---

## 3 · Interruptibility — the one that matters most

The thought and the gesture happen in parallel. Every animation must be
grabbable and reversible **at any moment**, without waiting for it to finish.

A modal that is closing, grabbed again, must follow the finger — not finish
closing, then reopen.

- **Never lock out input during a transition.** No `pointer-events: none` "while
  animating".
- **Animate from the *presentation* value, never the target value.** On
  interrupt, read the element's live on-screen transform and start there.
  Starting from the logical target causes a visible jump — this is the single
  most common cause of "it feels janky".
- **Do not use CSS transitions or `@keyframes` for anything gesture-driven.**
  They cannot be grabbed and reversed mid-flight. They remain correct for
  non-interactive state changes: a colour, a fade, a hover.
- **Blend velocity on reversal, do not hard-cut it.** Replacing one animation
  with another at the moment of reversal creates a velocity discontinuity that
  reads as a brick wall.
- **Decompose 2D motion into independent X and Y springs.** One spring over a 2D
  distance desynchronises the moment the two axes have different velocities.

---

## 4 · Springs, in two numbers

Think in **damping** and **response**, not mass/stiffness/damping:

- **Damping ratio** — overshoot. `1.0` = critically damped, settles with no
  bounce. Below `1.0` overshoots and oscillates; lower is bouncier.
- **Response** — how quickly it reaches the target, in seconds. Lower is
  snappier. **This is not a duration** — a spring has no fixed duration; the
  settle time emerges from the parameters.

**Default to `damping: 1.0`.** Add bounce (`~0.8`) *only when the gesture itself
carried momentum* — a flick, a throw, a drag release. Overshoot on a menu that
merely faded in feels wrong; overshoot on a card you threw feels right. That
distinction is the whole rule.

| Interaction | Damping | Response |
|---|---|---|
| Move / reposition | `1.0` | `0.4` |
| Rotation | `0.8` | `0.4` |
| Drawer / sheet | `0.8` | `0.3` |

```js
import { animate } from 'motion'

// default: critically damped, no overshoot
animate(el, { y: 0 }, { type: 'spring', bounce: 0, duration: 0.4 })

// momentum: a little bounce, only because a flick preceded it
animate(el, { y: target }, { type: 'spring', bounce: 0.2, duration: 0.4, velocity: releaseVelocity })
```

---

## 5 · Velocity handoff — the seam between drag and animation

When the gesture ends, the animation continues **at the finger's exact
velocity**. No seam between dragging and animating. This is the detail that
separates "fluid" from merely "fine", and it is usually one parameter.

Motion / Framer Motion take absolute px/s directly via `velocity`. APIs wanting
a *relative* velocity need it normalised by the remaining distance:

```
relativeVelocity = gestureVelocity / (target − current)
```

Element at `y=50`, target `y=150`, finger at 50px/s → `50 / 100 = 0.5`.

---

## 6 · Momentum projection — animate to where it is going

Do not snap to the boundary nearest the *release point*. Use velocity to project
where it would come to rest, then snap to the target nearest **that**. This is
what makes a flick feel like a throw rather than a nudge.

```js
// Apple's projection, from the Designing Fluid Interfaces sample code.
// decelerationRate ≈ 0.998 for normal scroll feel, 0.99 for snappier.
function project(initialVelocity /* px/s */, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate)
}

const projected = currentPosition + project(releaseVelocity)
animateSpringTo(nearestSnapPoint(projected), { velocity: releaseVelocity })
```

Note the textbook `v²/(2·decel)` is **not** this. Use the exponential-decay form
above — it is what good bottom sheets and carousels ship.

**Decide commit-versus-reverse from the velocity *sign*, not from position.** A
sheet dragged only 20% down but flicked hard downward should dismiss. Judging by
distance alone ignores what the person just told you.

---

## 7 · Spatial consistency

If something disappears one way, we expect it back from the same place.

- **Enter and exit along the same path.** A panel that slides in from the right
  dismisses to the right. In-from-right, out-the-bottom feels disconnected.
- **Anchor to the source.** A menu, popover or sheet originates from the element
  that triggered it — set `transform-origin` to the trigger.
- **Mirror the easing on reversible transitions** (inverse cubic-bézier control
  points), so the return path matches the outbound one.
- **Hint in the direction of travel.** Intermediate frames should telegraph the
  outcome, not blindly interpolate toward it. People predict the final state
  from the trajectory.

---

## 8 · Soft boundaries

At an edge, resist progressively rather than stopping dead. A hard stop reads as
frozen; increasing resistance reads as *responsive, but there is nothing more
here*.

```js
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}
```

---

## 9 · Gesture feel

- **Tap**: highlight on down, commit on up. About 10px of hit padding, and allow
  cancel by dragging away — and un-cancel by coming back.
- **Drag / swipe**: a small movement threshold (~10px) before committing to a
  direction, then 1:1.
- **Detect plausible gestures in parallel** from the first move, then cancel the
  losers once intent is clear. Avoid recognisers that only report a final state
  (`swipeleft`-style events) — they throw away the continuous tracking you need
  for feedback.
- **Minimise disambiguation delays.** Double-tap detection unavoidably delays
  every single tap. Only pay that where double-tap genuinely exists.

---

## 10 · Frames

Smoothness is about what is *in* the frames, not only how many there are.

- Animate `transform` and `opacity` only — they run on the compositor. Animating
  `top`, `width` or `box-shadow` puts layout on the main thread every frame.
- `will-change` where motion is imminent, and removed when it is not.
- `requestAnimationFrame` is the display-synced clock for anything you drive
  yourself.
- For very fast motion, a slight blur or stretch reads better than a sharp
  streak.

---

## 11 · Motion + sound + haptics

Three rules for combining senses:

1. **Causality** — it must be obvious what caused the feedback. Fire it on the
   actual causal event: the toggle flipping, the item snapping home.
2. **Harmony** — visual, sound and haptic land on the **same frame**. Latency
   between them destroys the illusion entirely.
3. **Utility** — only where it earns its place. Success, error, commit, snap.
   Over-feedback trains people to ignore all of it, including the important one.

---

## 12 · Reduced motion is not "no motion"

It means a gentler, non-vestibular equivalent. Three independent signals, and
components should handle all three:

| Signal | Response |
|---|---|
| `prefers-reduced-motion: reduce` | Replace slides, springs and parallax with a short opacity cross-fade. Drop overshoot. Keep colour and opacity changes that aid comprehension |
| `prefers-reduced-transparency: reduce` | Raise background opacity, drop the blur |
| `prefers-contrast: more` | Near-solid backgrounds with a defined, contrasting border |

```css
@media (prefers-reduced-motion: reduce) {
  .sheet { transition: opacity 200ms ease; transform: none !important; }
}
```

Also avoid: full-viewport moving backgrounds, slow looping oscillation near
0.2 Hz, and abrupt brightness jumps — ease dark↔light theme changes rather than
cutting.

---

## Quick reference

| Need | Value |
|---|---|
| Default UI spring | `damping 1.0`, `response 0.3–0.4` |
| Momentum / flick spring | `damping ~0.8`, `response 0.3–0.4` |
| Gesture → spring | hand off release velocity; normalise by `(target − current)` if the API wants relative |
| Flick landing point | `current + (v/1000)·d/(1−d)`, `d ≈ 0.998` |
| Interrupt cleanly | start from the live on-screen value, never the target |
| Reverse or commit | use the velocity **sign**, not the distance dragged |
| Reversible transition | mirror the easing curve |
| Boundary | rubber-band, do not hard-stop |
| Press feedback | on `pointerdown`, continuous through the gesture |
| Animatable properties | `transform` and `opacity` only |

---

## Anti-patterns

| Pattern | Why it hurts |
|---|---|
| CSS transitions on a draggable element | Cannot be grabbed and reversed; it will feel stuck |
| Animating from the target value on interrupt | A visible jump — the classic "janky" |
| Input disabled during a transition | The interface stops listening exactly when the user changed their mind |
| Bounce on everything | Overshoot without preceding momentum reads as decoration |
| Snapping to the nearest point at release | Ignores the throw. A hard flick lands one slot away |
| One spring over 2D distance | X and Y desynchronise the moment they differ |
| Animating `width` / `top` / `box-shadow` | Layout on the main thread, every frame |
| Feedback only when the gesture ends | The whole gesture feels unacknowledged |
| Ignoring `prefers-reduced-motion` | For some people this is nausea, not preference |
