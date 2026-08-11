# Templates

The files a new project gets in its **first** commit — not once they hurt.

```bash
# from the root of your new project
cp -r /path/to/Agentic-software-dev/templates/.github  .
cp    /path/to/Agentic-software-dev/templates/CLAUDE.md .
cp    /path/to/Agentic-software-dev/templates/gitignore .gitignore
cp    /path/to/Agentic-software-dev/templates/env.example .env.example
cp -r /path/to/Agentic-software-dev/templates/scripts .
mkdir -p docs/plans docs/decisions
cp    /path/to/Agentic-software-dev/templates/docs/plans-README.md docs/plans/README.md
cp    /path/to/Agentic-software-dev/templates/docs/0001-stack.md   docs/decisions/0001-stack.md
cp    /path/to/Agentic-software-dev/skills/docs-graph/assets/index-template.md docs/INDEX.md
```

Then fill in every `<placeholder>`. A template shipped with its placeholders
still in it is worse than no template — people learn to skim it.

| File | Why it is here from commit one |
|---|---|
| `CLAUDE.md` | The agent reads it first and trusts it most. Written later, it is a list of regrets |
| `.github/workflows/ci.yml` | A pipeline first exercised alongside real code cannot tell you which of the two is broken |
| `.github/PULL_REQUEST_TEMPLATE.md` | An Evidence section makes "tested locally" visibly insufficient without anyone having to say so |
| `.github/ISSUE_TEMPLATE/` | So a request arrives with enough information to act on |
| `gitignore` | `.env` must be ignored **before** the first `.env` exists |
| `env.example` | Documentation that cannot go stale silently |
| `docs/plans/README.md` | The folder existing is what makes writing a plan feel like following the path |
| `docs/0001-stack.md` | Stops the same stack argument recurring every six weeks from zero |
| `docs/INDEX.md` | The hub of the knowledge graph. Free while `docs/` holds three files; impossible to impose once it holds forty |
| `scripts/check-docs.mjs` | Validates that graph in CI — frontmatter, links, orphans, staleness. A rule nothing checks is a suggestion |

After copying: push, and **watch CI go green before writing a feature**.
