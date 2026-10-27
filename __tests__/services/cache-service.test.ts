import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CacheService } from '../../src/services/cache-service.ts'

test('serves cached data until the entry is cleared', async () => {
  const cache = new CacheService()
  let calls = 0
  const fetcher = async () => ({ revision: ++calls })
  const first = await cache.fetchWithCache('docs', fetcher)
  assert.strictEqual(await cache.fetchWithCache('docs', fetcher), first)
  assert.equal(calls, 1)
  assert.deepEqual(cache.getCacheStats(), { size: 1, keys: ['docs'] })
  cache.clearCache('docs')
  assert.deepEqual(await cache.fetchWithCache('docs', fetcher), { revision: 2 })
})

test('expires entries and refetches rather than returning stale data', async () => {
  const cache = new CacheService()
  await cache.fetchWithCache('docs', async () => 'stale', { ttlDays: 0 })
  cache.clearExpiredCache()
  assert.deepEqual(cache.getCacheStats(), { size: 0, keys: [] })
  assert.equal(await cache.fetchWithCache('docs', async () => 'fresh'), 'fresh')
})

test('propagates fetch failures without caching a failed result', async () => {
  const cache = new CacheService()
  const error = new Error('network unavailable')
  await assert.rejects(cache.fetchWithCache('docs', async () => { throw error }), error)
  assert.equal(cache.getCacheStats().size, 0)
  assert.equal(await cache.fetchWithCache('docs', async () => 'recovered'), 'recovered')
})
