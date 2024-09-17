import type { ActionConstraints, ShortcutConstraints } from '../../../src/App';
import { FakeReceiver, importApp, noop } from '../helpers';
import type { OptionsSource, SlackAction, SlackShortcut, SlackViewAction } from '../../../src/types';

// 0 should not be able to extend (1 & <SomeType>), if it does, SomeType must be Any
// https://stackoverflow.com/a/55541672
type IfAnyThenElse<TypeToCheck, Then, Else> = 0 extends 1 & TypeToCheck ? Then : Else;
interface valid {
  valid: boolean;
}
interface GlobalContext {
  globalContextKey: number;
}
interface MiddlewareContext {
  middlewareContextKey: number;
}

const receiver = new FakeReceiver();

describe('context typing', () => {
  it('use should handle global and middleware context', async () => {
    it('message should handle middleware context', async () => {
      const MockApp = await importApp();
      const app = new MockApp({ receiver, authorize: noop });
      it('shortcut should handle global and middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp<GlobalContext>({ receiver, authorize: noop });

        // Shortcut with RegExp callbackId is aware of global context and passes context to all middleware
        app.shortcut(
          /callback_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Shortcut with string callbackId is aware of global context and passes context to all middleware
        app.shortcut(
          'callback_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Shortcut with RegExp callbackId is aware of global and middleware context and passes context to all middleware
        app.shortcut<SlackShortcut, MiddlewareContext>(
          /callback_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Shortcut with string callbackId is aware of global and middleware context and passes context to all middleware
        app.shortcut<SlackShortcut, MiddlewareContext>(
          'callback_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Shortcut with constraints is aware of global context and passes context to all middleware
        app.shortcut(
          { type: 'shortcut' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Shortcut with constraints is aware of global and middleware context and passes context to all middleware
        app.shortcut<SlackShortcut, ShortcutConstraints<SlackShortcut>, MiddlewareContext>(
          { type: 'shortcut' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('shortcut should handle middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp({ receiver, authorize: noop });

        // Shortcut with RegExp callbackId is aware of middleware context and passes context to all middleware
        app.shortcut<SlackShortcut, MiddlewareContext>(
          /callback_id/,
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Shortcut with string callbackId is aware of middleware context and passes context to all middleware
        app.shortcut<SlackShortcut, MiddlewareContext>(
          'callback_id',
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Shortcut with constraints is aware of middleware context and passes context to all middleware
        app.shortcut<SlackShortcut, ShortcutConstraints, MiddlewareContext>(
          { type: 'shortcut' },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('action should handle global and middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp<GlobalContext>({ receiver, authorize: noop });

        // Action with RegExp callbackId is aware of global context and passes context to all middleware
        app.action(
          /callback_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Action with string callbackId is aware of global context and passes context to all middleware
        app.action(
          'callback_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Action with RegExp callbackId is aware of global and middleware context and passes context to all middleware
        app.action<SlackAction, MiddlewareContext>(
          /callback_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Action with string callbackId is aware of global and middleware context and passes context to all middleware
        app.action<SlackAction, MiddlewareContext>(
          'callback_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Action with constraints is aware of global context and passes context to all middleware
        app.action(
          { type: 'interactive_message' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Action with constraints is aware of global and middleware context and passes context to all middleware
        app.action<SlackAction, ActionConstraints, MiddlewareContext>(
          { type: 'interactive_message' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('action should handle middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp({ receiver, authorize: noop });

        // Action with RegExp callbackId is aware of middleware context and passes context to all middleware
        app.action<SlackAction, MiddlewareContext>(
          /callback_id/,
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Action with string callbackId is aware of middleware context and passes context to all middleware
        app.action<SlackAction, MiddlewareContext>(
          'callback_id',
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Action with constraints is aware of middleware context and passes context to all middleware
        app.action<SlackAction, ActionConstraints, MiddlewareContext>(
          { type: 'interactive_message' },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('command should handle global and middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp<GlobalContext>({ receiver, authorize: noop });
        // Command with commandName is aware of global context and passes context to all middleware

        // Command with RegExp commandName is aware of global and middleware context and passes context to all middleware
        app.command(
          /command_name/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Command with String commandName is aware of global and middleware context and passes context to all middleware
        app.command(
          'command_name',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Command with RegExp commandName is aware of global and middleware context and passes context to all middleware
        app.command<MiddlewareContext>(
          /command_name/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Command with string commandName is aware of global and middleware context and passes context to all middleware
        app.command<MiddlewareContext>(
          'command_name',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('command should handle middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp({ receiver, authorize: noop });

        // Command with RegExp commandName is aware of middleware context and passes context to all middleware
        app.command<MiddlewareContext>(
          /command_name/,
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Command with string commandName is aware of middleware context and passes context to all middleware
        app.command<MiddlewareContext>(
          'command_name',
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('options should handle global and middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp<GlobalContext>({ receiver, authorize: noop });

        // Options with RegExp actionId is aware of global context and passes context to all middleware
        app.options(
          /action_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Options with string actionId is aware of global context and passes context to all middleware
        app.options(
          'action_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Options with RegExp actionId is aware of global and middleware context and passes context to all middleware
        app.options<'block_suggestion', MiddlewareContext>(
          /action_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Options with string actionId is aware of global and middleware context and passes context to all middleware
        app.options<'block_suggestion', MiddlewareContext>(
          'action_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Options with constraint is aware of global context and passes context to all middleware
        app.options(
          { type: 'block_suggestion' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // Options with constraint is aware of global and middleware context and passes context to all middleware
        app.options<OptionsSource, MiddlewareContext>(
          { type: 'block_suggestion' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('options should handle middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp({ receiver, authorize: noop });

        // Options with RegExp actionId is aware of middleware context and passes context to all middleware
        app.options<'block_suggestion', MiddlewareContext>(
          /action_id/,
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Options with string actionId is aware of middleware context and passes context to all middleware
        app.options<'block_suggestion', MiddlewareContext>(
          'action_id',
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // Options with constraint is aware of middleware context and passes context to all middleware
        app.options<OptionsSource, MiddlewareContext>(
          { type: 'block_suggestion' },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('view should handle global and middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp<GlobalContext>({ receiver, authorize: noop });

        // View with RegExp callbackId is aware of global context and passes context to all middleware
        app.view(
          /callback_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // View with string callbackId is aware of global context and passes context to all middleware
        app.view(
          'callback_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // View with RegExp callbackId is aware of global and middleware context and passes context to all middleware
        app.view<SlackViewAction, MiddlewareContext>(
          /callback_id/,
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // View with string callbackId is aware of global and middleware context and passes context to all middleware
        app.view<SlackViewAction, MiddlewareContext>(
          'callback_id',
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // View with constraint is aware of global context and passes context to all middleware
        app.view(
          { type: 'view_closed' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;
          },
        );

        // View with constraint is aware of global and middleware context and passes context to all middleware
        app.view<SlackViewAction, MiddlewareContext>(
          { type: 'view_closed' },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const globalCheck = {} as IfAnyThenElse<(typeof context)['globalContextKey'], never, valid>;
            globalCheck.valid = true;

            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });

      it('view should handle middleware context', async () => {
        const MockApp = await importApp();
        const app = new MockApp({ receiver, authorize: noop });

        // View with RegExp callbackId is aware of global and middleware context and passes context to all middleware
        app.view<SlackViewAction, MiddlewareContext>(
          /callback_id/,
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // View with string callbackId is aware of global and middleware context and passes context to all middleware
        app.view<SlackViewAction, MiddlewareContext>(
          'callback_id',
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );

        // View with constraint is aware of global and middleware context and passes context to all middleware
        app.view<SlackViewAction, MiddlewareContext>(
          { type: 'view_closed' },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
          async ({ context }) => {
            const middlewareCheck = {} as IfAnyThenElse<(typeof context)['middlewareContextKey'], never, valid>;
            middlewareCheck.valid = true;
          },
        );
      });
    });
