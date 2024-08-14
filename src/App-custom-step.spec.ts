import 'mocha';
import sinon from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { Override, mergeOverrides } from './test-helpers';
import {
  Receiver,
  ReceiverEvent,
} from './types';
import App from './App';

// Fakes
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

describe('App function() and function_executed and function-scoped interactivity event processing', () => {
  let fakeReceiver: FakeReceiver;
  let dummyAuthorizationResult: { botToken: string; botId: string };

  beforeEach(() => {
    fakeReceiver = new FakeReceiver();
    dummyAuthorizationResult = { botToken: '', botId: '' };
  });

  let app: App;

  beforeEach(async () => {
    const MockAppNoOverrides = await importApp();
    app = new MockAppNoOverrides({
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
  });

  it('should add a listener to middleware for each function listener passed to app.function', async () => {
    /* middleware is a private property on App, so ensure that the step listener
    is added to the global middleware array. */
    const { middleware } = (app as any);
    const noop = () => Promise.resolve();

    assert.equal(middleware.length, 2);

    app.function('callback_id', noop, noop);

    // Bundles two listeners into one middleware, thus 3 here:
    assert.equal(middleware.length, 3);
  });
  it('should enrich custom step context and arguments with function_executed properties like execution ID and inputs', async () => {
    const noop = () => Promise.resolve();
    const processStub = sinon.fake.resolves({});
    const MockAppNoOverrides = await importApp(mergeOverrides(withNoopAppMetadata(), withNoopWebClient(), {
      './middleware/process': processStub,
    }));
    app = new MockAppNoOverrides({
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
    await fakeReceiver.sendEvent({
      body: {
        event: {
          type: 'function_executed',
          function_execution_id: 'Fx1234',
          bot_access_token: 'xowfp',
        },
        function_data: {
          inputs: 'yo',
        },
      },
      ack: noop,
    });
    const context = processStub.lastCall.args[2];
    assert.equal(context.functionBotAccessToken, 'xowfp');
    assert.equal(context.functionExecutionId, 'Fx1234');
    assert.equal(context.functionInputs, 'yo');
  });
  it('should not enrich custom step middleware arguments with JIT workflow token if attachFunctionToken set to false', async () => {
    const noop = () => Promise.resolve();
    const processStub = sinon.fake.resolves({});
    const MockAppNoOverrides = await importApp(mergeOverrides(withNoopAppMetadata(), withNoopWebClient(), {
      './middleware/process': processStub,
    }));
    app = new MockAppNoOverrides({
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
      attachFunctionToken: false,
    });
    await fakeReceiver.sendEvent({
      body: {
        event: {
          type: 'function_executed',
          function_execution_id: 'Fx1234',
          bot_access_token: 'xowfp',
        },
        function_data: {
          inputs: 'yo',
        },
      },
      ack: noop,
    });
    const context = processStub.lastCall.args[2];
    assert.notEqual(context.functionBotAccessToken, 'xowfp');
  });
  it('should enrich action middleware arguments with function_executed properties like execution ID, workflow JIT token and inputs if action event is function-scoped', async () => {
    const noop = () => Promise.resolve();
    const processStub = sinon.fake.resolves({});
    const MockAppNoOverrides = await importApp(mergeOverrides(withNoopAppMetadata(), withNoopWebClient(), {
      './middleware/process': processStub,
    }));
    app = new MockAppNoOverrides({
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
    await fakeReceiver.sendEvent({
      body: {
        actions: [],
        channel: { id: 'C1234' },
        function_data: {
          execution_id: 'Fx1234',
          bot_access_token: 'xowfp',
          inputs: 'yo',
        },
        user: {
          team_id: 'T1244',
        },
      },
      ack: noop,
    });
    const args = processStub.lastCall.args[1];
    assert(args.complete);
    assert(args.fail);
    assert(args.inputs);
    const context = processStub.lastCall.args[2];
    assert.equal(context.functionBotAccessToken, 'xowfp');
    assert.equal(context.functionExecutionId, 'Fx1234');
    assert.equal(context.functionInputs, 'yo');
  });
});

/* Testing Harness */

// Loading the system under test using overrides
async function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata(), withNoopWebClient()),
): Promise<typeof import('./App').default> {
  return (await rewiremock.module(() => import('./App'), overrides)).default;
}

// Composable overrides
function withNoopWebClient(): Override {
  return {
    '@slack/web-api': {
      WebClient: class {},
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
