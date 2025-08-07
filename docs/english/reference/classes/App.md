[@slack/bolt](../index.md) / App

# Class: App\<AppCustomContext\>

Defined in: [src/App.ts:221](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L221)

A Slack App

## Type Parameters

### AppCustomContext

`AppCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

## Constructors

### Constructor

```ts
new App<AppCustomContext>(__namedParameters): App<AppCustomContext>;
```

Defined in: [src/App.ts:277](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L277)

#### Parameters

##### \_\_namedParameters

[`AppOptions`](../interfaces/AppOptions.md) = `{}`

#### Returns

`App`\<`AppCustomContext`\>

## Properties

### client

```ts
client: WebClient;
```

Defined in: [src/App.ts:223](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L223)

Slack Web API client

***

### logger

```ts
logger: Logger;
```

Defined in: [src/App.ts:234](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L234)

Logger

## Accessors

### webClientOptions

#### Get Signature

```ts
get webClientOptions(): WebClientOptions;
```

Defined in: [src/App.ts:498](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L498)

##### Returns

[`WebClientOptions`](../@slack/namespaces/webApi/interfaces/WebClientOptions.md)

## Methods

### action()

#### Call Signature

```ts
action<Action, MiddlewareCustomContext>(actionId, ...listeners): void;
```

Defined in: [src/App.ts:753](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L753)

##### Type Parameters

###### Action

`Action` *extends* [`SlackAction`](../type-aliases/SlackAction.md) = [`SlackAction`](../type-aliases/SlackAction.md)

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### actionId

`string` | `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackActionMiddlewareArgs`](../type-aliases/SlackActionMiddlewareArgs.md)\<`Action`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
action<Action, Constraints, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:760](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L760)

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

Defined in: [src/App.ts:519](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L519)

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

Defined in: [src/App.ts:806](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L806)

#### Type Parameters

##### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

#### Parameters

##### commandName

`string` | `RegExp`

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

Defined in: [src/App.ts:902](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L902)

##### Parameters

###### errorHandler

`ErrorHandler`

##### Returns

`void`

#### Call Signature

```ts
error(errorHandler): void;
```

Defined in: [src/App.ts:903](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L903)

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

Defined in: [src/App.ts:595](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L595)

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

Defined in: [src/App.ts:599](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L599)

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
   options?, ...
   listeners?): this;
```

Defined in: [src/App.ts:546](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L546)

Register middleware for a workflow step.

##### Parameters

###### callbackId

`string`

Unique callback ID of a step.

###### options?

[`SlackEventMiddlewareArgsOptions`](../type-aliases/SlackEventMiddlewareArgsOptions.md)

Configurations for the listener.

###### listeners?

...[`Middleware`](../type-aliases/Middleware.md)\<`SlackCustomFunctionMiddlewareArgs`\>[]

Middleware handlers to call.

##### Returns

`this`

