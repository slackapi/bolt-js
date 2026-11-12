---
sidebar_label: "App"
---

# App\<AppCustomContext\>

Defined in: [src/App.ts:233](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L233)

A Slack App

## Type Parameters

### AppCustomContext

`AppCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

## Constructors

### Constructor

```ts
new App<AppCustomContext>(__namedParameters?): App<AppCustomContext>;
```

Defined in: [src/App.ts:289](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L289)

#### Parameters

##### \_\_namedParameters?

[`AppOptions`](../interfaces/AppOptions.md) = `{}`

#### Returns

`App`\<`AppCustomContext`\>

## Properties

### client

```ts
client: WebClient;
```

Defined in: [src/App.ts:235](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L235)

Slack Web API client

***

### logger

```ts
logger: Logger;
```

Defined in: [src/App.ts:246](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L246)

Logger

## Accessors

### webClientOptions

#### Get Signature

```ts
get webClientOptions(): WebClientOptions;
```

Defined in: [src/App.ts:493](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L493)

##### Returns

`WebClientOptions`

## Methods

### action()

#### Call Signature

```ts
action<Action, MiddlewareCustomContext>(actionId, ...listeners): void;
```

Defined in: [src/App.ts:735](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L735)

##### Type Parameters

###### Action

`Action` *extends* [`SlackAction`](../type-aliases/SlackAction.md) = [`SlackAction`](../type-aliases/SlackAction.md)

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### actionId

`string` \| `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackActionMiddlewareArgs`](../type-aliases/SlackActionMiddlewareArgs.md)\<`Action`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
action<Action, Constraints, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:742](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L742)

##### Type Parameters

###### Action

`Action` *extends* [`SlackAction`](../type-aliases/SlackAction.md) = [`SlackAction`](../type-aliases/SlackAction.md)

###### Constraints

`Constraints` *extends* [`ActionConstraints`](../interfaces/ActionConstraints.md)\<`Action`\> = [`ActionConstraints`](../interfaces/ActionConstraints.md)\<`Action`\>

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### constraints

`Constraints`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackActionMiddlewareArgs`](../type-aliases/SlackActionMiddlewareArgs.md)\<`Extract`\<`Action`, \{
  `type`: `Constraints`\[`"type"`\];
\}\>\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

***

### assistant()

```ts
assistant(assistant): this;
```

Defined in: [src/App.ts:514](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L514)

Register Assistant middleware

#### Parameters

##### assistant

[`Assistant`](Assistant.md)

global assistant middleware function

#### Returns

`this`

***

### command()

```ts
command<MiddlewareCustomContext>(commandName, ...listeners): void;
```

Defined in: [src/App.ts:788](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L788)

#### Type Parameters

##### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

#### Parameters

##### commandName

`string` \| `RegExp`

##### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackCommandMiddlewareArgs`](../interfaces/SlackCommandMiddlewareArgs.md), `AppCustomContext` & `MiddlewareCustomContext`\>[]

#### Returns

`void`

***

### error()

#### Call Signature

```ts
error(errorHandler): void;
```

Defined in: [src/App.ts:884](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L884)

##### Parameters

###### errorHandler

`ErrorHandler`

##### Returns

`void`

#### Call Signature

```ts
error(errorHandler): void;
```

Defined in: [src/App.ts:885](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L885)

##### Parameters

###### errorHandler

`ExtendedErrorHandler`

##### Returns

`void`

***

### event()

#### Call Signature

```ts
event<EventType, MiddlewareCustomContext>(eventName, ...listeners): void;
```

Defined in: [src/App.ts:577](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L577)

##### Type Parameters

###### EventType

`EventType` *extends* `string` = `string`

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### eventName

`EventType`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackEventMiddlewareArgs`](../type-aliases/SlackEventMiddlewareArgs.md)\<`EventType`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
event<EventType, MiddlewareCustomContext>(eventName, ...listeners): void;
```

Defined in: [src/App.ts:581](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L581)

##### Type Parameters

###### EventType

`EventType` *extends* `RegExp` = `RegExp`

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### eventName

