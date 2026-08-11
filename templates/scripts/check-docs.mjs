#!/usr/bin/env node
// Validates docs/ as a knowledge graph. Copy into your project and wire it into
// CI — a rule nothing checks is a suggestion.
//
//   node scripts/check-docs.mjs
//
// Fails on: missing or invalid frontmatter · an unresolved link that is not
// declared planned · an orphan node · a filename that is not kebab-case · a
// `current` node past the staleness limit · a `superseded` node with no
// forward link.
//
// Both link syntaxes count as edges: [[wikilinks]] (Obsidian) and relative
// markdown links (GitHub). Pick one style per project — the checker resolves
// both so migrating between them is not a flag day.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve, relative, basename, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const CONFIG = {
  docsDir: 'docs',
  indexFile: 'INDEX.md',
  staleDays: 180,
  types: ['charter', 'decision', 'plan', 'feature', 'runbook', 'reference', 'note'],
  statuses: ['draft', 'current', 'superseded', 'abandoned'],
  // Files exempt from the kebab-case rule — conventional shouty names.
  namingExempt: ['INDEX.md', 'README.md', 'CHARTER.md', 'CLAUDE.md'],
  // Node types whose `updated` date is not expected to move. A decision is a
  // record of a moment; it does not go stale, it gets superseded.
  staleExempt: ['decision', 'charter'],
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Every markdown file under a directory, recursively. */
export function markdownFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) markdownFiles(full, acc)
    else if (entry.name.endsWith('.md')) acc.push(full)
  }
  return acc
}

