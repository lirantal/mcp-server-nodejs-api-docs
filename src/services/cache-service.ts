import { initLogger, type Logger } from '../utils/logger.ts'

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

interface CacheOptions {
  ttlDays?: number
}

export class CacheService {
  private logger: Logger
  private cache: Map<string, CacheEntry<any>>

  constructor () {
    this.logger = initLogger()
    this.cache = new Map()
  }

  /**
   * Fetches data with caching. If cached data exists and hasn't expired, returns it.
   * Otherwise, fetches fresh data using the provided fetcher function.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttlDays = 7 } = options
    const now = Date.now()

    // Check if we have valid cached data
    const cached = this.cache.get(key)
    if (cached && cached.expiresAt > now) {
      this.logger.info({ msg: `Cache hit for key: ${key}` })
      return cached.data
    }

    // Cache miss or expired - fetch fresh data
    this.logger.info({ msg: `Cache miss for key: ${key}, fetching fresh data...` })
    try {
      const data = await fetcher()

      // Calculate expiration time
      const expiresAt = now + (ttlDays * 24 * 60 * 60 * 1000)

      // Store in cache
      this.cache.set(key, { data, expiresAt })

      this.logger.info({
        msg: `Cached data for key: ${key}`,
        expiresAt: new Date(expiresAt).toISOString(),
        ttlDays
      })

      return data
    } catch (error) {
      this.logger.error({ err: error, msg: `Failed to fetch data for key: ${key}` })
      throw error
    }
  }

  /**
   * Convenience method for fetching HTTP resources with caching
   */
  async fetchHttpWithCache (
    url: string,
    options: CacheOptions & { responseType?: 'json' | 'text' } = {}
  ): Promise<any> {
    const { responseType = 'json', ...cacheOptions } = options

    return this.fetchWithCache(
      url,
      async () => {
        this.logger.info({ msg: `Fetching HTTP resource: ${url}` })
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
        }

        const data = responseType === 'json' ? await response.json() : await response.text()
        this.logger.info({ msg: `Successfully fetched HTTP resource: ${url}` })
        return data
      },
      cacheOptions
    )
  }

  /**
   * Clear a specific cache entry
   */
  clearCache (key: string): void {
    this.cache.delete(key)
    this.logger.info({ msg: `Cleared cache for key: ${key}` })
  }

  /**
   * Clear all expired cache entries
   */
  clearExpiredCache (): void {
    const now = Date.now()
    let clearedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key)
        clearedCount++
      }
    }

    if (clearedCount > 0) {
      this.logger.info({ msg: `Cleared ${clearedCount} expired cache entries` })
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats (): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}
