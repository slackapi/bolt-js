---
sidebar_label: Migrating to v5
---

# Migrating @slack/bolt from v4 to v5

_Minimum Node.js version: 20_

Bolt for JS v5 follows the Node Slack SDK's shift from axios to the native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). It also removes the deprecated Workflow Steps feature (retired by Slack in September 2024) and raises the minimum Node.js version to 20.

All internal `@slack/*` Node Slack SDK dependencies have been bumped to their next major versions. See the section below on [Upgrading the Node Slack SDK dependencies]({#node-slack-sdk-dependencies}) for information and migration instructions.

If your app doesn't use proxy/TLS configuration or inspect `respond()` utility function return values, this upgrade is likely a version bump and done.

---

## Breaking Changes {#breaking-changes}

### We've raised the minimum Node.js version to 20 {#minimum-node-version}

We've dropped support for Node.js 18. Node.js 20 or later is required.

---

### We've removed the `agent` and `clientTls` options from the `AppOptions` interface {#removed-agent-clienttls}

You should configure transport via the `clientOptions.fetch` option or use the Node.js built-in proxy support.

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

#### Preferred: Built-in proxy support {#built-in-proxy-support}

Node.js can read proxy environment variables natively via [`http.setGlobalProxyFromEnv()`](https://nodejs.org/docs/latest/api/http.html#httpsetglobalproxyfromenvproxyenv). Call it once at startup and `globalThis.fetch` routes through your proxy automatically, no extra packages needed.

##### Option A: programmatically call once at startup {#programmatically-call-startup}

```typescript
import http from 'node:http';
import { App } from '@slack/bolt';

http.setGlobalProxyFromEnv();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
```

##### Option B: use an environment variable {#use-an-environment-variable}

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

#### Alternative: use an undici `Dispatcher` instance for proxy and TLS {#undici-dispatcher-proxy-tls}

If you need per-client configuration, use the `clientOptions.fetch` option with an [undici](https://undici.nodejs.org/) `Dispatcher` instance:

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

### We've updated the `SocketModeReceiver` class to accept a `dispatcher` option instead of proxy agents {#socketmodereceiver-dispatcher}

The `SocketModeReceiver` class now accepts a `dispatcher` option for unified proxy and TLS configuration of both the WebSocket connection and HTTP API calls. The `dispatcher` option accepts any undici-compatible `Dispatcher` instance.

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

#### Preferred: Use built-in proxy support {#socketmode-built-in-proxy-support}

Node.js can read proxy environment variables natively via [`http.setGlobalProxyFromEnv()`](https://nodejs.org/docs/latest/api/http.html#httpsetglobalproxyfromenvproxyenv). Call it once at startup and both the WebSocket connection and API calls route through your proxy automatically.

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

#### Alternative: Use an undici `Dispatcher` instance for proxy and TLS {#socketmode-undici-dispatcher-proxy-tls}

If you need per-client configuration, pass a `dispatcher` option to both the `SocketModeReceiver` class (for the WebSocket connection) and the `clientOptions.fetch` option (for the app's internal `WebClient` class API calls):

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

### We've removed Workflow Steps from Apps {#removed-workflow-steps}

The Workflow Steps from Apps feature [was retired in September 2024](/changelog/2023-08-workflow-steps-from-apps-step-back/). The `WorkflowStep` class, the `app.step()` method, and all related types have been deleted from Bolt for JS. You should remove any imports of the `WorkflowStep` class or the `WorkflowStepEdit` type.

Use the `app.function()` method with custom functions instead.

---

### We've updated the `respond()` utility function to return a native `Response` object {#respond-returns-fetch-response}

The `respond()` utility function now uses native fetch internally. If you inspect the return value, the shape has changed from an `AxiosResponse` object to a standard Fetch [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.

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

If you're only calling `await respond(...)` without using the return value (the common case), no changes are needed.

---

### We've upgraded the Node Slack SDK dependencies {#node-slack-sdk-dependencies}

All Node Slack SDK packages have been bumped to their next major versions.

* The `logger` package has been updated to v5.
* The `oauth` package has been updated to v4.
* The `types` package has been updated to v3.

Three packages have more substantial breaking changes:

* The `socket-mode` package has been updated to v3. See the guide on [migrating @slack/socket-mode from v2 to v3](/tools/node-slack-sdk/migration/socket-mode/migrating-socket-mode-package-to-v3) for handling breaking changes. 
* The `web-api` package has been updated to v8. See the guide on [migrating @slack/web-api from v7 to v8](/tools/node-slack-sdk/migration/web-api/migrating-web-api-package-to-v8) for handling breaking changes.

---

### We've improved error handling throughout {#error-handling}

This version of Bolt leverages the new error classes from v8 of the `@slack/web-api` Node Slack SDK package. Errors thrown by the internal `WebClient` class are now proper `Error` subclasses.

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

## New Features {#new-features}

### We've added a `dispatcher` option to the `SocketModeReceiver` class {#new-dispatcher-option}

Unified proxy and TLS configuration for both WebSocket connections and HTTP API calls. Pass any undici-compatible `Dispatcher` instance. See the section above on [the updated `SocketModeReceiver` class](#socketmodereceiver-dispatcher).

### We've added `instanceof` operator support to error classes {#instanceof-errors}

Both Bolt's own error classes (e.g., `AppInitializationError`, `AuthorizationError`) and the underlying `@slack/web-api` Node Slack SDK package error classes (e.g., `WebAPIPlatformError`, `WebAPIRequestError`) now properly extend the `Error` class. Use the `instanceof` operator for type-safe error handling instead of string comparisons on the `error.code` property.

### We've made the `app.function()` method the sole custom step mechanism {#app-function}

While the `app.function()` method already existed in Bolt v4, it is now the only way to handle custom function executions (replacing the removed `app.step()` method and `WorkflowStep` class). It provides `complete()` and `fail()` callback functions for signaling outcomes, and an `inputs` property for accessing function parameters.
