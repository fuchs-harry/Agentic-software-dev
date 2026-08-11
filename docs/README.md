# The guide

The plugin talks to the agent. These pages talk to you.

| | |
|---|---|
| **[install.md](install.md)** | Getting the plugin into Claude Code. Five minutes |
| **[first-hour.md](first-hour.md)** | A complete walkthrough — idea to live site, with the actual words you type |
| **[the-loop.md](the-loop.md)** | Why the order is scope → plan → build → prove → ship, and what each step buys |
| **[dials.md](dials.md)** | Effort and gates: how to say how careful to be, with worked examples |
| **[glossary.md](glossary.md)** | Every word this repository uses that you might not know |

---

## Who this is for

**You can describe what you want but have never opened a terminal.** Start with
[install.md](install.md), then [first-hour.md](first-hour.md). Keep
[glossary.md](glossary.md) open in a tab. You do not need to learn to code —
you need to learn to *direct*, which is a different and much smaller skill.

**You write code and you are tired of agents producing a thousand lines nobody
asked for.** Read [the-loop.md](the-loop.md) and
[skills/ship/references/effort-model.md](../skills/ship/references/effort-model.md).
The gates and dials are the part worth stealing even if you ignore the rest.

---

## The one-paragraph version

An agent will happily build the wrong thing, quickly and confidently, and it
will tell you it worked. This plugin puts four things in its way: **a written
plan a human approves before any code**, **a dial that decides how hard it
works before believing itself**, **named points where it must stop and ask**,
and **a test that has been watched failing** — because a green test that cannot
go red proves nothing.

None of that is about being slow. It is about the difference between software
that works and software that has not been shown to be broken yet.