##### See

 - [https://tools.slack.dev/bolt-js/concepts/custom-steps](https://tools.slack.dev/bolt-js/concepts/custom-steps)
 - [https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options](https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options)

#### Call Signature

```ts
function(callbackId, ...listeners): this;
```

Defined in: [src/App.ts:551](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L551)

Register middleware for a workflow step.

##### Parameters

###### callbackId

`string`

Unique callback ID of a step.

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<`SlackCustomFunctionMiddlewareArgs`\>[]

Middleware handlers to call.

##### Returns

`this`

##### See

 - [https://tools.slack.dev/bolt-js/concepts/custom-steps](https://tools.slack.dev/bolt-js/concepts/custom-steps)
 - [https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options](https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options)

***

### init()

```ts
init(): Promise<void>;
```

Defined in: [src/App.ts:463](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L463)

#### Returns

`Promise`\<`void`\>

***

### message()

#### Call Signature

```ts
message<MiddlewareCustomContext>(...listeners): void;
```

Defined in: [src/App.ts:636](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L636)

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

Defined in: [src/App.ts:645](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L645)

##### Type Parameters

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### pattern

Used for filtering out messages that don't match.
Strings match via String.prototype.includes.

`string` | `RegExp`

###### listeners

...`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>[]

Middlewares that process and react to the message events that matched the provided patterns.

##### Returns

`void`

#### Call Signature

```ts
message<MiddlewareCustomContext>(
   filter, 
   pattern, ...
   listeners): void;
```

Defined in: [src/App.ts:657](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L657)

##### Type Parameters

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### filter

`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>

Middleware that can filter out messages. Generally this is done by returning before
calling [AllMiddlewareArgs.next](../interfaces/AllMiddlewareArgs.md#next) if there is no match. See [directMention](../variables/directMention.md) for an example.

###### pattern

Used for filtering out messages that don't match the pattern. Strings match
via String.prototype.includes.

`string` | `RegExp`

###### listeners

...`MessageEventMiddleware`\<`AppCustomContext` & `MiddlewareCustomContext`\>[]

Middlewares that process and react to the message events that matched the provided pattern.

##### Returns

`void`

#### Call Signature

```ts
message<MiddlewareCustomContext>(filter, ...listeners): void;
```

Defined in: [src/App.ts:668](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L668)

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

Defined in: [src/App.ts:678](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L678)

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

Defined in: [src/App.ts:819](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L819)

##### Type Parameters

###### Source

`Source` *extends* `"interactive_message"` \| `"block_suggestion"` \| `"dialog_suggestion"` = `"block_suggestion"`

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### actionId

`string` | `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackOptionsMiddlewareArgs`](../interfaces/SlackOptionsMiddlewareArgs.md)\<`Source`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
options<Source, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:827](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L827)

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

Defined in: [src/App.ts:912](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L912)

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

Defined in: [src/App.ts:700](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L700)

##### Type Parameters

###### Shortcut

`Shortcut` *extends* [`SlackShortcut`](../type-aliases/SlackShortcut.md) = [`SlackShortcut`](../type-aliases/SlackShortcut.md)

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### callbackId

`string` | `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackShortcutMiddlewareArgs`](../type-aliases/SlackShortcutMiddlewareArgs.md)\<`Shortcut`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
shortcut<Shortcut, Constraints, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:707](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L707)

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

Defined in: [src/App.ts:577](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L577)

Convenience method to call start on the receiver

TODO: should replace HTTPReceiver in type definition with a generic that is constrained to Receiver

#### Parameters

##### args

receiver-specific start arguments

\[`string` \| `number` \| `ListenOptions`, `ServerOptions`\] | \[\]

#### Returns

`Promise`\<`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>\>

***

### ~~step()~~

```ts
step(workflowStep): this;
```

Defined in: [src/App.ts:532](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L532)

Register WorkflowStep middleware

#### Parameters

##### workflowStep

[`WorkflowStep`](WorkflowStep.md)

global workflow step middleware function

#### Returns

`this`

#### Deprecated

Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
version.

***

### stop()

```ts
stop(...args): Promise<unknown>;
```

Defined in: [src/App.ts:590](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L590)

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

Defined in: [src/App.ts:507](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L507)

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

Defined in: [src/App.ts:852](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L852)

##### Type Parameters

###### ViewActionType

`ViewActionType` *extends* [`SlackViewAction`](../type-aliases/SlackViewAction.md) = [`SlackViewAction`](../type-aliases/SlackViewAction.md)

###### MiddlewareCustomContext

`MiddlewareCustomContext` *extends* [`StringIndexed`](../type-aliases/StringIndexed.md) = [`StringIndexed`](../type-aliases/StringIndexed.md)

##### Parameters

###### callbackId

`string` | `RegExp`

###### listeners

...[`Middleware`](../type-aliases/Middleware.md)\<[`SlackViewMiddlewareArgs`](../interfaces/SlackViewMiddlewareArgs.md)\<`ViewActionType`\>, `AppCustomContext` & `MiddlewareCustomContext`\>[]

##### Returns

`void`

#### Call Signature

```ts
view<ViewActionType, MiddlewareCustomContext>(constraints, ...listeners): void;
```

Defined in: [src/App.ts:859](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L859)

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
