import { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import {
  CustomFunction,
  type SlackCustomFunctionMiddlewareArgs,
  createFunctionComplete,
  createFunctionFail,
  isSlackCustomFunctionMiddlewareArgsOptions,
  matchFunction,
  validate,
} from '../../src/CustomFunction';
import { CustomFunctionInitializationError } from '../../src/errors';
import { autoAcknowledge, matchEventType, onlyEvents } from '../../src/middleware/builtin';
import type { Middleware } from '../../src/types';

const MOCK_FN = async () => {};
const MOCK_FN_2 = async () => {};

const MOCK_MIDDLEWARE_SINGLE = [MOCK_FN];
const MOCK_MIDDLEWARE_MULTIPLE = [MOCK_FN, MOCK_FN_2];

describe('CustomFunction', () => {
  describe('constructor', () => {
    it('should accept single function as middleware', async () => {
      const fn = new CustomFunction('test_callback_id', MOCK_MIDDLEWARE_SINGLE, { autoAcknowledge: true });
      assert.isNotNull(fn);
    });

    it('should accept multiple functions as middleware', async () => {
      const fn = new CustomFunction('test_callback_id', MOCK_MIDDLEWARE_MULTIPLE, { autoAcknowledge: true });
      assert.isNotNull(fn);
    });

    it('should accept a variety of options', async () => {
      const fn = new CustomFunction('test_callback_id', MOCK_MIDDLEWARE_MULTIPLE, { autoAcknowledge: false });
      assert.isNotNull(fn);
    });
  });

  describe('getListeners', () => {
    it('should return a properly ordered array of listeners', async () => {
      const cbId = 'test_executed_callback_id';
      const fn = new CustomFunction(cbId, MOCK_MIDDLEWARE_SINGLE, { autoAcknowledge: true });
      const listeners = fn.getListeners();
      assert.equal(listeners[0], onlyEvents);
      assert.equal(listeners[1].toString(), matchEventType('function_executed').toString());
      assert.equal(listeners[2].toString(), matchFunction(cbId).toString());
      assert.equal(listeners[3], autoAcknowledge);
      assert.equal(listeners[4], MOCK_FN);
    });

    it('should return a properly ordered array of listeners when auto acknowledge is disabled', async () => {
      const cbId = 'test_executed_callback_id';
      const fn = new CustomFunction(cbId, MOCK_MIDDLEWARE_SINGLE, { autoAcknowledge: false });
      const listeners = fn.getListeners();
      assert.equal(listeners[0], onlyEvents);
      assert.equal(listeners[1].toString(), matchEventType('function_executed').toString());
      assert.equal(listeners[2].toString(), matchFunction(cbId).toString());
      assert.equal(listeners[3], MOCK_FN);
    });
  });

  describe('validate', () => {
    it('should throw an error if callback_id is not valid', async () => {
      // intentionally casting to string to trigger failure
      const badId = {} as string;
      const validationFn = () => validate(badId, MOCK_MIDDLEWARE_SINGLE);

      const expectedMsg = 'CustomFunction expects a callback_id as the first argument';
      assert.throws(validationFn, CustomFunctionInitializationError, expectedMsg);
    });

    it('should throw an error if middleware is not a function or array', async () => {
      // intentionally casting to Middleware<SlackCustomFunctionMiddlewareArgs>[] to trigger failure
      const badConfig = '' as unknown as Middleware<SlackCustomFunctionMiddlewareArgs>[];

      const validationFn = () => validate('callback_id', badConfig);
      const expectedMsg = 'CustomFunction expects a function or array of functions as the second argument';
      assert.throws(validationFn, CustomFunctionInitializationError, expectedMsg);
    });

    it('should throw an error if middleware is not a single callback or an array of callbacks', async () => {
      // intentionally casting to Middleware<SlackCustomFunctionMiddlewareArgs>[] to trigger failure
      const badMiddleware = [
        async () => {},
        'not-a-function',
      ] as unknown as Middleware<SlackCustomFunctionMiddlewareArgs>[];

      const validationFn = () => validate('callback_id', badMiddleware);
      const expectedMsg = 'All CustomFunction middleware must be functions';
      assert.throws(validationFn, CustomFunctionInitializationError, expectedMsg);
    });
  });

  describe(isSlackCustomFunctionMiddlewareArgsOptions.name, () => {
    it('should return true if object is SlackCustomFunctionMiddlewareArgsOptions', async () => {
      const actual = isSlackCustomFunctionMiddlewareArgsOptions({ autoAcknowledge: true });
      assert.isTrue(actual);
    });

    it('should return false if object is Middleware', async () => {
      const actual = isSlackCustomFunctionMiddlewareArgsOptions(async () => {});
      assert.isFalse(actual);
    });
  });

  describe('custom function utility functions', () => {
    describe('`complete` factory function', () => {
      it('complete should call functions.completeSuccess', async () => {
        const client = new WebClient('sometoken');
        const completeMock = sinon.stub(client.functions, 'completeSuccess').resolves();
        const complete = createFunctionComplete({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);
        await complete();
        assert(completeMock.called, 'client.functions.completeSuccess not called!');
      });
      it('should throw if no functionExecutionId present on context', () => {
        const client = new WebClient('sometoken');
        assert.throws(() => {
          createFunctionComplete({ isEnterpriseInstall: false }, client);
        });
      });
    });

    describe('`fail` factory function', () => {
      it('fail should call functions.completeError', async () => {
        const client = new WebClient('sometoken');
        const completeMock = sinon.stub(client.functions, 'completeError').resolves();
        const complete = createFunctionFail({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);
        await complete({ error: 'boom' });
        assert(completeMock.called, 'client.functions.completeError not called!');
      });
      it('should throw if no functionExecutionId present on context', () => {
        const client = new WebClient('sometoken');
        assert.throws(() => {
          createFunctionFail({ isEnterpriseInstall: false }, client);
        });
      });
    });
  });
});