`EventType`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackEventMiddlewareArgs`](../type-aliases/SlackEventMiddlewareArgs.md)\<`string`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

***

### function()

#### Call Signature

```ts
function(
   callbackId, 
   options?, 
   ...listeners
): this;
```

Defined in: [src/App.ts:528](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L528)

Register a listener for a custom function's execution.

##### Parameters

###### callbackId

`string`

Unique callback ID of the custom function.

###### options?

[`SlackEventMiddlewareArgsOptions`](../type-aliases/SlackEventMiddlewareArgsOptions.md)

Configurations for the listener.

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<`SlackCustomFunctionMiddlewareArgs`\>[]

Middleware handlers to call.

##### Returns

`this`

##### See

 - [https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/)
 - [https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options](https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options)

#### Call Signature

```ts
function(callbackId, ...listeners): this;
```

Defined in: [src/App.ts:533](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L533)

Register a listener for a custom function's execution.

##### Parameters

###### callbackId

`string`

Unique callback ID of the custom function.

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<`SlackCustomFunctionMiddlewareArgs`\>[]

Middleware handlers to call.

##### Returns

`this`

##### See

 - [https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/)
 - [https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options](https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options)

***

### init()

```ts
init(): Promise<void>;
```

Defined in: [src/App.ts:458](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L458)

#### Returns

`Promise`\<`void`\>

***

### message()

#### Call Signature

```ts
message<MiddlewareCustomContext>(...listeners): void;
```

Defined in: [src/App.ts:618](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L618)

##### Type Parameters

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### listeners

...`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>[]

Middlewares that process and react to a message event

##### Returns

`void`

#### Call Signature

```ts
message<MiddlewareCustomContext>(pattern, ...listeners): void;
```

Defined in: [src/App.ts:627](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L627)

##### Type Parameters

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### pattern

`string` \| `RegExp`

Used for filtering out messages that don't match.
Strings match via String.prototype.includes.

###### listeners

...`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>[]

Middlewares that process and react to the message events that matched the provided patterns.

##### Returns

`void`

#### Call Signature

```ts
message<MiddlewareCustomContext>(
   filter, 
   pattern, 
   ...listeners
): void;
```

Defined in: [src/App.ts:639](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L639)

##### Type Parameters

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### filter

`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>

Middleware that can filter out messages. Generally this is done by returning before
calling [AllMiddlewareArgs.next](../interfaces/AllMiddlewareArgs.md#next) if there is no match. See [directMention](../variables/directMention.md) for an example.

###### pattern

`string` \| `RegExp`

Used for filtering out messages that don't match the pattern. Strings match
via String.prototype.includes.

###### listeners

...`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>[]

Middlewares that process and react to the message events that matched the provided pattern.

##### Returns

`void`

#### Call Signature

```ts
message<MiddlewareCustomContext>(filter, ...listeners): void;
```

Defined in: [src/App.ts:650](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L650)

##### Type Parameters

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### filter

`MessageEventMiddleware`

Middleware that can filter out messages. Generally this is done by returning before calling
[AllMiddlewareArgs.next](../interfaces/AllMiddlewareArgs.md#next) if there is no match. See [directMention](../variables/directMention.md) for an example.

###### listeners

...`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>[]

Middlewares that process and react to the message events that matched the provided patterns.

##### Returns

`void`

#### Call Signature

```ts
message<MiddlewareCustomContext>(...patternsOrMiddleware): void;
```

Defined in: [src/App.ts:660](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L660)

This allows for further control of the filtering and response logic. Patterns and middlewares are processed in
the order provided. If any patterns do not match, or a middleware does not call [AllMiddlewareArgs.next](../interfaces/AllMiddlewareArgs.md#next),
all remaining patterns and middlewares will be skipped.

##### Type Parameters

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### patternsOrMiddleware

...(
  \| `string`
  \| `RegExp`
  \| `MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>)[]

A mix of patterns and/or middlewares.

##### Returns

`void`

***

### options()

#### Call Signature

```ts
options<Source, MiddlewareCustomContext>(actionId, ...listeners): void;
```

Defined in: [src/App.ts:801](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L801)

##### Type Parameters

###### Source

`Source` *extends* `"interactive_message"` \| `"block_suggestion"` \| `"dialog_suggestion"` = `"block_suggestion"`

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### actionId

`string` \| `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackOptionsMiddlewareArgs`](../interfaces/SlackOptionsMiddlewareArgs.md)\<`Source`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
options<Source, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:809](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L809)

##### Type Parameters

###### Source

`Source` *extends* `"interactive_message"` \| `"block_suggestion"` \| `"dialog_suggestion"` = `"interactive_message"` \| `"block_suggestion"` \| `"dialog_suggestion"`

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### constraints

[`OptionsConstraints`](../interfaces/OptionsConstraints.md)

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackOptionsMiddlewareArgs`](../interfaces/SlackOptionsMiddlewareArgs.md)\<`Source`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

***

### processEvent()

```ts
processEvent(event): Promise<void>;
```

Defined in: [src/App.ts:894](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L894)

Handles events from the receiver

#### Parameters

##### event

[`ReceiverEvent`](../interfaces/ReceiverEvent.md)

#### Returns

`Promise`\<`void`\>

***

### shortcut()

#### Call Signature

```ts
shortcut<Shortcut, MiddlewareCustomContext>(callbackId, ...listeners): void;
```

Defined in: [src/App.ts:682](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L682)

##### Type Parameters

###### Shortcut

`Shortcut` *extends* [`SlackShortcut`](../type-aliases/SlackShortcut.md) = [`SlackShortcut`](../type-aliases/SlackShortcut.md)

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### callbackId

`string` \| `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackShortcutMiddlewareArgs`](../type-aliases/SlackShortcutMiddlewareArgs.md)\<`Shortcut`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
shortcut<Shortcut, Constraints, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:689](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L689)

