import type { Cache, CacheEvents, MemoryCacheOptions } from '../types';

export function createMemoryCache(options: MemoryCacheOptions = { serializable: true }): Cache {
  let cache: Record<string, any> = {};

  return {
    get<TValue>(
      key: Record<string, any> | string,
      defaultValue: () => Promise<TValue>,
      events: CacheEvents<TValue> = {
        miss: (): Promise<void> => Promise.resolve(),
      },
    ): Promise<TValue> {
      const keyAsString = JSON.stringify(key);

      if (keyAsString in cache) {
        return Promise.resolve(options.serializable ? JSON.parse(cache[keyAsString]) : cache[keyAsString]);
      }

      const promise = defaultValue();

      return promise.then((value: TValue) => events.miss(value)).then(() => promise);
    },

    set<TValue>(key: Record<string, any> | string, value: TValue): Promise<TValue> {
      cache[JSON.stringify(key)] = options.serializable ? JSON.stringify(value) : value;

      return Promise.resolve(value);
    },

    delete(key: Record<string, unknown> | string): Promise<void> {
      delete cache[JSON.stringify(key)];

      return Promise.resolve();
    },

    clear(): Promise<void> {
      cache = {};

      return Promise.resolve();
    },
  };
}
