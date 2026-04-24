# AGENTS.md - bolt-js

Instructions for AI coding agents working on this repository.

## Project Overview

Slack Bolt for JavaScript -- a framework for building Slack apps, fast.

- **Foundation:** Built on top of `@slack/web-api`, `@slack/oauth`, `@slack/socket-mode`, and other `@slack/*` packages (see `package.json` for the full list and versions).
- **Language:** TypeScript-first, compiled to CommonJS.
- **Node version:** See `engines` in `package.json` for minimum Node.js and npm versions.
- **Repository**: <https://github.com/slackapi/bolt-js>
- **Documentation**: <https://docs.slack.dev/tools/bolt-js/>
- **npm**: <https://www.npmjs.com/package/@slack/bolt>
- **Current version**: defined in `package.json`
- **Examples**: Sample apps in `examples/` (Socket Mode, OAuth, Lambda, custom receivers, etc.)

## Environment Setup

```bash
# Install all dependencies
npm install
```

## Common Commands

Before considering any work complete, you MUST run `npm test` and confirm it passes.

```bash
npm test              # Full pipeline: build -> lint -> type tests -> unit test coverage
npm run build         # Clean build (rm dist/ + tsc compilation)
npm run lint          # Biome check (formatting + linting)
npm run lint:fix      # Biome auto-fix
npm run test:unit     # Unit tests only (mocha)
npm run test:coverage # Unit tests with coverage (c8)
npm run test:types    # Type definition tests (tsd)
npm run watch         # Watch mode for development (rebuilds on src/ changes)
```

## Architecture

### Event Flow

Incoming events flow through a middleware chain before reaching listeners:

1. **Receiver** ingests event from Slack (HTTP, Socket Mode, or Lambda)
2. Receiver calls `App.processEvent(ReceiverEvent)`
3. **Global middleware** chain executes (authorization, self-event ignoring, custom middleware)
4. App determines event type and matches relevant **listeners** based on constraints
5. **Listener-specific middleware** chains execute
6. **Listener handler** runs with full context

For FaaS environments (`processBeforeResponse: true`), acknowledgment happens after the handler executes.

### Core Classes

- **`App`** (`src/App.ts`) -- Central orchestrator. Registers listeners via methods (`app.event()`, `app.action()`, `app.command()`, etc.). Dispatches incoming events through middleware to matching listeners. Manages the Web API client pool, authorization, and error handling.
- **`Receiver`** interface (`src/types/receiver.ts`) -- Pluggable transport layer abstraction. Methods: `init(app)`, `start()`, `stop()`.
  - `HTTPReceiver` (`src/receivers/HTTPReceiver.ts`) -- Express v5 HTTP server, default receiver
  - `SocketModeReceiver` (`src/receivers/SocketModeReceiver.ts`) -- WebSocket-based, no public URL needed
  - `ExpressReceiver` (`src/receivers/ExpressReceiver.ts`) -- Integrates with an existing Express v5 app
  - `AwsLambdaReceiver` (`src/receivers/AwsLambdaReceiver.ts`) -- AWS Lambda handler
- **`Assistant`** (`src/Assistant.ts`) -- AI assistant thread handling middleware. Intercepts assistant thread events (`assistant_thread_started`, `assistant_thread_context_changed`, `message` in assistant threads) and dispatches them to registered sub-handlers. Provides utilities: `say`, `setStatus`, `setSuggestedPrompts`, `setTitle`, `getThreadContext`, `saveThreadContext`. Uses `AssistantThreadContextStore` (`src/AssistantThreadContextStore.ts`) for thread context persistence.
- **`CustomFunction`** (`src/CustomFunction.ts`) -- Workflow custom function handler. Provides `complete()` and `fail()` utilities for function execution lifecycle.
- **`WorkflowStep`** (`src/WorkflowStep.ts`) -- **Deprecated.** Use `CustomFunction` and `app.function()` instead.

### Middleware System

Middleware uses a chain-of-responsibility pattern. Each middleware receives args and calls `next()` to continue the chain.

**Type:** `Middleware<Args> = (args: Args & AllMiddlewareArgs) => Promise<void>`

**AllMiddlewareArgs** (always available):

- `context` -- Event metadata (botToken, userToken, botId, botUserId, teamId, enterpriseId, etc.)
- `logger` -- Logger instance
- `client` -- Web API client (pre-authorized)
- `next` -- Call to continue the middleware chain

**Built-in middleware** in `src/middleware/builtin.ts` includes constraint matchers (event type, command name, message pattern, action/shortcut/view constraints), type guards (`onlyActions`, `onlyCommands`, etc.), `ignoreSelf`, and `autoAcknowledge`.

### Listener Methods

| Method | Description | Must `ack()`? |
|--------|-------------|---------------|
| `app.event(type, fn)` | Events API events | No |
| `app.message([pattern,] fn)` | Message events (optional string/RegExp filter) | No |
| `app.action(constraints, fn)` | Block Kit interactive actions (buttons, selects, etc.) | Yes |
| `app.command(name, fn)` | Slash commands | Yes |
| `app.shortcut(constraints, fn)` | Global and message shortcuts | Yes |
| `app.view(constraints, fn)` | Modal view_submission / view_closed | Yes |
| `app.options(constraints, fn)` | External data source requests | Yes |
| `app.function(callbackId, fn)` | Custom workflow function executions | Auto-acknowledged |

### Listener Arguments

Listeners receive a single object with these properties (availability depends on event type):

