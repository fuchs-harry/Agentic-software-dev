---
description: Start a new project — interview, charter, stack decision, scaffold with CI
argument-hint: "[what you want to build]"
---

Start a new project from nothing.

The idea, as the user described it: **$ARGUMENTS**
(If that is empty, ask what they want to build before doing anything else.)

Load the `project-start` skill and follow it in order. Do not skip to
scaffolding because the idea sounds clear — it never is on the first telling.

1. **Interview.** One question at a time, in their words. Push past the first
   description until the idea has an edge. Specifically ask the questions
   nobody volunteers: logins, outbound messages, personal data, money, phone
   usage.
2. **Charter.** Write `docs/CHARTER.md`. Read it back. **Stop and get a yes** —
   this is gate G0 and it is the last cheap moment to find out you are building
   the wrong thing.
3. **Stack.** Choose, and record it in `docs/decisions/0001-stack.md` with the
   rejected alternatives.
4. **Scaffold.** Repository with README, CLAUDE.md, LICENSE, `.gitignore`,
   `docs/plans/`, CI, PR template, and one real test. Use `templates/` from
   this plugin.
5. **Prove it.** Push, watch CI go green, run the empty app and look at it.
   Do not start feature work before this.
6. **Slice one.** The thinnest vertical cut through the whole thing. Write it
   as the first plan node and hand off to the `ship` skill.

State the effort and gates dials you are using for slice one before you start
building, and say why in one sentence.
