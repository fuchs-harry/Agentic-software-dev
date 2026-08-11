---
description: Write a plan node for a piece of work, and stop for approval
argument-hint: "[what to build] [--effort quick|standard|deep|max] [--gates minimal|standard|strict]"
---

Write a plan node. **Do not write any code in this turn.**

Request: **$ARGUMENTS**

Load the `ship` skill. Then:

1. **Scope first.** State in three lines: what done looks like (observable by
   clicking), what is deliberately not in this, and what you are assuming.
   If an assumption would change the shape of the work, ask instead.

2. **Set the dials.** If `--effort` or `--gates` were given, use them. If not,
   choose from blast radius using the table in
   `references/effort-model.md`, and say which you chose and why in one
   sentence. Remember the floors: anything touching auth, permissions, money or
   other people's data is `deep` + `strict`, whatever the user asked for.

3. **Write `docs/plans/<slug>/README.md`** from
   `skills/ship/assets/plan-template.md`. Every task gets one commit and one
   acceptance criterion that could fail. A task whose criterion is "it works"
   is not finished being thought about.

4. **Check the preconditions honestly.** Anything unresolved that blocks a task
   goes in Preconditions, not in Open. A node with an unmet precondition does
   not proceed.

5. **Add it to `docs/plans/README.md`.**

6. **Stop.** Show the goal, the non-goals, the task list, the risk and the
   dials — in plain language, not as a diff. Ask for approval. This is gate G1.

Do not continue to the brief or to code in this turn, even if the plan looks
obviously right.
