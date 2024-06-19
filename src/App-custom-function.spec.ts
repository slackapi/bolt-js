import 'mocha';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { SinonSpy } from 'sinon';
import { FunctionsCompleteErrorResponse, FunctionsCompleteSuccessResponse, WebClientOptions } from '@slack/web-api';
import App from './App';
import { Override, mergeOverrides } from './test-helpers';
import { FunctionInputs, Receiver, ReceiverEvent } from './types';

class FakeReceiver implements Receiver {
  private bolt: App | undefined;

  public init = (bolt: App) => {
    this.bolt = bolt;
  };

  public start = sinon.fake((...params: any[]): Promise<unknown> => Promise.resolve([...params]));

  public stop = sinon.fake((...params: any[]): Promise<unknown> => Promise.resolve([...params]));

  public async sendEvent(event: ReceiverEvent): Promise<void> {
    return this.bolt?.processEvent(event);
  }
}

const MOCK_BLOCK_ACTION_ID = 'block_action_id';
const MOCK_BOT_TOKEN = 'xoxb-example-001';
const MOCK_BOT_ID = 'B0123456789';
const MOCK_FUNCTION_BOT_ACCESS_TOKEN = 'xwfp-example-001';
const MOCK_FUNCTION_CALLBACK_ID = 'mock_function_callback_id';
const MOCK_FUNCTION_EXECUTION_ID = 'Ft0123456789';
const MOCK_FUNCTION_INPUT: FunctionInputs = { message: 'hello world' };
const MOCK_TEAM_ID = 'T0123456789';
const MOCK_USER_ID = 'U0123456789';

