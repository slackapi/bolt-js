import type { FallbackableCacheOptions, Cache, CacheEvents } from '../types';

import { createNullCache } from './createNullCache';

export function createFallbackableCache(options: FallbackableCacheOptions): Cache {
  const caches = [...options.caches];
  const current = caches.shift();

  if (current === undefined) {
    return createNullCache();
  }

  return {
    get<TValue>(
      key: Record<string, any> | string,
      defaultValue: () => Promise<TValue>,
      events: CacheEvents<TValue> = {
        miss: (): Promise<void> => Promise.resolve(),
      },
    ): Promise<TValue> {
      return current.get(key, defaultValue, events).catch(() => {
        return createFallbackableCache({ caches }).get(key, defaultValue, events);
      });
    },

    set<TValue>(key: Record<string, any> | string, value: TValue): Promise<TValue> {
      return current.set(key, value).catch(() => {
        return createFallbackableCache({ caches }).set(key, value);
      });
    },

    delete(key: Record<string, any> | string): Promise<void> {
      return current.delete(key).catch(() => {
        return createFallbackableCache({ caches }).delete(key);
      });
    },

    clear(): Promise<void> {
      return current.clear().catch(() => {
        return createFallbackableCache({ caches }).clear();
      });
    },
  };
}