##### Type Parameters

###### Shortcut

`Shortcut` *extends* [`SlackShortcut`](../type-aliases/SlackShortcut.md) = [`SlackShortcut`](../type-aliases/SlackShortcut.md)

###### Constraints

`Constraints` *extends* [`ShortcutConstraints`](../interfaces/ShortcutConstraints.md)\<`Shortcut`\> = [`ShortcutConstraints`](../interfaces/ShortcutConstraints.md)\<`Shortcut`\>

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### constraints

`Constraints`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackShortcutMiddlewareArgs`](../type-aliases/SlackShortcutMiddlewareArgs.md)\<`Extract`\<`Shortcut`, \{
  `type`: `Constraints`\[`"type"`\];
\}\>\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

***

### start()

```ts
start(...args): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;
```

Defined in: [src/App.ts:559](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L559)

Convenience method to call start on the receiver

TODO: should replace HTTPReceiver in type definition with a generic that is constrained to Receiver

#### Parameters

##### args

\[`string` \| `number` \| `ListenOptions`, `ServerOptions`\] \| \[\]

receiver-specific start arguments

#### Returns

`Promise`\<`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>\>

***

### stop()

```ts
stop(...args): Promise<unknown>;
```

Defined in: [src/App.ts:572](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L572)

#### Parameters

##### args

...`any`[]

#### Returns

`Promise`\<`unknown`\>

***

### use()

```ts
use<MiddlewareCustomContext>(m): this;
```

Defined in: [src/App.ts:502](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L502)

Register a new middleware, processed in the order registered.

#### Type Parameters

##### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

#### Parameters

##### m

[`Middleware`](../type-aliases/Middleware.md)\<[`AnyMiddlewareArgs`](../type-aliases/AnyMiddlewareArgs.md), `AppCustomContext` & `MiddlewareCustomContext`\>

global middleware function

#### Returns

`this`

***

### view()

#### Call Signature

```ts
view<ViewActionType, MiddlewareCustomContext>(callbackId, ...listeners): void;
```

Defined in: [src/App.ts:834](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L834)

##### Type Parameters

###### ViewActionType

`ViewActionType` *extends* [`SlackViewAction`](../type-aliases/SlackViewAction.md) = [`SlackViewAction`](../type-aliases/SlackViewAction.md)

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### callbackId

`string` \| `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackViewMiddlewareArgs`](../interfaces/SlackViewMiddlewareArgs.md)\<`ViewActionType`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
view<ViewActionType, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:841](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L841)

##### Type Parameters

###### ViewActionType

`ViewActionType` *extends* [`SlackViewAction`](../type-aliases/SlackViewAction.md) = [`SlackViewAction`](../type-aliases/SlackViewAction.md)

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### constraints

[`ViewConstraints`](../interfaces/ViewConstraints.md)

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackViewMiddlewareArgs`](../interfaces/SlackViewMiddlewareArgs.md)\<`ViewActionType`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`
