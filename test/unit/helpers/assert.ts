import { AssertionError } from 'node:assert';
import nodeAssert from 'node:assert/strict';
import sinon from 'sinon';

type AssertFn = ((value: unknown, message?: string) => asserts value) & {
  ok: typeof nodeAssert.ok;
  fail: typeof nodeAssert.fail;
  equal: typeof nodeAssert.equal;
  notEqual: typeof nodeAssert.notEqual;
  strictEqual: typeof nodeAssert.strictEqual;
  deepEqual: typeof nodeAssert.deepEqual;
  deepStrictEqual: typeof nodeAssert.deepStrictEqual;
  throws: typeof nodeAssert.throws;
  exists(value: unknown, message?: string): void;
  notExists(value: unknown, message?: string): void;
  isDefined(value: unknown, message?: string): void;
  isUndefined(value: unknown, message?: string): void;
  isTrue(value: unknown, message?: string): void;
  isFalse(value: unknown, message?: string): void;
  isOk(value: unknown, message?: string): void;
  isNotNull(value: unknown, message?: string): void;
  isArray(value: unknown, message?: string): void;
  isFunction(value: unknown, message?: string): void;
  isAtLeast(value: number, min: number, message?: string): void;
  isEmpty(value: unknown, message?: string): void;
  lengthOf(value: { length: number }, expected: number, message?: string): void;
  typeOf(value: unknown, expected: string, message?: string): void;
  instanceOf(value: unknown, ctor: new (...args: any[]) => any, message?: string): void;
  notInstanceOf(value: unknown, ctor: new (...args: any[]) => any, message?: string): void;
  property(object: object, prop: PropertyKey, message?: string): void;
  notProperty(object: object, prop: PropertyKey, message?: string): void;
  propertyVal(object: unknown, prop: PropertyKey, expected: unknown, message?: string): void;
  sameMembers(actual: unknown[], expected: unknown[], message?: string): void;
  called(spy: sinon.SinonSpy, message?: string): void;
  notCalled(spy: sinon.SinonSpy, message?: string): void;
  calledOnce(spy: sinon.SinonSpy, message?: string): void;
  calledTwice(spy: sinon.SinonSpy, message?: string): void;
  calledThrice(spy: sinon.SinonSpy, message?: string): void;
  callCount(spy: sinon.SinonSpy, count: number, message?: string): void;
  calledWith(spy: sinon.SinonSpy, ...args: unknown[]): void;
  calledWithMatch(spy: sinon.SinonSpy, ...args: unknown[]): void;
  calledOnceWithExactly(spy: sinon.SinonSpy, ...args: unknown[]): void;
  neverCalledWith(spy: sinon.SinonSpy, ...args: unknown[]): void;
};

const assert: AssertFn = Object.assign(
  (value: unknown, message?: string): asserts value => nodeAssert.ok(value, message),
  {
    ok: nodeAssert.ok,
    fail: nodeAssert.fail,
    equal: nodeAssert.equal,
    notEqual: nodeAssert.notEqual,
    strictEqual: nodeAssert.strictEqual,
    deepEqual: nodeAssert.deepEqual,
    deepStrictEqual: nodeAssert.deepStrictEqual,
    throws: nodeAssert.throws,

    exists(value: unknown, message?: string): void {
      nodeAssert.notEqual(value, null, message);
    },
    notExists(value: unknown, message?: string): void {
      nodeAssert.equal(value, null, message);
    },
    isDefined(value: unknown, message?: string): void {
      nodeAssert.notStrictEqual(value, undefined, message);
    },
    isUndefined(value: unknown, message?: string): void {
      nodeAssert.strictEqual(value, undefined, message);
    },
    isTrue(value: unknown, message?: string): void {
      nodeAssert.strictEqual(value, true, message);
    },
    isFalse(value: unknown, message?: string): void {
      nodeAssert.strictEqual(value, false, message);
    },
    isOk(value: unknown, message?: string): void {
      nodeAssert.ok(value, message);
    },
    isNotNull(value: unknown, message?: string): void {
      nodeAssert.notStrictEqual(value, null, message);
    },
    isArray(value: unknown, message?: string): void {
      nodeAssert.ok(Array.isArray(value), message ?? 'expected value to be an array');
    },
    isFunction(value: unknown, message?: string): void {
      nodeAssert.strictEqual(typeof value, 'function', message);
    },
    isAtLeast(value: number, min: number, message?: string): void {
      nodeAssert.ok(value >= min, message ?? `expected ${value} to be at least ${min}`);
    },
    isEmpty(value: unknown, message?: string): void {
      if (Array.isArray(value) || typeof value === 'string') {
        nodeAssert.strictEqual(value.length, 0, message);
        return;
      }
      if (value && typeof value === 'object') {
        nodeAssert.strictEqual(Object.keys(value).length, 0, message);
        return;
      }
      nodeAssert.fail(message ?? 'expected value to be empty');
    },
    lengthOf(value: { length: number }, expected: number, message?: string): void {
      nodeAssert.strictEqual(value.length, expected, message);
    },
    typeOf(value: unknown, expected: string, message?: string): void {
      nodeAssert.strictEqual(typeof value, expected, message);
    },
    instanceOf(value: unknown, ctor: new (...args: any[]) => any, message?: string): void {
      nodeAssert.ok(value instanceof ctor, message);
    },
    notInstanceOf(value: unknown, ctor: new (...args: any[]) => any, message?: string): void {
      nodeAssert.ok(!(value instanceof ctor), message);
    },
    property(object: object, prop: PropertyKey, message?: string): void {
      nodeAssert.ok(prop in object, message);
    },
    notProperty(object: object, prop: PropertyKey, message?: string): void {
      nodeAssert.ok(!(prop in object), message);
    },
    propertyVal(object: unknown, prop: PropertyKey, expected: unknown, message?: string): void {
      nodeAssert.ok(object && typeof object === 'object', message ?? 'expected value to be an object');
      nodeAssert.ok(prop in object, message);
      nodeAssert.deepStrictEqual((object as Record<PropertyKey, unknown>)[prop], expected, message);
    },
    sameMembers(actual: unknown[], expected: unknown[], message?: string): void {
      const normalize = (arr: unknown[]) => [...arr].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      nodeAssert.deepStrictEqual(normalize(actual), normalize(expected), message);
    },

    called(spy: sinon.SinonSpy): void {
      sinon.assert.called(spy);
    },
    notCalled(spy: sinon.SinonSpy): void {
      sinon.assert.notCalled(spy);
    },
    calledOnce(spy: sinon.SinonSpy): void {
      sinon.assert.calledOnce(spy);
    },
    calledTwice(spy: sinon.SinonSpy): void {
      sinon.assert.calledTwice(spy);
    },
    calledThrice(spy: sinon.SinonSpy): void {
      sinon.assert.calledThrice(spy);
    },
    callCount(spy: sinon.SinonSpy, count: number): void {
      sinon.assert.callCount(spy, count);
    },
    calledWith(spy: sinon.SinonSpy, ...args: unknown[]): void {
      sinon.assert.calledWith(spy, ...args);
    },
    calledWithMatch(spy: sinon.SinonSpy, ...args: unknown[]): void {
      sinon.assert.calledWithMatch(spy, ...args);
    },
    calledOnceWithExactly(spy: sinon.SinonSpy, ...args: unknown[]): void {
      sinon.assert.calledOnceWithExactly(spy, ...args);
    },
    neverCalledWith(spy: sinon.SinonSpy, ...args: unknown[]): void {
      sinon.assert.neverCalledWith(spy, ...args);
    },
  },
) as AssertFn;

export { assert, AssertionError };
