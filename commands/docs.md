---
description: Audit and repair the docs graph — frontmatter, links, orphans, staleness
argument-hint: "[optional: an area to focus on] [--fix]"
---

Audit the documentation graph, and repair what is safe to repair.

Focus: **$ARGUMENTS**

Load the `docs-graph` skill.

1. **Run the checker.**

   ```bash
   node scripts/check-docs.mjs
   ```

   If the project has no `scripts/check-docs.mjs`, copy it from this plugin's
   `templates/scripts/`, wire it into CI, and say that you did.

2. **Fix the mechanical failures** — these need no judgement:
   - missing frontmatter fields → add them, with `updated` set to today **only
     if you actually read the node and it is still true**
   - filenames that are not kebab-case → rename, and update every link to them
   - a `superseded` node with no forward link → add it if the successor is
     obvious; otherwise report it

3. **Orphans need a decision, not a default.** For each, say which:
   - it belongs in the graph → add it to `docs/INDEX.md` and to the `Related`
     section of the one or two nodes a reader would arrive from
   - it is superseded → mark it, link forward
   - it was never true → propose deleting it, and wait for a yes

4. **Stale nodes: read them, do not re-date them.** For each `current` node past
   the limit, read it against the code and report one of three outcomes —
   still true (re-date), wrong (fix), or no longer relevant (supersede).
   **Never bump a date without reading the node.** That converts the whole
   mechanism into a lie with a fresh timestamp.

5. **Then look at the shape**, which the checker cannot:
   - two clusters with no link between them — usually the most interesting
     undocumented thing in the project
   - a node everything points at — a good hub, or one file doing four jobs?
   - duplicated explanations in two nodes — they have already drifted; say
     which one is right
   - `CLAUDE.md`: read it as if you had never seen the project. Is the "current
     state" section still honest? This one catches the most.

**Report before repairing** unless `--fix` was passed. Show what you found,
grouped by whether it is mechanical or needs a judgement call, then ask.

Never delete a node without being asked. Superseded and abandoned nodes stay —
deleting one deletes the reason something was a bad idea, and it gets proposed
again in four months.
