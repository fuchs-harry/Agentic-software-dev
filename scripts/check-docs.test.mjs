// Tests for the docs-graph checker that ships in templates/scripts/.
//
// Same discipline as validate.test.mjs: every check is proven twice — once
// against this repository's real docs graph, and once against a fixture broken
// on purpose that it MUST reject. A checker that passes on a broken graph is
// worse than none, because it certifies the rot.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkDocs, CONFIG, edges, plannedNames } from '../templates/scripts/check-docs.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TODAY = new Date('2026-08-11T12:00:00Z')

const node = (title, type, status, updated, body = '') =>
  `---\ntitle: ${title}\ntype: ${type}\nstatus: ${status}\nupdated: ${updated}\ntags: [x]\n---\n\n# ${title}\n\n${body}\n`

/** A valid three-node graph, with the given mutations applied. */
function fixture(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'asd-docs-'))
  const base = {
    'docs/INDEX.md': node('Index', 'reference', 'current', '2026-08-01', 'See [[alpha]] and [[beta]].'),
    'docs/alpha.md': node('Alpha', 'feature', 'current', '2026-08-01', 'Back to [[INDEX]].'),
    'docs/beta.md': node('Beta', 'reference', 'current', '2026-08-01', 'Also [[alpha]].'),
  }
  for (const [path, content] of Object.entries({ ...base, ...files })) {
    if (content === null) continue
    const full = join(dir, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
  return dir
}

const messagesFor = (dir) => checkDocs(dir, CONFIG, TODAY).map((p) => p.message).join(' | ')

function withFixture(files, assertion) {
  const dir = fixture(files)
  try {
    assertion(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// --- positive -------------------------------------------------------------

test("this repository's own docs graph is valid", () => {
  const problems = checkDocs(ROOT, CONFIG, TODAY)
  assert.deepEqual(problems, [], `unexpected problems:\n${problems.map((p) => `${p.file}: ${p.message}`).join('\n')}`)
})

test('a well-formed graph passes', () => {
  withFixture({}, (dir) => assert.deepEqual(checkDocs(dir, CONFIG, TODAY), []))
})

test('a link declared under "## Planned" is not a failure', () => {
  withFixture(
    {
      'docs/INDEX.md': node('Index', 'reference', 'current', '2026-08-01',
        'See [[alpha]], [[beta]] and [[gamma]].\n\n## Planned\n\n- `gamma` — linked from [[INDEX]], not written yet\n'),
    },
    (dir) => assert.deepEqual(checkDocs(dir, CONFIG, TODAY), []),
  )
})

test('links in code blocks are not treated as edges', () => {
  const source = '```\n[[not-a-node]]\n```\nand [[real]] plus `[[inline]]`'
  assert.deepEqual(edges(source).wiki, ['real'])
})

test('relative markdown links count as edges, external ones do not', () => {
  const { rel } = edges('[a](https://example.com) [b](./other.md) [c](#x) [d](../up.md#frag)')
  assert.deepEqual(rel, ['./other.md', '../up.md'])
})

test('planned names are read only from the Planned section', () => {
  const index = '## Related\n\n- `not-planned`\n\n## Planned\n\n- `gamma` — soon\n- `delta`\n'
  assert.deepEqual([...plannedNames(index)].sort(), ['delta', 'gamma'])
})

// --- negative controls ----------------------------------------------------

const broken = [
  {
    what: 'a node with no frontmatter',
    files: { 'docs/beta.md': '# Beta\n\nNothing above me.\n' },
    expect: /no frontmatter/,
  },
  {
    what: 'an unknown type',
    files: { 'docs/beta.md': node('Beta', 'thoughts', 'current', '2026-08-01') },
    expect: /unknown type "thoughts"/,
  },
  {
    what: 'an unknown status',
    files: { 'docs/beta.md': node('Beta', 'reference', 'maybe', '2026-08-01') },
    expect: /unknown status "maybe"/,
  },
  {
    what: 'a missing updated date',
    files: { 'docs/beta.md': '---\ntitle: Beta\ntype: reference\nstatus: current\n---\n\n# Beta\n' },
    expect: /no `updated`/,
  },
  {
    what: 'a malformed updated date',
    files: { 'docs/beta.md': node('Beta', 'reference', 'current', 'last tuesday') },
    expect: /not YYYY-MM-DD/,
  },
  {
    what: 'an updated date in the future',
    files: { 'docs/beta.md': node('Beta', 'reference', 'current', '2027-01-01') },
    expect: /in the future/,
  },
  {
    what: 'a current node past the staleness limit',
    files: { 'docs/beta.md': node('Beta', 'reference', 'current', '2024-01-01') },
    expect: /stale: last checked \d+ days ago/,
  },
  {
    what: 'an orphan node',
    files: { 'docs/lonely.md': node('Lonely', 'note', 'current', '2026-08-01') },
    expect: /orphan/,
  },
  {
    what: 'an unresolved link that is not declared planned',
    files: { 'docs/beta.md': node('Beta', 'reference', 'current', '2026-08-01', 'See [[ghost]].') },
    expect: /unresolved link \[\[ghost\]\]/,
  },
  {
    what: 'a broken relative link',
    files: { 'docs/beta.md': node('Beta', 'reference', 'current', '2026-08-01', 'See [x](./nope.md).') },
    expect: /broken link/,
  },
  {
    what: 'an ambiguous wikilink',
    files: { 'docs/sub/beta.md': node('Beta again', 'note', 'current', '2026-08-01', 'Back to [[INDEX]].') },
    expect: /ambiguous link \[\[beta\]\]/,
  },
  {
    what: 'a filename that is not kebab-case',
    files: { 'docs/Beta Notes.md': node('Beta', 'note', 'current', '2026-08-01', 'Back to [[INDEX]].') },
    expect: /not kebab-case/,
  },
  {
    what: 'a superseded node that does not say what replaced it',
    files: { 'docs/beta.md': node('Beta', 'reference', 'superseded', '2026-08-01', 'Nothing here.') },
    expect: /does not say what replaced it/,
  },
  {
    what: 'a missing index',
    files: { 'docs/INDEX.md': null },
    expect: /index is missing/,
  },
]

for (const { what, files, expect } of broken) {
  test(`rejects ${what}`, () => {
    withFixture(files, (dir) => assert.match(messagesFor(dir), expect))
  })
}

// --- the staleness rule has deliberate exemptions -------------------------

test('a decision is not stale — it gets superseded, not re-dated', () => {
  withFixture(
    { 'docs/beta.md': node('Beta', 'decision', 'current', '2019-01-01', 'Old but still binding.') },
    (dir) => assert.deepEqual(checkDocs(dir, CONFIG, TODAY), []),
  )
})

test('a superseded node is not checked for staleness', () => {
  withFixture(
    { 'docs/beta.md': node('Beta', 'reference', 'superseded', '2019-01-01', 'Superseded by [[alpha]].') },
    (dir) => assert.deepEqual(checkDocs(dir, CONFIG, TODAY), []),
  )
})
