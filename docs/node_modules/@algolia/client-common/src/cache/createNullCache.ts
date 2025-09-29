import type { Cache, CacheEvents } from '../types';

export function createNullCache(): Cache {
  return {
    get<TValue>(
      _key: Record<string, any> | string,
      defaultValue: () => Promise<TValue>,
      events: CacheEvents<TValue> = {
        miss: (): Promise<void> => Promise.resolve(),
      },
    ): Promise<TValue> {
      const value = defaultValue();

      return value.then((result) => Promise.all([result, events.miss(result)])).then(([result]) => result);
    },

    set<TValue>(_key: Record<string, any> | string, value: TValue): Promise<TValue> {
      return Promise.resolve(value);
    },

    delete(_key: Record<string, any> | string): Promise<void> {
      return Promise.resolve();
    },

    clear(): Promise<void> {
      return Promise.resolve();
    },
  };
}
