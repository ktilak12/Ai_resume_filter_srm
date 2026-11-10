/**
 * SRMIST High-Performance Memory & Session Cache Service
 * Provides in-memory LRU caching with Time-To-Live (TTL) for high-frequency data:
 * - Candidate lists and search indices
 * - Screened job requirements
 * - Computed ATS scores & match verdicts
 * - Analytics aggregations
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
  accessCount: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxEntries: number;
  private defaultTtlMs: number;
  private globalClock = 0;

  constructor(maxEntries = 200, defaultTtlMs = 5 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Retrieves an item from the cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    this.globalClock++;
    entry.lastAccessed = Date.now();
    entry.accessCount = this.globalClock;
    return entry.value as T;
  }

  /**
   * Stores an item in the cache with optional custom TTL
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    if (!this.cache.has(key) && this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.globalClock++;
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      lastAccessed: Date.now(),
      accessCount: this.globalClock
    });
  }

  /**
   * Checks whether a valid key exists
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidates a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidates all keys matching a prefix (e.g. 'candidates_')
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears entire memory cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Evicts least recently accessed entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestClock = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < oldestClock) {
        oldestClock = entry.accessCount;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Global shared cache instance for application lifecycle
export const appCache = new MemoryCache(250, 5 * 60 * 1000);
