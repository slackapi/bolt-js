---
title: Bolt for JavaScript interface and configuration reference
sidebar_label: Reference
slug: reference
lang: en
---

This guide is intended to detail the Bolt interface–including listeners and their arguments, initialization options, and errors. It may be helpful to first go through the ⚡️[Getting Started guide](/getting-started) to learn the basics of building Bolt for JavaScript apps.

---

## Listener functions
Slack apps typically receive and/or respond to one to many incoming events from Slack. This can be something like listening to an Events API event (like when a link associated with your app is shared) or a user invoking one of your app's shortcuts. For each type of incoming request from Slack, there are distinct methods that you can pass **listener functions** to handle and respond to the event.

### Methods
Below is the current list of methods that accept listener functions. These methods handle specific event types coming from Slack, and typically include an identifying parameter before the listener function. The identifying parameter (included below) narrows the events to specific interactions that your listener function is intended to handle, such as a specific `callback_id`, or a certain substring within a message.

| Method                          | Description |
| :--- | :--- |
| `app.event(eventType, fn);`     | Listens for Events API events. The `eventType` is a `string` to identify a [specific event](https://docs.slack.dev/reference/events) to handle (which must be subscribed to in your app's configuration).   |
| `app.message([pattern ,] fn);`  | Convenience method to listen specifically to the [`message`](https://docs.slack.dev/reference/events/message) event. The pattern parameter can be any substring (`string`) or `RegExp` expression, which will be used to identify the incoming message. |
| `app.action(actionId, fn);`     | Listens for an action event from a Block Kit element, such as a user interaction with a button, select menu, or datepicker. The `actionId` identifier is a `string` that should match the unique `action_id` included when your app sends the element to a view. Note that a view can be a message, modal, or app home. Note that action elements included in an `input` block do not trigger any events.
| `app.shortcut(callbackId, fn);` | Listens for global or message shortcut invocation. The `callbackId` is a `string` or `RegExp` that must match a shortcut `callback_id` specified within your app's configuration.
| `app.view(callbackId, fn);`     | Listens for `view_submission` and `view_closed` events. `view_submission` events are sent when a user submits a modal that your app opened. `view_closed` events are sent when a user closes the modal rather than submits it.
| `app.step(workflowStep)` | Listen and responds to steps from apps events using the callbacks passed in an instance of `WorkflowStep`. Callbacks include three callbacks: `edit`, `save`, and `execute`. More information on steps from apps can be found [in the documentation](/legacy/steps-from-apps).
| `app.command(commandName, fn);` | Listens for slash command invocations. The `commandName` is a `string` that must match a slash command specified in your app's configuration. Slash command names should be prefaced with a `/` (ex: `/helpdesk`).
| `app.options(actionId, fn);`    | Listens for options requests (from select menus with an external data source). This isn't often used, and shouldn't be mistaken with `app.action`. The `actionId` identifier is a `string` that matches the unique `action_id` included when you app sends a [select with an external data source](https://docs.slack.dev/reference/block-kit/block-elements/multi-select-menu-element/#external_multi_select).

#### Constraint objects
There are a collection of constraint objects that some methods have access to. These can be used to narrow the event your listener function handles, or to handle special cases. Constraint objects can be passed in lieu of the identifiers outlined above. Below is a collection of constraint objects and the methods they can be passed to.

| Method                                         | Options | Details |
| :--- | :--- | :--- |
| `app.action(constraints, fn)` | `block_id`, `action_id`, `callback_id`, (,`type`) | Listens for more than just the `action_id`. `block_id` is the ID for the element's parent block. `callback_id` is the ID of the view that is passed when instantiating it (only used when action elements are in modals). To specifically handle an action element in blocks or in legacy attachments, you can use `type` with the value of `block_actions` or `interactive_message` respectively. |
| `app.shortcut(constraints, fn)` | `type`, `callback_id` | Allows specification of the type of shortcut. `type` must either be `shortcut` for **global shortcuts** or `message_action` for **message_shortcuts**. `callbackId` can be a `string` or `RegExp`. |
| `app.view(constraints, fn)` | `type`, `callback_id` | `type` must either be `view_closed` or `view_submission`, which determines what specific event your listener function is sent. `callback_id` is the `callback_id` of the view that is sent when your app opens the modal. |
| `app.options(constraints, fn)` | `block_id`, `action_id`, `callback_id` | Optionally listens for `block_id` and `callback_id` in addition to `action_id`. `callback_id` can only be passed when handling options elements within modals. |

### Listener function arguments
Listener functions have access to a set of arguments that may change based on the method which the function is passed to. Below is an explanation of the different arguments. The below table details the different arguments and the methods they'll be accessible in.

| Argument  | Listener | Description  |
| :--- | :--- | :--- |
| `payload` | All listeners | The unwrapped contents of the incoming event, which varies based on event. This is a subset of the information included in `body` which is detailed below. `payload` is also accessible via the alias corresponding to the method name that the listener is passed to (`message`, `event`, `action`, `shortcut`, `view`, `command`, `options`) **An easy way to understand what's in a payload is to log it**, or [use TypeScript](https://github.com/slackapi/bolt-js/tree/main/examples/getting-started-typescript). |
| `say` | `message`, `event`, `action` `command` | Function to send a message to the channel associated with the incoming event. This argument is only available when the listener is triggered for events that contain a channel ID (the most common being `message` events). `say` accepts simple strings (for plain-text messages) and objects (for messages containing blocks). `say` returns a promise that will resolve with a [`chat.postMessage` response](https://docs.slack.dev/reference/methods/chat.postMessage). If you're using an the `action` method, or an event other than `message`, you should [ensure that the event payload contains a channel ID](https://docs.slack.dev/reference/events). |
| `ack` | `action`, `shortcut`, `view`, `command`, `options` | Function that **must** be called to acknowledge that an incoming event was received by your app. `ack` returns a promise that resolves when complete. Read more in [Acknowledging requests](/concepts/acknowledge) |
| `client` | All listeners | Web API client that uses the token associated with that event. For single-workspace installations, the token is provided to the constructor. For multi-workspace installations, the token is returned by the `authorize` function. |
| `respond` | `action`, `shortcut`, `view`, `command` | Function that responds to an incoming event **if** it contains a `response_url`. `respond` returns a promise that resolves with the results of responding using the `response_url`. For shortcuts, `respond` will **only** work for message shortcuts (not global shortcuts). For views, `respond` will **only** work when using `response_url_enabled: true` for [conversations list](https://docs.slack.dev/reference/block-kit/block-elements/multi-select-menu-element/#conversation_multi_select) and [channels list](https://docs.slack.dev/reference/block-kit/block-elements/multi-select-menu-element/#channel_multi_select) select menus in input blocks in modals. |
| `context` | All listeners | Event context. This object contains data about the event and the app, such as the `botId`. Middleware can add additional context before the event is passed to listeners. |
| `body` | All listeners | Object that contains the entire body of the request (superset of `payload`). Some accessory data is only available outside of the payload (such as `trigger_id` and `authorizations`). |
| `logger` | All listeners | The application logger with all of [the logging functions](/concepts/logging) for output. |

#### Body and payload references
The structure of the `payload` and `body` is detailed on the API site:
- `action`: [`body`](https://docs.slack.dev/reference/interaction-payloads/block_actions-payload) and [`payload`s](https://docs.slack.dev/reference/block-kit/block-elements)
- `event`: [`body`](https://docs.slack.dev/reference/objects/event-object) and [`payload`s](https://docs.slack.dev/reference/events)
- `shortcut`: [`body` and `payload`](https://docs.slack.dev/reference/interaction-payloads/shortcuts-interaction-payload)
- `command`: [`body` ](https://docs.slack.dev/interactivity/implementing-slash-commands)
- `view`: [`view_submission` `body` and `payload`](https://docs.slack.dev/reference/interaction-payloads/view-interactions-payload#view_submission); [`view_closed` `body` and `payload`](https://docs.slack.dev/reference/interaction-payloads/view-interactions-payload#view_closed)
- `options`: [`body` and `payload`](https://docs.slack.dev/reference/block-kit/block-elements/multi-select-menu-element#external_multi_select)

### Difference from listener middleware
Listener middleware is used to implement logic across many listener functions (though usually not all of them). Listener middleware has the same arguments as the above listener functions, with one distinction: they also have a `next()` function that **must** be called in order to pass the chain of execution. Learn more about listener middleware [in the documentation](/concepts/listener-middleware).

## Built-in middleware functions

Bolt offers a variety of built-in middleware functions to help simplify development of your Slack applications. These middleware functions implement common patterns to help filter out or focus your own listener function implementations.

These middleware functions are exported from the main `@slack/bolt` package for you to easily `import` in your applications:

```javascript
import { matchMessage } from '@slack/bolt';
app.message(matchMessage('hello'), async ({ message, logger }) => {
  // this function will now only execute if "hello" is present in the message
});
```

These middleware functions are divided into two groups: [global middleware functions](/concepts/global-middleware) and [listener middleware functions](/concepts/listener-middleware).

### Built-in global middleware functions

- `ignoreSelf()`: Filters out any event that originates from the app. Note that this middleware is enabled by default via the [`ignoreSelf` App initialization options](#app-options).
- `onlyActions`: Filters out any event that isn't an action.
- `onlyCommands`: Filters out any event that isn't a command.
- `onlyEvents`: Allows for only events to propagate down the middleware chain.
- `onlyOptions`: Filters out any event that isn't a drop-down-options event.
- `onlyShortcuts`: Filters out any event that isn't a shortcut.
- `onlyViewActions`: Filters out any event that isn't a `view_submission` or `view_closed` event.

### Built-in listener middleware functions

- `directMention()`: Filters out any `message` event whose text does not start with an @-mention of the handling app.
- `matchCommandName(pattern)`: Filters out any shortcut command whose name does not match the provided `pattern`; `pattern` can be a string or regular expression.
- `matchConstraints(constraint)`: Filters out any `block_action`, View or Options event that does not match the properties of the provided `constraint` object. Supported `constraint` object properties include:
  - `block_id` and `action_id`: for filtering out `block_action` events that do not match the provided IDs.
  - `callback_id`: for filtering out `view_*` events not matching the provided `callback_id`.
  - `type`: for filtering out any event `type`s not matching the provided `type`.
- `matchEventType(pattern)`: filters out any event whose `type` does not match the provided `pattern`. `pattern` can be a string or regular expression.
- `matchMessage(pattern)`: filters out any `message` or `app_mention` events whose message contents do not match the provided `pattern`. `pattern` can be a string or regular expression.
- `subtype(type)`: Filters out any `message` event whose `subtype` does not exactly equal the provided `type`.

## Initialization options
Bolt includes a collection of initialization options to customize apps. There are two primary kinds of options: Bolt app options and receiver options. The receiver options may change based on the receiver your app uses. The following receiver options are for the default `HTTPReceiver` (so they'll work as long as you aren't using a custom receiver).

### Receiver options
`HTTPReceiver` options can be passed into the `App` constructor, just like the Bolt app options. They'll be passed to the `HTTPReceiver` instance upon initialization.

| Option  | Description  |
| :--- | :--- |
| `signingSecret` | A `string` from your app's configuration (under "Basic Information") which verifies that incoming events are coming from Slack |
| `endpoints` | A `string` or `object` that specifies the endpoint(s) that the receiver will listen for incoming requests from Slack. Currently, the only key for the object is `key`, the value of which is the customizable endpoint (ex: `/myapp/events`). **By default, all events are sent to the `/slack/events` endpoint** |
| `processBeforeResponse` | `boolean` that determines whether events should be immediately acknowledged. This is primarily useful when running apps on FaaS since listeners will terminate immediately once the request has completed. When set to `true` it will defer sending the acknowledgement until after your handlers run to prevent early termination. Defaults to `false`.  |
| `clientId` | The client ID `string` from your app's configuration which is [required to configure OAuth](/concepts/authenticating-oauth). |
| `clientSecret` | The client secret `string` from your app's configuration which is [required to configure OAuth](/concepts/authenticating-oauth). |
| `stateSecret` | Recommended parameter (`string`) that's passed when [configuring OAuth](/concepts/authenticating-oauth) to prevent CSRF attacks |
| `installationStore` | Defines how to save, fetch and delete installation data when [configuring OAuth](/concepts/authenticating-oauth). Contains three methods: `fetchInstallation`, `storeInstallation` and `deleteInstallation`. The default `installationStore` is an in-memory store. |
| `scopes` | Array of scopes that your app will request [within the OAuth process](/concepts/authenticating-oauth). |
| `installerOptions` | Optional object that can be used to customize [the default OAuth support](/concepts/authenticating-oauth). Read more in the OAuth documentation. |
| `dispatchErrorHandler` | Error handler triggered if an incoming request is to an unexpected path. More details available in the [Error Handling documentation](/concepts/error-handling). |
| `processEventErrorHandler` | Error handler triggered if event processing threw an exception. More details available in the [Error Handling documentation](/concepts/error-handling). |
| `unhandledRequestHandler` | Error handler triggered when a request from Slack goes unacknowledged. More details available in the [Error Handling documentation](/concepts/error-handling). |
| `unhandledRequestTimeoutMillis` | How long to wait, in milliseconds, from the time a request is received to when the `unhandledRequestHandler` should be triggered. Default is `3001`. More details available in the [Error Handling documentation](/concepts/error-handling). |
| `signatureVerification` | `boolean` that determines whether Bolt should [verify Slack's signature on incoming requests](https://docs.slack.dev/authentication/verifying-requests-from-slack). Defaults to `true`. |
| `customPropertiesExtractor` | Optional `function` that can extract custom properties from an incoming receiver event -- for example, extracting custom headers to propagate to other services. The function receives one argument that will have the type of the event received by your receiver (e.g. an HTTP request or websocket message) and should return an object with string keys containing your custom properties. More details available in the [Customizing a receiver documentation](/concepts/receiver). |

### App options
App options are passed into the `App` constructor. When the `receiver` argument is `undefined` the `App` constructor also accepts the [above `Receiver` options](#receiver-options) to initialize either a `HttpReceiver` or a `SocketModeReceiver` depending on the value of the `socketMode` argument.

| Option  | Description  |
| :--- | :--- |
| `receiver` | An instance of `Receiver` that parses and handles incoming events. Must conform to the [`Receiver` interface](/concepts/receiver), which includes `init(app)`, `start()`, and `stop()`. More information about receivers is [in the documentation](/concepts/receiver). |
| `agent` | Optional HTTP `Agent` used to set up proxy support. Read more about custom agents in the [Node Slack SDK documentation](https://tools.slack.dev/node-slack-sdk/web-api#proxy-requests-with-a-custom-agent). |
| `clientTls` |  Optional `string` to set a custom TLS configuration for HTTP client requests. Must be one of: `"pfx"`, `"key"`, `"passphrase"`, `"cert"`, or `"ca"`. |
| `convoStore` | A store to set and retrieve state-related conversation information. `set()` sets conversation state and `get()` fetches it. By default, apps have access to an in-memory store. More information and an example can be found [in the documentation](/concepts/conversation-store). |
| `token` | A `string` from your app's configuration (under "Settings" > "Install App") required for calling the Web API. May not be passed when using `authorize`, `orgAuthorize`, or OAuth. |
| `botId` | Can only be used when `authorize` is not defined. The optional `botId` is the ID for your bot token (ex: `B12345`) which can be used to ignore messages sent by your app. If a `xoxb-` token is passed to your app, this value will automatically be retrieved by your app calling the [`auth.test` method](https://docs.slack.dev/reference/methods/auth.test). |
| `botUserId` | Can only be used when `authorize` is not defined. The optional `botUserId` is distinct from the `botId`, as it's the user ID associated with your bot user used to identify direct mentions. If a `xoxb-` token is passed to your app, this value will automatically be retrieved by your app calling the [`auth.test` method](https://docs.slack.dev/reference/methods/auth.test). |
| `authorize` | Function for multi-team installations that determines which token is associated with the incoming event. The `authorize` function is passed source data that sometimes contains a `userId`, `conversationId`, `enterpriseId`, `teamId` and `isEnterpriseInstall` (depending which information the incoming event contains). An `authorize` function should either return a `botToken`, `botId`, and `botUserId`, or could return a `userToken`. If using [built-in OAuth support](/concepts/authenticating-oauth), an `authorize` function will automatically be created so you do not need to pass one in. More information about `authorization` functions can be found on   |
| `logger` | Option that allows you to pass a custom logger rather than using the built-in one. Loggers must implement specific methods ([the `Logger` interface](https://github.com/slackapi/node-slack-sdk/blob/main/packages/logger/src/index.ts)), which includes `setLevel(level: LogLevel)`, `getLevel()`, `setName(name: string)`, `debug(...msgs: any[])`, `info(...msgs: any[])`, `warn(...msgs: any[])`, and `error(...msgs: any[])`. More information about logging are [in the documentation](/concepts/logging)  |
| `logLevel` | Option to control how much or what kind of information is logged. The `LogLevel` export contains the possible levels–in order of most to least information: `DEBUG`, `INFO`, `WARN`, and `ERROR`. By default, `logLevel` is set to `INFO`. More information on logging can be found [in the documentation](/concepts/logging). |
| `extendedErrorHandler` | Option that accepts a `boolean` value. When set to `true`, the global error handler is passed an object with additional request context. Available from version 3.8.0, defaults to `false`. More information on advanced error handling can be found [in the documentation](/concepts/error-handling). |
| `ignoreSelf` | `boolean` to enable a middleware function that ignores any messages coming from your app. Requires a `botId`. Defaults to `true`.  |
| `clientOptions.slackApiUrl` | Allows setting a custom endpoint for the Slack API. Used most often for testing. |
| `socketMode` | Option that accepts a `boolean` value. When set to `true` the app is started in [Socket Mode](/concepts/socket-mode), i.e. it allows your app to connect and receive data from Slack via a WebSocket connection. Defaults to `false`.
| `developerMode` | `boolean` to activate the developer mode. When set to `true` the `logLevel` is automatically set to `DEBUG` and `socketMode` is set to `true`. However, explicitly setting these two properties takes precedence over implicitly setting them via `developerMode`. Furthermore, a custom OAuth failure handler is provided to help debugging. Finally, the body of all incoming requests are logged and thus sensitive information like tokens might be contained in the logs. Defaults to `false`.  |
| `deferInitialization` | `boolean` to defer initialization of the app and places responsibility for manually calling the `async` `App#init()` method on the developer. `init()` must be called before `App#start()`. Defaults to `false`. |
| `signatureVerification` | `boolean` that determines whether Bolt should [verify Slack's signature on incoming requests](https://docs.slack.dev/authentication/verifying-requests-from-slack). Defaults to `true`. |

:::info 

Bolt's client is an instance of `WebClient` from the [Node Slack SDK](https://tools.slack.dev/node-slack-sdk), so some of that documentation may be helpful as you're developing.

:::

## Agents & Assistants

### The `AssistantConfig` configuration object

| Property | Required? | Description | 
|---|---|---|
|`threadContextStore` | Optional | When provided, must have the required methods to get and save thread context, which will override the `getThreadContext` and `saveThreadContext` utilities. <br/> <br/> If not provided, a `DefaultAssistantContextStore` instance is used.
| `threadStarted` | Required | Executes when the user opens the assistant container or otherwise begins a new chat, thus sending the [`assistant_thread_started`](https://docs.slack.dev/reference/events/assistant_thread_started) event.
| `threadContextChanged` | Optional | Executes when a user switches channels while the assistant container is open, thus sending the [`assistant_thread_context_changed`](https://docs.slack.dev/reference/events/assistant_thread_context_changed) event. <br/> <br/>  If not provided, context will be saved using the AssistantContextStore's `save` method (either the `DefaultAssistantContextStore` instance or provided `threadContextStore`).
| `userMessage` | Required |  Executes when a [message](https://docs.slack.dev/reference/events/message) is received, thus sending the [`message.im`](https://docs.slack.dev/reference/events/message.im) event. These messages do not contain a subtype and must be deduced based on their shape and metadata (if provided). Bolt handles this deduction out of the box for those using the `Assistant` class.

### Assistant utilities 

Utility | Description
|---|---|
| `getThreadContext` | Alias for `AssistantContextStore.get()` method. Executed if custom `AssistantContextStore` value is provided.  <br/><br/>  If not provided, the `DefaultAssistantContextStore` instance will retrieve the most recent context saved to the instance.
| `saveThreadContext` | Alias for `AssistantContextStore.save()`. Executed if `AssistantContextStore` value is provided. <br/> <br/> If not provided, the `DefaultAssistantContextStore` instance will save the `assistant_thread.context` to the instance and attach it to the initial assistant message that was sent to the thread.
| `say(message: string)` | Alias for the `postMessage` method.<br/><br/> Sends a message to the current assistant thread.
| `setTitle(title: string)` | [Sets the title](https://docs.slack.dev/reference/methods/assistant.threads.setTitle) of the assistant thread to capture the initial topic/question.
| `setStatus(status: string)` | Sets the [status](https://docs.slack.dev/reference/methods/assistant.threads.setStatus) of the assistant to give the appearance of active processing.
| `setSuggestedPrompts({ prompts: [{ title: string; message: string; }] })` | Provides the user up to 4 optional, preset [prompts](https://docs.slack.dev/reference/methods/assistant.threads.setSuggestedPrompts) to choose from.

## Framework error types
Bolt includes a set of error types to make errors easier to handle, with more specific contextual information. Below is a non-exhaustive list of error codes you may run into during development:

| Error code                         | Details |
| :--- | :--- |
| `AppInitializationError` | Invalid initialization options were passed. This could include not passing a signing secret, or passing in conflicting options (for example, you can't pass in both `token` and `authorize`). Includes an `original` property with more details. This error is only thrown during initialization (within the App's constructor). |
| `AuthorizationError` | Error exclusively thrown when installation information can't be fetched or parsed. You may encounter this error when using the built-in OAuth support, or you may want to import and use this error when building your own `authorize` function. |
| `ContextMissingPropertyError` | Error thrown when the `context` object is missing necessary information, such as not including `botUserId` or `botId` when `ignoreSelf` is set to `true`. The missing property is available in the `missingProperty` property. |
| `ReceiverMultipleAckError` | Error thrown within Receiver when your app calls `ack()` when that request has previously been acknowledged. Currently only used in the default `HTTPReceiver`. |
| `ReceiverAuthenticityError` | Error thrown when your app's request signature could not be verified. The error includes information on why it failed, such as an invalid timestamp, missing headers, or invalid signing secret.
| `MultipleListenerError` | Thrown when multiple errors occur when processing multiple listeners for a single event. Includes an `originals` property with an array of the individual errors. |
| `WorkflowStepInitializationError` | Error thrown when configuration options are invalid or missing when instantiating a new `WorkflowStep` instance. This could be scenarios like not including a `callback_id`, or not including a configuration object. More information on steps from apps [can be found in the documentation](/legacy/steps-from-apps).  |
| `UnknownError` | An error that was thrown inside the framework but does not have a specified error code. Contains an `original` property with more details. |

:::info 

You can find the code for error definition and construction within [errors.ts](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts).

:::

### Client errors
Bolt imports a `WebClient` to call Slack's APIs. Below is a set of errors you may encounter when making API calls with the client, though you can read more [in the web API documentation](https://tools.slack.dev/node-slack-sdk/web-api#handle-errors). When handling client errors, more information can be found in the body within the `data` property.

| Error code | Details |
| :--- | :--- |
| `PlatformError` | Error received when calling a Slack API. Includes a `data` property. |
| `RequestError` | A request could not be sent, perhaps because your network connection is not available. It has an `original` property with more details. |
| `RateLimitedError` | Your app has made too many requests too quickly. Includes a `retryAfter` property with the number of seconds you should wait before trying to send again. The `WebClient` will handle rate limit errors by default–[you can read more in the documentation](https://tools.slack.dev/node-slack-sdk/web-api#rate-limits). |
| `HTTPError` | The HTTP response contained an unfamiliar status code. The Web API only responds with `200` (including for errors), or `429` for rate limiting. |
