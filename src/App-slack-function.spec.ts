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
import importSlackFunctionModule from './SlackFunction.spec';

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

describe('App SlackFunction middleware', () => {
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

  it('should add a middleware for each SlackFunction passed to app.function', async () => {
    const mockFunctionCallbackId = 'reverse_approval';
    const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
    const slackFn = new SlackFunction(mockFunctionCallbackId, () => new Promise((resolve) => resolve()));

    const { middleware } = (app as any);

    assert.equal(middleware.length, 2);

    app.function(slackFn);

    assert.equal(middleware.length, 3);
  });
});

/* Testing Harness */

// Loading the system under test using overrides
async function importApp(
  overrides: Override = mergeOverrides(
    withNoopAppMetadata(),
    withNoopWebClient(),
  ),
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

export default function withMockValidManifestUtil(functionCallbackId: string): Override {
  const mockManifestOutput = JSON.parse(`{"functions": {"${functionCallbackId}": {}}}`);
  return {
    './cli/hook-utils/get-manifest-data': {
      getManifestData: () => mockManifestOutput,
    },
  };
}
