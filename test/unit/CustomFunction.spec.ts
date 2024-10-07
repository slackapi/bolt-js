import { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { CustomFunction, type SlackCustomFunctionMiddlewareArgs } from '../../src/CustomFunction';
import { CustomFunctionInitializationError } from '../../src/errors';
import type { AllMiddlewareArgs, Middleware } from '../../src/types';
import { type Override, createFakeLogger } from './helpers';

type AllCustomFunctionMiddlewareArgs<T extends SlackCustomFunctionMiddlewareArgs = SlackCustomFunctionMiddlewareArgs> =
  T & AllMiddlewareArgs;

type CustomFunctionMiddleware = Middleware<SlackCustomFunctionMiddlewareArgs>[];

async function importCustomFunction(overrides: Override = {}): Promise<typeof import('../../src//CustomFunction')> {
  return rewiremock.module(() => import('../../src/CustomFunction'), overrides);
}

const MOCK_FN = async () => {};
const MOCK_FN_2 = async () => {};

const MOCK_MIDDLEWARE_SINGLE = [MOCK_FN];
const MOCK_MIDDLEWARE_MULTIPLE = [MOCK_FN, MOCK_FN_2];

describe('CustomFunction class', () => {
  describe('constructor', () => {
    it('should accept single function as middleware', async () => {
      const fn = new CustomFunction('test_callback_id', MOCK_MIDDLEWARE_SINGLE, { autoAcknowledge: true });
      assert.isNotNull(fn);
    });

    it('should accept multiple functions as middleware', async () => {
      const fn = new CustomFunction('test_callback_id', MOCK_MIDDLEWARE_MULTIPLE, { autoAcknowledge: true });
      assert.isNotNull(fn);
    });
  });

  describe('getListeners', () => {
    // it('should not call next if a function_executed event', async () => {
    //   const cbId = 'test_executed_callback_id';
    //   const fn = new CustomFunction(cbId, MOCK_MIDDLEWARE_SINGLE, { autoAcknowledge: true });
    //   const listeners = fn.getListeners();
    //   const fakeEditArgs = createFakeFunctionExecutedEvent(cbId);
    //   const fakeNext = sinon.spy();
    //   fakeEditArgs.next = fakeNext;
    //   await listeners(fakeEditArgs);
    //   assert(fakeNext.notCalled, 'next called!');
    // });
    // it('should call next if valid custom function but mismatched callback_id', async () => {
    //   const fn = new CustomFunction('bad_executed_callback_id', MOCK_MIDDLEWARE_SINGLE, { autoAcknowledge: true });
    //   const middleware = fn.getMiddleware();
    //   const fakeEditArgs = createFakeFunctionExecutedEvent();
    //   const fakeNext = sinon.spy();
    //   fakeEditArgs.next = fakeNext;
    //   await middleware(fakeEditArgs);
    //   assert(fakeNext.called);
    // });
    // it('should call next if not a function executed event', async () => {
    //   const fn = new CustomFunction('test_view_callback_id', MOCK_MIDDLEWARE_SINGLE, { autoAcknowledge: true });
    //   const middleware = fn.getMiddleware();
    //   const fakeViewArgs = createFakeViewEvent() as unknown as SlackCustomFunctionMiddlewareArgs & AllMiddlewareArgs;
    //   const fakeNext = sinon.spy();
    //   fakeViewArgs.next = fakeNext;
    //   await middleware(fakeViewArgs);
    //   assert(fakeNext.called);
    // });
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
      const badMiddleware = [async () => {}, 'not-a-function'] as unknown as CustomFunctionMiddleware;

      const validationFn = () => validate('callback_id', badMiddleware);
      const expectedMsg = 'All CustomFunction middleware must be functions';
      assert.throws(validationFn, CustomFunctionInitializationError, expectedMsg);
    });
  });

  describe('isFunctionEvent', () => {
    // it('should return true if recognized function_executed payload type', async () => {
    //   const fakeExecuteArgs = createFakeFunctionExecutedEvent();
    //   const { isFunctionEvent } = await importCustomFunction();
    //   const eventIsFunctionExcuted = isFunctionEvent(fakeExecuteArgs);
    //   assert.isTrue(eventIsFunctionExcuted);
    // });
    // it('should return false if not a function_executed payload type', async () => {
    //   const fakeExecutedEvent = createFakeFunctionExecutedEvent();
    //   // @ts-expect-error expected invalid payload type
    //   fakeExecutedEvent.payload.type = 'invalid_type';
    //   const { isFunctionEvent } = await importCustomFunction();
    //   const eventIsFunctionExecuted = isFunctionEvent(fakeExecutedEvent);
    //   assert.isFalse(eventIsFunctionExecuted);
    // });
  });

  // describe('custom function utility functions', () => {
  //   describe('`complete` factory function', () => {
  //     it('complete should call functions.completeSuccess', async () => {
  //       const client = new WebClient('sometoken');
  //       const completeMock = sinon.stub(client.functions, 'completeSuccess').resolves();
  //       const complete = CustomFunction.createFunctionComplete(
  //         { isEnterpriseInstall: false, functionExecutionId: 'Fx1234' },
  //         client,
  //       );
  //       await complete();
  //       assert(completeMock.called, 'client.functions.completeSuccess not called!');
  //     });
  //     it('should throw if no functionExecutionId present on context', () => {
  //       const client = new WebClient('sometoken');
  //       assert.throws(() => {
  //         CustomFunction.createFunctionComplete({ isEnterpriseInstall: false }, client);
  //       });
  //     });
  //   });

  //   describe('`fail` factory function', () => {
  //     it('fail should call functions.completeError', async () => {
  //       const client = new WebClient('sometoken');
  //       const completeMock = sinon.stub(client.functions, 'completeError').resolves();
  //       const complete = CustomFunction.createFunctionFail(
  //         { isEnterpriseInstall: false, functionExecutionId: 'Fx1234' },
  //         client,
  //       );
  //       await complete({ error: 'boom' });
  //       assert(completeMock.called, 'client.functions.completeError not called!');
  //     });
  //     it('should throw if no functionExecutionId present on context', () => {
  //       const client = new WebClient('sometoken');
  //       assert.throws(() => {
  //         CustomFunction.createFunctionFail({ isEnterpriseInstall: false }, client);
  //       });
  //     });
  //   });

  // it('inputs should map to function payload inputs', async () => {
  //   const fakeExecuteArgs = createFakeFunctionExecutedEvent();

  //   const { enrichFunctionArgs } = await importCustomFunction();
  //   const enrichedArgs = enrichFunctionArgs(fakeExecuteArgs, {});

  //   assert.isTrue(enrichedArgs.inputs === fakeExecuteArgs.event.inputs);
  // });
  // });

  // describe('processFunctionMiddleware', () => {
  //   it('should call each callback in user-provided middleware', async () => {
  //     const { ...fakeArgs } = createFakeFunctionExecutedEvent();
  //     const { processFunctionMiddleware } = await importCustomFunction();

  //     const fn1 = sinon.spy((async ({ next: continuation }) => {
  //       await continuation();
  //     }) as Middleware<CustomFunctionExecuteMiddlewareArgs>);
  //     const fn2 = sinon.spy(async () => {});
  //     const fakeMiddleware = [fn1, fn2] as CustomFunctionMiddleware;

  //     await processFunctionMiddleware(fakeArgs, fakeMiddleware);

  //     assert(fn1.called, 'first user-provided middleware not called!');
  //     assert(fn2.called, 'second user-provided middleware not called!');
  //   });
  // });
});

