# Brief · <slug>

Derived from [`README.md`](README.md). If this brief disagrees with the plan,
the plan is wrong — fix the plan, do not build past it.

Effort: <quick|standard|deep|max> · Gates: <minimal|standard|strict>

---

## Part 1 · Where we stand

<Enough context that whoever builds this does not have to guess or go hunting.>

- The repository is at <state>; the branch to start from is `origin/main`.
- The relevant code lives in <paths>.
- These decisions are binding here: <links>.
- These things are deliberately NOT in scope: <from the plan's non-goals>.

Known traps in this area:

- <the thing that has broken before, or the non-obvious constraint>

---

## Part 2 · The work

Branch: `feat/<slug>`

### Task 1 — <name>

<What to do, concretely enough to act on.>

Acceptance: <the observable criterion from the plan>
Commit: `<type>(<scope>): <subject>`

### Task 2 — <name>

…

### Task 3 — <name>

…

---

## Part 3 · Afterwards

Before pushing:

```bash
<the project's local check — e.g. npm run lint && npm test>
```

Then push and let CI decide. Do not open the pull request while any job is red.

Must be true when this is done:

- [ ] <acceptance criterion 1>
- [ ] <acceptance criterion 2>
- [ ] Docs made wrong by this change are corrected in the same PR
- [ ] The plan node says `Status: shipped (#<PR>)`

Stays open after this:

- <what this deliberately leaves unresolved, and where it is tracked>

Stop and ask a human at:

- <the gate points that apply at this Gates setting>
