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
import { WorkflowStep } from './WorkflowStep';

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

describe('App WorkflowStep middleware', () => {
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

  it('should add a listener to middleware for each WorkflowStep passed to app.step', async () => {
    const ws = new WorkflowStep('test_id', { edit: [], save: [], execute: [] });

    /* middleware is a private property on App. Since app.step relies on app.use,
    and app.use is fully tested above, we're opting just to ensure that the step listener
    is added to the global middleware array, rather than repeating the same tests. */
    const { middleware } = (app as any);

    assert.equal(middleware.length, 2);

    app.step(ws);

    assert.equal(middleware.length, 3);
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