function createFakeFunctionExecutedEvent(callbackId?: string): AllCustomFunctionMiddlewareArgs {
  const func = {
    type: 'function',
    id: 'somefunc',
    callback_id: callbackId || 'callback_id',
    title: 'My dope function',
    input_parameters: [],
    output_parameters: [],
    app_id: 'A1234',
    date_created: 123456,
    date_deleted: 0,
    date_updated: 123456,
  };
  const base = {
    bot_access_token: 'xoxb-abcd-1234',
    event_ts: '123456.789',
    function_execution_id: 'Fx1234',
    workflow_execution_id: 'Wf1234',
    type: 'function_executed',
  } as const;
  const inputs = { message: 'test123', recipient: 'U012345' };
  const event = {
    function: func,
    inputs,
    ...base,
  } as const;
  return {
    ack: () => Promise.resolve(),
    body: {
      api_app_id: 'A1234',
      event,
      event_id: 'E1234',
      event_time: 123456,
      team_id: 'T1234',
      token: 'xoxb-1234',
      type: 'event_callback',
    },
    client: new WebClient('faketoken'),
    complete: () => Promise.resolve({ ok: true }),
    context: {
      functionBotAccessToken: 'xwfp-123',
      functionExecutionId: 'test_executed_callback_id',
      isEnterpriseInstall: false,
    },
    event,
    fail: () => Promise.resolve({ ok: true }),
    inputs,
    logger: createFakeLogger(),
    next: () => Promise.resolve(),
    payload: {
      function: func,
      inputs: { message: 'test123', recipient: 'U012345' },
      ...base,
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
