---
sidebar_label: Migrating to v5
---

# Migrating @slack/bolt from v4 to v5

_Minimum Node.js version: 20_

Bolt v5 follows the Node Slack SDK's shift from [axios](https://www.npmjs.com/package/axios) to the native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). It also removes the deprecated Workflow Steps feature (retired by Slack in September 2024) and raises the minimum Node.js version to 20.

All internal `@slack/*` dependencies have been bumped to their next major versions: `@slack/web-api` ^8, `@slack/socket-mode` ^3, `@slack/oauth` ^4, `@slack/logger` ^5, and `@slack/types` ^3. These bring proper error class hierarchies, native fetch transport, and undici-based WebSocket connections.

If your app doesn't use proxy/TLS configuration, Workflow Steps, or inspect `respond()` return values, this upgrade is likely a version bump and done.

---

## Breaking Changes


### We've raised the minimum Node.js version to 20

We've dropped support for Node.js 18. Node.js 20 or later is required.

---

### We've removed the `agent` and `clientTls` options from `AppOptions`

You should configure transport via `clientOptions.fetch` or use the Node.js built-in proxy support.

**Before (v4):**

```typescript
import { App } from '@slack/bolt';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'node:fs';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  agent: new HttpsProxyAgent('http://corporate.proxy:8080'),
  clientTls: {
    cert: fs.readFileSync('/path/to/client-cert.pem'),
    key: fs.readFileSync('/path/to/client-key.pem'),
  },
});
```

#### Preferred: Built-in proxy support

