export interface CacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

/**
 * Caching is an infrastructure concern. Phase 0 does not add a cache implementation
 * beyond this boundary. Callers must not assume a specific cache engine.
 */
export class NoopCacheProvider implements CacheProvider {
  async get(_key: string): Promise<string | null> {
    return null;
  }

  async set(_key: string, _value: string, _ttlSeconds?: number): Promise<void> {
    return;
  }

  async del(_key: string): Promise<void> {
    return;
  }
}
