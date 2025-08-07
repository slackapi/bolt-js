[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CallsUpdateArguments

# Interface: CallsUpdateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:49

## Extends

- `ID`.`Partial`\<`CallDetails`\>.`TokenOverridable`

## Properties

### desktop\_app\_join\_url?

```ts
optional desktop_app_join_url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:21

#### Description

When supplied, available Slack clients will attempt to directly launch the 3rd-party Call
with this URL.

#### Inherited from

[`CallsAddArguments`](CallsAddArguments.md).[`desktop_app_join_url`](CallsAddArguments.md#desktop_app_join_url)

***

### id

```ts
id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:5

#### Description

`id` returned when registering the call using the `calls.add` method.

#### Inherited from

```ts
ID.id
```

***

### join\_url?

```ts
optional join_url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:16

#### Description

The URL required for a client to join the Call.

#### Inherited from

[`CallsAddArguments`](CallsAddArguments.md).[`join_url`](CallsAddArguments.md#join_url)

***

### title?

```ts
optional title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:23

#### Description

The name of the Call.

#### Inherited from

[`CallsAddArguments`](CallsAddArguments.md).[`title`](CallsAddArguments.md#title)

***

### token?

```ts
optional token: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:37

#### Description

Overridable authentication token bearing required scopes.

#### Inherited from

```ts
TokenOverridable.token
```