Node.js can read proxy env vars natively via [`http.setGlobalProxyFromEnv()`](https://nodejs.org/docs/latest/api/http.html#httpsetglobalproxyfromenvproxyenv). Call it once at startup and `globalThis.fetch` routes through your proxy automatically, no extra packages needed.


##### Option A: programmatically call once at startup

```typescript
import http from 'node:http';
import { App } from '@slack/bolt';

http.setGlobalProxyFromEnv();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
```

##### Option B: use an environment variable

```bash
NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://corporate.proxy:8080 node app.js
```

```typescript
import { App } from '@slack/bolt';

// No proxy configuration needed — globalThis.fetch respects the environment
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
```

#### Alternative: use an undici dispatcher for proxy + TLS

If you need per-client configuration, use the `clientOptions.fetch` option with an [undici](https://undici.nodejs.org/) dispatcher:

```typescript
import { App } from '@slack/bolt';
import { fetch, ProxyAgent, Agent } from 'undici';
import fs from 'node:fs';

// Proxy only
const proxyDispatcher = new ProxyAgent('http://corporate.proxy:8080');

// TLS only
const tlsDispatcher = new Agent({
  connect: {
    cert: fs.readFileSync('/path/to/client-cert.pem'),
    key: fs.readFileSync('/path/to/client-key.pem'),
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
  },
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientOptions: {
    fetch: (url, init) => fetch(url, { ...init, dispatcher: tlsDispatcher }),
  },
});
```

---

### We've updated `SocketModeReceiver` to use `dispatcher` instead of proxy agents

The `SocketModeReceiver` now accepts a `dispatcher` option (from `@slack/socket-mode` v3) for unified proxy and TLS configuration of both the WebSocket connection and HTTP API calls ([#2929](https://github.com/slackapi/bolt-js/pull/2929)).

**Before (v4):**

```typescript
import { App } from '@slack/bolt';
import { HttpsProxyAgent } from 'https-proxy-agent';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  agent: new HttpsProxyAgent('http://corporate.proxy:8080'),
});
```

#### Preferred: Built-in proxy support

Node.js can read proxy env vars natively via [`http.setGlobalProxyFromEnv()`](https://nodejs.org/docs/latest/api/http.html#httpsetglobalproxyfromenvproxyenv). Call it once at startup and both the WebSocket connection and API calls route through your proxy automatically.

```typescript
import http from 'node:http';
import { App } from '@slack/bolt';

http.setGlobalProxyFromEnv();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});
```

#### Alternative: undici dispatcher for proxy + TLS

If you need per-client configuration, pass a `dispatcher` to both the `SocketModeReceiver` (for the WebSocket connection) and `clientOptions.fetch` (for the app's internal `WebClient` API calls):

```typescript
import { App, SocketModeReceiver } from '@slack/bolt';
import { fetch, ProxyAgent } from 'undici';

const dispatcher = new ProxyAgent('http://corporate.proxy:8080');

const receiver = new SocketModeReceiver({
  appToken: process.env.SLACK_APP_TOKEN,
  dispatcher,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
  clientOptions: {
    fetch: (url, init) => fetch(url, { ...init, dispatcher }),
  },
});
```

---

### 4. Workflow Steps removed entirely

The `WorkflowStep` class, `app.step()` method, and all related types have been deleted ([#2928](https://github.com/slackapi/bolt-js/pull/2928)). Slack retired the Steps from Apps feature in September 2024. Use `app.function()` with custom functions instead.

Remove any imports of `WorkflowStep` or `WorkflowStepEdit` — they no longer exist.

---

### 5. `respond()` returns native `Response` instead of axios response

The `respond()` utility now uses native fetch internally ([#2929](https://github.com/slackapi/bolt-js/pull/2929)). If you inspect the return value, the shape has changed from an axios response to a standard Fetch [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response).

**Before (v4):**

```typescript
app.command('/ticket', async ({ command, ack, respond }) => {
  await ack();
  const result = await respond(`Ticket created: ${command.text}`);
  // result was an AxiosResponse
  console.log(result.status);   // 200
  console.log(result.data);     // response body (pre-parsed)
  console.log(result.headers);  // AxiosHeaders object
});
```

**After (v5):**

```typescript
app.command('/ticket', async ({ command, ack, respond }) => {
  await ack();
  const result = await respond(`Ticket created: ${command.text}`);
  // result is a native Fetch Response
  console.log(result.status);        // 200
  console.log(await result.text());  // response body (call .text() or .json())
  console.log(result.headers);       // Headers object
});
```

If you're just calling `await respond(...)` without using the return value (the common case), no changes are needed.

---

### 6. Upgraded `@slack/*` dependencies

All internal `@slack/*` packages have been bumped to their next major versions ([#2929](https://github.com/slackapi/bolt-js/pull/2929)). If you import from these packages directly, check their respective migration guides:

| Dependency | v4 range | v5 range | Migration guide |
| --- | --- | --- | --- |
| `@slack/web-api` | ^7 | ^8 | [web-api v8 migration](./web-api-v8-migration.md) |
| `@slack/socket-mode` | ^2 | ^3 | [socket-mode v3 migration](./socket-mode-v3-migration.md) |
| `@slack/oauth` | ^3 | ^4 | — |
| `@slack/logger` | ^4 | ^5 | — |
| `@slack/types` | ^2 | ^3 | — |

Key inherited changes:

- **`@slack/web-api` v8** removes `agent`, `tls`, `requestInterceptor`, and `adapter` options from `WebClientOptions`. If you pass any of these via `clientOptions` in your `App` constructor, they no longer exist — use `clientOptions.fetch` instead.
- **`@slack/web-api` v8** errors are now proper `Error` subclasses with `instanceof` support. See the [web-api v8 error handling section](./web-api-v8-migration.md#7-error-handling-overhaul).
- **`@slack/socket-mode` v3** replaces the `ws` library with undici's WebSocket implementation. See the [socket-mode v3 migration](./socket-mode-v3-migration.md).

---

### 7. Error handling improvements

Bolt v5 leverages the new error classes from `@slack/web-api` v8 ([#2930](https://github.com/slackapi/bolt-js/pull/2930)). Errors thrown by the internal `WebClient` are now proper `Error` subclasses — `instanceof` checks work and TypeScript narrows types correctly.

**Before (v4):**

```typescript
import { App } from '@slack/bolt';

const app = new App({ /* ... */ });

app.error(async ({ error }) => {
  if ('code' in error && error.code === 'slack_webapi_platform_error') {
    console.log((error as any).data?.error);
  }
});
```

**After (v5):**

```typescript
import { App } from '@slack/bolt';
import { WebAPIPlatformError, WebAPIRequestError } from '@slack/web-api';

const app = new App({ /* ... */ });

app.error(async ({ error }) => {
  if (error instanceof WebAPIPlatformError) {
    console.log(error.data.error); // e.g. 'channel_not_found'
  } else if (error instanceof WebAPIRequestError) {
    console.log(error.cause); // the underlying fetch/network error
  }
});
```

---

## New Features

### `dispatcher` option on `SocketModeReceiver`

Unified proxy and TLS configuration for both WebSocket connections and HTTP API calls. Pass any undici-compatible dispatcher. See [Breaking Change #3](#3-socketmodereceiver-uses-dispatcher-instead-of-proxy-agents).

### Error classes with `instanceof` support

Both Bolt's own errors (e.g., `AppInitializationError`, `AuthorizationError`) and the underlying `@slack/web-api` errors now properly extend `Error`. Use `instanceof` for type-safe error handling instead of string comparisons on `error.code`.

### `app.function()` as the sole custom step mechanism

While `app.function()` already existed in Bolt v4, it is now the only way to handle custom function executions (replacing the removed `app.step()` / `WorkflowStep`). It provides `complete()` and `fail()` callbacks for signaling outcomes, and `inputs` for accessing function parameters.