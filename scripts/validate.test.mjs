// Tests for the validator, including negative controls.
//
// A validator that passes on a broken repository is worse than no validator: it
// reports safety. So each check below is proven twice — once on the real
// repository, and once on a deliberately broken fixture that it MUST reject.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runChecks, frontmatter, relativeLinks } from './validate.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Build a throwaway plugin tree, apply the given mutations, return its path. */
function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'asd-fixture-'))
  const base = {
    '.claude-plugin/plugin.json': JSON.stringify({ name: 'demo', version: '1.0.0' }),
    '.claude-plugin/marketplace.json': JSON.stringify({
      name: 'demo',
      plugins: [{ name: 'demo', source: './', version: '1.0.0' }],
    }),
    'skills/demo/SKILL.md': '---\nname: demo\ndescription: A demo skill that does a thing.\n---\n\n# Demo\n',
    'commands/go.md': '---\ndescription: Go\n---\n\nGo.\n',
    'agents/helper.md': '---\nname: helper\ndescription: Helps\n---\n\nHelp.\n',
  }
  for (const [path, content] of Object.entries({ ...base, ...files })) {
    if (content === null) continue
    const full = join(dir, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
  return dir
}

const messagesFor = (dir) => runChecks(dir).map((p) => p.message).join(' | ')

// --- the positive case ----------------------------------------------------

test('this repository passes its own validator', () => {
  const problems = runChecks(ROOT)
  assert.deepEqual(problems, [], `unexpected problems:\n${problems.map((p) => `${p.file}: ${p.message}`).join('\n')}`)
})

test('a well-formed fixture passes', () => {
  const dir = fixture({})
  try {
    assert.deepEqual(runChecks(dir), [])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

// --- negative controls ----------------------------------------------------
// Each of these breaks exactly one thing. The validator must notice.

const brokenFixtures = [
  {
    what: 'a skill with no description',
    files: { 'skills/demo/SKILL.md': '---\nname: demo\n---\n\n# Demo\n' },
    expect: /no `description`/,
  },
  {
    what: 'a skill whose name disagrees with its folder',
    files: { 'skills/demo/SKILL.md': '---\nname: something-else\ndescription: x\n---\n' },
    expect: /does not match directory/,
  },
  {
    what: 'a skill with no frontmatter at all',
    files: { 'skills/demo/SKILL.md': '# Demo\n' },
    expect: /missing or unterminated frontmatter/,
  },
  {
    what: 'a broken relative link',
    files: { 'skills/demo/SKILL.md': '---\nname: demo\ndescription: x\n---\n\n[gone](references/nope.md)\n' },
    expect: /broken link/,
  },
  {
    what: 'an orphan reference file',
    files: {
      'skills/demo/references/unread.md': '# Nobody links here\n',
    },
    expect: /orphan/,
  },
  {
    what: 'marketplace and plugin versions disagreeing',
    files: {
      '.claude-plugin/marketplace.json': JSON.stringify({
        name: 'demo',
        plugins: [{ name: 'demo', source: './', version: '9.9.9' }],
      }),
    },
    expect: /disagrees with plugin.json/,
  },
  {
    what: 'malformed JSON in a manifest',
    files: { '.claude-plugin/plugin.json': '{ "name": "demo", ' },
    expect: /not valid JSON/,
  },
  {
    what: 'an agent whose name disagrees with its filename',
    files: { 'agents/helper.md': '---\nname: assistant\ndescription: x\n---\n' },
    expect: /does not match filename/,
  },
  {
    what: 'a command with no description',
    files: { 'commands/go.md': '---\nargument-hint: "x"\n---\n\nGo.\n' },
    expect: /no `description`/,
  },
]

for (const { what, files, expect } of brokenFixtures) {
  test(`rejects ${what}`, () => {
    const dir = fixture(files)
    try {
      assert.match(messagesFor(dir), expect)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
}

// --- the parsing helpers, at their boundaries -----------------------------

test('frontmatter folds a >- block scalar into one line', () => {
  const meta = frontmatter('---\nname: x\ndescription: >-\n  first line\n  second line\n---\nbody\n')
  assert.equal(meta.description, 'first line second line')
})

test('frontmatter returns null when the block is never closed', () => {
  assert.equal(frontmatter('---\nname: x\nno terminator here\n'), null)
})

test('frontmatter returns null when there is none', () => {
  assert.equal(frontmatter('# Just a heading\n'), null)
})

test('links inside fenced code blocks are not checked', () => {
  const source = '```\n[example](does/not/exist.md)\n```\n[real](./other.md)\n'
  assert.deepEqual(relativeLinks(source), ['./other.md'])
})

test('external links and bare anchors are ignored', () => {
  const source = '[a](https://example.com) [b](mailto:x@y.z) [c](#section) [d](./real.md)'
  assert.deepEqual(relativeLinks(source), ['./real.md'])
})
