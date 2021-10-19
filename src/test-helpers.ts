/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/no-extraneous-dependencies
import sinon, { SinonSpy } from 'sinon';
import { Logger } from '@slack/logger';

export interface Override {
  [packageName: string]: {
    [exportName: string]: any;
  };
}

export function mergeOverrides(...overrides: Override[]): Override {
  let currentOverrides: Override = {};
  overrides.forEach((override) => {
    currentOverrides = mergeObjProperties(currentOverrides, override);
  });
  return currentOverrides;
}

function mergeObjProperties(first: Override, second: Override): Override {
  const merged: Override = {};
  const props = Object.keys(first).concat(Object.keys(second));
  props.forEach((prop) => {
    if (second[prop] === undefined && first[prop] !== undefined) {
      merged[prop] = first[prop];
    } else if (first[prop] === undefined && second[prop] !== undefined) {
      merged[prop] = second[prop];
    } else {
      // second always overwrites the first
      merged[prop] = { ...first[prop], ...second[prop] };
    }
  });
  return merged;
}

export interface FakeLogger extends Logger {
  setLevel: SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>;
  getLevel: SinonSpy<Parameters<Logger['getLevel']>, ReturnType<Logger['getLevel']>>;
  setName: SinonSpy<Parameters<Logger['setName']>, ReturnType<Logger['setName']>>;
  debug: SinonSpy<Parameters<Logger['debug']>, ReturnType<Logger['debug']>>;
  info: SinonSpy<Parameters<Logger['info']>, ReturnType<Logger['info']>>;
  warn: SinonSpy<Parameters<Logger['warn']>, ReturnType<Logger['warn']>>;
  error: SinonSpy<Parameters<Logger['error']>, ReturnType<Logger['error']>>;
}

export function createFakeLogger(): FakeLogger {
  return {
    // NOTE: the two casts are because of a TypeScript inconsistency with tuple types and any[]. all tuple types
    // should be assignable to any[], but TypeScript doesn't think so.
    // UPDATE (Nov 2019):
    // src/test-helpers.ts:49:15 - error TS2352: Conversion of type 'SinonSpy<any[], any>' to type 'SinonSpy<[LogLevel],
    //  void>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional,
    // convert the expression to 'unknown' first.
    //   Property '0' is missing in type 'any[]' but required in type '[LogLevel]'.
    // 49     setLevel: sinon.fake() as SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>,
    //                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setLevel: sinon.fake() as unknown as SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>,
    getLevel: sinon.fake() as unknown as SinonSpy<Parameters<Logger['getLevel']>, ReturnType<Logger['getLevel']>>,
    setName: sinon.fake() as unknown as SinonSpy<Parameters<Logger['setName']>, ReturnType<Logger['setName']>>,
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
