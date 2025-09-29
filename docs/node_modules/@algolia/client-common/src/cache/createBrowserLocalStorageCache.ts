import type { BrowserLocalStorageCacheItem, BrowserLocalStorageOptions, Cache, CacheEvents } from '../types';

export function createBrowserLocalStorageCache(options: BrowserLocalStorageOptions): Cache {
  let storage: Storage;
  // We've changed the namespace to avoid conflicts with v4, as this version is a huge breaking change
  const namespaceKey = `algolia-client-js-${options.key}`;

  function getStorage(): Storage {
    if (storage === undefined) {
      storage = options.localStorage || window.localStorage;
    }

    return storage;
  }

  function getNamespace<TValue>(): Record<string, TValue> {
    return JSON.parse(getStorage().getItem(namespaceKey) || '{}');
  }

  function setNamespace(namespace: Record<string, any>): void {
    getStorage().setItem(namespaceKey, JSON.stringify(namespace));
  }

  function removeOutdatedCacheItems(): void {
    const timeToLive = options.timeToLive ? options.timeToLive * 1000 : null;
    const namespace = getNamespace<BrowserLocalStorageCacheItem>();

    const filteredNamespaceWithoutOldFormattedCacheItems = Object.fromEntries(
      Object.entries(namespace).filter(([, cacheItem]) => {
        return cacheItem.timestamp !== undefined;
      }),
    );

    setNamespace(filteredNamespaceWithoutOldFormattedCacheItems);

    if (!timeToLive) {
      return;
    }

    const filteredNamespaceWithoutExpiredItems = Object.fromEntries(
      Object.entries(filteredNamespaceWithoutOldFormattedCacheItems).filter(([, cacheItem]) => {
        const currentTimestamp = new Date().getTime();
        const isExpired = cacheItem.timestamp + timeToLive < currentTimestamp;

        return !isExpired;
      }),
    );

    setNamespace(filteredNamespaceWithoutExpiredItems);
  }

  return {
    get<TValue>(
      key: Record<string, any> | string,
      defaultValue: () => Promise<TValue>,
      events: CacheEvents<TValue> = {
        miss: () => Promise.resolve(),
      },
    ): Promise<TValue> {
      return Promise.resolve()
        .then(() => {
          removeOutdatedCacheItems();

          return getNamespace<Promise<BrowserLocalStorageCacheItem>>()[JSON.stringify(key)];
        })
        .then((value) => {
          return Promise.all([value ? value.value : defaultValue(), value !== undefined]);
        })
        .then(([value, exists]) => {
          return Promise.all([value, exists || events.miss(value)]);
        })
        .then(([value]) => value);
    },

    set<TValue>(key: Record<string, any> | string, value: TValue): Promise<TValue> {
      return Promise.resolve().then(() => {
        const namespace = getNamespace();

        namespace[JSON.stringify(key)] = {
          timestamp: new Date().getTime(),
          value,
        };

        getStorage().setItem(namespaceKey, JSON.stringify(namespace));

        return value;
      });
    },

    delete(key: Record<string, any> | string): Promise<void> {
      return Promise.resolve().then(() => {
        const namespace = getNamespace();

        delete namespace[JSON.stringify(key)];

        getStorage().setItem(namespaceKey, JSON.stringify(namespace));
      });
    },

    clear(): Promise<void> {
      return Promise.resolve().then(() => {
        getStorage().removeItem(namespaceKey);
      });
    },
  };
}
