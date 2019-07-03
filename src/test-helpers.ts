import * as sinon from 'sinon';
import { Logger } from '@slack/logger';

export interface Override {
  [packageName: string]: {
    [exportName: string]: any;
  };
}

export function mergeOverrides(...overrides: Override[]): Override {
  let currentOverrides: Override = {};
  for (const override of overrides) {
    currentOverrides = mergeObjProperties(currentOverrides, override);
  }
  return currentOverrides;
}

function mergeObjProperties(first: Override, second: Override): Override {
  const merged: Override = {};
  const props = Object.keys(first).concat(Object.keys(second));
  for (const prop of props) {
    if (second[prop] === undefined && first[prop] !== undefined) {
      merged[prop] = first[prop];
    } else if (first[prop] === undefined && second[prop] !== undefined) {
      merged[prop] = second[prop];
    } else {
      // second always overwrites the first
      merged[prop] = { ...first[prop], ...second[prop] };
    }
  }
  return merged;
}

export interface FakeLogger extends Logger {
  setLevel: sinon.SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>;
  getLevel: sinon.SinonSpy<Parameters<Logger['getLevel']>, ReturnType<Logger['getLevel']>>;
  setName: sinon.SinonSpy<Parameters<Logger['setName']>, ReturnType<Logger['setName']>>;
  debug: sinon.SinonSpy<Parameters<Logger['debug']>, ReturnType<Logger['debug']>>;
  info: sinon.SinonSpy<Parameters<Logger['info']>, ReturnType<Logger['info']>>;
  warn: sinon.SinonSpy<Parameters<Logger['warn']>, ReturnType<Logger['warn']>>;
  error: sinon.SinonSpy<Parameters<Logger['error']>, ReturnType<Logger['error']>>;
}

export function createFakeLogger(): FakeLogger {
  return {
    /* eslint-disable max-len */
    // NOTE: the two casts are because of a TypeScript inconsistency with tuple types and any[]. all tuple types
    // should be assignable to any[], but TypeScript doesn't think so.
    // UPDATE (Nov 2019):
    // src/test-helpers.ts:49:15 - error TS2352: Conversion of type 'sinon.SinonSpy<any[], any>' to type 'sinon.SinonSpy<[LogLevel],
    //  void>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional,
    // convert the expression to 'unknown' first.
    //   Property '0' is missing in type 'any[]' but required in type '[LogLevel]'.
    // 49     setLevel: sinon.fake() as sinon.SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>,
    //                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /* eslint-enable max-len */
    setLevel: sinon.fake() as unknown as sinon.SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>,
    getLevel: sinon.fake() as unknown as sinon.SinonSpy<Parameters<Logger['getLevel']>, ReturnType<Logger['getLevel']>>,
    setName: sinon.fake() as unknown as sinon.SinonSpy<Parameters<Logger['setName']>, ReturnType<Logger['setName']>>,
    debug: sinon.fake(),
    info: sinon.fake(),
    warn: sinon.fake(),
    error: sinon.fake(),
  };
}

export function delay(ms: number = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type AsyncFunction = (...args: any[]) => Promise<void>;

export function wrapToResolveOnFirstCall<T extends AsyncFunction>(
  original: T,
  timeoutMs: number = 1000,
): { fn: (...args: Parameters<T>) => Promise<void>; promise: Promise<void> } {
  let firstCallResolve: (value?: void | PromiseLike<void>) => void = () => { };
  let firstCallReject: (reason?: any) => void = () => { };

  const firstCallPromise: Promise<void> = new Promise((resolve, reject) => {
    firstCallResolve = resolve;
    firstCallReject = reject;
  });

  const wrapped = async function wrapped(this: ThisParameterType<T>, ...args: Parameters<T>): Promise<void> {
    try {
      await original.call(this, ...args);
      firstCallResolve();
    } catch (error) {
      firstCallReject(error);
    }
  };

  setTimeout(
    () => {
      firstCallReject(new Error('First call to function took longer than expected'));
    },
    timeoutMs,
  );

  return {
    promise: firstCallPromise,
    fn: wrapped,
  };
}