/** Minimal frontmatter reader: scalars, inline [a, b] lists, folded scalars. */
export function frontmatter(source) {
  if (!source.startsWith('---')) return null
  const end = source.indexOf('\n---', 3)
  if (end === -1) return null

  const body = source.slice(source.indexOf('\n') + 1, end + 1)
  const out = {}
  const lines = body.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(lines[i])
    if (!match) continue
    const [, key, raw] = match

    if (raw === '>-' || raw === '>' || raw === '|' || raw === '|-') {
      const folded = []
      while (i + 1 < lines.length && (lines[i + 1].startsWith('  ') || lines[i + 1].trim() === '')) {
        folded.push(lines[++i].trim())
      }
      out[key] = folded.join(' ').replace(/\s+/g, ' ').trim()
    } else if (raw.startsWith('[') && raw.endsWith(']')) {
      out[key] = raw.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
    } else {
      out[key] = raw.trim().replace(/^["']|["']$/g, '')
    }
  }
  return out
}

/** Outgoing edges: [[wikilinks]] and relative markdown links. Code blocks excluded. */
export function edges(source) {
  const clean = source.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const wiki = []
  const rel = []

  for (const [, target] of clean.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) {
    wiki.push(target.trim())
  }
  for (const [, target] of clean.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue
    rel.push(target.split('#')[0])
  }
  return { wiki, rel }
}

/** Node names declared under "## Planned" in the index — linked but not written yet. */
export function plannedNames(indexSource) {
  const lines = indexSource.split('\n')
  const start = lines.findIndex((line) => /^##\s+Planned\s*$/.test(line))
  if (start === -1) return new Set()

  const rest = lines.slice(start + 1)
  const end = rest.findIndex((line) => /^##\s/.test(line))
  const section = (end === -1 ? rest : rest.slice(0, end)).join('\n')

  return new Set([...section.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim()))
}

const daysBetween = (a, b) => Math.floor((a - b) / 86_400_000)

export function checkDocs(root = process.cwd(), config = CONFIG, today = new Date()) {
  const problems = []
  const docsDir = join(root, config.docsDir)
  const fail = (file, message) => problems.push({ file: relative(root, file), message })

  if (!existsSync(docsDir)) {
    problems.push({ file: config.docsDir, message: 'docs directory does not exist' })
    return problems
  }

  const files = markdownFiles(docsDir)
  if (files.length === 0) {
    problems.push({ file: config.docsDir, message: 'no documents found' })
    return problems
  }

  const indexPath = join(docsDir, config.indexFile)
  if (!existsSync(indexPath)) {
    problems.push({ file: join(config.docsDir, config.indexFile), message: 'the index is missing — the graph has no hub' })
    return problems
  }

  // name → paths, for wikilink resolution (Obsidian matches on basename)
  const byName = new Map()
  for (const file of files) {
    const name = basename(file, '.md')
    if (!byName.has(name)) byName.set(name, [])
    byName.get(name).push(file)
  }

  const planned = plannedNames(readFileSync(indexPath, 'utf8'))
  const outgoing = new Map()

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const meta = frontmatter(source)
    const name = basename(file)

    // --- naming ---
    if (!config.namingExempt.includes(name) && !/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(name)) {
      fail(file, `filename is not kebab-case: ${name}`)
    }

    // --- frontmatter ---
    if (!meta) {
      fail(file, 'no frontmatter — every node needs title, type, status and updated')
      outgoing.set(file, [])
      continue
    }
    if (!meta.title) fail(file, 'frontmatter has no `title`')
    if (!meta.type) fail(file, 'frontmatter has no `type`')
    else if (!config.types.includes(meta.type)) {
      fail(file, `unknown type "${meta.type}" — expected one of: ${config.types.join(', ')}`)
    }
    if (!meta.status) fail(file, 'frontmatter has no `status`')
    else if (!config.statuses.includes(meta.status)) {
      fail(file, `unknown status "${meta.status}" — expected one of: ${config.statuses.join(', ')}`)
    }

    if (!meta.updated) {
      fail(file, 'frontmatter has no `updated` — the node is unknowably stale')
    } else if (!DATE.test(meta.updated)) {
      fail(file, `\`updated\` is not YYYY-MM-DD: ${meta.updated}`)
    } else {
      const age = daysBetween(today, new Date(`${meta.updated}T00:00:00Z`))
      if (age < 0) fail(file, `\`updated\` is in the future: ${meta.updated}`)
      else if (
        meta.status === 'current' &&
        !config.staleExempt.includes(meta.type) &&
        age > config.staleDays
      ) {
        fail(file, `stale: last checked ${age} days ago (limit ${config.staleDays}). Re-read it, then fix it, re-date it, or supersede it`)
      }
    }

    // A superseded node that does not say what replaced it is a dead end.
    if (meta.status === 'superseded' && !/supersed/i.test(source.slice(source.indexOf('\n---') + 4))) {
      fail(file, 'status is `superseded` but the body does not say what replaced it')
    }

    // --- edges ---
    const { wiki, rel } = edges(source)
    const resolved = []

    for (const target of wiki) {
      const matches = byName.get(target)
      if (!matches) {
        if (!planned.has(target)) {
          fail(file, `unresolved link [[${target}]] — no such node, and it is not declared under "## Planned" in the index`)
        }
        continue
      }
      if (matches.length > 1) {
        fail(file, `ambiguous link [[${target}]] — matches ${matches.length} files; rename one`)
      }
      resolved.push(matches[0])
    }

    for (const target of rel) {
      const abs = resolve(dirname(file), target)
      if (!existsSync(abs)) {
        fail(file, `broken link: ${target}`)
        continue
      }
      if (statSync(abs).isFile() && abs.endsWith('.md') && abs.startsWith(docsDir)) resolved.push(abs)
    }

    outgoing.set(file, resolved)
  }

  // --- orphans: everything must be reachable from the index ---
  const reachable = new Set([indexPath])
  const queue = [indexPath]
  while (queue.length) {
    for (const next of outgoing.get(queue.shift()) ?? []) {
      if (!reachable.has(next)) {
        reachable.add(next)
        queue.push(next)
      }
    }
  }
  for (const file of files) {
    if (!reachable.has(file)) {
      fail(file, 'orphan — not reachable from the index. A node nobody can find is a node nobody maintains')
    }
  }

  return problems
}

// --- CLI ------------------------------------------------------------------
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const problems = checkDocs(process.cwd())
  if (problems.length === 0) {
    console.log('✓ docs graph: frontmatter, links, index coverage and freshness all check out')
    process.exit(0)
  }
  console.error(`✗ ${problems.length} problem${problems.length === 1 ? '' : 's'} in the docs graph:\n`)
  for (const { file, message } of problems) console.error(`  ${file}\n    ${message}`)
  console.error('\nThe docs-graph skill explains each of these.')
  process.exit(1)
}
