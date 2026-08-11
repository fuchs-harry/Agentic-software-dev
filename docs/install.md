---
title: Installing the plugin
type: runbook
status: current
updated: 2026-08-11
tags: [meta, setup]
---

# Installing

You need [Claude Code](https://claude.com/claude-code) and a GitHub account.
Five minutes.

---

## 1 · Add the marketplace

In Claude Code:

```
/plugin marketplace add fuchs-harry/Agentic-software-dev
```

This tells Claude Code where to find the plugin. It does not install anything
yet.

## 2 · Install the plugin

```
/plugin install agentic-software-dev
```

Restart Claude Code when it asks.

## 3 · Check it worked

```
/status
```

If you get a report about the current project rather than "unknown command",
the commands are loaded.

---

## What you just got

**Eight commands** you can type:

| | |
|---|---|
| `/start` | begin a new project — interview, charter, stack, scaffold |
| `/plan` | write a plan for a piece of work, and stop for your approval |
| `/build` | execute an approved plan on a branch |
| `/check` | prove it works — acceptance criteria, negative control, CI |
| `/ship` | open the pull request, with evidence |
| `/review` | review a pull request properly |
| `/docs` | audit and repair the documentation graph |
| `/status` | where does this project actually stand |

**Ten skills** that load themselves when relevant — you do not invoke these,
Claude notices when they apply:

`ship` · `project-start` · `github-basics` · `testing-and-ci` ·
`pr-orchestration` · `docs-graph` · `web-app` · `supabase-db` ·
`nextjs-supabase-security` · `deployment`

**Four agents** Claude can delegate to: `planner`, `verifier`, `reviewer`,
`security-auditor`.

---

## Also install these

```bash
# GitHub's command line tool — Claude uses it to open pull requests
# macOS:    brew install gh
# Windows:  winget install GitHub.cli
# Linux:    see https://cli.github.com

gh auth login
```

`gh auth login` opens a browser and connects your GitHub account. Without it,
Claude can commit locally but cannot push, open pull requests, or watch CI.

---

## Using it in one project rather than globally

If you want the rules to apply to one repository only, copy the plugin's
folders into it instead:

```bash
git clone https://github.com/fuchs-harry/Agentic-software-dev
cp -r Agentic-software-dev/skills   your-project/.claude/skills
cp -r Agentic-software-dev/commands your-project/.claude/commands
cp -r Agentic-software-dev/agents   your-project/.claude/agents
```

Then commit them. Everyone working in that repository — human or agent — gets
the same rules, and changes to them go through review like any other change.

---

## First thing to do

Nothing to build yet? Read [first-hour.md](first-hour.md) — it walks through a
real project from idea to live site, with the actual words you type.

Already have a project? Run `/status` in it and see what it says.

---

## Related

- [The first hour](first-hour.md) — what to do once it is installed
- [The guide index](INDEX.md) — everything else
