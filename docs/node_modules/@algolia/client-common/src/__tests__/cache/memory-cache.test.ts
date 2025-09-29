import { createMemoryCache } from '../../cache';

type DefaultValue = Promise<{ bar: number }>;

describe('memory cache', () => {
  const missMock = jest.fn();
  const events = {
    miss: (): Promise<any> => Promise.resolve(missMock()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets/gets values', async () => {
    const cache = createMemoryCache();
    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 1 });

    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({
      bar: 1,
    });

    await cache.set({ key: 'foo' }, { foo: 2 });

    expect(missMock.mock.calls.length).toBe(1);
    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({ foo: 2 });
    expect(missMock.mock.calls.length).toBe(1);
  });

  it('getted values do not have references to the value on cache', async () => {
    const cache = createMemoryCache();
    const key = { foo: 'bar' };
    const obj = { 1: { 2: 'bar' } };
    const defaultObj = { 1: { 2: 'too' } };

    await cache.set(key, obj);
    const gettedValue = await cache.get(key, () => Promise.resolve(defaultObj));
    gettedValue[1][2] = 'foo';

    expect(await cache.get(key, () => Promise.resolve(defaultObj))).toEqual({
      1: { 2: 'bar' },
    });
  });

  it('deletes keys', async () => {
    const cache = createMemoryCache();

    await cache.set({ key: 'foo' }, { bar: 1 });
    await cache.delete({ key: 'foo' });

    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 2 });

    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({ bar: 2 });
    expect(missMock.mock.calls.length).toBe(1);
  });

  it('can be cleared', async () => {
    const cache = createMemoryCache();

    await cache.set({ key: 'foo' }, { bar: 1 });
    await cache.clear();

    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 2 });

    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({ bar: 2 });
    expect(missMock.mock.calls.length).toBe(1);
  });

  it('do not force promise based api for clearing cache', async () => {
    const cache = createMemoryCache();

    cache.set({ key: 'foo' }, { bar: 1 });
    cache.clear();

    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 2 });

    expect(await cache.get({ key: 'foo' }, defaultValue, events)).toMatchObject({ bar: 2 });
    expect(missMock.mock.calls.length).toBe(1);
  });
});
