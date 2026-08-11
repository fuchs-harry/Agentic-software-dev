#!/usr/bin/env node
// Validates the plugin itself: frontmatter, naming, manifests, links, orphans.
//
// This repository has to follow its own rules, and a rule nothing checks is a
// suggestion. Run with `npm run validate`.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Templates and assets hold placeholder content on purpose — `<slug>`, links to
// files that will only exist in the project being scaffolded. Checking those
// links would report failures for text that is working as intended.
const LINK_CHECK_SKIPPED = [`${sep}assets${sep}`, `templates${sep}`]

const MAX_DESCRIPTION = 1024

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

/**
 * Minimal frontmatter reader: scalars and folded (`>-` / `|`) block scalars.
 * Not a YAML parser — deliberately. It handles exactly what skill frontmatter
 * uses, and anything else is a finding rather than a silent pass.
 */
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
    const [, key, rawValue] = match

    if (rawValue === '>-' || rawValue === '>' || rawValue === '|' || rawValue === '|-') {
      const folded = []
      while (i + 1 < lines.length && (lines[i + 1].startsWith('  ') || lines[i + 1].trim() === '')) {
        folded.push(lines[++i].trim())
      }
      out[key] = folded.join(' ').replace(/\s+/g, ' ').trim()
    } else {
      out[key] = rawValue.trim().replace(/^["']|["']$/g, '')
    }
  }
  return out
}

/** Relative markdown links in a file, excluding external ones and bare anchors. */
export function relativeLinks(source) {
  const links = []
  // Skip fenced code blocks — they contain example paths that need not exist.
  const withoutCode = source.replace(/```[\s\S]*?```/g, '')
  for (const [, target] of withoutCode.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue
    links.push(target)
  }
  return links
}

export function runChecks(root = ROOT) {
  const problems = []
  const fail = (file, message) => problems.push({ file: relative(root, file), message })

  // --- skills -------------------------------------------------------------
  const skillsDir = join(root, 'skills')
  const skillNames = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : []

  if (skillNames.length === 0) fail(skillsDir, 'no skills found')

  for (const name of skillNames) {
    const skillFile = join(skillsDir, name, 'SKILL.md')
    if (!existsSync(skillFile)) {
      fail(join(skillsDir, name), 'directory has no SKILL.md')
      continue
    }

    const source = readFileSync(skillFile, 'utf8')
    const meta = frontmatter(source)

    if (!meta) {
      fail(skillFile, 'missing or unterminated frontmatter')
      continue
    }
    if (!meta.name) fail(skillFile, 'frontmatter has no `name`')
    else if (meta.name !== name) fail(skillFile, `frontmatter name "${meta.name}" does not match directory "${name}"`)

    if (!meta.description) fail(skillFile, 'frontmatter has no `description` — the skill will never trigger')
    else if (meta.description.length > MAX_DESCRIPTION)
      fail(skillFile, `description is ${meta.description.length} chars, over the ${MAX_DESCRIPTION} limit`)

    // A reference nothing links to will never be read.
    const refDir = join(skillsDir, name, 'references')
    if (existsSync(refDir)) {
      const linkedAnywhere = markdownFiles(join(skillsDir, name))
        .map((f) => readFileSync(f, 'utf8'))
        .join('\n')
      for (const ref of readdirSync(refDir)) {
        if (!linkedAnywhere.includes(ref)) fail(join(refDir, ref), 'orphan — nothing in this skill links to it')
      }
    }
  }

  // --- commands and agents ------------------------------------------------
  for (const kind of ['commands', 'agents']) {
    const dir = join(root, kind)
    if (!existsSync(dir)) continue
    for (const entry of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const file = join(dir, entry)
      const meta = frontmatter(readFileSync(file, 'utf8'))
      if (!meta) {
        fail(file, 'missing or unterminated frontmatter')
        continue
      }
      if (!meta.description) fail(file, 'frontmatter has no `description`')
      if (kind === 'agents') {
        const expected = entry.replace(/\.md$/, '')
        if (!meta.name) fail(file, 'agent frontmatter has no `name`')
        else if (meta.name !== expected) fail(file, `agent name "${meta.name}" does not match filename "${expected}"`)
      }
    }
  }

  // --- manifests ----------------------------------------------------------
  const pluginPath = join(root, '.claude-plugin', 'plugin.json')
  const marketPath = join(root, '.claude-plugin', 'marketplace.json')
  let plugin = null

  for (const [path, label] of [[pluginPath, 'plugin.json'], [marketPath, 'marketplace.json']]) {
    if (!existsSync(path)) {
      fail(path, `${label} is missing`)
      continue
    }
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8'))
      if (path === pluginPath) plugin = parsed
      if (!parsed.name) fail(path, 'has no `name`')
    } catch (error) {
      fail(path, `is not valid JSON: ${error.message}`)
    }
  }

  if (plugin && existsSync(marketPath)) {
    try {
      const market = JSON.parse(readFileSync(marketPath, 'utf8'))
      const entry = (market.plugins ?? []).find((p) => p.name === plugin.name)
      if (!entry) fail(marketPath, `does not list the plugin "${plugin.name}"`)
      else if (entry.version && entry.version !== plugin.version)
        fail(marketPath, `version ${entry.version} disagrees with plugin.json ${plugin.version}`)
    } catch {
      /* already reported above */
    }
  }

  // --- links --------------------------------------------------------------
  for (const file of markdownFiles(root).filter((f) => !f.includes(`${sep}node_modules${sep}`))) {
    if (LINK_CHECK_SKIPPED.some((skip) => file.includes(skip))) continue
    for (const link of relativeLinks(readFileSync(file, 'utf8'))) {
      const target = resolve(dirname(file), link.split('#')[0])
      if (!existsSync(target)) fail(file, `broken link: ${link}`)
      else if (link.endsWith('/') && !statSync(target).isDirectory()) fail(file, `link ends in / but is not a directory: ${link}`)
    }
  }

  return problems
}

// --- CLI ------------------------------------------------------------------
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const problems = runChecks()
  if (problems.length === 0) {
    console.log('✓ plugin structure, manifests and links all check out')
    process.exit(0)
  }
  console.error(`✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`)
  for (const { file, message } of problems) console.error(`  ${file}\n    ${message}`)
  process.exit(1)
}
