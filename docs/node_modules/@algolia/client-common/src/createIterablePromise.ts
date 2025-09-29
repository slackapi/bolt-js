import type { CreateIterablePromise } from './types/createIterablePromise';

/**
 * Helper: Returns the promise of a given `func` to iterate on, based on a given `validate` condition.
 *
 * @param createIterator - The createIterator options.
 * @param createIterator.func - The function to run, which returns a promise.
 * @param createIterator.validate - The validator function. It receives the resolved return of `func`.
 * @param createIterator.aggregator - The function that runs right after the `func` method has been executed, allows you to do anything with the response before `validate`.
 * @param createIterator.error - The `validate` condition to throw an error, and its message.
 * @param createIterator.timeout - The function to decide how long to wait between iterations.
 */
export function createIterablePromise<TResponse>({
  func,
  validate,
  aggregator,
  error,
  timeout = (): number => 0,
}: CreateIterablePromise<TResponse>): Promise<TResponse> {
  const retry = (previousResponse?: TResponse): Promise<TResponse> => {
    return new Promise<TResponse>((resolve, reject) => {
      func(previousResponse)
        .then((response) => {
          if (aggregator) {
            aggregator(response);
          }

          if (validate(response)) {
            return resolve(response);
          }

          if (error && error.validate(response)) {
            return reject(new Error(error.message(response)));
          }

          return setTimeout(() => {
            retry(response).then(resolve).catch(reject);
          }, timeout());
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  return retry();
}
