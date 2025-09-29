import { createBrowserLocalStorageCache } from '../../cache';

const version = 'foobar';
const notAvailableStorage = new Proxy(window.localStorage, {
  get() {
    return (): void => {
      throw new Error('Component is not available');
    };
  },
});

type DefaultValue = Promise<{ bar: number }>;

describe('browser local storage cache', () => {
  const missMock = jest.fn();
  const events = {
    miss: (): Promise<any> => Promise.resolve(missMock()),
  };

  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('sets/gets values', async () => {
    const cache = createBrowserLocalStorageCache({ key: version });
    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 1 });

    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({ bar: 1 });
    expect(missMock.mock.calls.length).toBe(1);

    await cache.set({ key: 'foo' }, { foo: 2 });

    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({ foo: 2 });
    expect(missMock.mock.calls.length).toBe(1);
  });

  it('reads unexpired timeToLive keys', async () => {
    const cache = createBrowserLocalStorageCache({
      key: version,
      timeToLive: 5,
    });
    await cache.set({ key: 'foo' }, { bar: 1 });

    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 2 });

    expect(
      await cache.get({ key: 'foo' }, defaultValue, {
        miss: () => Promise.resolve(missMock()),
      }),
    ).toMatchObject({ bar: 1 });

    expect(missMock.mock.calls.length).toBe(0);
  });

  it('deletes keys', async () => {
    const cache = createBrowserLocalStorageCache({ key: version });

    await cache.set({ key: 'foo' }, { bar: 1 });
    await cache.delete({ key: 'foo' });

    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 2 });

    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({ bar: 2 });
    expect(missMock.mock.calls.length).toBe(1);
  });

  it('deletes expired keys', async () => {
    const cache = createBrowserLocalStorageCache({
      key: version,
      timeToLive: -1,
    });
    await cache.set({ key: 'foo' }, { bar: 1 });

    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 2 });

    expect(
      await cache.get({ key: 'foo' }, defaultValue, {
        miss: () => Promise.resolve(missMock()),
      }),
    ).toMatchObject({ bar: 2 });

    expect(missMock.mock.calls.length).toBe(1);
  });

  it('can be cleared', async () => {
    const cache = createBrowserLocalStorageCache({ key: version });
    await cache.set({ key: 'foo' }, { bar: 1 });

    await cache.clear();

    const defaultValue = (): Promise<void> => Promise.resolve({ bar: 2 });

    expect(localStorage.length).toBe(0);

    expect(
      await cache.get({ key: 'foo' }, defaultValue, {
        miss: () => Promise.resolve(missMock()),
      }),
    ).toMatchObject({ bar: 2 });

    expect(missMock.mock.calls.length).toBe(1);

    expect(localStorage.getItem(`algolia-client-js-${version}`)).toEqual('{}');
  });

  it('do throws localstorage exceptions on access', async () => {
    const message = "Failed to read the 'localStorage' property from 'Window': Access is denied for this document.";
    const cache = createBrowserLocalStorageCache(
      new Proxy(
        { key: 'foo' },
        {
          get(_, key): DOMException | string {
            if (key === 'key') {
              return 'foo';
            }

            // Simulates a window.localStorage access.
            throw new DOMException(message);
          },
        },
      ),
    );
    const key = { foo: 'bar' };
    const value = 'foo';
    const fallback = 'bar';

    await expect(cache.delete(key)).rejects.toEqual(new DOMException(message));
    await expect(cache.set(key, value)).rejects.toEqual(new DOMException(message));
    await expect(cache.get(key, () => Promise.resolve(fallback))).rejects.toEqual(new DOMException(message));
  });

  it('do throws localstorage exceptions after access', async () => {
    const cache = createBrowserLocalStorageCache({
      key: version,
      localStorage: notAvailableStorage,
    });
    const key = { foo: 'bar' };
    const value = 'foo';
    const fallback = 'bar';
    const message = 'Component is not available';

    await expect(cache.delete(key)).rejects.toEqual(new Error(message));
    await expect(cache.set(key, value)).rejects.toEqual(new Error(message));
    await expect(cache.get(key, () => Promise.resolve(fallback))).rejects.toEqual(new Error(message));
  });

  it('creates a namespace within local storage', async () => {
    const cache = createBrowserLocalStorageCache({
      key: version,
    });
    const key = { foo: 'bar' };
    const value = 'foo';
    expect(localStorage.getItem(`algolia-client-js-${version}`)).toBeNull();

    await cache.set(key, value);

    const expectedValue = expect.objectContaining({
      [JSON.stringify(key)]: {
        timestamp: expect.any(Number),
        value,
      },
    });

    const localStorageValue = localStorage.getItem(`algolia-client-js-${version}`);

    expect(JSON.parse(localStorageValue ? localStorageValue : '{}')).toEqual(expectedValue);
  });
});