- `payload` / type-specific alias (`event`, `action`, `command`, `shortcut`, `view`, `options`, `message`) -- The incoming event data
- `say` -- Send a message to the associated channel
- `ack` -- Acknowledge receipt of the event (required for interactive events within 3 seconds)
- `respond` -- Respond via `response_url`
- `client` -- Pre-authorized Web API client
- `context` -- Event metadata and authorization info
- `body` -- Full request body from Slack
- `complete` / `fail` -- Workflow function completion (for `app.function()`)

### Authorization

- **Single workspace:** Provide `token` in `AppOptions` -- used for all events.
- **Multi-workspace:** Provide an `authorize` function that receives `AuthorizeSourceData` (teamId, enterpriseId, userId, conversationId, isEnterpriseInstall) and returns `AuthorizeResult` (botToken, userToken, botId, botUserId, etc.).
- OAuth support via `@slack/oauth` -- configure `clientId`, `clientSecret`, `stateSecret`, `scopes`, `installationStore` in `AppOptions`.

## Code Conventions

- **TypeScript** throughout. Compiler options in `tsconfig.json` (extends `@tsconfig/node18`, CommonJS output).
- **Biome** for formatting and linting. Configuration in `biome.json`.
- **Testing:** See the Testing section below for test frameworks and conventions.

## Critical Rules

1. **Use Biome exclusively** -- never ESLint or Prettier. Config is in `biome.json`.
2. **Run `npm test` before submitting** -- this runs the full pipeline (build + lint + types + coverage).
3. **Follow existing patterns** -- when adding new listener types, middleware, or receivers, match the structure and style of existing implementations.
4. **Don't duplicate `package.json` values** -- reference it for versions, engines, and dependency lists.
5. **Don't add `WorkflowStep` code** -- it is deprecated. Use `CustomFunction` and `app.function()` instead.
6. **Build before running unit tests directly** -- `npm test` handles this automatically, but `npm run test:unit` requires a build to exist first.
7. **Keep the Receiver abstraction clean** -- receivers should only handle transport concerns (ingesting events, sending ack responses). Business logic belongs in middleware and listeners.
8. **Prefer middleware for cross-cutting concerns** -- authorization, logging, validation, and feature-level request handling (like `Assistant`) all use the middleware pattern.
9. **TypeScript types are part of the API** -- changes to exported types are breaking changes. Add type tests for new public types.
10. **Every listener type needs four things:** type definitions, built-in middleware matchers, an App method, and tests.

## Adding a New Listener Type

This is one of the more complex contribution patterns. Follow these steps:

1. **Define types** in `src/types/` -- create the event-specific middleware args interface (see existing patterns in `src/types/actions/`, `src/types/events/`, etc.).
2. **Add built-in middleware matchers** in `src/middleware/builtin.ts` -- create a constraint-matching function and a type guard (e.g., `onlyMyType`).
3. **Add the listener method** in `src/App.ts` -- follow the pattern of existing methods like `action()`, `command()`, etc. Wire up the middleware matchers and register listeners.
4. **Export types** from `src/types/index.ts` and `src/index.ts`.
5. **Add unit tests** in `test/unit/` mirroring the source structure.
6. **Add type tests** in `test/types/` using tsd.

## Adding Middleware

1. Implement the middleware function with signature `(args: MiddlewareArgs & AllMiddlewareArgs) => Promise<void>`. Call `await next()` to continue the chain.
2. For built-in middleware, add to `src/middleware/builtin.ts` and export from `src/middleware/`.
3. For complex middleware (like `Assistant`), create a dedicated file in `src/` with a class that provides a `getMiddleware()` method returning the middleware function.
4. Register in the App's middleware chain in `src/App.ts` where the default middleware is assembled.
5. Add tests in `test/unit/middleware/`.

## Testing

### Test Structure

Tests mirror the source directory structure:

```text
test/unit/
  App/              # App class tests
  middleware/        # Middleware tests
  receivers/        # Receiver tests
  helpers/          # Helper function tests
  Assistant.spec.ts
  CustomFunction.spec.ts
  conversation-store.spec.ts
  ...
test/types/         # tsd type tests
```

### Test Conventions

- **Test files** use `*.spec.ts` suffix
- **Assertions** use chai (`expect`, `assert`)
- **Mocking** uses sinon (`stub`, `spy`, `fake`) and proxyquire for module-level dependency replacement
- **Test config** in `test/unit/.mocharc.json`
- **Where to put new tests:** Mirror the source structure. For `src/Foo.ts`, add `test/unit/Foo.spec.ts`. For `src/receivers/Bar.ts`, add `test/unit/receivers/Bar.spec.ts`.

### CI

CI configuration is in `.github/workflows/ci-build.yml`. Tests run across multiple Node.js versions on every push to `main` and every PR. Coverage is uploaded to Codecov.

## Security Considerations

- **Request signature verification:** The built-in receivers validate `x-slack-signature` and `x-slack-request-timestamp` on every incoming HTTP request using `tsscmp` for timing-safe comparison. Never disable `signatureVerification` in production.
- **Tokens and secrets:** `SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN`, and `SLACK_APP_TOKEN` must come from environment variables. Never hardcode or commit secrets.
- **Authorization middleware:** Verifies tokens and injects an authorized `WebClient` into the listener context. Do not bypass authorization.
- **Tests:** Always use mock/stub values for tokens and secrets. Never use real credentials in tests.
