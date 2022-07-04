import sinon from 'sinon';
import rewiremock from 'rewiremock';
import { mergeOverrides, Override } from './test-helpers';
import { OptionsSource, Receiver, ReceiverEvent, SlackAction, SlackShortcut, SlackViewAction } from './types';
import App, { ActionConstraints, ShortcutConstraints } from './App';

// 0 should not be able to extend (1 & <SomeType>), if it does, SomeType must be Any
// https://stackoverflow.com/a/55541672
type IfAnyThenElse<TypeToCheck, Then, Else> = 0 extends (1 & TypeToCheck) ? Then : Else;
interface valid { valid: boolean }
interface GlobalContext { globalContextKey: number }
interface MiddlewareContext { middlewareContextKey: number }

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
  it('use should handle global and middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });

    // Use - Global Context
    app.use(async ({ context }) => {
      const check = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      check.valid = true;
    });

    // Use - Global & Middleware Context
    app.use<MiddlewareContext>(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('use should handle middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    // Use - Middleware Context
    app.use<MiddlewareContext>(async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('message should handle global and middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });

    // Message passes global context to all middleware
    app.message(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Message passes global and middleware context to all middleware
    app.message<MiddlewareContext>(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message passes global context when using RegExp pattern and passes context to all middleware
    app.message(/^regex/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Message passes global context when using string pattern and passes context to all middleware
    app.message('string', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Message passes global and middleware context when using RegExp patterns and passes context to all middleware
    app.message<MiddlewareContext>(/^regex/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message passes global and middleware context when using String patterns and passes context to all middleware
    app.message<MiddlewareContext>('string', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message filter with RegExp pattern is aware of global context and passes context to all middleware
    app.message(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, /^regex/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Message filter with String pattern is aware of global context and passes context to all middleware
    app.message(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, 'string', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Message filter with RegExp pattern is aware of global and middleware context and passes context to all middleware
    app.message<MiddlewareContext>(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, /^regex/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message filter with String pattern is aware of global and middleware context and passes context to all middleware
    app.message<MiddlewareContext>(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, 'string', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message filter is aware of global context and passes context to all middleware
    app.message(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Message filter is aware of global and middleware context and passes context to all middleware
    app.message<MiddlewareContext>(async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message with mixed patterns and middleware is aware of global context passes context to all middleware
    app.message('test_string', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, 'test_string_2', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, /regex/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    /**
    * Message with mixed patterns and middleware is aware of global and
    * middleware context and passes context to all middleware
    */
    app.message<MiddlewareContext>('test_string', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, 'test_string_2', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, /regex/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('message should handle middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    // Message passes middleware context to all middleware
    app.message<MiddlewareContext>(async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message passes middleware context when using RegExp patterns and passes context to all middleware
    app.message<MiddlewareContext>(/^regex/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message passes middleware context when using String patterns and passes context to all middleware
    app.message<MiddlewareContext>('string', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message filter with RegExp pattern is aware of middleware context and passes context to all middleware
    app.message<MiddlewareContext>(async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, /^regex/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Message filter is aware of middleware context and passes context to all middleware
    app.message<MiddlewareContext>(async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    /**
    * Message with mixed patterns and middleware is aware of global and
    * middleware context and passes context to all middleware
    */
    app.message<MiddlewareContext>('test_string', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, 'test_string_2', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, /regex/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('shortcut should handle global and middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });

    // Shortcut with RegExp callbackId is aware of global context and passes context to all middleware
    app.shortcut(/callback_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Shortcut with string callbackId is aware of global context and passes context to all middleware
    app.shortcut('callback_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Shortcut with RegExp callbackId is aware of global and middleware context and passes context to all middleware
    app.shortcut<SlackShortcut, MiddlewareContext>(/callback_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Shortcut with string callbackId is aware of global and middleware context and passes context to all middleware
    app.shortcut<SlackShortcut, MiddlewareContext>('callback_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Shortcut with constraints is aware of global context and passes context to all middleware
    app.shortcut({ type: 'shortcut' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Shortcut with constraints is aware of global and middleware context and passes context to all middleware
    app.shortcut<SlackShortcut, ShortcutConstraints<SlackShortcut>, MiddlewareContext>({ type: 'shortcut' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('shortcut should handle middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    // Shortcut with RegExp callbackId is aware of middleware context and passes context to all middleware
    app.shortcut<SlackShortcut, MiddlewareContext>(/callback_id/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Shortcut with string callbackId is aware of middleware context and passes context to all middleware
    app.shortcut<SlackShortcut, MiddlewareContext>('callback_id', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Shortcut with constraints is aware of middleware context and passes context to all middleware
    app.shortcut<SlackShortcut, ShortcutConstraints, MiddlewareContext>({ type: 'shortcut' }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('action should handle global and middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });

    // Action with RegExp callbackId is aware of global context and passes context to all middleware
    app.action(/callback_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Action with string callbackId is aware of global context and passes context to all middleware
    app.action('callback_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Action with RegExp callbackId is aware of global and middleware context and passes context to all middleware
    app.action<SlackAction, MiddlewareContext>(/callback_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Action with string callbackId is aware of global and middleware context and passes context to all middleware
    app.action<SlackAction, MiddlewareContext>('callback_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Action with constraints is aware of global context and passes context to all middleware
    app.action({ type: 'interactive_message' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Action with constraints is aware of global and middleware context and passes context to all middleware
    app.action<SlackAction, ActionConstraints, MiddlewareContext>({ type: 'interactive_message' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('action should handle middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    // Action with RegExp callbackId is aware of middleware context and passes context to all middleware
    app.action<SlackAction, MiddlewareContext>(/callback_id/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Action with string callbackId is aware of middleware context and passes context to all middleware
    app.action<SlackAction, MiddlewareContext>('callback_id', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Action with constraints is aware of middleware context and passes context to all middleware
    app.action<SlackAction, ActionConstraints, MiddlewareContext>({ type: 'interactive_message' }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('command should handle global and middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });
    // Command with commandName is aware of global context and passes context to all middleware

    // Command with RegExp commandName is aware of global and middleware context and passes context to all middleware
    app.command(/command_name/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Command with String commandName is aware of global and middleware context and passes context to all middleware
    app.command('command_name', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Command with RegExp commandName is aware of global and middleware context and passes context to all middleware
    app.command<MiddlewareContext>(/command_name/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Command with string commandName is aware of global and middleware context and passes context to all middleware
    app.command<MiddlewareContext>('command_name', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('command should handle middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    // Command with RegExp commandName is aware of middleware context and passes context to all middleware
    app.command<MiddlewareContext>(/command_name/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Command with string commandName is aware of middleware context and passes context to all middleware
    app.command<MiddlewareContext>('command_name', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('options should handle global and middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });

    // Options with RegExp actionId is aware of global context and passes context to all middleware
    app.options(/action_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Options with string actionId is aware of global context and passes context to all middleware
    app.options('action_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Options with RegExp actionId is aware of global and middleware context and passes context to all middleware
    app.options<'block_suggestion', MiddlewareContext>(/action_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Options with string actionId is aware of global and middleware context and passes context to all middleware
    app.options<'block_suggestion', MiddlewareContext>('action_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Options with constraint is aware of global context and passes context to all middleware
    app.options({ type: 'block_actions' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // Options with constraint is aware of global and middleware context and passes context to all middleware
    app.options<OptionsSource, MiddlewareContext>({ type: 'block_actions' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('options should handle middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    // Options with RegExp actionId is aware of middleware context and passes context to all middleware
    app.options<'block_suggestion', MiddlewareContext>(/action_id/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Options with string actionId is aware of middleware context and passes context to all middleware
    app.options<'block_suggestion', MiddlewareContext>('action_id', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // Options with constraint is aware of middleware context and passes context to all middleware
    app.options<OptionsSource, MiddlewareContext>({ type: 'block_actions' }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('view should handle global and middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp<GlobalContext>({ receiver, authorize: noopAuthorize });

    // View with RegExp callbackId is aware of global context and passes context to all middleware
    app.view(/callback_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // View with string callbackId is aware of global context and passes context to all middleware
    app.view('callback_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // View with RegExp callbackId is aware of global and middleware context and passes context to all middleware
    app.view<SlackViewAction, MiddlewareContext>(/callback_id/, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // View with string callbackId is aware of global and middleware context and passes context to all middleware
    app.view<SlackViewAction, MiddlewareContext>('callback_id', async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // View with constraint is aware of global context and passes context to all middleware
    app.view({ type: 'view_closed' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;
    });

    // View with constraint is aware of global and middleware context and passes context to all middleware
    app.view<SlackViewAction, MiddlewareContext>({ type: 'view_closed' }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const globalCheck = {} as IfAnyThenElse<typeof context['globalContextKey'], never, valid>;
      globalCheck.valid = true;

      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });
  });

  it('view should handle middleware context', async () => {
    const MockApp = await importApp();
    const app = new MockApp({ receiver, authorize: noopAuthorize });

    // View with RegExp callbackId is aware of global and middleware context and passes context to all middleware
    app.view<SlackViewAction, MiddlewareContext>(/callback_id/, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // View with string callbackId is aware of global and middleware context and passes context to all middleware
    app.view<SlackViewAction, MiddlewareContext>('callback_id', async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    });

    // View with constraint is aware of global and middleware context and passes context to all middleware
    app.view<SlackViewAction, MiddlewareContext>({ type: 'view_closed' }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
    }, async ({ context }) => {
      const middlewareCheck = {} as IfAnyThenElse<typeof context['middlewareContextKey'], never, valid>;
      middlewareCheck.valid = true;
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
