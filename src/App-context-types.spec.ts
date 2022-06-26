import sinon from 'sinon';
import rewiremock from 'rewiremock';
import { mergeOverrides, Override } from './test-helpers';
import { Receiver, ReceiverEvent } from './types';
import App from './App';

type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;
interface valid { valid: boolean }
interface GlobalContext { globalContextKey: number }
interface MiddlewareContext { middleWareContextKey: number }

// Loading the system under test using overrides
async function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata(), withNoopWebClient()),
): Promise<typeof import('./App').default> {
  return (await rewiremock.module(() => import('./App'), overrides)).default;
}

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

const noopAuthorize = () => Promise.resolve({});
const receiver = new FakeReceiver();

describe('context typing', () => {
  it('should pass global context to message middleware', async () => {

    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });

    app.message('hello', async ({ context }) => {
      // If the globalContextKey in the context is not explicitly typed, then it will be 'any'
      // The IfAny check will then set 'check' to 'never', causing the check.valid call later to fail
      const check = {} as IfAny<typeof context['globalContextKey'], never, valid>;
      check.valid = true;
    });
  });

  it('should pass middleware context to message middleware', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    app.message<MiddlewareContext>('hello', async ({ context }) => {
      const check = {} as IfAny<typeof context['middleWareContextKey'], never, valid>;
      check.valid = true;
    });
  });
});

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