describe('App CustomFunction middleware', () => {
  const fakeReceiver: FakeReceiver = new FakeReceiver();
  const dummyAuthorizationResult = {
    botToken: MOCK_BOT_TOKEN,
    botId: MOCK_BOT_ID,
    teamId: MOCK_TEAM_ID,
  };

  let MockApp: typeof App;
  let fakeFunctionsSuccess: SinonSpy;
  let fakeFunctionsError: SinonSpy;

  beforeEach(async () => {
    fakeFunctionsSuccess = sinon.fake.resolves({ ok: true });
    fakeFunctionsError = sinon.fake.resolves({ ok: true });

    const overrides = mergeOverrides(...[
      withFunctionsComplete(fakeFunctionsSuccess, fakeFunctionsError),
      withNoopAppMetadata(),
    ]);
    MockApp = await importApp(overrides);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('completes a function with success using values from the execution event', async () => {
    const dummyFunctionExecutionEvent = createFunctionExecutionEvent();
    let response: FunctionsCompleteSuccessResponse | undefined;

    const app = new MockApp({
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
      receiver: fakeReceiver,
    });

    app.function(MOCK_FUNCTION_CALLBACK_ID, async ({ client, complete, inputs }) => {
      response = await complete({ outputs: inputs });
      assert(response?.ok);
      assert.equal(client.token, MOCK_FUNCTION_BOT_ACCESS_TOKEN);
    });

    assert(fakeFunctionsError.notCalled);
    assert(fakeFunctionsSuccess.notCalled);
    await fakeReceiver.sendEvent(dummyFunctionExecutionEvent);
    assert(fakeFunctionsError.notCalled);
    assert(fakeFunctionsSuccess.calledOnce);
    assert(fakeFunctionsSuccess.calledWith({
      token: MOCK_FUNCTION_BOT_ACCESS_TOKEN,
      function_execution_id: MOCK_FUNCTION_EXECUTION_ID,
      outputs: MOCK_FUNCTION_INPUT,
    }));
  });

  it('completes a function with error after middleware using application settings', async () => {
    const dummyFunctionExecutionEvent = createFunctionExecutionEvent();
    let response: FunctionsCompleteErrorResponse | undefined;

    const app = new MockApp({
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
      receiver: fakeReceiver,
      attachFunctionToken: false,
    });

    app.function(MOCK_FUNCTION_CALLBACK_ID,
      async ({ context, next }) => {
        context.example = '12';
        await next();
      },
      async ({ client, context, fail }) => {
        response = await fail({ error: context.example });
        assert(response?.ok);
        assert.equal(client.token, MOCK_BOT_TOKEN);
      });

    assert(fakeFunctionsError.notCalled);
    assert(fakeFunctionsSuccess.notCalled);
    await fakeReceiver.sendEvent(dummyFunctionExecutionEvent);
    assert(fakeFunctionsSuccess.notCalled);
    assert(fakeFunctionsError.calledOnce);
    assert(fakeFunctionsError.calledWith({
      token: MOCK_BOT_TOKEN,
      function_execution_id: MOCK_FUNCTION_EXECUTION_ID,
      error: '12',
    }));
  });

  it('skips function handlers without a matching function callback id', async () => {
    const dummyFunctionExecutionEvent = createFunctionExecutionEvent({
      mockFunctionCallbackId: 'unexpected_callback_id',
    });

    const app = new MockApp({
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
      receiver: fakeReceiver,
    });

    app.function(MOCK_FUNCTION_CALLBACK_ID, async () => {
      assert(false);
    });

    await fakeReceiver.sendEvent(dummyFunctionExecutionEvent);
  });

  it('extracts function execution context for use in block action events', async () => {
    const dummyBlockActionEvent = createBlockActionEvent();
    let response: FunctionsCompleteSuccessResponse | undefined;

    const app = new MockApp({
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
      receiver: fakeReceiver,
    });

    app.function(MOCK_FUNCTION_CALLBACK_ID, async () => {
      assert(false);
    });

    app.action(MOCK_BLOCK_ACTION_ID, async (args) => {
      const { context, complete } = args as any;
      response = await complete();
      assert(response?.ok);
      assert.strictEqual(context.functionBotAccessToken, MOCK_FUNCTION_BOT_ACCESS_TOKEN);
      assert.strictEqual(context.functionExecutionId, MOCK_FUNCTION_EXECUTION_ID);
      assert.deepEqual(context.functionInputs, MOCK_FUNCTION_INPUT);
    });

    assert(fakeFunctionsError.notCalled);
    assert(fakeFunctionsSuccess.notCalled);
    await fakeReceiver.sendEvent(dummyBlockActionEvent);
    assert(fakeFunctionsError.notCalled);
    assert(fakeFunctionsSuccess.called);
    assert(fakeFunctionsSuccess.calledWith({
      token: MOCK_FUNCTION_BOT_ACCESS_TOKEN,
      function_execution_id: MOCK_FUNCTION_EXECUTION_ID,
      outputs: {},
    }));
  });
});

/**
 * Generators for mock function events are found below
 */

interface MockFunctionContextOverrides {
  mockFunctionBotAccessToken?: string,
  mockFunctionCallbackId?: string,
  mockFunctionExecutionId?: string,
  mockFunctionInput?: FunctionInputs,
}

function createFunctionExecutionEvent(overrides?: MockFunctionContextOverrides): ReceiverEvent {
  const defaults = {
    mockFunctionBotAccessToken: MOCK_FUNCTION_BOT_ACCESS_TOKEN,
    mockFunctionCallbackId: MOCK_FUNCTION_CALLBACK_ID,
    mockFunctionExecutionId: MOCK_FUNCTION_EXECUTION_ID,
    mockFunctionInput: MOCK_FUNCTION_INPUT,
  };
  const values = Object.assign(defaults, overrides);
  return {
    ack: () => Promise.resolve(undefined),
    body: {
      event: {
        type: 'function_executed',
        bot_access_token: values.mockFunctionBotAccessToken,
        function: {
          callback_id: values.mockFunctionCallbackId,
        },
        function_execution_id: values.mockFunctionExecutionId,
        inputs: {
          message: values.mockFunctionInput.message,
        },
      },
    },
  };
}

function createBlockActionEvent(overrides?: MockFunctionContextOverrides): ReceiverEvent {
  const defaults = {
    mockFunctionBotAccessToken: MOCK_FUNCTION_BOT_ACCESS_TOKEN,
    mockFunctionCallbackId: MOCK_FUNCTION_CALLBACK_ID,
    mockFunctionExecutionId: MOCK_FUNCTION_EXECUTION_ID,
    mockFunctionInput: MOCK_FUNCTION_INPUT,
  };
  const values = Object.assign(defaults, overrides);
  return {
    ack: () => Promise.resolve(undefined),
    body: {
      type: 'block_actions',
      team: { id: MOCK_TEAM_ID },
      user: { id: MOCK_USER_ID },
      actions: [
        {
          action_id: MOCK_BLOCK_ACTION_ID,
        },
      ],
      bot_access_token: values.mockFunctionBotAccessToken,
      function_data: {
        execution_id: values.mockFunctionExecutionId,
        inputs: {
          message: values.mockFunctionInput.message,
        },
      },
    },
  };
}

/**
 * Overrides for spying on mocks are below this comment
 */

async function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata()),
): Promise<typeof import('./App').default> {
  return (await rewiremock.module(() => import('./App'), overrides)).default;
}

function withFunctionsComplete(spySuccess: SinonSpy, spyError: SinonSpy): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public readonly token?: string;

        public constructor(token: string, _options?: WebClientOptions) {
          this.token = token;
        }

        public functions = {
          completeSuccess: spySuccess,
          completeError: spyError,
        };
      },
    },
  };
}

function withNoopAppMetadata(): Override {
  return {
    '@slack/web-api': {
      addAppMetadata: sinon.fake(),
    },
  };
}
