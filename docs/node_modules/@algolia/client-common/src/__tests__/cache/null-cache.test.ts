import { createNullCache } from '../../cache';

type DefaultValue = Promise<{ bar: number }>;

describe('null cache', () => {
  const cache = createNullCache();
  const missMock = jest.fn();
  const events = {
    miss: (): Promise<any> => Promise.resolve(missMock()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not set value', async () => {
    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 12 });

    await cache.set({ key: 'key' }, { foo: 10 });

    expect(await cache.get({ key: 'key' }, defaultValue, events)).toMatchObject({
      bar: 12,
    });

    expect(missMock.mock.calls.length).toBe(1);
  });

  it('returns default value', async () => {
    const defaultValue = (): DefaultValue => Promise.resolve({ bar: 12 });

    expect(await cache.get({ foo: 'foo' }, defaultValue, events)).toMatchObject({
      bar: 12,
    });

    expect(missMock.mock.calls.length).toBe(1);
  });

  it('can be deleted', async () => {
    await cache.delete('foo');
  });

  it('can be cleared', async () => {
    await cache.clear();
  });
});
