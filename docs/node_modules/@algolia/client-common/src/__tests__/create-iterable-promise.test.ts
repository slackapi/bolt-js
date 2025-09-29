import { createIterablePromise } from '../createIterablePromise';

describe('createIterablePromise', () => {
  describe('func', () => {
    it('provides the `previousResponse` parameter', async () => {
      const responses: Array<string | undefined> = [];
      const promise = createIterablePromise<string | undefined>({
        func: (previousResponse) => {
          return new Promise((resolve) => {
            resolve(previousResponse === undefined ? 'yes' : 'no');
          });
        },
        validate: () => responses.length === 3,
        aggregator: (response) => responses.push(response),
      });

      await expect(promise).resolves.toEqual('no');
      expect(responses).toEqual(['yes', 'no', 'no']);
    });
  });

  describe('validate', () => {
    it('iterates on a `func` until `validate` is met', async () => {
      let calls = 0;
      const promise = createIterablePromise({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve(`success #${calls}`);
          });
        },
        validate: () => calls >= 3,
      });

      await expect(promise).resolves.toEqual('success #3');
      expect(calls).toBe(3);
    });

    it('forward the response of the `func`', async () => {
      let calls = 0;
      const promise = createIterablePromise<number>({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve(calls);
          });
        },
        validate: (response) => response >= 3,
      });

      await expect(promise).resolves.toEqual(3);
      expect(calls).toBe(3);
    });
  });

  describe('aggregator', () => {
    it('is called before iterating', async () => {
      let calls = 0;
      let count = 0;
      const promise = createIterablePromise({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve(`success #${calls}`);
          });
        },
        validate: () => calls >= 3,
        aggregator: () => (count += 3),
      });

      await expect(promise).resolves.toEqual('success #3');
      expect(calls).toBe(3);
      expect(count).toBe(3 * 3);
    });

    it('forward the response of the `func`', async () => {
      let calls = 0;
      const responses: string[] = [];
      const promise = createIterablePromise<string>({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve(`success #${calls}`);
          });
        },
        validate: () => calls >= 3,
        aggregator: (response) => {
          responses.push(response);
        },
      });

      await expect(promise).resolves.toEqual('success #3');
      expect(calls).toBe(3);
      expect(responses).toEqual(['success #1', 'success #2', 'success #3']);
    });
  });

  describe('timeout', () => {
    it('defaults to no timeout (0)', async () => {
      let calls = 0;
      const before = Date.now();
      const promise = createIterablePromise({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve(`success #${calls}`);
          });
        },
        validate: () => calls >= 2,
      });

      await expect(promise).resolves.toEqual('success #2');

      expect(Date.now() - before).toBeGreaterThanOrEqual(0);
      expect(Date.now() - before).toBeLessThanOrEqual(20);
      expect(calls).toBe(2);
    });

    it('waits before calling the `func` again', async () => {
      let calls = 0;
      const before = Date.now();
      const promise = createIterablePromise({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve(`success #${calls}`);
          });
        },
        validate: () => calls >= 2,
        timeout: () => 2000,
      });

      await expect(promise).resolves.toEqual('success #2');

      expect(Date.now() - before).toBeGreaterThanOrEqual(2000);
      expect(Date.now() - before).toBeLessThanOrEqual(2020);
      expect(calls).toBe(2);
    });
  });

  describe('error', () => {
    it('gets the rejection of the given promise via reject', async () => {
      let calls = 0;

      const promise = createIterablePromise({
        func: () => {
          return new Promise((resolve, reject) => {
            calls += 1;
            if (calls <= 3) {
              resolve('okay');
            } else {
              reject(new Error('nope'));
            }
          });
        },
        validate: () => false,
      });

      await expect(promise).rejects.toEqual(expect.objectContaining({ message: 'nope' }));
    });

    it('gets the rejection of the given promise via throw', async () => {
      let calls = 0;

      const promise = createIterablePromise({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            if (calls <= 3) {
              resolve('okay');
            } else {
              throw new Error('nope');
            }
          });
        },
        validate: () => false,
      });

      await expect(promise).rejects.toEqual(expect.objectContaining({ message: 'nope' }));
    });

    it('rejects with the given `message` when `validate` hits', async () => {
      const MAX_RETRIES = 3;
      let calls = 0;

      const promise = createIterablePromise({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve('okay');
          });
        },
        validate: () => false,
        error: {
          validate: () => calls >= MAX_RETRIES,
          message: () => `Error is thrown: ${calls}/${MAX_RETRIES}`,
        },
      });

      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          message: 'Error is thrown: 3/3',
        }),
      );
      expect(calls).toBe(MAX_RETRIES);
    });

    it('forward the response of the `func`', async () => {
      const MAX_RETRIES = 3;
      let calls = 0;

      const promise = createIterablePromise<number>({
        func: () => {
          return new Promise((resolve) => {
            calls += 1;
            resolve(calls);
          });
        },
        validate: () => false,
        error: {
          validate: (response) => response >= MAX_RETRIES,
          message: (response) => `Error is thrown: ${response}/${MAX_RETRIES}`,
        },
      });

      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          message: 'Error is thrown: 3/3',
        }),
      );
      expect(calls).toBe(MAX_RETRIES);
    });
  });
});
