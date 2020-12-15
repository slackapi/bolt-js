---
title: App reference and app configuration
order: 1
slug: reference
lang: en
layout: fullpage
permalink: /reference
---
# Interface and initialization options

<div class="section-content">
This guide is intended to list and explain the Bolt interface–including listeners and their arguments, initialization options, and frequently asked questions.
</div> 

It may be helpful to go through the ⚡️[Getting Started guide](/getting-started) to learn the basics of building and instantiating Bolt for JavaScript apps.

---

## Listener middleware
Slack apps typically receive and/or respond to one to many incoming events from Slack. This can be something like listening to an Events API event (like when a link associated with your app is shared) or a user invoking one of your app's shortcuts. For each type of incoming request from Slack, there are distinct methods that you can pass **listener middleware functions** to handle and respond to the event.

### Methods
Below is the current list of methods that accept listener functions. These methods handle specific event types coming from Slack, and typically include an identifing parameter before the listener function. The identifying parameter (included below) narrows the events to specific interactions that your listener function is intended to handle, such as a specific `callback_id`, or a certain substring within a message.

| Method                          | Description |
|--------------------------------------------------------------------|
| `app.event(eventType, fn);`     | Listens for Events API events. The `eventType` is a `string` to identify a [specific event](https://api.slack.com/events) to handle (which must be subscribed to in your app's configuration).   | 
| `app.message([pattern ,] fn);`  | Convenience method to listen specifically to the [`message` event](https://api.slack.com/events/message). The pattern parameter can be any substring (`string`) or `RegExp` expression, which will be used to identify the incoming message. | 
| `app.action(actionId, fn);`     | Listens for an action event from a Block Kit element, such as a user interaction with a button, select menu, or datepicker. The `actionId` identifier is a `string` that should match the unique `action_id` included when your app sends the element to a view. Note that a view can be a message, modal, or app home. Note that action elements included in an `input` block do not trigger any events.
| `app.shortcut(callbackId, fn);` | Listens for global or message shortcut invocation. The `callbackId` is a `string` or `RegExp` that must match a shortcut `callback_id` specified within your app's configuration.
| `app.command(commandName, fn);` | Listens for slash command invocations. The `commandName` is a `string` that must match a slash command specified in your app's configuration. Slash command names should be prefaced with a `/` (ex: `/helpdesk`).
| `app.view(callbackId, fn);`     | Listens for `view_submission` and `view_closed` events. `view_submission` events are sent when a user submits a modal that your app opened. `view_closed` events are sent when a user closes the modal rather than submits it.
| `app.options(actionId, fn);`    | Listens for options requests (from select menus with an external data source). This isn't often used, and shouldn't be mistaken with `app.action`. The `actionId` identifier is a `string` that matches the unique `action_id` included when you app sends a [select with an external data source](https://api.slack.com/reference/block-kit/block-elements#external_select).

⚙️ There are also **[globally-scoped middleware functions](/concepts#global-middleware)** that will be run for all incoming events.

#### Constraint objects
There are a collection of constraint objects that some methods have access to. These can be used to narrow the event your listener function handles, or to handle special cases. Constraint objects can be passed in lieu of the identifiers outlined above. Below is a collection of constraint objects and the methods they can be passed to. 

| Method                          | Options | Details |
|--------------------------------------------------------------------|
| `app.action(constraints, fn)` | `block_id`, `action_id`, `callback_id` | Listens for more than just the `action_id`. `block_id` is the ID for the block that contains the action element. `callback_id` is the `callback_id` of the parent view that is passed when instantiating it. `callback_id`s can only be passed when handling action elements within modals. |
| `app.shortcut(constraints, fn)` | `type`, `callback_id` | Allows specification of the type of shortcut. `type` must either be `shortcut` for **global shortcuts** or `message_action` for **message_shortcuts**. `callbackId` can be a `string` or `RegExp`. |
| `app.view(constraints, fn)` | `type`, `callback_id` | `type` must either be `view_closed` or `view_submission`, which determines what specific event your listener function is sent. `callback_id` is the `callback_id` of the view that is sent when your app opens the modal. |
| `app.action(constraints, fn);` | `type` | Used primarily to listen to legacy interactive message payloads. Type must be `block_actions` or `interactive_message` |

### Listener function arguments
Listener middleware functions have access to a set of arguments that may change based on the method which the function is passed to. Below is an explanation of the different arguments. The below table details the different arguments and the methods they'll be accessible in.

| Argument  | Description  |
| :---: | :--- |
| `payload` | All listeners | The unwrapped contents of the incoming event, which varies based on event. This is a subset of the information included in `body` which is detailed below. `payload` is also accessible via the alias corresponding to the method name that the lisener is passed to (`message`, `event`, `action`, `shortcut`, `view`, `command`, `options`) **An easy way to understand what's in a payload is to log it**, or [use TypeScript](https://slack.dev/bolt-js/tutorial/using-typescript). |
| `say` | `message`, *`event`, *`action` `command` | Function to send a message to the channel associated with the incoming event. This argument is only available when the listener is triggered for events that contain a channel ID (the most common being `message` events). `say` accepts simple strings (for plain-text messages) and objects (for messages containing blocks). `say` returns a promise that will resolve with a [`chat.postMessage` response](https://api.slack.com/methods/chat.postMessage). If you're using an the `action` method, or an event other than `message`, you should [ensure that the event payload contains a channel ID](https://api.slack.com/events).
| `ack` | `action`, `shortcut`, `view`, `command` | Function that **must** be called to acknowledge that an incoming event was received by your app. `ack` returns a promise that resolves when complete. Read more in [Acknowledging events](#acknowledging-events)
| `client` | All listeners | Web API client that uses the token associated with that event. For single-workspace installations, the token is provided to the constructor. For multi-workspace installations, the token is returned by the `authorize` function.
| `respond` | `shortcut`, `action`, `command` | Function that responds to an incoming event **if** it contains a `response_url`. `respond` returns a promise that resolves with the results of responding using the `response_url`.
| `context` | All listeners | Event context. This object contains data about the event and the app, such as the `botId`. Middleware can add additional context before the event is passed to listeners.
| `body` | All listeners | Object that contains the entire body of the request (superset of `payload`). Some accessory data is only available outside of the payload (such as `trigger_id` and `authorizations`).

#### Body and payload references
The structure of the `payload` and `body` is detailed on the API site:
- `action`: [`body`](https://api.slack.com/reference/interaction-payloads/block-actions) and [`payload`s](https://api.slack.com/reference/block-kit/block-elements)
- `event`: [`body`](https://api.slack.com/types/event) and [`payload`s](https://api.slack.com/events)
- `shortcut`: [`body` and `payload`](https://api.slack.com/reference/interaction-payloads/shortcuts)
- `command`: [`body` ](https://api.slack.com/interactivity/slash-commands)
- `view`: [`view_submission` `body` and `payload`](https://api.slack.com/reference/interaction-payloads/views#view_submission); [`view_closed` `body` and `payload`](https://api.slack.com/reference/interaction-payloads/views#view_closed)
- `options`: [`body`] and [`payload`](https://api.slack.com/reference/block-kit/block-elements#external_select)

## Initialization options
Bolt includes a collection of initialization options to customize apps. There are two primary kinds of options: Bolt app options and receiver options. The receiver options may change based on the receiver your app uses. The following receiver options are for the default `ExpressReceiver` (so they'll work as long as you aren't using a custom receiver).

### Receiver options
`ExpressReceiver` options can be passed into the app constructor, just like the Bolt app options.

| Option  | Description  |
| :---: | :--- |
| `signingSecret` | A `string` from your app's configuration which verifies that incoming events are coming from Slack |
| `endpoints` | A `string` or `object` that specifies the endpoint(s) that the receiver will listen for incoming requests from Slack. For `object`, the `key` is the type of events (ex: `events`), and the value is the endpoint (ex: `/myapp/events`). **By default, all events are sent to the `/slack/events` endpoint** |
| `processBeforeResponse` | todo |
| `clientId` | The client ID `string` from your app's configuration which is [required to implement OAuth](/concepts#authenticating-oauth). |
| `clientSecret` | The client secret `string` from your app's configuration which is [required to implement OAuth](/concepts#authenticating-oauth). |
| `stateSecret` | todo |
| `installationStore` | todo |
| `scopes` | todo |
| `installerOptions` | todo |

### App options

| Option  | Description  |
| :---: | :--- |
| `agent` | todo |
| `clientTls` |  todo |
| `convoStore` | todo |
| `token` | A `string` from your app's configuration required for calling the Web API. |
| `botId` | todo |
| `botUserId` | todo |
| `authorize` | todo |
| `orgAuthorize` | todo |
| `receiver` | todo |
| `logger` | todo |
| `logLevel` | todo |
| `ignoreSelf` | todo |
| `clientOptions` | todo | 

> Bolt's client is an instance of `WebClient` from the [Node Slack SDK](https://slack.dev/node-slack-sdk). The `clientOptions` object can use any options from the [`WebClient`'s documentation](https://slack.dev/node-slack-sdk/web-api).
