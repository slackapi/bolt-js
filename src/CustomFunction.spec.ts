import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import rewiremock from 'rewiremock';
import {
  CustomFunction,
  SlackCustomFunctionMiddlewareArgs,
  AllCustomFunctionMiddlewareArgs,
  CustomFunctionMiddleware,
  CustomFunctionExecuteMiddlewareArgs,
} from './CustomFunction';
import { Override } from './test-helpers';
import { AllMiddlewareArgs, AnyMiddlewareArgs, Middleware } from './types';
import { CustomFunctionInitializationError } from './errors';

async function importCustomFunction(overrides: Override = {}): Promise<typeof import('./CustomFunction')> {
  return rewiremock.module(() => import('./CustomFunction'), overrides);
}

const MOCK_FN = async () => {};
const MOCK_FN_2 = async () => {};

const MOCK_MIDDLEWARE_SINGLE = [MOCK_FN];
const MOCK_MIDDLEWARE_MULTIPLE = [MOCK_FN, MOCK_FN_2];

describe('CustomFunction class', () => {
  describe('constructor', () => {
    it('should accept single function as middleware', async () => {
      const fn = new CustomFunction('test_callback_id', MOCK_MIDDLEWARE_SINGLE);
      assert.isNotNull(fn);
    });

    it('should accept multiple functions as middleware', async () => {
      const fn = new CustomFunction('test_callback_id', MOCK_MIDDLEWARE_MULTIPLE);
      assert.isNotNull(fn);
    });
  });

  describe('getMiddleware', () => {
    it('should not call next if a function_executed event', async () => {
      const fn = new CustomFunction('test_executed_callback_id', MOCK_MIDDLEWARE_SINGLE);
      const middleware = fn.getMiddleware();
      const fakeEditArgs = createFakeFunctionExecutedEvent() as unknown as
        SlackCustomFunctionMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeEditArgs.next = fakeNext;

      await middleware(fakeEditArgs);

      assert(fakeNext.notCalled);
    });

    it('should call next if valid custom function but mismatched callback_id', async () => {
      const fn = new CustomFunction('bad_executed_callback_id', MOCK_MIDDLEWARE_SINGLE);
      const middleware = fn.getMiddleware();
      const fakeEditArgs = createFakeFunctionExecutedEvent() as unknown as
        SlackCustomFunctionMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeEditArgs.next = fakeNext;

      await middleware(fakeEditArgs);

      assert(fakeNext.called);
    });

    it('should call next if not a function executed event', async () => {
      const fn = new CustomFunction('test_view_callback_id', MOCK_MIDDLEWARE_SINGLE);
      const middleware = fn.getMiddleware();
      const fakeViewArgs = createFakeViewEvent() as unknown as
        SlackCustomFunctionMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeViewArgs.next = fakeNext;

      await middleware(fakeViewArgs);

      assert(fakeNext.called);
    });
  });

  describe('validate', () => {
    it('should throw an error if callback_id is not valid', async () => {
      const { validate } = await importCustomFunction();

      // intentionally casting to string to trigger failure
      const badId = {} as string;
      const validationFn = () => validate(badId, MOCK_MIDDLEWARE_SINGLE);

      const expectedMsg = 'CustomFunction expects a callback_id as the first argument';
      assert.throws(validationFn, CustomFunctionInitializationError, expectedMsg);
    });

    it('should throw an error if middleware is not a function or array', async () => {
      const { validate } = await importCustomFunction();

      // intentionally casting to CustomFunctionMiddleware to trigger failure
      const badConfig = '' as unknown as CustomFunctionMiddleware;

      const validationFn = () => validate('callback_id', badConfig);
      const expectedMsg = 'CustomFunction expects a function or array of functions as the second argument';
      assert.throws(validationFn, CustomFunctionInitializationError, expectedMsg);
    });

    it('should throw an error if middleware is not a single callback or an array of callbacks', async () => {
      const { validate } = await importCustomFunction();

      // intentionally casting to CustomFunctionMiddleware to trigger failure
      const badMiddleware = [
        async () => {},
        'not-a-function',
      ] as unknown as CustomFunctionMiddleware;

      const validationFn = () => validate('callback_id', badMiddleware);
      const expectedMsg = 'All CustomFunction middleware must be functions';
      assert.throws(validationFn, CustomFunctionInitializationError, expectedMsg);
    });
  });

  describe('isFunctionEvent', () => {
    it('should return true if recognized function_executed payload type', async () => {
      const fakeExecuteArgs = createFakeFunctionExecutedEvent() as unknown as SlackCustomFunctionMiddlewareArgs
      & AllMiddlewareArgs;

      const { isFunctionEvent } = await importCustomFunction();
      const eventIsFunctionExcuted = isFunctionEvent(fakeExecuteArgs);

      assert.isTrue(eventIsFunctionExcuted);
    });

    it('should return false if not a function_executed payload type', async () => {
      const fakeExecutedEvent = createFakeFunctionExecutedEvent() as unknown as AnyMiddlewareArgs;
      fakeExecutedEvent.payload.type = 'invalid_type';

      const { isFunctionEvent } = await importCustomFunction();
      const eventIsFunctionExecuted = isFunctionEvent(fakeExecutedEvent);

      assert.isFalse(eventIsFunctionExecuted);
    });
  });

  describe('enrichFunctionArgs', () => {
    it('should remove next() from all original event args', async () => {
      const fakeExecutedEvent = createFakeFunctionExecutedEvent() as unknown as AnyMiddlewareArgs;

      const { enrichFunctionArgs } = await importCustomFunction();
      const executeFunctionArgs = enrichFunctionArgs(fakeExecutedEvent);

      assert.notExists(executeFunctionArgs.next);
    });

    it('should augment function_executed args with inputs, complete, and fail', async () => {
      const fakeArgs = createFakeFunctionExecutedEvent();

      const { enrichFunctionArgs } = await importCustomFunction();
      const functionArgs = enrichFunctionArgs(fakeArgs);

      assert.exists(functionArgs.inputs);
      assert.exists(functionArgs.complete);
      assert.exists(functionArgs.fail);
    });
  });

  describe('custom function utility functions', () => {
    it('complete should call functions.completeSuccess', async () => {
      // TODO
    });

    it('fail should call functions.completeError', async () => {
      // TODO
    });

    it('inputs should map to function payload inputs', async () => {
      const fakeExecuteArgs = createFakeFunctionExecutedEvent() as unknown as AllCustomFunctionMiddlewareArgs;

      const { enrichFunctionArgs } = await importCustomFunction();
      const enrichedArgs = enrichFunctionArgs(fakeExecuteArgs);

      assert.isTrue(enrichedArgs.inputs === fakeExecuteArgs.event.inputs);
    });
  });

  describe('processFunctionMiddleware', () => {
    it('should call each callback in user-provided middleware', async () => {
      const { ...fakeArgs } = createFakeFunctionExecutedEvent() as unknown as AllCustomFunctionMiddlewareArgs;
      const { processFunctionMiddleware } = await importCustomFunction();

      const fn1 = sinon.spy((async ({ next: continuation }) => {
        await continuation();
      }) as Middleware<CustomFunctionExecuteMiddlewareArgs>);
      const fn2 = sinon.spy(async () => {});
      const fakeMiddleware = [fn1, fn2] as CustomFunctionMiddleware;

      await processFunctionMiddleware(fakeArgs, fakeMiddleware);

      assert(fn1.called);
      assert(fn2.called);
    });
  });
});

function createFakeFunctionExecutedEvent() {
  return {
    event: {
      inputs: { message: 'test123', recipient: 'U012345' },
    },
    payload: {
      type: 'function_executed',
      function: {
        callback_id: 'test_executed_callback_id',
      },
      inputs: { message: 'test123', recipient: 'U012345' },
      bot_access_token: 'xwfp-123',
    },
    context: {
      functionBotAccessToken: 'xwfp-123',
      functionExecutionId: 'test_executed_callback_id',
    },
  };
}

function createFakeViewEvent() {
  return {
    body: {
      callback_id: 'test_view_callback_id',
      trigger_id: 'test_view_trigger_id',
      workflow_step: {
        workflow_step_edit_id: '',
      },
    },
    payload: {
      type: 'view_submission',
      callback_id: 'test_view_callback_id',
    },
    context: {},
  };
}
