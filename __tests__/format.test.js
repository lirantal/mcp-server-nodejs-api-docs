import { describe, test } from 'node:test'
import assert from 'node:assert'
import { formatContent, normalizeModuleName } from '../src/utils/format.ts'

describe('Utils: format', () => {
  test('should replace single newlines with double newlines', () => {
    const input = 'Hello\nWorld\nTest'
    const expected = 'Hello\n\nWorld\n\nTest'
    const result = formatContent(input)
    assert.strictEqual(result, expected)
  })

  test('should return empty string for null or undefined input', () => {
    const result1 = formatContent(null)
    const result2 = formatContent(undefined)
    assert.strictEqual(result1, '')
    assert.strictEqual(result2, '')
  })

  test('should normalize module names', () => {
    const input1 = 'My_Module'
    const input2 = 'my-module'
    const input3 = 'my module'
    const expected = 'mymodule'
    assert.strictEqual(normalizeModuleName(input1), expected)
    assert.strictEqual(normalizeModuleName(input2), expected)
    assert.strictEqual(normalizeModuleName(input3), expected)
  })

  test('should handle empty strings in normalization', () => {
    const result = normalizeModuleName('')
    assert.strictEqual(result, '')
  })

  test('should handle special characters in normalization', () => {
    const input = 'My-Module_123'
    const expected = 'mymodule123'
    const result = normalizeModuleName(input)
    assert.strictEqual(result, expected)
  })

  test('should handle numbers in normalization', () => {
    const input = 'Module123'
    const expected = 'module123'
    const result = normalizeModuleName(input)
    assert.strictEqual(result, expected)
  })

  test('should handle mixed case in normalization', () => {
    const input = 'MyModule'
    const expected = 'mymodule'
    const result = normalizeModuleName(input)
    assert.strictEqual(result, expected)
  })
})
