import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DocsFormatter } from '../../src/services/docs-formatter-service.ts'

test('normalizes tool identifiers and enforces the identifier length limit', () => {
  const formatter = new DocsFormatter()
  assert.equal(formatter.normalizeModuleName('Node:FS/Promises'), 'nodefspromises')
  assert.equal(formatter.normalizeModuleName('A'.repeat(60)), 'a'.repeat(47))
})

test('formats module documentation with descriptions and filtered methods', () => {
  const formatter = new DocsFormatter()
  const output = formatter.createModuleDocumentation({
    name: 'fs',
    textRaw: 'File system',
    desc: 'Read files.\nWrite files.',
    methods: [
      { textRaw: 'readFile()', desc: 'Reads a file.' },
      { textRaw: 'writeFile()', desc: 'Writes a file.' }
    ]
  }, { method: 'READ' })
  assert.match(output, /^# File system\n/)
  assert.ok(output.includes('Read files.\n\nWrite files.'))
  assert.ok(output.includes('### readFile()'))
  assert.ok(!output.includes('writeFile()'))
})
