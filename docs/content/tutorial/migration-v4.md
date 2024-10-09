---
title: Migrating to V4
slug: migration-v4
lang: en
---

This guide will walk you through the process of updating your app from using `@slack/bolt@3.x` to `@slack/bolt@4.x`. There may be a few changes you'll need to make depending on which features you use, but for most apps, these changes can be applied in a few minutes. Some apps may need no changes at all.

---

## 🚨 Breaking Changes

- ⬆️  [Support for node v14 and v16 have been officially dropped, as these node versions have been EOL'ed](#minimum-node-version).
- 🚥 [`*MiddlewareArgs` interfaces, modeling middleware arguments for different _kinds_ of Slack event payloads processed by bolt apps, have been improved](#middleware-arg-types).
- 🌐 [The Web API client, `@slack/web-api`, has been upgraded from v6 to v7](#web-api-v7).
- 🔌 [The Socket Mode handler package, `@slack/socket-mode`, has been upgraded from v1 to v2](#socket-mode-v2).
- 🚅 For those using the `ExpressReceiver`, [`express` has been upgraded from v4 to v5](#express-v5).
- 🍽️ [The `@slack/types` package is no longer exported without a namespace; it is now exported under the named `types` export](#types-named-export).
- 🧘 [The `SocketModeFunctions` class with a single static method instead now directly exports the single `defaultProcessEventErrorHandler` method from it](#socketmodefunctions).
- 🏭 [Some of the built-in middleware functions like `ignoreSelf` and `directMention` have had their APIs changed to create a consistent middleware style](#built-in-middleware-changes).
- 🌩️ [The `AwsEvent` interface has changed](#awsevent-changes).
- 🧹 [Deprecated methods, modules and properties in v3 were removed](#removed-deprecations).

## ✨ Other Changes

- 🚳 [Steps From Apps related types, methods and constants were marked as deprecated](#sfa-deprecation).
- 📦 [The `@slack/web-api` package leveraged within bolt-js is now exported under the `webApi` namespace](#web-api-export).

## Details

### ⬆️  Minimum Node version {#minimum-node-version}

`@slack/bolt@4.x` requires a minimum Node version of `18` and minimum npm version of `8.6.0` .

### 🚥 Changes to middleware argument types {#middleware-arg-types}

This change primarily applies to TypeScript users.

Many middleware argument types, for example [the `SlackEventMiddlewareArgs` type](https://github.com/slackapi/bolt-js/blob/%40slack/bolt%403.22.0/src/types/events/index.ts#L11-L19), previously used a conditional to sometimes define particular additional helper utilities on the middleware arguments. For example, [the `say`](https://github.com/slackapi/bolt-js/blob/%40slack/bolt%403.22.0/src/types/actions/index.ts#L47) utility, or [tacking on a convenience `message` property](https://github.com/slackapi/bolt-js/blob/%40slack/bolt%403.22.0/src/types/events/index.ts#L14) for message-event-related payloads. This was problematic: when the payload was not of a type that required the extra utility, these properties would be required to exist on the middleware arguments but have a type of `undefined`. Those of us trying to build generic middleware utilities would have to deal with TypeScript compilation errors and needing to liberally type-cast to avoid these conditional mismatches with `undefined`.

Instead, these `MiddlewareArgs` types now conditionally create a type intersection when appropriate in order to provide this conditional-utility-extension mechanism. That looks something like:

```typescript
type SomeMiddlewareArgs<EventType extends string = string> = {
  // some type in here
} & (EventType extends 'message'
  // If this is a message event, add a `message` property
  ? { message: EventFromType<EventType> }
  : unknown
)
```

With the above, now when a message payload is wrapped in middleware arguments, it will contain an appropriate `message` property, whereas a non-message payload will be intersected with `unknown` - effectively a type "noop." No more e.g. `say: undefined` or `message: undefined` to deal with!

### 🌐 `@slack/web-api` v7 upgrade {#web-api-v7}

All bolt handlers are [provided a convenience `client` argument](../concepts/web-api) that developers can use to make API requests to [Slack's public HTTP APIs][methods]. This `client` is powered by [the `@slack/web-api` package][web-api]. In bolt v4, `web-api` has been upgraded from v6 to v7.

More APIs! Better argument type safety! And a whole slew of other changes, too. Many of these changes won't affect JavaScript application builders, but if you are building a bolt app using TypeScript, you may see some compilation issues. Head over to [the `@slack/web-api` v6 -> v7 migration guide](https://github.com/slackapi/node-slack-sdk/wiki/Migration-Guide-for-web%E2%80%90api-v7) to get the details on what changed and how to migrate to v7.

### 🔌 `@slack/socket-mode` v2 upgrade {#socket-mode-v2}

While the breaking changes from this upgrade should be shielded from most bolt-js users, if you are using [the `SocketModeReceiver` or setting `socketMode: true`](../concepts/socket-mode) _and_ attach custom code to how the `SocketModeReceiver` operates, we suggest you read through [the `@slack/socket-mode` v1 -> v2 migration guide](https://github.com/slackapi/node-slack-sdk/wiki/Migration-Guide-for-socket%E2%80%90mode-2.0), just in case.

### 🚅 `express` v5 upgrade {#express-v5}

For those building bolt-js apps using the `ExpressReceiver`, the packaged `express` version has been upgraded to v5. Best to check [the list of breaking changes in `express` v5](https://github.com/expressjs/express/blob/5.x/History.md#500--2024-09-10) and keep tabs on [express#5944](https://github.com/expressjs/express/issues/5944), which tracks the creation of an `express` v4 -> v5 migration guide.

### 🍽️ `@slack/types` exported as a named `types` export {#types-named-export}

We are slowly moving more core Slack domain object types and interfaces into [the utility package `@slack/types`][types]. For example, recently we shuffled [Slack Events API payloads](https://api.slack.com/events) from bolt-js over to `@slack/types`. Similar moves will continue as we improve bolt-js. Ideally, we'd like for everyone - ourselves as Slack employees but of course you as well, dear developer - to leverage these types when modeling Slack domain objects.

Anyways, previously we simply `export * from '@slack/types';` in bolt-js. We've tweaked this somewhat, it is now: `export * as types from '@slack/types';`. So if you are using `@slack/types` when packaged within bolt-js, please update your references to something like:

```typescript
import { App, type types } from '@slack/bolt';

// Now you can get references to e.g. `types.BotMessageEvent`
```

### 🧘 `SocketModeFunctions` class disassembled {#socketmodefunctions}

If you previously imported the `SocketModeFunctions` class, you likely only did so to get a reference to the single static method available on this class: [`defaultProcessEventErrorHandler`](https://github.com/slackapi/bolt-js/blob/cd662ed540aa40b5cf20b4d5c21b0008db8ed427/src/receivers/SocketModeFunctions.ts#L13). Instead, you can now directly import the named `defaultProcessEventErrorHandler` export instead:

```typescript
// before:
import { SocketModeFunctions } from '@slack/bolt';
// you probably did something with:
SocketModeFunctions.defaultProcessEventErrorHandler

// now:
import { defaultProcessEventHandler } from '@slack/bolt';
```

### 🏭 Built-in middleware changes {#built-in-middleware-changes}

Two [built-in middlewares](../reference#built-in-listener-middleware-functions), `ignoreSelf` and `directMention`, previously needed to be invoked as a function in order to _return_ a middleware. These two built-in middlewares were not parameterized in the sense that they should just be used directly; as a result, you no longer should invoke them and instead pass them directly.

As an example, previously you may have leveraged `directMention` like this:

```typescript
app.message(directMention(), async (args) => {
  // my handler here
});
```

Instead, you should now use it like so:

```typescript
app.message(directMention, async (args) => {
  // my handler here
});
```

### 🌩️ `AwsEvent` interface changes {#awsevent-changes}

For users of the `AwsLambdaReceiver` and TypeScript, [we previously modeled, rather simplistically, the AWS event payloads](https://github.com/slackapi/bolt-js/blob/cd662ed540aa40b5cf20b4d5c21b0008db8ed427/src/receivers/AwsLambdaReceiver.ts#L11-L24): liberal use of `any` and in certain cases, incorrect property types altogether. We've now improved these to be more accurate and to take into account the two versions of API Gateway payloads that AWS supports (v1 and v2). Details for these changes are available in [#2277](https://github.com/slackapi/bolt-js/pull/2277).

As for userland changes that may be required, this depends on your use of the `AwsEvent` interface. The major change here is that it is a union type of V1 and V2 payload structures. Check out the source code and changes in [#2277](https://github.com/slackapi/bolt-js/pull/2277) for details on what each payload version structure looks like and how to adapt your application code to account for these differences. Most likely, your code will need to test for the existence of certain properties in order for TypeScript to narrow down to the appropriate payload version. For example, one change bolt-js had to employ in its code as a result of this more correct typing is the following:

```typescript
// the variable `awsEvent` is of type `AwsEvent`
let path: string;
if ('path' in awsEvent) {
  // This is a v1 payload, so `awsEvent.path` exists and points to the request URL path.
  path = awsEvent.path;
} else {
  // This is a v2 payload, so `awsEvent.rawPath` exists and points to the request URL path.
  path = awsEvent.rawPath;
}
this.logger.info(`No request handler matched the request: ${path}`);
```

### 🧹 Removed deprecations {#removed-deprecations}

- The deprecated type `KnownKeys` was removed. Admittedly, it wasn't very useful: `export type KnownKeys<_T> = never;`
- The deprecated types `VerifyOptions` and `OptionsRequest` were removed.
- The deprecated methods `extractRetryNum`, `extractRetryReason`, `defaultRenderHtmlForInstallPath`, `renderHtmlForInstallPath` and `verify` were removed.

### 🚳 Steps From Apps related deprecations {#sfa-deprecation}

A variety of methods, constants and types related to Steps From Apps were deprecated and will be removed in bolt-js v5.

### 📦 `@slack/web-api` exported as `webApi` {#web-api-export}

To help application developers keep versions of various `@slack/*` dependencies in sync with those used by bolt-js, `@slack/web-api` is now exported from bolt-js under the `webApi` export. Unless applications have specific version needs from the `@slack/web-api` package, apps should be able to import `web-api` from bolt instead:

```typescript
import { webApi } from '@slack/bolt';
// now can use e.g. webApi.WebClient, etc.
```

[methods]: https://api.slack.com/methods
[web-api]: https://www.npmjs.com/package/@slack/web-api
[types]: https://www.npmjs.com/package/@slack/types
